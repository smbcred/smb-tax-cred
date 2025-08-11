import express from 'express';
import { z } from 'zod';
import { db } from '../db';
import { userFeedback, testingSessions, insertUserFeedbackSchema, insertTestingSessionSchema } from '../../shared/schema';
import { eq, desc, and, gte, lte, count } from 'drizzle-orm';
// Authentication middleware function
const authenticateUser = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const router = express.Router();

// Validation schemas
const createFeedbackSchema = insertUserFeedbackSchema.extend({
  metadata: z.object({
    userAgent: z.string().optional(),
    viewport: z.object({
      width: z.number(),
      height: z.number()
    }).optional(),
    task: z.string().optional(),
    timeSpent: z.number().optional(),
    completionStatus: z.enum(['completed', 'abandoned', 'error']).optional(),
    testingPhase: z.enum(['moderated', 'unmoderated', 'ab_test']).optional(),
    userPersona: z.enum(['business_owner', 'accountant', 'startup_founder']).optional(),
    referenceId: z.string().optional()
  }).optional()
});

const createTestingSessionSchema = insertTestingSessionSchema.extend({
  metadata: z.object({
    recruitmentChannel: z.string().optional(),
    company: z.string().optional(),
    industry: z.string().optional(),
    companySize: z.string().optional(),
    aiToolUsage: z.array(z.string()).optional(),
    technicalSetup: z.string().optional(),
    issues: z.array(z.string()).optional(),
    keyInsights: z.array(z.string()).optional()
  }).optional()
});

// POST /api/feedback - Submit user feedback
router.post('/', async (req, res) => {
  try {
    const validatedData = createFeedbackSchema.parse(req.body);
    
    // Get user ID if authenticated, otherwise use session-based tracking
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const user = await authenticateUser(req, res, () => {});
        userId = (user as any)?.id;
      } catch {
        // Continue without user ID for anonymous feedback
      }
    }

    // Generate session ID if not provided
    const sessionId = validatedData.sessionId || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const [feedback] = await db.insert(userFeedback).values({
      ...validatedData,
      userId,
      sessionId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    res.status(201).json({
      success: true,
      feedback: {
        id: feedback.id,
        type: feedback.type,
        category: feedback.category,
        severity: feedback.severity,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating feedback:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feedback data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

// GET /api/feedback - Get user feedback (authenticated users only)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;
    
    const type = req.query.type as string;
    const category = req.query.category as string;
    const status = req.query.status as string;

    // Build where conditions
    const conditions = [eq(userFeedback.userId, userId)];
    
    if (type) conditions.push(eq(userFeedback.type, type));
    if (category) conditions.push(eq(userFeedback.category, category));
    if (status) conditions.push(eq(userFeedback.status, status));

    // Get feedback with pagination
    const feedback = await db
      .select()
      .from(userFeedback)
      .where(and(...conditions))
      .orderBy(desc(userFeedback.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(userFeedback)
      .where(and(...conditions));

    res.json({
      success: true,
      feedback,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback'
    });
  }
});

// GET /api/feedback/analytics - Get feedback analytics (admin only)
router.get('/analytics', authenticateUser, async (req, res) => {
  try {
    // Note: In production, add admin role check here
    
    const { startDate, endDate } = req.query;
    
    const conditions = [];
    if (startDate) {
      conditions.push(gte(userFeedback.createdAt, new Date(startDate as string)));
    }
    if (endDate) {
      conditions.push(lte(userFeedback.createdAt, new Date(endDate as string)));
    }

    // Get feedback summary statistics
    const allFeedback = await db
      .select()
      .from(userFeedback)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(userFeedback.createdAt));

    // Calculate analytics
    const analytics = {
      total: allFeedback.length,
      byType: allFeedback.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: allFeedback.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: allFeedback.reduce((acc, item) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: allFeedback.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageRating: allFeedback
        .filter(item => item.rating)
        .reduce((sum, item, _, arr) => sum + (item.rating! / arr.length), 0),
      averageNPS: allFeedback
        .filter(item => item.npsScore !== null)
        .reduce((sum, item, _, arr) => sum + (item.npsScore! / arr.length), 0),
      recentFeedback: allFeedback.slice(0, 10).map(item => ({
        id: item.id,
        type: item.type,
        category: item.category,
        severity: item.severity,
        title: item.title,
        rating: item.rating,
        page: item.page,
        createdAt: item.createdAt
      }))
    };

    res.json({
      success: true,
      analytics,
      dateRange: {
        startDate: startDate || 'all',
        endDate: endDate || 'now'
      }
    });

  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// POST /api/feedback/testing-session - Create testing session
router.post('/testing-session', async (req, res) => {
  try {
    const validatedData = createTestingSessionSchema.parse(req.body);

    const [session] = await db.insert(testingSessions).values({
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    res.status(201).json({
      success: true,
      session: {
        id: session.id,
        participantId: session.participantId,
        type: session.type,
        phase: session.phase,
        persona: session.persona,
        createdAt: session.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating testing session:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create testing session'
    });
  }
});

// PUT /api/feedback/testing-session/:id - Update testing session
router.put('/testing-session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [session] = await db
      .update(testingSessions)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(testingSessions.id, id))
      .returning();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Testing session not found'
      });
    }

    res.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Error updating testing session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update testing session'
    });
  }
});

// GET /api/feedback/testing-sessions - Get testing sessions (admin only)
router.get('/testing-sessions', authenticateUser, async (req, res) => {
  try {
    // Note: In production, add admin role check here
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    
    const type = req.query.type as string;
    const phase = req.query.phase as string;
    const persona = req.query.persona as string;

    // Build where conditions
    const conditions = [];
    if (type) conditions.push(eq(testingSessions.type, type));
    if (phase) conditions.push(eq(testingSessions.phase, phase));
    if (persona) conditions.push(eq(testingSessions.persona, persona));

    // Get sessions with pagination
    const sessions = await db
      .select()
      .from(testingSessions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(testingSessions.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(testingSessions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json({
      success: true,
      sessions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching testing sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch testing sessions'
    });
  }
});

export default router;