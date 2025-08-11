// Integration tests for calculator flow
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupTestDatabase, teardownTestDatabase, clearTestData, createTestUser } from '../../server/__tests__/helpers/database';
import { createTestApp } from '../../server/__tests__/helpers/app';

describe('Calculator Integration Tests', () => {
  let app: any;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
    testUser = await createTestUser({
      email: 'calculator@test.com',
      firstName: 'Calculator',
      lastName: 'User'
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'hashedpassword123'
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/calculations', () => {
    it('should create a new calculation with valid data', async () => {
      const calculationData = {
        businessType: 'consulting',
        annualRevenue: 500000,
        employeeCount: 10,
        aiActivities: ['process-automation'],
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
        .set('Authorization', `Bearer ${authToken}`)
        .send(calculationData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toHaveProperty('qualified');
      expect(response.body.results).toHaveProperty('credit');
      expect(response.body.results).toHaveProperty('savings');
      expect(response.body.businessType).toBe('consulting');
    });

    it('should validate expense data correctly', async () => {
      const invalidCalculationData = {
        businessType: 'consulting',
        annualRevenue: 500000,
        employeeCount: 10,
        aiActivities: ['process-automation'],
        timeSpent: 25,
        teamSize: 3,
        expenses: {
          salaries: -1000, // Invalid negative value
          contractors: 50000,
          software: 10000,
          training: 5000,
          equipment: 0
        }
      };

      const response = await request(app)
        .post('/api/calculations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCalculationData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should require authentication', async () => {
      const calculationData = {
        businessType: 'consulting',
        annualRevenue: 500000,
        employeeCount: 10,
        aiActivities: ['process-automation'],
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

      await request(app)
        .post('/api/calculations')
        .send(calculationData)
        .expect(401);
    });
  });

  describe('GET /api/calculations', () => {
    it('should retrieve user calculations', async () => {
      // Create a calculation first
      const calculationData = {
        businessType: 'consulting',
        annualRevenue: 500000,
        employeeCount: 10,
        aiActivities: ['process-automation'],
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

      await request(app)
        .post('/api/calculations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(calculationData);

      const response = await request(app)
        .get('/api/calculations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('businessType');
    });

    it('should return empty array for new user', async () => {
      const response = await request(app)
        .get('/api/calculations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('Calculator Business Logic', () => {
    it('should calculate R&D credit correctly for different business types', async () => {
      const testCases = [
        {
          businessType: 'consulting',
          expectedMinCredit: 10000
        },
        {
          businessType: 'manufacturing',
          expectedMinCredit: 15000
        },
        {
          businessType: 'technology',
          expectedMinCredit: 20000
        }
      ];

      for (const testCase of testCases) {
        const calculationData = {
          businessType: testCase.businessType,
          annualRevenue: 1000000,
          employeeCount: 20,
          aiActivities: ['process-automation', 'data-analysis'],
          timeSpent: 50,
          teamSize: 5,
          expenses: {
            salaries: 300000,
            contractors: 100000,
            software: 20000,
            training: 10000,
            equipment: 5000
          }
        };

        const response = await request(app)
          .post('/api/calculations')
          .set('Authorization', `Bearer ${authToken}`)
          .send(calculationData);

        expect(response.status).toBe(201);
        expect(response.body.results.credit.federal).toBeGreaterThan(testCase.expectedMinCredit);
      }
    });

    it('should apply contractor cost limitations correctly', async () => {
      const calculationData = {
        businessType: 'consulting',
        annualRevenue: 500000,
        employeeCount: 5,
        aiActivities: ['process-automation'],
        timeSpent: 100, // 100% time allocation
        teamSize: 2,
        expenses: {
          salaries: 100000,
          contractors: 500000, // Very high contractor costs
          software: 10000,
          training: 5000,
          equipment: 0
        }
      };

      const response = await request(app)
        .post('/api/calculations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(calculationData)
        .expect(201);

      // Contractor costs should be limited
      const qualifiedContractors = response.body.results.qualified.contractors;
      const totalQualified = response.body.results.qualified.total;
      
      // Contractor costs should not exceed 65% of total qualified expenses
      expect(qualifiedContractors).toBeLessThanOrEqual(totalQualified * 0.65);
    });
  });
});