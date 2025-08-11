/**
 * Health and readiness endpoints for production monitoring
 * Includes request ID logging and PII redaction
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { randomUUID } from 'crypto';
// Simple console logging for health endpoints
const logger = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
};

const router = Router();

// Middleware to add request ID to all health requests
router.use((req, _res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || randomUUID();
  next();
});

/**
 * Basic health check - always returns 200 if server is running
 */
router.get('/healthz', (_req: Request, res: Response) => {
  const requestId = res.getHeader('x-request-id') || randomUUID();
  
  logger.info('Health check requested', {
    requestId,
    timestamp: new Date().toISOString(),
    endpoint: '/healthz'
  });

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    requestId,
    service: 'smbTaxCredits-api',
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * Readiness check - validates dependencies and database connectivity
 */
router.get('/readyz', async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string;
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    await db.execute('SELECT 1 as health_check');
    
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      logger.warn('Readiness check failed - missing environment variables', {
        requestId,
        missingVars: missingEnvVars.length, // Don't log actual var names for security
        endpoint: '/readyz'
      });
      
      return res.status(503).json({
        status: 'not_ready',
        reason: 'missing_configuration',
        timestamp: new Date().toISOString(),
        requestId
      });
    }
    
    const responseTime = Date.now() - startTime;
    
    logger.info('Readiness check passed', {
      requestId,
      responseTime,
      timestamp: new Date().toISOString(),
      endpoint: '/readyz'
    });
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      requestId,
      checks: {
        database: 'healthy',
        configuration: 'healthy'
      },
      responseTime
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Redact PII from error logs
    const sanitizedError = {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'UnknownError',
      // Never log full error stack or connection strings
    };
    
    logger.error('Readiness check failed', {
      requestId,
      error: sanitizedError,
      responseTime,
      endpoint: '/readyz'
    });
    
    res.status(503).json({
      status: 'not_ready',
      reason: 'dependency_failure',
      timestamp: new Date().toISOString(),
      requestId
    });
  }
});

/**
 * Detailed system status for internal monitoring
 */
router.get('/status', async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string;
  
  try {
    const dbStartTime = Date.now();
    await db.execute('SELECT 1 as health_check');
    const dbResponseTime = Date.now() - dbStartTime;
    
    const systemInfo = {
      status: 'operational',
      timestamp: new Date().toISOString(),
      requestId,
      system: {
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
        node_version: process.version,
        environment: process.env.NODE_ENV || 'unknown'
      },
      dependencies: {
        database: {
          status: 'healthy',
          responseTime: dbResponseTime
        }
      }
    };
    
    logger.info('System status requested', {
      requestId,
      dbResponseTime,
      memoryUsage: systemInfo.system.memory.used,
      endpoint: '/status'
    });
    
    res.status(200).json(systemInfo);
    
  } catch (error) {
    logger.error('System status check failed', {
      requestId,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'UnknownError'
      },
      endpoint: '/status'
    });
    
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      requestId,
      reason: 'system_check_failed'
    });
  }
});

export { router as healthRouter };