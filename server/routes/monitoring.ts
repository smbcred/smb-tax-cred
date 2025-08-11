// Monitoring API routes for health checks, metrics, and system status

import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { monitoringService } from '../services/monitoring';

const router = Router();

/**
 * GET /api/monitoring/health
 * Basic health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const healthChecks = monitoringService.getHealthStatus();
    const overallStatus = healthChecks.every(h => h.status === 'healthy') ? 'healthy' : 'unhealthy';

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: healthChecks
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/monitoring/health/:service
 * Get health status for specific service
 */
router.get('/health/:service', (req: Request, res: Response) => {
  try {
    const { service } = req.params;
    const healthCheck = monitoringService.getHealthStatus(service);

    if (healthCheck.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(healthCheck[0]);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/monitoring/dashboard
 * Get comprehensive monitoring dashboard data
 */
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const dashboard = monitoringService.getDashboard();
    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/monitoring/metrics
 * Get system metrics with optional filtering
 */
router.get('/metrics',
  query('type').optional().isIn(['system', 'api', 'database']),
  query('period').optional().isIn(['hour', 'day', 'week']),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type = 'system', period = 'hour', limit = 100 } = req.query;
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'hour':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // This would typically query your metrics storage
      // For now, return sample data structure
      const metrics = {
        type,
        period,
        startDate,
        endDate: now,
        data: [] // Would contain actual metrics data
      };

      res.json(metrics);
    } catch (error) {
      console.error('Metrics retrieval error:', error);
      res.status(500).json({
        error: 'Failed to retrieve metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/monitoring/alerts
 * Get active and recent alerts
 */
router.get('/alerts',
  query('status').optional().isIn(['active', 'resolved', 'all']),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status = 'active', severity, limit = 50 } = req.query;
      const dashboard = monitoringService.getDashboard();
      
      let alerts = dashboard.recentAlerts;

      // Filter by status
      if (status === 'active') {
        alerts = alerts.filter(a => !a.resolved);
      } else if (status === 'resolved') {
        alerts = alerts.filter(a => a.resolved);
      }

      // Filter by severity
      if (severity) {
        alerts = alerts.filter(a => a.severity === severity);
      }

      // Apply limit
      alerts = alerts.slice(0, parseInt(limit as string));

      res.json({
        alerts,
        total: alerts.length,
        filters: { status, severity, limit }
      });
    } catch (error) {
      console.error('Alerts retrieval error:', error);
      res.status(500).json({
        error: 'Failed to retrieve alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/monitoring/alerts/:id/resolve
 * Resolve an alert
 */
router.post('/alerts/:id/resolve',
  body('reason').optional().isString().isLength({ max: 500 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { reason } = req.body;

      const resolved = monitoringService.resolveAlert(id);

      if (!resolved) {
        return res.status(404).json({ error: 'Alert not found or already resolved' });
      }

      res.json({
        success: true,
        message: 'Alert resolved successfully',
        alertId: id,
        reason
      });
    } catch (error) {
      console.error('Alert resolution error:', error);
      res.status(500).json({
        error: 'Failed to resolve alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/monitoring/errors
 * Get error events
 */
router.get('/errors',
  query('status').optional().isIn(['active', 'resolved', 'all']),
  query('level').optional().isIn(['error', 'warning', 'critical']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status = 'active', level, limit = 50 } = req.query;
      const dashboard = monitoringService.getDashboard();
      
      let errorEvents = dashboard.recentErrors;

      // Filter by status
      if (status === 'active') {
        errorEvents = errorEvents.filter(e => !e.resolved);
      } else if (status === 'resolved') {
        errorEvents = errorEvents.filter(e => e.resolved);
      }

      // Filter by level
      if (level) {
        errorEvents = errorEvents.filter(e => e.level === level);
      }

      // Apply limit
      errorEvents = errorEvents.slice(0, parseInt(limit as string));

      res.json({
        errors: errorEvents,
        total: errorEvents.length,
        filters: { status, level, limit }
      });
    } catch (error) {
      console.error('Error events retrieval error:', error);
      res.status(500).json({
        error: 'Failed to retrieve error events',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/monitoring/errors/:id/resolve
 * Resolve an error event
 */
router.post('/errors/:id/resolve',
  body('reason').optional().isString().isLength({ max: 500 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { reason } = req.body;

      const resolved = monitoringService.resolveError(id);

      if (!resolved) {
        return res.status(404).json({ error: 'Error event not found or already resolved' });
      }

      res.json({
        success: true,
        message: 'Error resolved successfully',
        errorId: id,
        reason
      });
    } catch (error) {
      console.error('Error resolution error:', error);
      res.status(500).json({
        error: 'Failed to resolve error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/monitoring/test-alert
 * Create a test alert for testing purposes (development only)
 */
router.post('/test-alert',
  body('type').isIn(['latency', 'error_rate', 'throughput', 'resource', 'uptime']),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  body('message').isString().isLength({ min: 1, max: 200 }),
  async (req: Request, res: Response) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Test alerts not allowed in production' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, severity, message } = req.body;

      // Create test error for monitoring
      const errorId = monitoringService.createErrorEvent(
        `Test alert: ${message}`,
        new Error(message),
        {
          type: 'test',
          severity,
          endpoint: req.path,
          userAgent: req.get('user-agent')
        }
      );

      res.json({
        success: true,
        message: 'Test alert created',
        errorId,
        type,
        severity
      });
    } catch (error) {
      console.error('Test alert creation error:', error);
      res.status(500).json({
        error: 'Failed to create test alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;