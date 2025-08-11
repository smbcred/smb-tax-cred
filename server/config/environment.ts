/**
 * Environment configuration with validation
 * Ensures all required environment variables are present
 */

import { z } from 'zod';

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(5000),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  
  // Payment processing
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  
  // Email services
  SENDGRID_API_KEY: z.string().optional(),
  
  // AI Services
  CLAUDE_API_KEY: z.string().optional(),
  
  // Document generation
  DOCUMINT_API_KEY: z.string().optional(),
  
  // Object storage
  DEFAULT_OBJECT_STORAGE_BUCKET_ID: z.string().optional(),
  PUBLIC_OBJECT_SEARCH_PATHS: z.string().optional(),
  PRIVATE_OBJECT_DIR: z.string().optional(),
  
  // External integrations
  AIRTABLE_API_KEY: z.string().optional(),
  AIRTABLE_BASE_ID: z.string().optional(),
  MAKE_WEBHOOK_URL: z.string().url().optional(),
  
  // Law regime feature flags
  LAW_REGIME: z.enum(['current', 'legacy', 'proposed']).default('current'),
  
  // Security
  ENCRYPTION_KEY: z.string().min(32).optional(),
  
  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Validate environment on module load
let validatedEnv: z.infer<typeof EnvironmentSchema>;

try {
  validatedEnv = EnvironmentSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export const env = validatedEnv;

/**
 * Get feature flags based on environment
 */
export function getFeatureFlags() {
  return {
    enableClaudeGeneration: !!env.CLAUDE_API_KEY,
    enableEmailNotifications: !!env.SENDGRID_API_KEY,
    enableObjectStorage: !!(env.DEFAULT_OBJECT_STORAGE_BUCKET_ID && env.PUBLIC_OBJECT_SEARCH_PATHS),
    enableDocumentGeneration: !!env.DOCUMINT_API_KEY,
    enableAirtableIntegration: !!(env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID),
    enableMakeAutomation: !!env.MAKE_WEBHOOK_URL,
    lawRegime: env.LAW_REGIME,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
  };
}

/**
 * Get service availability status
 */
export function getServiceStatus() {
  const flags = getFeatureFlags();
  
  return {
    database: 'required',
    authentication: 'required',
    payments: 'required',
    email: flags.enableEmailNotifications ? 'available' : 'disabled',
    aiGeneration: flags.enableClaudeGeneration ? 'available' : 'disabled',
    objectStorage: flags.enableObjectStorage ? 'available' : 'disabled',
    documentGeneration: flags.enableDocumentGeneration ? 'available' : 'disabled',
    airtable: flags.enableAirtableIntegration ? 'available' : 'disabled',
    automation: flags.enableMakeAutomation ? 'available' : 'disabled',
  };
}