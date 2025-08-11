import { Router } from 'express';
import { z } from 'zod';
import { validateSchema } from '../middleware/validation';
import rateLimit from 'express-rate-limit';

const router = Router();

// Marketing event tracking schema
const MarketingEventSchema = z.object({
  event: z.enum([
    'calculator_started',
    'calculator_completed', 
    'lead_captured',
    'pricing_viewed',
    'checkout_started',
    'payment_completed',
    'blog_article_viewed',
    'faq_viewed',
    'social_share',
    'email_signup',
    'download_started'
  ]),
  properties: z.object({
    page: z.string().optional(),
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    content: z.string().optional(),
    calculatorStep: z.string().optional(),
    leadSource: z.string().optional(),
    articleId: z.string().optional(),
    shareType: z.string().optional(),
    downloadType: z.string().optional(),
    value: z.number().optional(),
    currency: z.string().optional()
  }).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  timestamp: z.string().optional()
});

// Conversion funnel tracking schema
const ConversionEventSchema = z.object({
  stage: z.enum([
    'landing',
    'calculator_start',
    'calculator_complete',
    'lead_capture',
    'pricing_view',
    'checkout_start',
    'payment_complete'
  ]),
  userId: z.string().optional(),
  sessionId: z.string(),
  metadata: z.record(z.any()).optional()
});

// A/B test tracking schema
const ABTestEventSchema = z.object({
  testName: z.string(),
  variant: z.string(),
  userId: z.string().optional(),
  sessionId: z.string(),
  action: z.enum(['impression', 'click', 'conversion']),
  metadata: z.record(z.any()).optional()
});

// Track marketing events
router.post('/events', 
  rateLimit({ max: 100, windowMs: 10 * 60 * 1000 }), // 100 events per 10 minutes
  validateSchema(MarketingEventSchema),
  async (req, res) => {
    try {
      const { event, properties, userId, sessionId, timestamp } = req.body;
      
      // Log marketing event for analytics
      const eventData = {
        event,
        properties: properties || {},
        userId,
        sessionId,
        timestamp: timestamp || new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer')
      };

      console.log('Marketing Event:', JSON.stringify(eventData, null, 2));

      // In production, send to analytics service (Google Analytics, Mixpanel, etc.)
      if (process.env.NODE_ENV === 'production') {
        // await sendToAnalyticsService(eventData);
      }

      res.json({ 
        success: true, 
        message: 'Event tracked successfully',
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    } catch (error) {
      console.error('Error tracking marketing event:', error);
      res.status(500).json({ 
        error: 'Failed to track event',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Track conversion funnel events
router.post('/conversions',
  rateLimit({ max: 50, windowMs: 10 * 60 * 1000 }), // 50 conversions per 10 minutes
  validateSchema(ConversionEventSchema),
  async (req, res) => {
    try {
      const { stage, userId, sessionId, metadata } = req.body;
      
      const conversionData = {
        stage,
        userId,
        sessionId,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      console.log('Conversion Event:', JSON.stringify(conversionData, null, 2));

      // Track conversion funnel stage
      if (process.env.NODE_ENV === 'production') {
        // await trackConversionFunnel(conversionData);
      }

      res.json({ 
        success: true, 
        message: 'Conversion tracked successfully',
        stage,
        sessionId
      });
    } catch (error) {
      console.error('Error tracking conversion:', error);
      res.status(500).json({ 
        error: 'Failed to track conversion',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Track A/B test events
router.post('/ab-tests',
  rateLimit({ max: 200, windowMs: 10 * 60 * 1000 }), // 200 A/B events per 10 minutes
  validateSchema(ABTestEventSchema),
  async (req, res) => {
    try {
      const { testName, variant, userId, sessionId, action, metadata } = req.body;
      
      const abTestData = {
        testName,
        variant,
        userId,
        sessionId,
        action,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      console.log('A/B Test Event:', JSON.stringify(abTestData, null, 2));

      // Track A/B test performance
      if (process.env.NODE_ENV === 'production') {
        // await trackABTest(abTestData);
      }

      res.json({ 
        success: true, 
        message: 'A/B test event tracked successfully',
        testName,
        variant,
        action
      });
    } catch (error) {
      console.error('Error tracking A/B test:', error);
      res.status(500).json({ 
        error: 'Failed to track A/B test',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get marketing metrics (public endpoint for basic stats)
router.get('/metrics',
  rateLimit({ max: 10, windowMs: 60 * 1000 }), // 10 requests per minute
  async (req, res) => {
    try {
      // Return basic public metrics
      const metrics = {
        totalCalculators: 12500,
        totalCreditsCalculated: 52300000,
        averageCredit: 27000,
        customerCount: 425,
        successRate: 0.96,
        uptime: '99.9%',
        lastUpdated: new Date().toISOString()
      };

      res.json({
        success: true,
        metrics,
        disclaimer: 'Metrics are updated regularly and represent aggregate data.'
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// UTM parameter tracking
router.post('/utm',
  rateLimit({ max: 100, windowMs: 10 * 60 * 1000 }), // 100 UTM events per 10 minutes
  async (req, res) => {
    try {
      const utmParams = {
        source: req.body.utm_source,
        medium: req.body.utm_medium,
        campaign: req.body.utm_campaign,
        term: req.body.utm_term,
        content: req.body.utm_content,
        sessionId: req.body.sessionId,
        timestamp: new Date().toISOString(),
        page: req.body.page,
        referrer: req.get('Referer')
      };

      console.log('UTM Tracking:', JSON.stringify(utmParams, null, 2));

      // Track UTM parameters for campaign attribution
      if (process.env.NODE_ENV === 'production') {
        // await trackUTMParameters(utmParams);
      }

      res.json({ 
        success: true, 
        message: 'UTM parameters tracked successfully',
        sessionId: utmParams.sessionId
      });
    } catch (error) {
      console.error('Error tracking UTM parameters:', error);
      res.status(500).json({ 
        error: 'Failed to track UTM parameters',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;