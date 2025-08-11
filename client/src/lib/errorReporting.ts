// Client-side error reporting and tracking

export interface ErrorReport {
  message: string;
  stack?: string;
  name: string;
  context: ErrorContext;
}

export interface ErrorContext {
  errorId: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  componentStack?: string;
  errorBoundary?: boolean;
  retryCount?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  viewport?: {
    width: number;
    height: number;
  };
  screen?: {
    width: number;
    height: number;
  };
  connection?: {
    effectiveType?: string;
    downlink?: number;
  };
  memory?: {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
  };
  additionalData?: Record<string, any>;
}

class ErrorReportingService {
  private isEnabled: boolean = true;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError(
        event.error || new Error(event.message),
        {
          errorBoundary: false,
          category: 'javascript',
          severity: 'high',
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        }
      );
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          errorBoundary: false,
          category: 'promise_rejection',
          severity: 'high',
          additionalData: {
            reason: event.reason,
          },
        }
      );
    });

    // Handle network errors
    window.addEventListener('online', () => {
      console.log('Network connection restored');
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
    });
  }

  async reportError(
    error: Error,
    contextOverrides: Partial<ErrorContext> = {}
  ): Promise<string | null> {
    if (!this.isEnabled) {
      console.warn('Error reporting is disabled');
      return null;
    }

    try {
      const errorId = this.generateErrorId();
      const context = this.buildErrorContext(errorId, contextOverrides);
      
      const errorReport: ErrorReport = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        context,
      };

      // Log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reported:', errorReport);
      }

      // Send to server with retry logic
      await this.sendErrorReport(errorReport);

      return errorId;

    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
      
      // Fallback: store in localStorage for later retry
      this.storeErrorForRetry({
        message: error.message,
        stack: error.stack,
        name: error.name,
        context: this.buildErrorContext(this.generateErrorId(), contextOverrides),
      });

      return null;
    }
  }

  private async sendErrorReport(errorReport: ErrorReport, retryCount: number = 0): Promise<void> {
    try {
      const response = await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(errorReport),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Error reported successfully:', errorReport.context.errorId);

    } catch (networkError) {
      if (retryCount < this.maxRetries) {
        console.warn(`Error reporting failed, retrying... (${retryCount + 1}/${this.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount)));
        
        return this.sendErrorReport(errorReport, retryCount + 1);
      }

      throw networkError;
    }
  }

  private buildErrorContext(errorId: string, overrides: Partial<ErrorContext> = {}): ErrorContext {
    const user = this.getUserContext();
    
    return {
      errorId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: user?.id,
      sessionId: this.getSessionId(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      connection: this.getConnectionInfo(),
      memory: this.getMemoryInfo(),
      ...overrides,
    };
  }

  private getUserContext() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  private getSessionId(): string | undefined {
    try {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    } catch {
      return undefined;
    }
  }

  private getConnectionInfo() {
    try {
      const connection = (navigator as any).connection;
      return connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
      } : undefined;
    } catch {
      return undefined;
    }
  }

  private getMemoryInfo() {
    try {
      const memory = (performance as any).memory;
      return memory ? {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
      } : undefined;
    } catch {
      return undefined;
    }
  }

  private generateErrorId(): string {
    return `client_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private storeErrorForRetry(errorReport: ErrorReport): void {
    try {
      const storedErrors = this.getStoredErrors();
      storedErrors.push(errorReport);
      
      // Keep only the latest 10 errors
      if (storedErrors.length > 10) {
        storedErrors.shift();
      }
      
      localStorage.setItem('pendingErrorReports', JSON.stringify(storedErrors));
    } catch {
      // Storage failed, ignore
    }
  }

  private getStoredErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('pendingErrorReports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Retry sending stored errors (call this when network is restored)
  async retryStoredErrors(): Promise<void> {
    const storedErrors = this.getStoredErrors();
    if (storedErrors.length === 0) return;

    console.log(`Retrying ${storedErrors.length} stored error reports...`);

    const results = await Promise.allSettled(
      storedErrors.map(errorReport => this.sendErrorReport(errorReport))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Successfully sent ${successCount}/${storedErrors.length} stored error reports`);

    // Clear stored errors after attempting to send them
    try {
      localStorage.removeItem('pendingErrorReports');
    } catch {
      // Ignore storage errors
    }
  }

  // Enable/disable error reporting
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Report custom events or metrics
  reportEvent(eventName: string, data: Record<string, any> = {}): void {
    if (!this.isEnabled) return;

    try {
      const context = this.buildErrorContext(this.generateErrorId(), {
        category: 'event',
        severity: 'low',
        additionalData: { eventName, ...data },
      });

      // For events, we create a minimal error report
      const eventReport: ErrorReport = {
        message: `Event: ${eventName}`,
        name: 'CustomEvent',
        context,
      };

      // Send asynchronously without waiting
      this.sendErrorReport(eventReport).catch(error => {
        console.warn('Failed to report event:', error);
      });

    } catch (error) {
      console.warn('Failed to report event:', error);
    }
  }

  // Report performance issues
  reportPerformanceIssue(metric: string, value: number, threshold: number): void {
    if (value <= threshold) return;

    this.reportEvent('performance_issue', {
      metric,
      value,
      threshold,
      exceedsBy: value - threshold,
    });
  }

  // Monitor and report slow operations
  monitorAsyncOperation<T>(
    operation: () => Promise<T>,
    name: string,
    timeoutMs: number = 30000
  ): Promise<T> {
    const startTime = Date.now();

    return Promise.race([
      operation().then(result => {
        const duration = Date.now() - startTime;
        
        // Report if operation took longer than expected
        if (duration > timeoutMs * 0.8) { // 80% of timeout
          this.reportEvent('slow_operation', {
            operationName: name,
            duration,
            threshold: timeoutMs * 0.8,
          });
        }
        
        return result;
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          this.reportError(
            new Error(`Operation '${name}' timed out after ${timeoutMs}ms`),
            {
              category: 'timeout',
              severity: 'high',
              additionalData: { operationName: name, timeoutMs },
            }
          );
          reject(new Error(`Operation '${name}' timed out`));
        }, timeoutMs);
      })
    ]);
  }
}

// Create singleton instance
export const errorReporting = new ErrorReportingService();

// Utility functions for common error reporting scenarios
export function reportApiError(error: Error, endpoint: string, method: string): Promise<string | null> {
  return errorReporting.reportError(error, {
    category: 'api',
    severity: 'medium',
    additionalData: { endpoint, method },
  });
}

export function reportFormError(error: Error, formName: string, fieldName?: string): Promise<string | null> {
  return errorReporting.reportError(error, {
    category: 'form',
    severity: 'low',
    additionalData: { formName, fieldName },
  });
}

export function reportPaymentError(error: Error, paymentMethod?: string): Promise<string | null> {
  return errorReporting.reportError(error, {
    category: 'payment',
    severity: 'critical',
    additionalData: { paymentMethod },
  });
}

export function reportAuthError(error: Error, action: string): Promise<string | null> {
  return errorReporting.reportError(error, {
    category: 'authentication',
    severity: 'high',
    additionalData: { action },
  });
}

// Set up automatic retry of stored errors when online
window.addEventListener('online', () => {
  errorReporting.retryStoredErrors();
});