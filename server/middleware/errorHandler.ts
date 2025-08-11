import { Request, Response, NextFunction } from 'express';
import { getLoggingService, ErrorSeverity, ErrorCategory } from '../services/logger';
import { ZodError } from 'zod';

export interface ErrorWithContext extends Error {
  statusCode?: number;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  context?: Record<string, any>;
  userMessage?: string;
}

export function createErrorHandler() {
  const logger = getLoggingService();

  return (error: ErrorWithContext, req: Request, res: Response, next: NextFunction) => {
    // Generate request context
    const context = {
      userId: (req as any).user?.id,
      requestId: req.headers['x-request-id'] as string,
      endpoint: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      sessionId: (req as any).session?.id,
      body: req.method !== 'GET' ? req.body : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      ...error.context,
    };

    // Determine error details
    let statusCode = error.statusCode || 500;
    let category = error.category || logger.categorizeError(error, context);
    let severity = error.severity || logger.determineSeverity(error, context);
    let userMessage = error.userMessage;

    // Handle specific error types
    if (error instanceof ZodError) {
      statusCode = 400;
      category = ErrorCategory.VALIDATION;
      severity = ErrorSeverity.LOW;
      userMessage = 'Please check your input and try again.';
    } else if (error.name === 'UnauthorizedError' || error.message.includes('unauthorized')) {
      statusCode = 401;
      category = ErrorCategory.AUTHENTICATION;
      severity = ErrorSeverity.MEDIUM;
      userMessage = 'Please log in to continue.';
    } else if (error.message.includes('not found')) {
      statusCode = 404;
      category = ErrorCategory.SYSTEM;
      severity = ErrorSeverity.LOW;
      userMessage = 'The requested resource was not found.';
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
      category = ErrorCategory.INTEGRATION;
      severity = ErrorSeverity.HIGH;
      userMessage = 'The request took too long to complete. Please try again.';
    }

    // Generate user-friendly message if not provided
    if (!userMessage) {
      userMessage = getUserFriendlyMessage(statusCode, category);
    }

    // Log the error
    const errorId = logger.logError(
      error.message || 'Unknown error occurred',
      error,
      severity,
      category,
      context
    );

    // Prepare error response
    const errorResponse: any = {
      success: false,
      error: userMessage,
      errorId,
      timestamp: new Date().toISOString(),
    };

    // Add additional details in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = {
        message: error.message,
        stack: error.stack,
        category,
        severity,
      };
    }

    // Add validation details for validation errors
    if (error instanceof ZodError) {
      errorResponse.validation = {
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }

    // Add recovery options
    errorResponse.recovery = getRecoveryOptions(statusCode, category, context);

    // Add support contact for critical/high severity errors
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      errorResponse.support = {
        email: 'support@smbtaxcredits.com',
        message: 'If this problem persists, please contact our support team with error ID: ' + errorId,
      };
    }

    // Log response for monitoring
    logger.logInfo('Error response sent', {
      errorId,
      statusCode,
      category,
      severity,
      endpoint: req.originalUrl,
      userId: context.userId,
    });

    res.status(statusCode).json(errorResponse);
  };
}

function getUserFriendlyMessage(statusCode: number, category: ErrorCategory): string {
  // Status code based messages
  switch (statusCode) {
    case 400:
      return 'There was a problem with your request. Please check your input and try again.';
    case 401:
      return 'You need to be logged in to access this feature.';
    case 403:
      return 'You don\'t have permission to access this resource.';
    case 404:
      return 'The requested page or resource could not be found.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'We\'re experiencing technical difficulties. Please try again in a few minutes.';
    case 502:
    case 503:
    case 504:
      return 'Our service is temporarily unavailable. Please try again in a few minutes.';
  }

  // Category based messages
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return 'There was a problem with your login. Please try signing in again.';
    case ErrorCategory.VALIDATION:
      return 'Please check that all required fields are filled out correctly.';
    case ErrorCategory.PAYMENT:
      return 'There was an issue processing your payment. Please check your payment details and try again.';
    case ErrorCategory.EMAIL:
      return 'We had trouble sending your email notification. The action was completed but you may not receive an email.';
    case ErrorCategory.DOCUMENT:
      return 'There was a problem generating or accessing your documents. Please try again or contact support.';
    case ErrorCategory.DATABASE:
      return 'We\'re having database issues. Your changes may not have been saved. Please try again.';
    case ErrorCategory.INTEGRATION:
      return 'One of our external services is unavailable. Some features may be limited.';
    default:
      return 'Something went wrong. Please try again, and contact support if the problem continues.';
  }
}

function getRecoveryOptions(statusCode: number, category: ErrorCategory, context: any): any {
  const options: any = {
    canRetry: false,
    suggestedActions: [],
  };

  // Determine if retry is possible
  if ([500, 502, 503, 504].includes(statusCode) || 
      [ErrorCategory.INTEGRATION, ErrorCategory.DATABASE].includes(category)) {
    options.canRetry = true;
    options.retryDelay = 5000; // 5 seconds
  }

  // Add specific suggested actions
  switch (statusCode) {
    case 401:
      options.suggestedActions = [
        { action: 'login', label: 'Sign in again', url: '/login' },
        { action: 'contact_support', label: 'Contact support', url: '/support' },
      ];
      break;
    
    case 400:
      if (category === ErrorCategory.VALIDATION) {
        options.suggestedActions = [
          { action: 'review_form', label: 'Review form fields' },
          { action: 'clear_form', label: 'Start over' },
        ];
      }
      break;
    
    case 404:
      options.suggestedActions = [
        { action: 'go_home', label: 'Go to dashboard', url: '/dashboard' },
        { action: 'go_back', label: 'Go back' },
      ];
      break;
    
    case 429:
      options.suggestedActions = [
        { action: 'wait_retry', label: 'Wait and try again' },
      ];
      options.retryDelay = 60000; // 1 minute for rate limiting
      break;
    
    default:
      if (category === ErrorCategory.PAYMENT) {
        options.suggestedActions = [
          { action: 'check_payment', label: 'Check payment details' },
          { action: 'try_different_card', label: 'Try a different payment method' },
          { action: 'contact_support', label: 'Contact support', url: '/support' },
        ];
      } else if (category === ErrorCategory.DOCUMENT) {
        options.suggestedActions = [
          { action: 'try_again', label: 'Try again' },
          { action: 'check_status', label: 'Check document status', url: '/dashboard' },
          { action: 'contact_support', label: 'Contact support', url: '/support' },
        ];
      } else {
        options.suggestedActions = [
          { action: 'try_again', label: 'Try again' },
          { action: 'refresh_page', label: 'Refresh the page' },
          { action: 'contact_support', label: 'Contact support', url: '/support' },
        ];
      }
      break;
  }

  return options;
}

// Not found handler
export function createNotFoundHandler() {
  const logger = getLoggingService();

  return (req: Request, res: Response) => {
    const context = {
      endpoint: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.id,
    };

    logger.logWarning('404 Not Found', context);

    res.status(404).json({
      success: false,
      error: 'The requested page or resource could not be found.',
      errorId: 'not_found_' + Date.now(),
      timestamp: new Date().toISOString(),
      recovery: {
        canRetry: false,
        suggestedActions: [
          { action: 'go_home', label: 'Go to dashboard', url: '/dashboard' },
          { action: 'go_back', label: 'Go back' },
          { action: 'contact_support', label: 'Contact support', url: '/support' },
        ],
      },
    });
  };
}

// Request logging middleware
export function createRequestLogger() {
  const logger = getLoggingService();

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Generate request ID if not present
    if (!req.headers['x-request-id']) {
      req.headers['x-request-id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Log request
    logger.logDebug('Incoming request', {
      requestId: req.headers['x-request-id'],
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.id,
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      logger.logDebug('Request completed', {
        requestId: req.headers['x-request-id'],
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: (req as any).user?.id,
      });

      // Log slow requests
      if (duration > 5000) { // 5 seconds
        logger.logWarning('Slow request detected', {
          requestId: req.headers['x-request-id'],
          method: req.method,
          url: req.originalUrl,
          duration: `${duration}ms`,
          statusCode: res.statusCode,
        });
      }
    });

    next();
  };
}