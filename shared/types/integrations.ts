import { z } from 'zod';

// Integration status types
export enum IntegrationStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  FAILED = 'failed',
  RECOVERING = 'recovering',
  MAINTENANCE = 'maintenance'
}

// Integration types
export enum IntegrationType {
  DATABASE = 'database',
  EMAIL = 'email',
  PAYMENT = 'payment',
  STORAGE = 'storage',
  AI = 'ai',
  PDF = 'pdf',
  AIRTABLE = 'airtable',
  WEBHOOK = 'webhook'
}

// Retry strategy types
export enum RetryStrategy {
  EXPONENTIAL = 'exponential',
  LINEAR = 'linear',
  IMMEDIATE = 'immediate',
  CUSTOM = 'custom'
}

// Job status types
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled',
  MANUAL_INTERVENTION = 'manual_intervention'
}

// Job priority levels
export enum JobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Integration health check schema
export const integrationHealthCheckSchema = z.object({
  integration: z.nativeEnum(IntegrationType),
  status: z.nativeEnum(IntegrationStatus),
  lastChecked: z.string(),
  responseTime: z.number(),
  errorCount: z.number(),
  lastError: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Retry configuration schema
export const retryConfigSchema = z.object({
  maxAttempts: z.number().min(1).max(10),
  strategy: z.nativeEnum(RetryStrategy),
  baseDelay: z.number().min(100), // milliseconds
  maxDelay: z.number().min(1000), // milliseconds
  backoffMultiplier: z.number().min(1).max(5),
  jitter: z.boolean().default(true),
  retryCondition: z.function().optional(),
});

// Job definition schema
export const jobDefinitionSchema = z.object({
  id: z.string(),
  type: z.string(),
  priority: z.nativeEnum(JobPriority),
  payload: z.record(z.any()),
  integration: z.nativeEnum(IntegrationType),
  retryConfig: retryConfigSchema,
  createdAt: z.string(),
  scheduledFor: z.string().optional(),
  timeout: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

// Job execution result schema
export const jobResultSchema = z.object({
  jobId: z.string(),
  status: z.nativeEnum(JobStatus),
  attempts: z.number(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  result: z.any().optional(),
  error: z.object({
    message: z.string(),
    stack: z.string().optional(),
    code: z.string().optional(),
    retryable: z.boolean(),
  }).optional(),
  nextRetryAt: z.string().optional(),
});

// Integration metrics schema
export const integrationMetricsSchema = z.object({
  integration: z.nativeEnum(IntegrationType),
  period: z.string(),
  totalRequests: z.number(),
  successfulRequests: z.number(),
  failedRequests: z.number(),
  averageResponseTime: z.number(),
  p95ResponseTime: z.number(),
  errorRate: z.number(),
  availability: z.number(),
  lastFailure: z.string().optional(),
});

// Manual intervention request schema
export const manualInterventionSchema = z.object({
  jobId: z.string(),
  reason: z.string(),
  action: z.enum(['retry', 'skip', 'cancel', 'modify']),
  modifiedPayload: z.record(z.any()).optional(),
  notes: z.string().optional(),
  requestedBy: z.string(),
  requestedAt: z.string(),
});

// Integration recovery configuration schema
export const recoveryConfigSchema = z.object({
  integration: z.nativeEnum(IntegrationType),
  enabled: z.boolean(),
  healthCheckInterval: z.number(), // seconds
  retryConfig: retryConfigSchema,
  fallbackEnabled: z.boolean(),
  fallbackConfig: z.record(z.any()).optional(),
  alertThreshold: z.number(), // error count threshold
  escalationDelay: z.number(), // minutes before escalation
  autoRecoveryEnabled: z.boolean(),
});

// Integration status update schema
export const statusUpdateSchema = z.object({
  integration: z.nativeEnum(IntegrationType),
  status: z.nativeEnum(IntegrationStatus),
  message: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
  affectedJobs: z.array(z.string()).optional(),
});

// Queue statistics schema
export const queueStatsSchema = z.object({
  totalJobs: z.number(),
  pendingJobs: z.number(),
  processingJobs: z.number(),
  completedJobs: z.number(),
  failedJobs: z.number(),
  retryingJobs: z.number(),
  manualInterventionJobs: z.number(),
  averageProcessingTime: z.number(),
  throughput: z.number(), // jobs per minute
});

// Type exports
export type IntegrationHealthCheck = z.infer<typeof integrationHealthCheckSchema>;
export type RetryConfig = z.infer<typeof retryConfigSchema>;
export type JobDefinition = z.infer<typeof jobDefinitionSchema>;
export type JobResult = z.infer<typeof jobResultSchema>;
export type IntegrationMetrics = z.infer<typeof integrationMetricsSchema>;
export type ManualIntervention = z.infer<typeof manualInterventionSchema>;
export type RecoveryConfig = z.infer<typeof recoveryConfigSchema>;
export type StatusUpdate = z.infer<typeof statusUpdateSchema>;
export type QueueStats = z.infer<typeof queueStatsSchema>;

// Default retry configurations for different integration types
export const DEFAULT_RETRY_CONFIGS: Record<IntegrationType, RetryConfig> = {
  [IntegrationType.DATABASE]: {
    maxAttempts: 3,
    strategy: RetryStrategy.EXPONENTIAL,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
  },
  [IntegrationType.EMAIL]: {
    maxAttempts: 5,
    strategy: RetryStrategy.EXPONENTIAL,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
  },
  [IntegrationType.PAYMENT]: {
    maxAttempts: 3,
    strategy: RetryStrategy.LINEAR,
    baseDelay: 5000,
    maxDelay: 15000,
    backoffMultiplier: 1,
    jitter: false,
  },
  [IntegrationType.STORAGE]: {
    maxAttempts: 4,
    strategy: RetryStrategy.EXPONENTIAL,
    baseDelay: 1500,
    maxDelay: 20000,
    backoffMultiplier: 2,
    jitter: true,
  },
  [IntegrationType.AI]: {
    maxAttempts: 3,
    strategy: RetryStrategy.EXPONENTIAL,
    baseDelay: 3000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
  },
  [IntegrationType.PDF]: {
    maxAttempts: 3,
    strategy: RetryStrategy.EXPONENTIAL,
    baseDelay: 2000,
    maxDelay: 15000,
    backoffMultiplier: 2,
    jitter: true,
  },
  [IntegrationType.AIRTABLE]: {
    maxAttempts: 4,
    strategy: RetryStrategy.EXPONENTIAL,
    baseDelay: 2000,
    maxDelay: 25000,
    backoffMultiplier: 2,
    jitter: true,
  },
  [IntegrationType.WEBHOOK]: {
    maxAttempts: 5,
    strategy: RetryStrategy.EXPONENTIAL,
    baseDelay: 1000,
    maxDelay: 20000,
    backoffMultiplier: 2,
    jitter: true,
  },
};

// Default recovery configurations
export const DEFAULT_RECOVERY_CONFIGS: Record<IntegrationType, RecoveryConfig> = {
  [IntegrationType.DATABASE]: {
    integration: IntegrationType.DATABASE,
    enabled: true,
    healthCheckInterval: 30,
    retryConfig: DEFAULT_RETRY_CONFIGS[IntegrationType.DATABASE],
    fallbackEnabled: false,
    alertThreshold: 5,
    escalationDelay: 5,
    autoRecoveryEnabled: true,
  },
  [IntegrationType.EMAIL]: {
    integration: IntegrationType.EMAIL,
    enabled: true,
    healthCheckInterval: 60,
    retryConfig: DEFAULT_RETRY_CONFIGS[IntegrationType.EMAIL],
    fallbackEnabled: true,
    fallbackConfig: { provider: 'backup' },
    alertThreshold: 3,
    escalationDelay: 10,
    autoRecoveryEnabled: true,
  },
  [IntegrationType.PAYMENT]: {
    integration: IntegrationType.PAYMENT,
    enabled: true,
    healthCheckInterval: 30,
    retryConfig: DEFAULT_RETRY_CONFIGS[IntegrationType.PAYMENT],
    fallbackEnabled: false,
    alertThreshold: 2,
    escalationDelay: 5,
    autoRecoveryEnabled: false,
  },
  [IntegrationType.STORAGE]: {
    integration: IntegrationType.STORAGE,
    enabled: true,
    healthCheckInterval: 45,
    retryConfig: DEFAULT_RETRY_CONFIGS[IntegrationType.STORAGE],
    fallbackEnabled: false,
    alertThreshold: 4,
    escalationDelay: 10,
    autoRecoveryEnabled: true,
  },
  [IntegrationType.AI]: {
    integration: IntegrationType.AI,
    enabled: true,
    healthCheckInterval: 60,
    retryConfig: DEFAULT_RETRY_CONFIGS[IntegrationType.AI],
    fallbackEnabled: false,
    alertThreshold: 3,
    escalationDelay: 15,
    autoRecoveryEnabled: true,
  },
  [IntegrationType.PDF]: {
    integration: IntegrationType.PDF,
    enabled: true,
    healthCheckInterval: 60,
    retryConfig: DEFAULT_RETRY_CONFIGS[IntegrationType.PDF],
    fallbackEnabled: false,
    alertThreshold: 3,
    escalationDelay: 10,
    autoRecoveryEnabled: true,
  },
  [IntegrationType.AIRTABLE]: {
    integration: IntegrationType.AIRTABLE,
    enabled: true,
    healthCheckInterval: 120,
    retryConfig: DEFAULT_RETRY_CONFIGS[IntegrationType.AIRTABLE],
    fallbackEnabled: false,
    alertThreshold: 4,
    escalationDelay: 15,
    autoRecoveryEnabled: true,
  },
  [IntegrationType.WEBHOOK]: {
    integration: IntegrationType.WEBHOOK,
    enabled: true,
    healthCheckInterval: 90,
    retryConfig: DEFAULT_RETRY_CONFIGS[IntegrationType.WEBHOOK],
    fallbackEnabled: false,
    alertThreshold: 5,
    escalationDelay: 10,
    autoRecoveryEnabled: true,
  },
};

// Error classification utilities
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true;
  
  // HTTP status codes that are retryable
  const retryableStatusCodes = [429, 500, 502, 503, 504];
  if (error.status && retryableStatusCodes.includes(error.status)) return true;
  
  // Database connection errors
  if (error.message?.includes('connection') || error.message?.includes('timeout')) return true;
  
  // Rate limiting
  if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) return true;
  
  return false;
}

export function shouldEscalate(errorCount: number, integration: IntegrationType): boolean {
  const config = DEFAULT_RECOVERY_CONFIGS[integration];
  return errorCount >= config.alertThreshold;
}

export function getNextRetryDelay(
  attempt: number,
  retryConfig: RetryConfig
): number {
  const { strategy, baseDelay, maxDelay, backoffMultiplier, jitter } = retryConfig;
  
  let delay: number;
  
  switch (strategy) {
    case RetryStrategy.EXPONENTIAL:
      delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt - 1), maxDelay);
      break;
    case RetryStrategy.LINEAR:
      delay = Math.min(baseDelay * attempt, maxDelay);
      break;
    case RetryStrategy.IMMEDIATE:
      delay = 0;
      break;
    default:
      delay = baseDelay;
  }
  
  // Add jitter to prevent thundering herd
  if (jitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }
  
  return Math.floor(delay);
}