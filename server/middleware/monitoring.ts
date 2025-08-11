// Monitoring middleware for request/response tracking and performance monitoring

import { Request, Response, NextFunction } from 'express';
import { monitoringService } from '../services/monitoring';

/**
 * Middleware to track API request metrics and performance
 */
export function requestMonitoring(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const originalSend = res.send;

  // Override res.send to capture response data
  res.send = function(this: Response, body: any) {
    const responseTime = Date.now() - startTime;
    const contentLength = Buffer.isBuffer(body) ? body.length : 
                         typeof body === 'string' ? Buffer.byteLength(body, 'utf8') : 0;

    // Track API metrics
    monitoringService.trackAPIRequest(
      req.path,
      req.method,
      res.statusCode,
      responseTime,
      {
        requestSize: req.get('content-length') ? parseInt(req.get('content-length')!) : 0,
        responseSize: contentLength,
        userAgent: req.get('user-agent'),
        ipAddress: req.ip || req.connection.remoteAddress
      }
    );

    // Call original send
    return originalSend.call(this, body);
  };

  next();
}

/**
 * Error monitoring middleware
 */
export function errorMonitoring(error: Error, req: Request, res: Response, next: NextFunction): void {
  // Create error event for monitoring
  monitoringService.createErrorEvent(
    error.message,
    error,
    {
      endpoint: req.path,
      method: req.method,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.id,
      sessionId: (req as any).sessionID
    }
  );

  next(error);
}

/**
 * Health check middleware for monitoring endpoints
 */
export function healthCheckMonitoring(req: Request, res: Response, next: NextFunction): void {
  if (req.path === '/api/health' || req.path === '/health') {
    // Basic health check - can be expanded with additional checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(healthStatus);
    return;
  }

  next();
}

/**
 * Rate limiting monitoring
 */
export function rateLimitMonitoring(req: Request, res: Response, next: NextFunction): void {
  // Track rate limiting events
  const rateLimitRemaining = res.get('X-RateLimit-Remaining');
  const rateLimitLimit = res.get('X-RateLimit-Limit');

  if (rateLimitRemaining && rateLimitLimit) {
    const remaining = parseInt(rateLimitRemaining);
    const limit = parseInt(rateLimitLimit);
    const usagePercentage = (limit - remaining) / limit;

    // Alert if usage is high
    if (usagePercentage > 0.8) {
      monitoringService.createErrorEvent(
        'High rate limit usage detected',
        new Error(`Rate limit usage: ${Math.round(usagePercentage * 100)}%`),
        {
          endpoint: req.path,
          ipAddress: req.ip,
          remaining,
          limit,
          usagePercentage
        }
      );
    }
  }

  next();
}

/**
 * Database monitoring middleware
 */
export function databaseMonitoring(req: Request, res: Response, next: NextFunction): void {
  // This would typically integrate with your database connection pool
  // to track connection metrics, query performance, etc.
  
  // For now, we'll add a hook for database operations
  const originalJson = res.json;
  res.json = function(this: Response, body: any) {
    // If this is a database-related endpoint, track metrics
    if (req.path.includes('/api/') && req.method !== 'GET') {
      // Track database write operations
      monitoringService.emit('database_operation', {
        type: 'write',
        endpoint: req.path,
        method: req.method,
        timestamp: new Date()
      });
    }

    return originalJson.call(this, body);
  };

  next();
}

/**
 * Security monitoring middleware
 */
export function securityMonitoring(req: Request, res: Response, next: NextFunction): void {
  // Monitor for suspicious activity
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /drop.*table/i  // SQL injection
  ];

  const userInput = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userInput)) {
      monitoringService.createErrorEvent(
        'Suspicious activity detected',
        new Error(`Potential security threat: ${pattern.source}`),
        {
          endpoint: req.path,
          method: req.method,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          pattern: pattern.source,
          input: userInput.substring(0, 500) // Limit input logging
        }
      );
      break;
    }
  }

  next();
}

/**
 * Apply all monitoring middleware
 */
export function applyMonitoring() {
  return [
    requestMonitoring,
    healthCheckMonitoring,
    rateLimitMonitoring,
    databaseMonitoring,
    securityMonitoring
  ];
}