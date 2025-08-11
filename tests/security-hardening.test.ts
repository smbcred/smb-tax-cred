/**
 * Test suite for security hardening (Task 6.1.6)
 */

import request from 'supertest';
import { Express } from 'express';
import { registerRoutes } from '../server/routes';
import jwt from 'jsonwebtoken';
import { maskSecrets } from '../server/middleware/security';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const adminUser = { id: 'admin-user-id', email: 'admin@test.com', isAdmin: true };
const userToken = jwt.sign({ id: 'user-123', isAdmin: false }, JWT_SECRET);
const adminToken = jwt.sign(adminUser, JWT_SECRET);

let app: Express;

beforeAll(async () => {
  app = (await import('express')).default();
  await registerRoutes(app);
});

describe('Security Hardening Tests', () => {
  describe('Rate Limiting', () => {
    it('should apply rate limiting to admin endpoints', async () => {
      const endpoint = '/api/admin/ping';
      const requests = [];
      
      // Make multiple requests to test rate limiting
      for (let i = 0; i < 52; i++) { // Exceed the 50 request limit
        requests.push(
          request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${adminToken}`)
        );
      }
      
      const responses = await Promise.all(requests);
      
      // First 50 should succeed
      const successfulRequests = responses.filter(res => res.status === 200);
      expect(successfulRequests.length).toBeLessThanOrEqual(50);
      
      // Later requests should be rate limited
      const rateLimitedRequests = responses.filter(res => res.status === 429);
      expect(rateLimitedRequests.length).toBeGreaterThan(0);
    }, 10000); // Increase timeout for this test

    it('should apply stricter rate limiting to admin actions', async () => {
      const endpoint = '/api/admin/documents/test-doc/resend-email';
      const requests = [];
      
      // Make multiple action requests
      for (let i = 0; i < 12; i++) { // Exceed the 10 action limit
        requests.push(
          request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ reason: `Test ${i}` })
        );
      }
      
      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedRequests = responses.filter(res => res.status === 429);
      expect(rateLimitedRequests.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Helmet Security Headers', () => {
    it('should include security headers in admin responses', async () => {
      const response = await request(app)
        .get('/api/admin/ping')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Check for key security headers
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
      expect(response.headers['referrer-policy']).toBe('no-referrer');
    });

    it('should include CSP headers', async () => {
      const response = await request(app)
        .get('/api/admin/ping')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });
  });

  describe('Secret Masking', () => {
    it('should mask sensitive keys in objects', () => {
      const sensitiveData = {
        email: 'test@example.com',
        password: 'secret123',
        stripeSecretKey: 'sk_test_123456',
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        normalData: 'this should not be masked'
      };

      const masked = maskSecrets(sensitiveData);

      expect(masked.email).toBe('test@example.com');
      expect(masked.password).toBe('***MASKED***');
      expect(masked.stripeSecretKey).toBe('***MASKED***');
      expect(masked.jwtToken).toBe('***MASKED***');
      expect(masked.normalData).toBe('this should not be masked');
    });

    it('should mask secrets in strings', () => {
      const stringWithSecrets = 'postgresql://user:password123@localhost/db?api_key=secret';
      const masked = maskSecrets(stringWithSecrets);
      
      expect(masked).toContain('***MASKED***');
      expect(masked).not.toContain('password123');
      expect(masked).not.toContain('secret');
    });

    it('should mask JWT tokens in strings', () => {
      const jwtString = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const masked = maskSecrets(jwtString);
      
      expect(masked).toContain('***MASKED_JWT***');
      expect(masked).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('should mask Stripe keys', () => {
      const stripeData = {
        secretKey: 'sk_test_123456789',
        publicKey: 'pk_test_987654321'
      };
      
      const masked = maskSecrets(stripeData);
      
      expect(masked.secretKey).toBe('***MASKED***');
      expect(masked.publicKey).toBe('***MASKED***');
    });
  });

  describe('IP Allowlist (Optional)', () => {
    it('should allow access when no allowlist is configured', async () => {
      // No ADMIN_IP_ALLOWLIST set, should allow all IPs
      const response = await request(app)
        .get('/api/admin/ping')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Admin API is accessible');
    });

    // Note: Testing actual IP blocking would require setting environment variables
    // and controlling the request IP, which is complex in the test environment
  });

  describe('Response Security', () => {
    it('should not return sensitive data in responses', async () => {
      // Test that admin endpoints don't accidentally return secrets
      const response = await request(app)
        .get('/api/admin/ping')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const responseString = JSON.stringify(response.body);
      
      // Check that no common secret patterns are in the response
      expect(responseString).not.toMatch(/sk_[a-zA-Z0-9_]+/); // Stripe secret keys
      expect(responseString).not.toMatch(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/); // JWT tokens
      expect(responseString).not.toContain('password');
      expect(responseString).not.toContain('secret');
    });
  });

  describe('Non-Admin Access', () => {
    it('should reject non-admin users even with security headers', async () => {
      const response = await request(app)
        .get('/api/admin/ping')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Should still have security headers even for rejected requests
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should reject unauthenticated requests', async () => {
      await request(app)
        .get('/api/admin/ping')
        .expect(401);
    });
  });
});