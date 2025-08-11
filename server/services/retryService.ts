import { EventEmitter } from 'events';
import { LoggingService } from './logger';
import {
  RetryConfig,
  RetryStrategy,
  getNextRetryDelay,
  isRetryableError,
} from '../../shared/types/integrations';

interface RetryContext {
  attempt: number;
  lastError?: Error;
  startTime: number;
  metadata?: Record<string, any>;
}

interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

export class RetryService extends EventEmitter {
  private logger: LoggingService;
  private activeRetries: Map<string, AbortController> = new Map();

  constructor() {
    super();
    this.logger = new LoggingService();
  }

  /**
   * Execute a function with retry logic
   */
  async executeWithRetry<T>(
    id: string,
    fn: () => Promise<T>,
    config: RetryConfig,
    context?: Record<string, any>
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const retryContext: RetryContext = {
      attempt: 0,
      startTime,
      metadata: context,
    };

    // Create abort controller for cancellation
    const abortController = new AbortController();
    this.activeRetries.set(id, abortController);

    try {
      this.logger.log('info', 'Starting retry execution', {
        id,
        config,
        context,
        category: 'retry',
      });

      const result = await this.attemptExecution(
        id,
        fn,
        config,
        retryContext,
        abortController.signal
      );

      const totalTime = Date.now() - startTime;

      this.logger.log('info', 'Retry execution completed', {
        id,
        success: result.success,
        attempts: result.attempts,
        totalTime,
        category: 'retry',
      });

      this.emit('retry_completed', {
        id,
        success: result.success,
        attempts: result.attempts,
        totalTime,
        context,
      });

      return result;
    } finally {
      this.activeRetries.delete(id);
    }
  }

  /**
   * Cancel an active retry operation
   */
  cancelRetry(id: string): boolean {
    const abortController = this.activeRetries.get(id);
    if (abortController) {
      abortController.abort();
      this.activeRetries.delete(id);
      
      this.logger.log('info', 'Retry operation cancelled', {
        id,
        category: 'retry',
      });

      this.emit('retry_cancelled', { id });
      return true;
    }
    return false;
  }

  /**
   * Get active retry operations
   */
  getActiveRetries(): string[] {
    return Array.from(this.activeRetries.keys());
  }

  /**
   * Clear all active retries
   */
  clearAllRetries(): void {
    for (const id of this.activeRetries.keys()) {
      const abortController = this.activeRetries.get(id)!;
      abortController.abort();
      this.emit('retry_cancelled', { id });
    }
    this.activeRetries.clear();
    
    this.logger.log('info', 'All retry operations cleared', {
      category: 'retry',
    });
  }

  private async attemptExecution<T>(
    id: string,
    fn: () => Promise<T>,
    config: RetryConfig,
    context: RetryContext,
    signal: AbortSignal
  ): Promise<RetryResult<T>> {
    let lastError: Error | undefined;

    while (context.attempt < config.maxAttempts) {
      if (signal.aborted) {
        throw new Error('Retry operation was cancelled');
      }

      context.attempt++;

      try {
        this.logger.debug('Attempting execution', {
          id,
          attempt: context.attempt,
          maxAttempts: config.maxAttempts,
          category: 'retry',
        });

        this.emit('retry_attempt', {
          id,
          attempt: context.attempt,
          maxAttempts: config.maxAttempts,
          context: context.metadata,
        });

        const result = await fn();

        return {
          success: true,
          result,
          attempts: context.attempt,
          totalTime: Date.now() - context.startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        context.lastError = lastError;

        this.logger.warn('Execution attempt failed', {
          id,
          attempt: context.attempt,
          error: lastError.message,
          stack: lastError.stack,
          retryable: isRetryableError(lastError),
          category: 'retry',
        });

        this.emit('retry_failed', {
          id,
          attempt: context.attempt,
          error: lastError,
          retryable: isRetryableError(lastError),
          context: context.metadata,
        });

        // Check if error is retryable
        if (!isRetryableError(lastError)) {
          this.logger.error('Non-retryable error encountered', {
            id,
            error: lastError.message,
            category: 'retry',
          });

          return {
            success: false,
            error: lastError,
            attempts: context.attempt,
            totalTime: Date.now() - context.startTime,
          };
        }

        // Calculate delay for next attempt
        if (context.attempt < config.maxAttempts) {
          const delay = getNextRetryDelay(context.attempt, config);
          
          this.logger.info('Scheduling retry attempt', {
            id,
            nextAttempt: context.attempt + 1,
            delay,
            category: 'retry',
          });

          await this.delay(delay, signal);
        }
      }
    }

    // All attempts exhausted
    this.logger.error('All retry attempts exhausted', {
      id,
      attempts: context.attempt,
      lastError: lastError?.message,
      category: 'retry',
    });

    return {
      success: false,
      error: lastError || new Error('All retry attempts exhausted'),
      attempts: context.attempt,
      totalTime: Date.now() - context.startTime,
    };
  }

  private async delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error('Delay cancelled'));
        return;
      }

      const timeout = setTimeout(() => {
        resolve();
      }, ms);

      // Handle abort signal
      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('Delay cancelled'));
      });
    });
  }

  /**
   * Create a retry wrapper function
   */
  createRetryWrapper<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    config: RetryConfig,
    getId?: (...args: T) => string
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      const id = getId ? getId(...args) : `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await this.executeWithRetry(
        id,
        () => fn(...args),
        config,
        { args: args.length > 0 ? args : undefined }
      );

      if (result.success) {
        return result.result!;
      } else {
        throw result.error!;
      }
    };
  }

  /**
   * Get retry statistics
   */
  getRetryStats() {
    return {
      activeRetries: this.activeRetries.size,
      activeRetryIds: Array.from(this.activeRetries.keys()),
    };
  }

  /**
   * Validate retry configuration
   */
  validateConfig(config: RetryConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.maxAttempts < 1 || config.maxAttempts > 10) {
      errors.push('maxAttempts must be between 1 and 10');
    }

    if (config.baseDelay < 100) {
      errors.push('baseDelay must be at least 100ms');
    }

    if (config.maxDelay < config.baseDelay) {
      errors.push('maxDelay must be greater than or equal to baseDelay');
    }

    if (config.backoffMultiplier < 1 || config.backoffMultiplier > 5) {
      errors.push('backoffMultiplier must be between 1 and 5');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Create singleton instance
export const retryService = new RetryService();