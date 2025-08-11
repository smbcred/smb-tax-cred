import winston from 'winston';
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
  UNKNOWN = 'unknown'
}

// Error context schema
export const errorContextSchema = z.object({
  userId: z.string().optional(),
  requestId: z.string().optional(),
  endpoint: z.string().optional(),
  method: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  sessionId: z.string().optional(),
  timestamp: z.string(),
  stackTrace: z.string().optional(),
  additionalData: z.record(z.any()).optional(),
});

export const errorLogSchema = z.object({
  id: z.string(),
  message: z.string(),
  severity: z.nativeEnum(ErrorSeverity),
  category: z.nativeEnum(ErrorCategory),
  context: errorContextSchema,
  resolved: z.boolean().default(false),
  resolvedAt: z.string().optional(),
  resolvedBy: z.string().optional(),
  resolution: z.string().optional(),
  occurrenceCount: z.number().default(1),
  firstOccurrence: z.string(),
  lastOccurrence: z.string(),
});

export type ErrorContext = z.infer<typeof errorContextSchema>;
export type ErrorLog = z.infer<typeof errorLogSchema>;

export class LoggingService {
  private logger: winston.Logger;
  private errorStore: Map<string, ErrorLog> = new Map();

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta
          });
        })
      ),
      defaultMeta: {
        service: 'smb-tax-credits',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          )
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      ],
    });

    console.log('Logging service initialized:', {
      level: this.logger.level,
      environment: process.env.NODE_ENV,
    });
  }

  // Log an error with context
  logError(
    message: string,
    error: Error | unknown,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context: Partial<ErrorContext> = {}
  ): string {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();
    
    const fullContext: ErrorContext = {
      timestamp,
      stackTrace: error instanceof Error ? error.stack : undefined,
      ...context,
    };

    // Create or update error log entry
    const existingError = this.findSimilarError(message, category);
    if (existingError) {
      existingError.occurrenceCount++;
      existingError.lastOccurrence = timestamp;
      this.errorStore.set(existingError.id, existingError);
    } else {
      const errorLog: ErrorLog = {
        id: errorId,
        message,
        severity,
        category,
        context: fullContext,
        resolved: false,
        occurrenceCount: 1,
        firstOccurrence: timestamp,
        lastOccurrence: timestamp,
      };
      this.errorStore.set(errorId, errorLog);
    }

    // Log with Winston
    this.logger.error(message, {
      errorId,
      severity,
      category,
      context: fullContext,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });

    // Alert for critical errors
    if (severity === ErrorSeverity.CRITICAL) {
      this.alertCriticalError(errorId, message, fullContext);
    }

    return errorId;
  }

  // Log informational messages
  logInfo(message: string, data?: any): void {
    this.logger.info(message, data);
  }

  // Log debug messages
  logDebug(message: string, data?: any): void {
    this.logger.debug(message, data);
  }

  // Log warnings
  logWarning(message: string, data?: any): void {
    this.logger.warn(message, data);
  }

  // Get error by ID
  getError(errorId: string): ErrorLog | null {
    return this.errorStore.get(errorId) || null;
  }

  // Get recent errors
  getRecentErrors(limit: number = 50, severity?: ErrorSeverity): ErrorLog[] {
    const errors = Array.from(this.errorStore.values());
    
    let filteredErrors = errors;
    if (severity) {
      filteredErrors = errors.filter(error => error.severity === severity);
    }

    return filteredErrors
      .sort((a, b) => new Date(b.lastOccurrence).getTime() - new Date(a.lastOccurrence).getTime())
      .slice(0, limit);
  }

  // Get error statistics
  getErrorStats(days: number = 7): {
    totalErrors: number;
    errorsBySeverity: Record<ErrorSeverity, number>;
    errorsByCategory: Record<ErrorCategory, number>;
    resolvedCount: number;
    unresolvedCount: number;
    averageResolutionTime: number;
  } {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentErrors = Array.from(this.errorStore.values()).filter(
      error => new Date(error.firstOccurrence) >= cutoffDate
    );

    const errorsBySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = recentErrors.filter(error => error.severity === severity).length;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const errorsByCategory = Object.values(ErrorCategory).reduce((acc, category) => {
      acc[category] = recentErrors.filter(error => error.category === category).length;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const resolvedErrors = recentErrors.filter(error => error.resolved);
    const unresolvedErrors = recentErrors.filter(error => !error.resolved);

    // Calculate average resolution time
    const resolutionTimes = resolvedErrors
      .filter(error => error.resolvedAt)
      .map(error => {
        const firstOccurrence = new Date(error.firstOccurrence).getTime();
        const resolvedAt = new Date(error.resolvedAt!).getTime();
        return resolvedAt - firstOccurrence;
      });

    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;

    return {
      totalErrors: recentErrors.length,
      errorsBySeverity,
      errorsByCategory,
      resolvedCount: resolvedErrors.length,
      unresolvedCount: unresolvedErrors.length,
      averageResolutionTime: Math.round(averageResolutionTime / (1000 * 60 * 60)), // Convert to hours
    };
  }

  // Mark error as resolved
  resolveError(errorId: string, resolution: string, resolvedBy: string): boolean {
    const error = this.errorStore.get(errorId);
    if (!error) return false;

    error.resolved = true;
    error.resolvedAt = new Date().toISOString();
    error.resolvedBy = resolvedBy;
    error.resolution = resolution;

    this.errorStore.set(errorId, error);

    this.logger.info('Error resolved', {
      errorId,
      resolution,
      resolvedBy,
      originalMessage: error.message,
    });

    return true;
  }

  // Helper method to categorize errors automatically
  categorizeError(error: Error | unknown, context: Partial<ErrorContext> = {}): ErrorCategory {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      const stack = error.stack?.toLowerCase() || '';

      // Check context for endpoint clues
      const endpoint = context.endpoint?.toLowerCase() || '';

      // Authentication errors
      if (message.includes('unauthorized') || message.includes('authentication') || 
          message.includes('token') || endpoint.includes('auth')) {
        return ErrorCategory.AUTHENTICATION;
      }

      // Validation errors
      if (message.includes('validation') || message.includes('invalid') || 
          message.includes('required') || stack.includes('zod')) {
        return ErrorCategory.VALIDATION;
      }

      // Database errors
      if (message.includes('database') || message.includes('sql') || 
          message.includes('connection') || stack.includes('drizzle')) {
        return ErrorCategory.DATABASE;
      }

      // Payment errors
      if (message.includes('stripe') || message.includes('payment') || 
          endpoint.includes('payment') || endpoint.includes('checkout')) {
        return ErrorCategory.PAYMENT;
      }

      // Email errors
      if (message.includes('sendgrid') || message.includes('email') || 
          endpoint.includes('email')) {
        return ErrorCategory.EMAIL;
      }

      // Document errors
      if (message.includes('document') || message.includes('pdf') || 
          message.includes('s3') || endpoint.includes('document')) {
        return ErrorCategory.DOCUMENT;
      }

      // Integration errors
      if (message.includes('api') || message.includes('fetch') || 
          message.includes('airtable') || message.includes('claude')) {
        return ErrorCategory.INTEGRATION;
      }
    }

    return ErrorCategory.UNKNOWN;
  }

  // Helper method to determine error severity
  determineSeverity(error: Error | unknown, context: Partial<ErrorContext> = {}): ErrorSeverity {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Critical errors
      if (message.includes('payment failed') || message.includes('data loss') || 
          message.includes('security') || message.includes('breach')) {
        return ErrorSeverity.CRITICAL;
      }

      // High severity errors
      if (message.includes('database') || message.includes('authentication') || 
          message.includes('timeout') || message.includes('service unavailable')) {
        return ErrorSeverity.HIGH;
      }

      // Medium severity errors
      if (message.includes('validation') || message.includes('not found') || 
          message.includes('forbidden')) {
        return ErrorSeverity.MEDIUM;
      }
    }

    return ErrorSeverity.LOW;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private findSimilarError(message: string, category: ErrorCategory): ErrorLog | null {
    // Look for similar errors in the last 24 hours
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
    
    for (const error of Array.from(this.errorStore.values())) {
      if (error.category === category && 
          error.message === message && 
          new Date(error.lastOccurrence).getTime() > cutoffTime) {
        return error;
      }
    }
    
    return null;
  }

  private alertCriticalError(errorId: string, message: string, context: ErrorContext): void {
    // In a real implementation, this would send alerts via email, Slack, PagerDuty, etc.
    console.error('🚨 CRITICAL ERROR ALERT 🚨', {
      errorId,
      message,
      timestamp: context.timestamp,
      userId: context.userId,
      endpoint: context.endpoint,
    });

    // Log critical error for monitoring systems
    this.logger.error('CRITICAL_ERROR_ALERT', {
      errorId,
      message,
      context,
      alertLevel: 'CRITICAL',
    });
  }

  // Clean up old errors (called periodically)
  cleanupOldErrors(daysToKeep: number = 30): number {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    let cleanedCount = 0;

    for (const [id, error] of Array.from(this.errorStore.entries())) {
      if (new Date(error.lastOccurrence).getTime() < cutoffTime) {
        this.errorStore.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info(`Cleaned up ${cleanedCount} old error entries`);
    }

    return cleanedCount;
  }
}

// Singleton instance
let loggingService: LoggingService | null = null;

export function getLoggingService(): LoggingService {
  if (!loggingService) {
    loggingService = new LoggingService();
  }
  return loggingService;
}