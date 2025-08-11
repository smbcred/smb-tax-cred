// Security tests for R&D Tax Credit SaaS
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestDatabase, teardownTestDatabase } from '../../server/__tests__/helpers/database';
import { createTestApp } from '../../server/__tests__/helpers/app';

describe('Security Tests', () => {
  let app: any;

  beforeAll(async () => {
    await setupTestDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('Input Validation & Sanitization', () => {
    it('should reject SQL injection attempts', async () => {
      const maliciousPayload = {
        email: "admin@test.com'; DROP TABLE users; --",
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(maliciousPayload)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should reject XSS attempts in form inputs', async () => {
      const xssPayload = {
        email: 'test@example.com',
        password: 'password123',
        firstName: '<script>alert("xss")</script>',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(xssPayload)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should sanitize calculator input data', async () => {
      const maliciousCalculationData = {
        businessType: '<script>alert("hack")</script>',
        annualRevenue: 'javascript:alert(1)',
        employeeCount: 10,
        aiActivities: ['<img src=x onerror=alert(1)>'],
        timeSpent: 25,
        teamSize: 3,
        expenses: {
          salaries: 150000,
          contractors: 50000,
          software: 10000,
          training: 5000,
          equipment: 0
        }
      };

      const response = await request(app)
        .post('/api/calculations')
        .send(maliciousCalculationData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Authentication & Authorization', () => {
    it('should require valid JWT tokens for protected routes', async () => {
      await request(app)
        .get('/api/calculations')
        .expect(401);

      await request(app)
        .get('/api/calculations')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should not expose sensitive data in responses', async () => {
      const userData = {
        email: 'security@test.com',
        password: 'SecurePassword123!',
        firstName: 'Security',
        lastName: 'Test'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200);

      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should implement rate limiting on auth endpoints', async () => {
      const invalidCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make multiple failed login attempts
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/login')
            .send(invalidCredentials)
        );
      }

      const responses = await Promise.all(attempts);
      
      // Should eventually start returning 429 (Too Many Requests)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Data Protection', () => {
    it('should encrypt sensitive data in transit', async () => {
      // This test would verify HTTPS in production
      // For now, we verify security headers are present
      const response = await request(app)
        .get('/')
        .expect(200);

      // Check for security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    it('should validate file upload restrictions', async () => {
      // Test file upload security if implemented
      const maliciousFile = Buffer.from('<?php echo "hacked"; ?>');
      
      const response = await request(app)
        .post('/api/upload')
        .attach('file', maliciousFile, 'malicious.php')
        .expect(400); // Should reject PHP files

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Business Logic Security', () => {
    it('should prevent calculation manipulation', async () => {
      // Register and login first
      const userData = {
        email: 'calc@test.com',
        password: 'Password123!',
        firstName: 'Calc',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      const authToken = loginResponse.body.token;

      // Try to manipulate calculation results
      const manipulatedData = {
        businessType: 'consulting',
        annualRevenue: 100, // Very low revenue
        employeeCount: 1,
        aiActivities: ['process-automation'],
        timeSpent: 1, // Minimal time
        teamSize: 1,
        expenses: {
          salaries: 10,
          contractors: 10,
          software: 10,
          training: 10,
          equipment: 10
        },
        // Attempting to inject pre-calculated results
        results: {
          qualified: { total: 999999999 },
          credit: { federal: 999999999, ases: 999999999 },
          savings: { total: 999999999 }
        }
      };

      const response = await request(app)
        .post('/api/calculations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(manipulatedData)
        .expect(201);

      // Results should be calculated server-side, not from client input
      expect(response.body.results.credit.federal).toBeLessThan(1000); // Should be minimal for tiny inputs
    });

    it('should validate business rules consistently', async () => {
      // Register and login
      const userData = {
        email: 'rules@test.com',
        password: 'Password123!',
        firstName: 'Rules',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      const authToken = loginResponse.body.token;

      // Test extreme values that should be rejected
      const extremeData = {
        businessType: 'consulting',
        annualRevenue: -1000000, // Negative revenue
        employeeCount: -50, // Negative employees
        aiActivities: [],
        timeSpent: 150, // > 100%
        teamSize: -5, // Negative team size
        expenses: {
          salaries: -100000,
          contractors: -50000,
          software: -10000,
          training: -5000,
          equipment: -1000
        }
      };

      await request(app)
        .post('/api/calculations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(extremeData)
        .expect(400);
    });
  });

  describe('Privacy Compliance', () => {
    it('should handle data deletion requests', async () => {
      // Register user
      const userData = {
        email: 'privacy@test.com',
        password: 'Password123!',
        firstName: 'Privacy',
        lastName: 'User'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const userId = registerResponse.body.user.id;

      // Test data deletion endpoint (if implemented)
      const response = await request(app)
        .delete(`/api/users/${userId}/data`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');
    });

    it('should support opt-out of analytics tracking', async () => {
      const response = await request(app)
        .post('/api/analytics/opt-out')
        .send({ email: 'optout@test.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success');
    });
  });
});