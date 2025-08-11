// Test setup configuration for comprehensive testing suite
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver  
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
) as any;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock crypto for testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mocked-uuid'),
    getRandomValues: vi.fn().mockReturnValue(new Uint32Array(10)),
  },
});

// Mock process.env for testing
process.env.NODE_ENV = 'test';
process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    elements: vi.fn(() => ({
      create: vi.fn(() => ({
        mount: vi.fn(),
        unmount: vi.fn(),
        destroy: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
      })),
      getElement: vi.fn(),
    })),
    confirmPayment: vi.fn(),
    confirmSetup: vi.fn(),
  })),
}));

// Mock React Router
vi.mock('wouter', () => ({
  Route: ({ children }: { children: React.ReactNode }) => children,
  Switch: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => 
    React.createElement('a', { href }, children),
  useLocation: vi.fn(() => ['/', vi.fn()]),
  useRoute: vi.fn(() => [false, {}]),
}));

// Custom matchers
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = document.body.contains(received);
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be in document`,
      pass,
    };
  },
});

// Console warnings and errors should fail tests in CI
if (process.env.CI) {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    originalWarn(...args);
    throw new Error(`Console warning: ${args.join(' ')}`);
  };
  
  console.error = (...args) => {
    originalError(...args);
    throw new Error(`Console error: ${args.join(' ')}`);
  };
}