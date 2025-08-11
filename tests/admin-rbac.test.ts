/**
 * RBAC Tests for Admin Back-Office (Task 6.1.7)
 * Tests admin vs non-admin access control across all admin endpoints
 */

import request from 'supertest';
import { Express } from 'express';
import { registerRoutes } from '../server/routes';
import jwt from 'jsonwebtoken';
import { db } from '../server/db';
import { users, auditLogs } from '../shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Test users
const adminUser = { id: 'admin-123', email: 'admin@test.com', isAdmin: true };
const regularUser = { id: 'user-456', email: 'user@test.com', isAdmin: false };
const noAdminFlagUser = { id: 'user-789', email: 'noflags@test.com' }; // Missing isAdmin flag

// JWT tokens
const adminToken = jwt.sign(adminUser, JWT_SECRET);
const userToken = jwt.sign(regularUser, JWT_SECRET);
const noFlagToken = jwt.sign(noAdminFlagUser, JWT_SECRET);

let app: Express;

beforeAll(async () => {
  app = (await import('express')).default();
  await registerRoutes(app);
  
  // Seed test users
  try {
    await db.insert(users).values([
      {
        id: adminUser.id,
        email: adminUser.email,
        passwordHash: 'hashed-password',
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true,
      },
      {
        id: regularUser.id,
        email: regularUser.email,
        passwordHash: 'hashed-password',
        firstName: 'Regular',
        lastName: 'User',
        isAdmin: false,
      },
      {
        id: noAdminFlagUser.id,
        email: noAdminFlagUser.email,
        passwordHash: 'hashed-password',
        firstName: 'No Flag',
        lastName: 'User',
      }
    ]).onConflictDoNothing();
  } catch (error) {
    // Users might already exist
  }
});

afterAll(async () => {
  // Clean up test data
  try {
    await db.delete(users).where(users.id.in([adminUser.id, regularUser.id, noAdminFlagUser.id]));
    await db.delete(auditLogs);
  } catch (error) {
    // Ignore cleanup errors
  }
});

describe('Admin RBAC Tests', () => {
  describe('Admin Ping Endpoint', () => {
    it('should allow admin access', async () => {
      const response = await request(app)
        .get('/api/admin/ping')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Admin API is accessible');
      expect(response.body.adminUser).toBe(adminUser.email);
    });

    it('should deny regular user access', async () => {
      await request(app)
        .get('/api/admin/ping')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should deny user without admin flag', async () => {
      await request(app)
        .get('/api/admin/ping')
        .set('Authorization', `Bearer ${noFlagToken}`)
        .expect(403);
    });

    it('should deny unauthenticated access', async () => {
      await request(app)
        .get('/api/admin/ping')
        .expect(401);
    });

    it('should deny invalid token', async () => {
      await request(app)
        .get('/api/admin/ping')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Admin Dashboard Access', () => {
    it('should allow admin dashboard access', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should deny non-admin dashboard access', async () => {
      await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Admin Data Access Endpoints', () => {
    const endpoints = [
      '/api/admin/leads',
      '/api/admin/customers',
      '/api/admin/documents',
      '/api/admin/payments',
      '/api/admin/webhooks'
    ];

    endpoints.forEach(endpoint => {
      describe(`${endpoint}`, () => {
        it('should allow admin access', async () => {
          const response = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.data).toBeDefined();
          expect(response.body.pagination).toBeDefined();
        });

        it('should deny non-admin access', async () => {
          await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
        });

        it('should deny unauthenticated access', async () => {
          await request(app)
            .get(endpoint)
            .expect(401);
        });
      });
    });
  });

  describe('Admin Action Endpoints', () => {
    const actionEndpoints = [
      {
        method: 'post',
        path: '/api/admin/documents/test-doc-id/resend-email',
        body: { reason: 'Test resend' }
      },
      {
        method: 'post',
        path: '/api/admin/documents/test-doc-id/regenerate',
        body: { reason: 'Test regenerate' }
      },
      {
        method: 'post',
        path: '/api/admin/payments/test-payment-id/refund',
        body: { reason: 'Test refund', amount: 100 }
      }
    ];

    actionEndpoints.forEach(({ method, path, body }) => {
      describe(`${method.toUpperCase()} ${path}`, () => {
        it('should allow admin action', async () => {
          const response = await request(app)
            [method](path)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(body)
            .expect(200);

          expect(response.body.success).toBe(true);
        });

        it('should deny non-admin action', async () => {
          await request(app)
            [method](path)
            .set('Authorization', `Bearer ${userToken}`)
            .send(body)
            .expect(403);
        });

        it('should deny unauthenticated action', async () => {
          await request(app)
            [method](path)
            .send(body)
            .expect(401);
        });
      });
    });
  });

  describe('Security Headers for Admin Routes', () => {
    it('should include security headers in admin responses', async () => {
      const response = await request(app)
        .get('/api/admin/ping')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify Helmet security headers
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
      expect(response.headers['referrer-policy']).toBe('no-referrer');
    });

    it('should include security headers even for denied requests', async () => {
      const response = await request(app)
        .get('/api/admin/ping')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Rate Limiting for Admin Routes', () => {
    it('should apply rate limiting after multiple requests', async () => {
      const requests = [];
      
      // Make multiple requests to test rate limiting (admin limit is 50/15min)
      for (let i = 0; i < 52; i++) {
        requests.push(
          request(app)
            .get('/api/admin/ping')
            .set('Authorization', `Bearer ${adminToken}`)
        );
      }
      
      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedRequests = responses.filter(res => res.status === 429);
      expect(rateLimitedRequests.length).toBeGreaterThan(0);
    }, 15000);
  });
});