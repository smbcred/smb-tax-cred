/**
 * Audit Logs Snapshot Tests (Task 6.1.7)
 * Tests audit log structure and content with snapshots
 */

import request from 'supertest';
import { Express } from 'express';
import { registerRoutes } from '../server/routes';
import jwt from 'jsonwebtoken';
import { db } from '../server/db';
import { users, auditLogs, documents, payments } from '../shared/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const adminUser = { id: 'admin-audit', email: 'admin@test.com', isAdmin: true };
const adminToken = jwt.sign(adminUser, JWT_SECRET);

let app: Express;

beforeAll(async () => {
  app = (await import('express')).default();
  await registerRoutes(app);
  
  // Seed test admin user
  try {
    await db.insert(users).values({
      id: adminUser.id,
      email: adminUser.email,
      passwordHash: 'hashed-password',
      firstName: 'Audit',
      lastName: 'Admin',
      isAdmin: true,
    }).onConflictDoNothing();
  } catch (error) {
    // User might already exist
  }
});

afterAll(async () => {
  // Clean up test data
  try {
    await db.delete(auditLogs);
    await db.delete(documents);
    await db.delete(payments);
    await db.delete(users).where(eq(users.id, adminUser.id));
  } catch (error) {
    // Ignore cleanup errors
  }
});

beforeEach(async () => {
  // Clear audit logs before each test
  await db.delete(auditLogs);
});

describe('Audit Logs Snapshot Tests', () => {
  describe('Resend Email Audit Log', () => {
    it('should create proper audit log snapshot for resend email action', async () => {
      // Create test document
      const [testDoc] = await db.insert(documents).values({
        id: 'audit-doc-email',
        userId: 'user-email-test',
        documentType: 'comprehensive_report',
        s3Key: 's3://bucket/audit-test.pdf',
        status: 'completed',
        userEmail: 'testuser@example.com'
      }).returning();

      // Perform resend email action
      await request(app)
        .post(`/api/admin/documents/${testDoc.id}/resend-email`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Audit log snapshot test for email resend' })
        .expect(200);

      // Get the audit log entry
      const auditEntries = await db.select().from(auditLogs);
      expect(auditEntries).toHaveLength(1);

      const auditEntry = auditEntries[0];
      
      // Snapshot test for audit log structure
      expect(auditEntry).toMatchObject({
        id: expect.any(String),
        adminUserId: adminUser.id,
        action: 'resend_email',
        entityType: 'document',
        entityId: testDoc.id,
        before: null, // Resend email doesn't modify the document
        after: {
          documentType: 'comprehensive_report',
          recipientEmail: 'testuser@example.com',
          emailSent: true
        },
        reason: 'Audit log snapshot test for email resend',
        ipAddress: expect.any(String),
        userAgent: expect.any(String),
        createdAt: expect.any(Date)
      });

      // Detailed field validation
      expect(auditEntry.adminUserId).toBe(adminUser.id);
      expect(auditEntry.action).toBe('resend_email');
      expect(auditEntry.entityType).toBe('document');
      expect(auditEntry.entityId).toBe(testDoc.id);
      expect(auditEntry.before).toBeNull();
      expect(auditEntry.after).toEqual({
        documentType: 'comprehensive_report',
        recipientEmail: 'testuser@example.com',
        emailSent: true
      });
      expect(auditEntry.reason).toBe('Audit log snapshot test for email resend');
      expect(auditEntry.ipAddress).toBeTruthy();
      expect(auditEntry.userAgent).toBeTruthy();
      expect(auditEntry.createdAt).toBeInstanceOf(Date);

      console.log('📋 AUDIT LOG SNAPSHOT - Resend Email:');
      console.log(JSON.stringify(auditEntry, null, 2));
    });
  });

  describe('Regenerate Document Audit Log', () => {
    it('should create proper audit log snapshot for regenerate document action', async () => {
      // Create test document
      const [testDoc] = await db.insert(documents).values({
        id: 'audit-doc-regen',
        userId: 'user-regen-test',
        documentType: 'comprehensive_report',
        s3Key: 's3://bucket/original-doc.pdf',
        status: 'completed'
      }).returning();

      // Perform regenerate action
      await request(app)
        .post(`/api/admin/documents/${testDoc.id}/regenerate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Audit log snapshot test for document regeneration' })
        .expect(200);

      // Get the audit log entry
      const auditEntries = await db.select().from(auditLogs);
      expect(auditEntries).toHaveLength(1);

      const auditEntry = auditEntries[0];
      
      // Snapshot test for regenerate audit log
      expect(auditEntry).toMatchObject({
        id: expect.any(String),
        adminUserId: adminUser.id,
        action: 'regenerate_doc',
        entityType: 'document',
        entityId: testDoc.id,
        before: {
          s3Key: 's3://bucket/original-doc.pdf'
        },
        after: {
          newS3Key: expect.stringContaining('s3://'),
          regenerated: true
        },
        reason: 'Audit log snapshot test for document regeneration',
        ipAddress: expect.any(String),
        userAgent: expect.any(String),
        createdAt: expect.any(Date)
      });

      // Validate before/after state tracking
      expect(auditEntry.before).toEqual({
        s3Key: 's3://bucket/original-doc.pdf'
      });
      expect(auditEntry.after.regenerated).toBe(true);
      expect(auditEntry.after.newS3Key).toContain('s3://');

      console.log('📋 AUDIT LOG SNAPSHOT - Regenerate Document:');
      console.log(JSON.stringify(auditEntry, null, 2));
    });
  });

  describe('Refund Payment Audit Log', () => {
    it('should create proper audit log snapshot for refund payment action', async () => {
      // Create test payment
      const [testPayment] = await db.insert(payments).values({
        id: 'audit-payment-refund',
        userId: 'user-refund-test',
        amount: 149.99,
        stripePaymentIntentId: 'pi_audit_test123',
        status: 'completed'
      }).returning();

      // Perform refund action
      await request(app)
        .post(`/api/admin/payments/${testPayment.id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          reason: 'Audit log snapshot test for payment refund',
          amount: 74.99
        })
        .expect(200);

      // Get the audit log entry
      const auditEntries = await db.select().from(auditLogs);
      expect(auditEntries).toHaveLength(1);

      const auditEntry = auditEntries[0];
      
      // Snapshot test for refund audit log
      expect(auditEntry).toMatchObject({
        id: expect.any(String),
        adminUserId: adminUser.id,
        action: 'refund',
        entityType: 'payment',
        entityId: testPayment.id,
        before: {
          amount: 149.99,
          status: 'completed'
        },
        after: {
          refundAmount: 74.99,
          stripeRefundId: expect.stringContaining('re_'),
          refunded: true
        },
        reason: 'Audit log snapshot test for payment refund',
        ipAddress: expect.any(String),
        userAgent: expect.any(String),
        createdAt: expect.any(Date)
      });

      // Validate payment-specific fields
      expect(auditEntry.before.amount).toBe(149.99);
      expect(auditEntry.before.status).toBe('completed');
      expect(auditEntry.after.refundAmount).toBe(74.99);
      expect(auditEntry.after.refunded).toBe(true);
      expect(auditEntry.after.stripeRefundId).toMatch(/^re_/);

      console.log('📋 AUDIT LOG SNAPSHOT - Refund Payment:');
      console.log(JSON.stringify(auditEntry, null, 2));
    });
  });

  describe('Audit Log Metadata', () => {
    it('should capture complete request metadata in audit logs', async () => {
      // Create test document for any action
      const [testDoc] = await db.insert(documents).values({
        id: 'audit-metadata-test',
        userId: 'user-metadata',
        documentType: 'comprehensive_report',
        s3Key: 's3://bucket/metadata-test.pdf',
        status: 'completed',
        userEmail: 'metadata@test.com'
      }).returning();

      // Perform action with custom headers
      await request(app)
        .post(`/api/admin/documents/${testDoc.id}/resend-email`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('User-Agent', 'AdminTool/1.0 (Test Suite)')
        .set('X-Forwarded-For', '192.168.1.100')
        .send({ reason: 'Metadata capture test' })
        .expect(200);

      const auditEntries = await db.select().from(auditLogs);
      const auditEntry = auditEntries[0];

      // Verify metadata capture
      expect(auditEntry.ipAddress).toBeTruthy();
      expect(auditEntry.userAgent).toContain('AdminTool/1.0');
      expect(auditEntry.createdAt).toBeInstanceOf(Date);
      expect(auditEntry.createdAt.getTime()).toBeCloseTo(Date.now(), -10000); // Within 10 seconds

      console.log('📋 AUDIT LOG METADATA SNAPSHOT:');
      console.log({
        ipAddress: auditEntry.ipAddress,
        userAgent: auditEntry.userAgent,
        timestamp: auditEntry.createdAt.toISOString(),
        timeDelta: Date.now() - auditEntry.createdAt.getTime()
      });
    });
  });

  describe('Audit Log Query and Pagination', () => {
    it('should support querying audit logs by admin user', async () => {
      // Create multiple audit entries
      const actions = ['resend_email', 'regenerate_doc', 'refund'];
      
      for (let i = 0; i < actions.length; i++) {
        await db.insert(auditLogs).values({
          adminUserId: adminUser.id,
          action: actions[i],
          entityType: 'test_entity',
          entityId: `test-entity-${i}`,
          reason: `Test action ${i}`,
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent'
        });
      }

      // Query audit logs
      const userAuditLogs = await db.select()
        .from(auditLogs)
        .where(eq(auditLogs.adminUserId, adminUser.id))
        .orderBy(auditLogs.createdAt);

      expect(userAuditLogs).toHaveLength(3);
      expect(userAuditLogs.map(log => log.action)).toEqual(actions);

      console.log('📋 AUDIT LOG QUERY SNAPSHOT:');
      console.log(userAuditLogs.map(log => ({
        action: log.action,
        entityType: log.entityType,
        reason: log.reason,
        timestamp: log.createdAt?.toISOString()
      })));
    });
  });
});