// Test app setup helper
import express from 'express';
import cors from 'cors';
import { setupRoutes } from '../../routes';
import { getTestDb } from './database';
import { vi } from 'vitest';

export async function createTestApp(): Promise<express.Application> {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Override database instance for testing
  const testDb = getTestDb();
  
  // Setup routes with test database
  await setupRoutes(app, testDb);

  return app;
}

export function createMockRequest(options: any = {}) {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    user: null,
    ...options
  };
}

export function createMockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  return res;
}

export function createMockNext() {
  return vi.fn();
}