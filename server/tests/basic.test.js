/**
 * Basic test to ensure test infrastructure works
 */
import { describe, it, expect } from 'vitest';

describe('Server Infrastructure', () => {
  it('should exist', () => {
    expect(true).toBe(true);
  });

  it('should have environment variables', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});