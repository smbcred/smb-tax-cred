// Analytics API routes for event collection and reporting

import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { AnalyticsEvent, ConversionFunnel, UserJourney, ABTest, PerformanceMetric } from '../../shared/types/analytics';

const router = Router();

// Temporary in-memory storage for analytics data
// In production, this should use a proper analytics database
let analyticsEvents: AnalyticsEvent[] = [];
let userJourneys: Map<string, UserJourney> = new Map();
let abTests: ABTest[] = [];
let performanceMetrics: PerformanceMetric[] = [];

/**
 * POST /api/analytics/events
 * Collect analytics events from the frontend
 */
router.post('/events',
  body('events').isArray().withMessage('Events must be an array'),
  body('events.*.event').notEmpty().withMessage('Event name is required'),
  body('events.*.category').notEmpty().withMessage('Event category is required'),
  body('events.*.sessionId').notEmpty().withMessage('Session ID is required'),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { events } = req.body;
      
      // Process and store events
      for (const eventData of events) {
        const analyticsEvent: AnalyticsEvent = {
          ...eventData,
          timestamp: new Date(eventData.timestamp || Date.now()),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        };

        analyticsEvents.push(analyticsEvent);

        // Update user journey
        updateUserJourney(analyticsEvent);

        // Track performance metrics separately
        if (analyticsEvent.category === 'performance') {
          trackPerformanceMetric(analyticsEvent);
        }
      }

      res.status(200).json({ 
        success: true, 
        processed: events.length,
        message: 'Events processed successfully'
      });

    } catch (error) {
      console.error('Analytics events processing error:', error);
      res.status(500).json({ 
        error: 'Failed to process analytics events',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/analytics/events
 * Retrieve analytics events with filtering
 */
router.get('/events',
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('userId').optional().isString(),
  query('sessionId').optional().isString(),
  query('event').optional().isString(),
  query('category').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { startDate, endDate, userId, sessionId, event, category, limit = 100 } = req.query;

      let filteredEvents = analyticsEvents;

      // Apply filters
      if (startDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= new Date(startDate as string));
      }
      if (endDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= new Date(endDate as string));
      }
      if (userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === userId);
      }
      if (sessionId) {
        filteredEvents = filteredEvents.filter(e => e.sessionId === sessionId);
      }
      if (event) {
        filteredEvents = filteredEvents.filter(e => e.event === event);
      }
      if (category) {
        filteredEvents = filteredEvents.filter(e => e.category === category);
      }

      // Sort by timestamp (newest first) and limit
      filteredEvents = filteredEvents
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, parseInt(limit as string));

      res.json({
        events: filteredEvents,
        total: filteredEvents.length,
        filtered: filteredEvents.length < analyticsEvents.length
      });

    } catch (error) {
      console.error('Analytics events retrieval error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve analytics events',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/analytics/dashboard
 * Get dashboard metrics and insights
 */
router.get('/dashboard',
  query('period').optional().isIn(['hour', 'day', 'week', 'month']).withMessage('Period must be hour, day, week, or month'),
  async (req: Request, res: Response) => {
    try {
      const { period = 'day' } = req.query;
      const now = new Date();
      let startDate: Date;

      // Calculate time period
      switch (period) {
        case 'hour':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const periodEvents = analyticsEvents.filter(e => e.timestamp >= startDate);

      // Calculate key metrics
      const metrics = {
        totalEvents: periodEvents.length,
        uniqueUsers: new Set(periodEvents.filter(e => e.userId).map(e => e.userId)).size,
        uniqueSessions: new Set(periodEvents.map(e => e.sessionId)).size,
        pageViews: periodEvents.filter(e => e.event === 'page_view').length,
        conversions: periodEvents.filter(e => e.category === 'conversion').length,
        errors: periodEvents.filter(e => e.category === 'error').length,
        averageSessionDuration: calculateAverageSessionDuration(periodEvents),
        topPages: getTopPages(periodEvents),
        topEvents: getTopEvents(periodEvents),
        conversionRate: calculateConversionRate(periodEvents),
        bounceRate: calculateBounceRate(periodEvents)
      };

      res.json({
        period,
        startDate,
        endDate: now,
        metrics
      });

    } catch (error) {
      console.error('Analytics dashboard error:', error);
      res.status(500).json({ 
        error: 'Failed to generate dashboard metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/analytics/funnel/:funnelId
 * Get conversion funnel analytics
 */
router.get('/funnel/:funnelId',
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  async (req: Request, res: Response) => {
    try {
      const { funnelId } = req.params;
      const { startDate, endDate } = req.query;

      let events = analyticsEvents;
      
      if (startDate) {
        events = events.filter(e => e.timestamp >= new Date(startDate as string));
      }
      if (endDate) {
        events = events.filter(e => e.timestamp <= new Date(endDate as string));
      }

      const funnelData = calculateFunnelMetrics(funnelId, events);

      res.json(funnelData);

    } catch (error) {
      console.error('Funnel analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to calculate funnel metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/analytics/user-journey/:sessionId
 * Get user journey for a specific session
 */
router.get('/user-journey/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const journey = userJourneys.get(sessionId);
    
    if (!journey) {
      return res.status(404).json({ error: 'User journey not found' });
    }

    res.json(journey);

  } catch (error) {
    console.error('User journey retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve user journey',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/analytics/performance
 * Get performance metrics
 */
router.get('/performance',
  query('metric').optional().isString(),
  query('page').optional().isString(),
  query('period').optional().isIn(['hour', 'day', 'week', 'month']),
  async (req: Request, res: Response) => {
    try {
      const { metric, page, period = 'day' } = req.query;
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'hour':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      let filteredMetrics = performanceMetrics.filter(m => m.timestamp >= startDate);

      if (metric) {
        filteredMetrics = filteredMetrics.filter(m => m.metric === metric);
      }
      if (page) {
        filteredMetrics = filteredMetrics.filter(m => m.page === page);
      }

      const aggregatedMetrics = aggregatePerformanceMetrics(filteredMetrics);

      res.json({
        period,
        startDate,
        endDate: now,
        metrics: aggregatedMetrics,
        total: filteredMetrics.length
      });

    } catch (error) {
      console.error('Performance metrics error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);


// Helper functions

function updateUserJourney(event: AnalyticsEvent): void {
  let journey = userJourneys.get(event.sessionId);
  
  if (!journey) {
    journey = {
      sessionId: event.sessionId,
      userId: event.userId,
      startTime: event.timestamp,
      events: [],
      pages: [],
      bounced: true,
      converted: false
    };
    userJourneys.set(event.sessionId, journey);
  }

  journey.events.push(event);
  journey.endTime = event.timestamp;
  journey.duration = journey.endTime.getTime() - journey.startTime.getTime();

  // Track unique pages
  if (event.event === 'page_view' && event.properties?.page) {
    if (!journey.pages.includes(event.properties.page)) {
      journey.pages.push(event.properties.page);
    }
  }

  // Update bounce status
  journey.bounced = journey.pages.length <= 1 && journey.duration < 30000; // Less than 30 seconds on one page

  // Update conversion status
  if (event.category === 'conversion' || event.event === 'payment_completed') {
    journey.converted = true;
    journey.conversionValue = event.properties?.value || 0;
  }
}

function trackPerformanceMetric(event: AnalyticsEvent): void {
  const metric: PerformanceMetric = {
    id: event.id,
    sessionId: event.sessionId,
    timestamp: event.timestamp,
    metric: event.properties?.metric || 'custom',
    value: event.properties?.value || 0,
    unit: event.properties?.unit || 'ms',
    page: event.properties?.page || event.page || '',
    deviceType: determineDeviceType(event.userAgent || ''),
    connection: event.properties?.connection
  };

  performanceMetrics.push(metric);
}

function determineDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return /iPad/.test(userAgent) ? 'tablet' : 'mobile';
  }
  return 'desktop';
}

function calculateAverageSessionDuration(events: AnalyticsEvent[]): number {
  const sessionDurations = new Map<string, number>();
  
  events.forEach(event => {
    const sessionStart = sessionDurations.get(event.sessionId) || event.timestamp.getTime();
    sessionDurations.set(event.sessionId, Math.max(sessionStart, event.timestamp.getTime()));
  });

  const durations = Array.from(sessionDurations.values());
  return durations.length > 0 ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length : 0;
}

function getTopPages(events: AnalyticsEvent[]): Array<{ page: string; views: number }> {
  const pageViews = new Map<string, number>();
  
  events
    .filter(e => e.event === 'page_view' && e.properties?.page)
    .forEach(e => {
      const page = e.properties.page;
      pageViews.set(page, (pageViews.get(page) || 0) + 1);
    });

  return Array.from(pageViews.entries())
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
}

function getTopEvents(events: AnalyticsEvent[]): Array<{ event: string; count: number }> {
  const eventCounts = new Map<string, number>();
  
  events.forEach(e => {
    eventCounts.set(e.event, (eventCounts.get(e.event) || 0) + 1);
  });

  return Array.from(eventCounts.entries())
    .map(([event, count]) => ({ event, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculateConversionRate(events: AnalyticsEvent[]): number {
  const totalSessions = new Set(events.map(e => e.sessionId)).size;
  const convertedSessions = new Set(
    events
      .filter(e => e.category === 'conversion' || e.event === 'payment_completed')
      .map(e => e.sessionId)
  ).size;

  return totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0;
}

function calculateBounceRate(events: AnalyticsEvent[]): number {
  const sessionPageViews = new Map<string, number>();
  
  events
    .filter(e => e.event === 'page_view')
    .forEach(e => {
      sessionPageViews.set(e.sessionId, (sessionPageViews.get(e.sessionId) || 0) + 1);
    });

  const totalSessions = sessionPageViews.size;
  const bouncedSessions = Array.from(sessionPageViews.values()).filter(views => views === 1).length;

  return totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;
}

function calculateFunnelMetrics(funnelId: string, events: AnalyticsEvent[]): ConversionFunnel {
  // This is a simplified funnel calculation
  // In production, you'd have predefined funnel steps
  const steps = [
    { id: '1', name: 'Landing Page', event: 'page_view', description: 'User visits landing page', order: 1, required: true },
    { id: '2', name: 'Calculator Started', event: 'calculator_started', description: 'User starts calculator', order: 2, required: true },
    { id: '3', name: 'Calculator Completed', event: 'calculator_completed', description: 'User completes calculator', order: 3, required: true },
    { id: '4', name: 'Registration', event: 'user_registered', description: 'User registers', order: 4, required: true },
    { id: '5', name: 'Payment', event: 'payment_completed', description: 'User pays', order: 5, required: true }
  ];

  const stepCounts = steps.map(step => 
    new Set(events.filter(e => e.event === step.event).map(e => e.sessionId)).size
  );

  const totalUsers = stepCounts[0] || 0;
  const completedUsers = stepCounts[stepCounts.length - 1] || 0;

  const conversionRates = stepCounts.map((count, index) => 
    index === 0 ? 100 : totalUsers > 0 ? (count / totalUsers) * 100 : 0
  );

  const dropoffRates = stepCounts.map((count, index) => 
    index === 0 ? 0 : stepCounts[index - 1] > 0 ? ((stepCounts[index - 1] - count) / stepCounts[index - 1]) * 100 : 0
  );

  return {
    id: funnelId,
    name: `Funnel ${funnelId}`,
    steps,
    conversionRates,
    totalUsers,
    completedUsers,
    dropoffRates
  };
}

function aggregatePerformanceMetrics(metrics: PerformanceMetric[]): Record<string, any> {
  const grouped = new Map<string, number[]>();
  
  metrics.forEach(metric => {
    const key = `${metric.metric}_${metric.unit}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(metric.value);
  });

  const aggregated: Record<string, any> = {};
  
  grouped.forEach((values, key) => {
    const [metric, unit] = key.split('_');
    aggregated[metric] = {
      unit,
      count: values.length,
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      p50: percentile(values, 50),
      p90: percentile(values, 90),
      p95: percentile(values, 95)
    };
  });

  return aggregated;
}

function percentile(values: number[], p: number): number {
  const sorted = values.sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  
  if (index % 1 === 0) {
    return sorted[index];
  } else {
    const lower = sorted[Math.floor(index)];
    const upper = sorted[Math.ceil(index)];
    return lower + (upper - lower) * (index % 1);
  }
}

export default router;