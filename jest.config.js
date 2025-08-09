module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'server/**/*.ts',
    '!server/**/*.d.ts',
    '!server/**/*.test.ts',
    '!server/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/server/src/$1',
    '^@controllers/(.*)$': '<rootDir>/server/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/server/src/services/$1',
    '^@models/(.*)$': '<rootDir>/server/src/models/$1',
    '^@middleware/(.*)$': '<rootDir>/server/src/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/server/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/server/src/types/$1',
  },
};