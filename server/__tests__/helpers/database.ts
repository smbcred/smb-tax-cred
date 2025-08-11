// Database test helpers for setting up and tearing down test database
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from '../../shared/schema';

let testDbClient: any;
let testDb: any;

export async function setupTestDatabase() {
  // Use a test database URL or in-memory database for testing
  const testDatabaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!testDatabaseUrl) {
    throw new Error('TEST_DATABASE_URL or DATABASE_URL must be set for testing');
  }

  testDbClient = neon(testDatabaseUrl);
  testDb = drizzle(testDbClient, { schema });

  // Run migrations on test database
  try {
    await migrate(testDb, { migrationsFolder: './drizzle' });
  } catch (error) {
    console.log('Migration not needed or already applied:', error);
  }

  return testDb;
}

export async function teardownTestDatabase() {
  if (testDb) {
    // Clean up test data
    try {
      await testDb.delete(schema.users);
      await testDb.delete(schema.companies);
      await testDb.delete(schema.calculations);
      await testDb.delete(schema.payments);
      await testDb.delete(schema.intakeForms);
      await testDb.delete(schema.leads);
      await testDb.delete(schema.documents);
    } catch (error) {
      console.log('Error cleaning test database:', error);
    }
  }
}

export async function clearTestData() {
  if (!testDb) {
    throw new Error('Test database not initialized');
  }

  // Clear all tables
  try {
    await testDb.delete(schema.documents);
    await testDb.delete(schema.leads);
    await testDb.delete(schema.intakeForms);
    await testDb.delete(schema.payments);
    await testDb.delete(schema.calculations);
    await testDb.delete(schema.companies);
    await testDb.delete(schema.users);
  } catch (error) {
    console.log('Error clearing test data:', error);
  }
}

export function getTestDb() {
  if (!testDb) {
    throw new Error('Test database not initialized. Call setupTestDatabase first.');
  }
  return testDb;
}

export async function createTestUser(userData: any = {}) {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    password: 'hashedpassword123', // In real app, this would be bcrypt hashed
    ...userData
  };

  const [user] = await testDb.insert(schema.users).values(defaultUser).returning();
  return user;
}

export async function createTestCompany(userId: string, companyData: any = {}) {
  const defaultCompany = {
    userId,
    name: 'Test Company',
    industry: 'Technology',
    ein: '12-3456789',
    address: '123 Test St',
    city: 'Test City',
    state: 'CA',
    zipCode: '12345',
    phone: '555-0123',
    ...companyData
  };

  const [company] = await testDb.insert(schema.companies).values(defaultCompany).returning();
  return company;
}

export async function createTestCalculation(userId: string, calculationData: any = {}) {
  const defaultCalculation = {
    userId,
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
    },
    results: {
      qualified: { total: 100000 },
      credit: { federal: 20000, ases: 1200 },
      savings: { total: 21200 }
    },
    ...calculationData
  };

  const [calculation] = await testDb.insert(schema.calculations).values(defaultCalculation).returning();
  return calculation;
}