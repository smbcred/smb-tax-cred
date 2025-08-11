import { z } from 'zod';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  INTEGRATION = 'integration',
  DATABASE = 'database',
  PAYMENT = 'payment',
  EMAIL = 'email',
  DOCUMENT = 'document',
  SYSTEM = 'system',
  FORM = 'form',
  API = 'api',
  UNKNOWN = 'unknown'
}

// Error context schema for client-side reporting
export const clientErrorContextSchema = z.object({
  errorId: z.string(),
  url: z.string(),
  userAgent: z.string(),
  timestamp: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  componentStack: z.string().optional(),
  errorBoundary: z.boolean().optional(),
  retryCount: z.number().optional(),
  severity: z.nativeEnum(ErrorSeverity).optional(),
  category: z.string().optional(),
  viewport: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  screen: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  connection: z.object({
    effectiveType: z.string().optional(),
    downlink: z.number().optional(),
  }).optional(),
  memory: z.object({
    usedJSHeapSize: z.number().optional(),
    totalJSHeapSize: z.number().optional(),
  }).optional(),
  additionalData: z.record(z.any()).optional(),
});

// Error report schema for API endpoints
export const errorReportSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  name: z.string(),
  context: clientErrorContextSchema,
});

// Error response schema
export const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
  errorId: z.string(),
  timestamp: z.string(),
  details: z.object({
    message: z.string(),
    stack: z.string().optional(),
    category: z.string(),
    severity: z.string(),
  }).optional(),
  validation: z.object({
    errors: z.array(z.object({
      field: z.string(),
      message: z.string(),
      code: z.string(),
    })),
  }).optional(),
  recovery: z.object({
    canRetry: z.boolean(),
    retryDelay: z.number().optional(),
    suggestedActions: z.array(z.object({
      action: z.string(),
      label: z.string(),
      url: z.string().optional(),
    })),
  }),
  support: z.object({
    email: z.string(),
    message: z.string(),
  }).optional(),
});

// Error statistics schema
export const errorStatsSchema = z.object({
  totalErrors: z.number(),
  errorsBySeverity: z.record(z.nativeEnum(ErrorSeverity), z.number()),
  errorsByCategory: z.record(z.nativeEnum(ErrorCategory), z.number()),
  resolvedCount: z.number(),
  unresolvedCount: z.number(),
  averageResolutionTime: z.number(),
});

// Error log schema for API responses
export const errorLogResponseSchema = z.object({
  id: z.string(),
  message: z.string(),
  severity: z.nativeEnum(ErrorSeverity),
  category: z.nativeEnum(ErrorCategory),
  resolved: z.boolean(),
  resolvedAt: z.string().optional(),
  resolvedBy: z.string().optional(),
  resolution: z.string().optional(),
  occurrenceCount: z.number(),
  firstOccurrence: z.string(),
  lastOccurrence: z.string(),
  context: z.object({
    userId: z.string().optional(),
    endpoint: z.string().optional(),
    timestamp: z.string(),
  }),
});

// Type exports
export type ClientErrorContext = z.infer<typeof clientErrorContextSchema>;
export type ErrorReport = z.infer<typeof errorReportSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type ErrorStats = z.infer<typeof errorStatsSchema>;
export type ErrorLogResponse = z.infer<typeof errorLogResponseSchema>;

// Recovery action types
export interface RecoveryAction {
  action: string;
  label: string;
  url?: string;
}

// Common recovery actions
export const RECOVERY_ACTIONS = {
  LOGIN: { action: 'login', label: 'Sign in again', url: '/login' },
  CONTACT_SUPPORT: { action: 'contact_support', label: 'Contact support', url: '/support' },
  GO_HOME: { action: 'go_home', label: 'Go to dashboard', url: '/dashboard' },
  GO_BACK: { action: 'go_back', label: 'Go back' },
  REFRESH_PAGE: { action: 'refresh_page', label: 'Refresh the page' },
  TRY_AGAIN: { action: 'try_again', label: 'Try again' },
  REVIEW_FORM: { action: 'review_form', label: 'Review form fields' },
  CLEAR_FORM: { action: 'clear_form', label: 'Start over' },
  CHECK_PAYMENT: { action: 'check_payment', label: 'Check payment details' },
  TRY_DIFFERENT_CARD: { action: 'try_different_card', label: 'Try a different payment method' },
  CHECK_STATUS: { action: 'check_status', label: 'Check document status', url: '/dashboard' },
  WAIT_RETRY: { action: 'wait_retry', label: 'Wait and try again' },
} as const;

// Error handling utilities
export function isRetryableError(statusCode: number, category: ErrorCategory): boolean {
  return [500, 502, 503, 504].includes(statusCode) || 
         [ErrorCategory.INTEGRATION, ErrorCategory.DATABASE].includes(category);
}

export function getRetryDelay(statusCode: number, category: ErrorCategory): number {
  if (statusCode === 429) return 60000; // 1 minute for rate limiting
  if (isRetryableError(statusCode, category)) return 5000; // 5 seconds for server errors
  return 0;
}

export function shouldShowSupportContact(severity: ErrorSeverity): boolean {
  return severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH;
}