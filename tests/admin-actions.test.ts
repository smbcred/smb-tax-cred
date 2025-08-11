/**
 * Test suite for admin action endpoints (Task 6.1.5)
 */

import request from 'supertest';
import { Express } from 'express';
import { registerRoutes } from '../server/routes';
import { db } from '../server/db';
import { users, documents, payments, auditLogs } from '../shared/schema';
import jwt from 'jsonwebtoken';

// Mock data
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const adminUser = {
  id: 'admin-user-id',
  email: 'admin@test.com',
  isAdmin: true
};

const testDocument = {
  id: 'test-doc-id',
  documentType: 'form_6765',
  documentName: 'Test Document',
  s3Key: 'documents/test.pdf',
  userId: 'user-123',
  userEmail: 'user@test.com'
};

const testPayment = {
  id: 'test-payment-id',
  userId: 'user-123',
  amount: '97.00',
  status: 'completed',
  stripePaymentIntentId: 'pi_test_123'
};

let app: Express;
let adminToken: string;
let userToken: string;

beforeAll(async () => {
  // Create test app
  app = (await import('express')).default();
  await registerRoutes(app);
  
  // Generate tokens
  adminToken = jwt.sign(adminUser, JWT_SECRET);
  userToken = jwt.sign({ id: 'user-123', isAdmin: false }, JWT_SECRET);
});

describe('Admin Actions Endpoints', () => {
  describe('POST /api/admin/documents/:id/resend-email', () => {
    it('should resend email for valid admin user (200)', async () => {
      const response = await request(app)
        .post(`/api/admin/documents/${testDocument.id}/resend-email`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Customer requested resend' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.documentId).toBe(testDocument.id);
      expect(response.body.emailSent).toBe(true);
    });

    it('should reject non-admin user (403)', async () => {
      await request(app)
        .post(`/api/admin/documents/${testDocument.id}/resend-email`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Test' })
        .expect(403);
    });

    it('should reject unauthenticated request (401)', async () => {
      await request(app)
        .post(`/api/admin/documents/${testDocument.id}/resend-email`)
        .send({ reason: 'Test' })
        .expect(401);
    });

    it('should handle non-existent document (404)', async () => {
      await request(app)
        .post('/api/admin/documents/non-existent-id/resend-email')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' })
        .expect(404);
    });

    it('should implement idempotency guard', async () => {
      // First request
      const response1 = await request(app)
        .post(`/api/admin/documents/${testDocument.id}/resend-email`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'First attempt' })
        .expect(200);

      // Second request within 10 minutes
      const response2 = await request(app)
        .post(`/api/admin/documents/${testDocument.id}/resend-email`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Second attempt' })
        .expect(200);

      expect(response2.body.isDuplicate).toBe(true);
    });
  });

  describe('POST /api/admin/documents/:id/regenerate', () => {
    it('should regenerate document for valid admin user (200)', async () => {
      const response = await request(app)
        .post(`/api/admin/documents/${testDocument.id}/regenerate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Document corrupted' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.documentId).toBe(testDocument.id);
      expect(response.body.regenerated).toBe(true);
      expect(response.body.newS3Key).toMatch(/regenerated\//);
    });

    it('should reject non-admin user (403)', async () => {
      await request(app)
        .post(`/api/admin/documents/${testDocument.id}/regenerate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Test' })
        .expect(403);
    });
  });

  describe('POST /api/admin/payments/:id/refund', () => {
    it('should process refund for valid admin user (200)', async () => {
      const response = await request(app)
        .post(`/api/admin/payments/${testPayment.id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Customer requested refund' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBe(testPayment.id);
      expect(response.body.refunded).toBe(true);
      expect(response.body.stripeRefundId).toMatch(/re_stub_/);
    });

    it('should handle partial refunds', async () => {
      const response = await request(app)
        .post(`/api/admin/payments/${testPayment.id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          reason: 'Partial refund requested',
          amount: '50.00'
        })
        .expect(200);

      expect(response.body.refundAmount).toBe('50.00');
    });

    it('should reject non-admin user (403)', async () => {
      await request(app)
        .post(`/api/admin/payments/${testPayment.id}/refund`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Test' })
        .expect(403);
    });
  });

  describe('Audit Trail Verification', () => {
    it('should create audit log entry for resend email', async () => {
      const initialAuditCount = await db.select().from(auditLogs);
      
      await request(app)
        .post(`/api/admin/documents/${testDocument.id}/resend-email`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Audit test' })
        .expect(200);

      const finalAuditCount = await db.select().from(auditLogs);
      expect(finalAuditCount.length).toBe(initialAuditCount.length + 1);

      const latestAudit = finalAuditCount[finalAuditCount.length - 1];
      expect(latestAudit.action).toBe('resend_email');
      expect(latestAudit.entityType).toBe('document');
      expect(latestAudit.entityId).toBe(testDocument.id);
      expect(latestAudit.adminUserId).toBe(adminUser.id);
    });

    it('should create audit log entry for regenerate document', async () => {
      const initialAuditCount = await db.select().from(auditLogs);
      
      await request(app)
        .post(`/api/admin/documents/${testDocument.id}/regenerate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Audit test' })
        .expect(200);

      const finalAuditCount = await db.select().from(auditLogs);
      expect(finalAuditCount.length).toBe(initialAuditCount.length + 1);

      const latestAudit = finalAuditCount[finalAuditCount.length - 1];
      expect(latestAudit.action).toBe('regenerate_doc');
      expect(latestAudit.entityType).toBe('document');
      expect(latestAudit.adminUserId).toBe(adminUser.id);
    });

    it('should create audit log entry for refund', async () => {
      const initialAuditCount = await db.select().from(auditLogs);
      
      await request(app)
        .post(`/api/admin/payments/${testPayment.id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Audit test' })
        .expect(200);

      const finalAuditCount = await db.select().from(auditLogs);
      expect(finalAuditCount.length).toBe(initialAuditCount.length + 1);

      const latestAudit = finalAuditCount[finalAuditCount.length - 1];
      expect(latestAudit.action).toBe('refund');
      expect(latestAudit.entityType).toBe('payment');
      expect(latestAudit.adminUserId).toBe(adminUser.id);
    });
  });
});