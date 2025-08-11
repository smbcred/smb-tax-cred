/**
 * Comprehensive Admin Actions Tests with Mocks (Task 6.1.7)
 * Tests all admin actions with proper service mocking
 */

import request from 'supertest';
import { Express } from 'express';
import { registerRoutes } from '../server/routes';
import jwt from 'jsonwebtoken';
import { db } from '../server/db';
import { users, documents, payments, auditLogs } from '../shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const adminUser = { id: 'admin-test', email: 'admin@test.com', isAdmin: true };
const adminToken = jwt.sign(adminUser, JWT_SECRET);

let app: Express;

// Mock external services
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }])
}));

jest.mock('../server/services/documint', () => ({
  generateDocument: jest.fn().mockResolvedValue({
    success: true,
    documentUrl: 'https://documint.com/test-doc.pdf',
    documentId: 'doc-123'
  })
}));

jest.mock('../server/services/s3', () => ({
  uploadDocument: jest.fn().mockResolvedValue({
    success: true,
    s3Key: 's3://bucket/documents/new-doc-123.pdf',
    s3Url: 'https://s3.amazonaws.com/bucket/documents/new-doc-123.pdf'
  })
}));

jest.mock('stripe', () => ({
  refunds: {
    create: jest.fn().mockResolvedValue({
      id: 're_test123',
      amount: 10000,
      status: 'succeeded',
      charge: 'ch_test456'
    })
  }
}));

beforeAll(async () => {
  app = (await import('express')).default();
  await registerRoutes(app);
  
  // Seed test admin user
  try {
    await db.insert(users).values({
      id: adminUser.id,
      email: adminUser.email,
      passwordHash: 'hashed-password',
      firstName: 'Test',
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
    await db.delete(users).where(users.id.eq(adminUser.id));
  } catch (error) {
    // Ignore cleanup errors
  }
});

beforeEach(async () => {
  // Clear audit logs before each test
  await db.delete(auditLogs);
  jest.clearAllMocks();
});

describe('Admin Actions with Mocks', () => {
  describe('Resend Email Action', () => {
    let testDocumentId: string;

    beforeEach(async () => {
      // Create test document
      const [doc] = await db.insert(documents).values({
        id: 'test-doc-resend',
        userId: 'user-123',
        documentType: 'comprehensive_report',
        s3Key: 's3://bucket/test-doc.pdf',
        status: 'completed',
        userEmail: 'user@test.com'
      }).returning();
      testDocumentId = doc.id;
    });

    it('should successfully resend email with SendGrid mock', async () => {
      const sendGridMock = require('@sendgrid/mail');
      
      const response = await request(app)
        .post(`/api/admin/documents/${testDocumentId}/resend-email`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Customer requested resend' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Document email resent successfully');
      expect(response.body.emailSent).toBe(true);
      expect(response.body.documentId).toBe(testDocumentId);

      // Verify SendGrid was called
      expect(sendGridMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          from: expect.any(String),
          subject: expect.stringContaining('document'),
          text: expect.any(String),
          html: expect.any(String)
        })
      );
    });

    it('should create audit log for resend email action', async () => {
      await request(app)
        .post(`/api/admin/documents/${testDocumentId}/resend-email`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test audit log creation' })
        .expect(200);

      // Check audit log was created
      const auditEntries = await db.select().from(auditLogs);
      expect(auditEntries).toHaveLength(1);
      
      const auditEntry = auditEntries[0];
      expect(auditEntry.adminUserId).toBe(adminUser.id);
      expect(auditEntry.action).toBe('resend_email');
      expect(auditEntry.entityType).toBe('document');
      expect(auditEntry.entityId).toBe(testDocumentId);
      expect(auditEntry.reason).toBe('Test audit log creation');
      expect(auditEntry.after).toEqual(
        expect.objectContaining({
          documentType: 'comprehensive_report',
          recipientEmail: 'user@test.com',
          emailSent: true
        })
      );
    });

    it('should handle SendGrid failure gracefully', async () => {
      const sendGridMock = require('@sendgrid/mail');
      sendGridMock.send.mockRejectedValueOnce(new Error('SendGrid API error'));

      const response = await request(app)
        .post(`/api/admin/documents/${testDocumentId}/resend-email`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test error handling' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.emailSent).toBe(false);
    });
  });

  describe('Regenerate Document Action', () => {
    let testDocumentId: string;

    beforeEach(async () => {
      // Create test document
      const [doc] = await db.insert(documents).values({
        id: 'test-doc-regen',
        userId: 'user-456',
        documentType: 'comprehensive_report',
        s3Key: 's3://bucket/old-doc.pdf',
        status: 'completed'
      }).returning();
      testDocumentId = doc.id;
    });

    it('should successfully regenerate document with Documint and S3 mocks', async () => {
      const documintMock = require('../server/services/documint');
      const s3Mock = require('../server/services/s3');

      const response = await request(app)
        .post(`/api/admin/documents/${testDocumentId}/regenerate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Customer requested update' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Document regenerated successfully');
      expect(response.body.regenerated).toBe(true);
      expect(response.body.newS3Key).toBe('s3://bucket/documents/new-doc-123.pdf');

      // Verify external services were called
      expect(documintMock.generateDocument).toHaveBeenCalled();
      expect(s3Mock.uploadDocument).toHaveBeenCalled();
    });

    it('should create audit log for regenerate action', async () => {
      await request(app)
        .post(`/api/admin/documents/${testDocumentId}/regenerate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test regenerate audit' })
        .expect(200);

      // Check audit log
      const auditEntries = await db.select().from(auditLogs);
      expect(auditEntries).toHaveLength(1);
      
      const auditEntry = auditEntries[0];
      expect(auditEntry.action).toBe('regenerate_doc');
      expect(auditEntry.entityType).toBe('document');
      expect(auditEntry.entityId).toBe(testDocumentId);
      expect(auditEntry.before).toEqual(
        expect.objectContaining({
          s3Key: 's3://bucket/old-doc.pdf'
        })
      );
      expect(auditEntry.after).toEqual(
        expect.objectContaining({
          newS3Key: 's3://bucket/documents/new-doc-123.pdf',
          regenerated: true
        })
      );
    });

    it('should handle document generation failure', async () => {
      const documintMock = require('../server/services/documint');
      documintMock.generateDocument.mockRejectedValueOnce(new Error('Documint API error'));

      const response = await request(app)
        .post(`/api/admin/documents/${testDocumentId}/regenerate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test error handling' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.regenerated).toBe(false);
    });
  });

  describe('Refund Payment Action', () => {
    let testPaymentId: string;

    beforeEach(async () => {
      // Create test payment
      const [payment] = await db.insert(payments).values({
        id: 'test-payment-refund',
        userId: 'user-789',
        amount: 100.00,
        stripePaymentIntentId: 'pi_test123',
        status: 'completed'
      }).returning();
      testPaymentId = payment.id;
    });

    it('should successfully process refund with Stripe mock', async () => {
      const stripeMock = require('stripe');

      const response = await request(app)
        .post(`/api/admin/payments/${testPaymentId}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          reason: 'Customer request',
          amount: 50.00
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment refunded successfully');
      expect(response.body.refunded).toBe(true);
      expect(response.body.stripeRefundId).toBe('re_test123');

      // Verify Stripe was called
      expect(stripeMock.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test123',
        amount: 5000, // Amount in cents
        reason: 'requested_by_customer'
      });
    });

    it('should create audit log for refund action', async () => {
      await request(app)
        .post(`/api/admin/payments/${testPaymentId}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          reason: 'Test refund audit',
          amount: 25.00
        })
        .expect(200);

      // Check audit log
      const auditEntries = await db.select().from(auditLogs);
      expect(auditEntries).toHaveLength(1);
      
      const auditEntry = auditEntries[0];
      expect(auditEntry.action).toBe('refund');
      expect(auditEntry.entityType).toBe('payment');
      expect(auditEntry.entityId).toBe(testPaymentId);
      expect(auditEntry.before).toEqual(
        expect.objectContaining({
          amount: 100.00,
          status: 'completed'
        })
      );
      expect(auditEntry.after).toEqual(
        expect.objectContaining({
          refundAmount: 25.00,
          stripeRefundId: 're_test123',
          refunded: true
        })
      );
    });

    it('should handle Stripe refund failure', async () => {
      const stripeMock = require('stripe');
      stripeMock.refunds.create.mockRejectedValueOnce(new Error('Stripe API error'));

      const response = await request(app)
        .post(`/api/admin/payments/${testPaymentId}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          reason: 'Test error handling',
          amount: 10.00
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.refunded).toBe(false);
    });
  });

  describe('Idempotency Guards', () => {
    let testDocumentId: string;

    beforeEach(async () => {
      const [doc] = await db.insert(documents).values({
        id: 'test-doc-idempotent',
        userId: 'user-999',
        documentType: 'comprehensive_report',
        s3Key: 's3://bucket/test.pdf',
        status: 'completed',
        userEmail: 'user@test.com'
      }).returning();
      testDocumentId = doc.id;
    });

    it('should detect duplicate actions within time window', async () => {
      // First action
      await request(app)
        .post(`/api/admin/documents/${testDocumentId}/resend-email`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'First attempt' })
        .expect(200);

      // Immediate duplicate action
      const response = await request(app)
        .post(`/api/admin/documents/${testDocumentId}/resend-email`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Duplicate attempt' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('duplicate');

      // Should have only one audit log entry
      const auditEntries = await db.select().from(auditLogs);
      expect(auditEntries).toHaveLength(1);
    });
  });
});