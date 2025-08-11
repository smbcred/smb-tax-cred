import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../services/logger';
import { integrationRecoveryService } from '../services/integrationRecovery';
import { queueService } from '../services/queueService';
import {
  IntegrationType,
  IntegrationStatus,
  JobPriority,
  JobDefinition,
} from '../../shared/types/integrations';

interface IntegrationContext extends Request {
  integration?: {
    type: IntegrationType;
    fallbackEnabled?: boolean;
    queueOnFailure?: boolean;
    priority?: JobPriority;
  };
}

export class IntegrationMiddleware {
  private logger: LoggingService;

  constructor() {
    this.logger = new LoggingService();
  }

  /**
   * Middleware to check integration health before processing
   */
  checkIntegrationHealth(integration: IntegrationType) {
    return async (req: IntegrationContext, res: Response, next: NextFunction) => {
      try {
        const status = integrationRecoveryService.getIntegrationStatus(integration);
        
        if (!status) {
          this.logger.warn('No status available for integration', {
            integration,
            endpoint: req.path,
            category: 'integration_middleware',
          });
          
          // Continue with request but log warning
          req.integration = { type: integration };
          return next();
        }

        // Add integration context to request
        req.integration = { type: integration };

        switch (status.status) {
          case IntegrationStatus.HEALTHY:
            // All good, continue
            return next();

          case IntegrationStatus.DEGRADED:
            // Log warning but continue
            this.logger.warn('Integration degraded, continuing with caution', {
              integration,
              endpoint: req.path,
              errorCount: status.errorCount,
              category: 'integration_middleware',
            });
            return next();

          case IntegrationStatus.FAILED:
            // Integration failed - check if fallback or queueing is available
            const config = await this.getIntegrationConfig(integration);
            
            if (config.fallbackEnabled) {
              this.logger.info('Using fallback for failed integration', {
                integration,
                endpoint: req.path,
                category: 'integration_middleware',
              });
              
              req.integration.fallbackEnabled = true;
              return next();
            }

            if (config.queueOnFailure) {
              // Queue the request for later processing
              await this.queueRequest(req, integration);
              
              return res.status(202).json({
                success: true,
                message: 'Request queued for processing when integration recovers',
                status: 'queued',
              });
            }

            // No fallback or queueing - return error
            return res.status(503).json({
              success: false,
              error: 'Integration temporarily unavailable',
              details: {
                integration,
                status: status.status,
                lastError: status.lastError,
              },
              recovery: {
                canRetry: true,
                retryDelay: 30000,
                suggestedActions: [
                  {
                    action: 'try_again_later',
                    label: 'Try again in a few minutes',
                  },
                  {
                    action: 'contact_support',
                    label: 'Contact support',
                    url: '/support',
                  },
                ],
              },
            });

          case IntegrationStatus.RECOVERING:
            // Integration is recovering
            return res.status(503).json({
              success: false,
              error: 'Integration is currently recovering',
              status: 'recovering',
              recovery: {
                canRetry: true,
                retryDelay: 60000,
                suggestedActions: [
                  {
                    action: 'wait_retry',
                    label: 'Wait and try again',
                  },
                ],
              },
            });

          case IntegrationStatus.MAINTENANCE:
            // Integration under maintenance
            return res.status(503).json({
              success: false,
              error: 'Integration is under maintenance',
              status: 'maintenance',
              recovery: {
                canRetry: true,
                retryDelay: 300000, // 5 minutes
                suggestedActions: [
                  {
                    action: 'try_again_later',
                    label: 'Try again later',
                  },
                ],
              },
            });

          default:
            // Unknown status - log and continue with caution
            this.logger.warn('Unknown integration status', {
              integration,
              status: status.status,
              endpoint: req.path,
              category: 'integration_middleware',
            });
            return next();
        }
      } catch (error) {
        this.logger.error('Error in integration health check middleware', {
          integration,
          endpoint: req.path,
          error: error instanceof Error ? error.message : String(error),
          category: 'integration_middleware',
        });

        // Don't block request on middleware error
        req.integration = { type: integration };
        return next();
      }
    };
  }

  /**
   * Middleware to handle integration failures and report them
   */
  handleIntegrationFailure() {
    return (error: any, req: IntegrationContext, res: Response, next: NextFunction) => {
      if (!req.integration) {
        return next(error);
      }

      const integration = req.integration.type;
      
      // Report failure to recovery service
      integrationRecoveryService.reportFailure(
        integration,
        error instanceof Error ? error : new Error(String(error)),
        {
          endpoint: req.path,
          method: req.method,
          userId: (req as any).user?.id,
          timestamp: new Date().toISOString(),
        }
      );

      this.logger.error('Integration failure reported', {
        integration,
        endpoint: req.path,
        error: error instanceof Error ? error.message : String(error),
        category: 'integration_middleware',
      });

      // Check if we should queue the request for retry
      if (req.integration.queueOnFailure && this.isRetryableError(error)) {
        this.queueRequest(req, integration, JobPriority.HIGH)
          .then(() => {
            res.status(202).json({
              success: true,
              message: 'Request failed but has been queued for retry',
              status: 'queued_for_retry',
            });
          })
          .catch((queueError) => {
            this.logger.error('Failed to queue request after integration failure', {
              integration,
              originalError: error instanceof Error ? error.message : String(error),
              queueError: queueError instanceof Error ? queueError.message : String(queueError),
              category: 'integration_middleware',
            });
            
            next(error); // Pass original error
          });
      } else {
        // Pass error to global error handler
        next(error);
      }
    };
  }

  /**
   * Middleware to track integration performance
   */
  trackIntegrationPerformance(integration: IntegrationType) {
    return (req: IntegrationContext, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      // Override res.end to capture completion
      const originalEnd = res.end;
      res.end = function(...args: any[]) {
        const responseTime = Date.now() - startTime;
        
        // Log performance metrics
        const logger = new LoggingService();
        logger.info('Integration performance', {
          integration,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTime,
          category: 'integration_performance',
        });

        // Call original end method
        originalEnd.apply(res, args);
      };

      req.integration = { ...req.integration, type: integration };
      next();
    };
  }

  /**
   * Get integration configuration
   */
  private async getIntegrationConfig(integration: IntegrationType) {
    // This would typically come from a configuration service or database
    // For now, return default configuration
    return {
      fallbackEnabled: false,
      queueOnFailure: integration !== IntegrationType.PAYMENT, // Don't queue payment requests
      maxQueueTime: 24 * 60 * 60 * 1000, // 24 hours
    };
  }

  /**
   * Queue a request for later processing
   */
  private async queueRequest(
    req: IntegrationContext,
    integration: IntegrationType,
    priority: JobPriority = JobPriority.NORMAL
  ): Promise<void> {
    const jobId = `integration_retry_${integration}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: JobDefinition = {
      id: jobId,
      type: 'integration_retry',
      priority,
      payload: {
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query,
        headers: this.sanitizeHeaders(req.headers),
        integration,
      },
      integration,
      retryConfig: {
        maxAttempts: 3,
        strategy: 'exponential' as any,
        baseDelay: 5000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        jitter: true,
      },
      createdAt: new Date().toISOString(),
      metadata: {
        originalRequestTime: new Date().toISOString(),
        userId: (req as any).user?.id,
        queueReason: 'integration_failure',
      },
    };

    await queueService.addJob(job);
    
    this.logger.info('Request queued for integration retry', {
      jobId,
      integration,
      endpoint: req.path,
      priority,
      category: 'integration_middleware',
    });
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true;
    
    // HTTP status codes that are retryable
    const retryableStatusCodes = [429, 500, 502, 503, 504];
    if (error.status && retryableStatusCodes.includes(error.status)) return true;
    
    // Database connection errors
    if (error.message?.includes('connection') || error.message?.includes('timeout')) return true;
    
    return false;
  }

  /**
   * Sanitize headers for storage (remove sensitive information)
   */
  private sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const allowedHeaders = [
      'content-type',
      'accept',
      'user-agent',
      'accept-language',
      'accept-encoding',
    ];

    for (const [key, value] of Object.entries(headers)) {
      if (allowedHeaders.includes(key.toLowerCase()) && typeof value === 'string') {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

// Create singleton instance
export const integrationMiddleware = new IntegrationMiddleware();

// Export convenience functions
export const checkIntegrationHealth = (integration: IntegrationType) =>
  integrationMiddleware.checkIntegrationHealth(integration);

export const handleIntegrationFailure = () =>
  integrationMiddleware.handleIntegrationFailure();

export const trackIntegrationPerformance = (integration: IntegrationType) =>
  integrationMiddleware.trackIntegrationPerformance(integration);