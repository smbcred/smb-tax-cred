/**
 * Admin-only API routes
 */

import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth';
import { db } from '../db';
import { users, companies, auditLogs, webhookLogs, documents, intakeForms, leads, payments, calculations } from '../../shared/schema';
import { eq, desc, count, sql } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';

// Rate limiting for admin read endpoints (100 requests per 15 minutes)
const adminReadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many admin requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// Apply admin authentication and rate limiting to all routes
router.use(requireAdmin);
router.use(adminReadRateLimit);

/**
 * Health check for admin routes
 */
router.get('/ping', (req, res) => {
  res.json({ 
    message: 'Admin API is accessible', 
    adminUser: req.user?.email,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get system overview dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [companyCount] = await db.select({ count: count() }).from(companies);
    const [documentCount] = await db.select({ count: count() }).from(documents);
    const [intakeCount] = await db.select({ count: count() }).from(intakeForms);

    // Recent activity from audit logs
    const recentActivity = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        adminUserId: auditLogs.adminUserId,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(10);

    res.json({
      stats: {
        users: userCount.count,
        companies: companyCount.count,
        documents: documentCount.count,
        intakeForms: intakeCount.count,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

/**
 * GET /api/admin/leads - Search and filter leads with pagination
 */
router.get('/leads', async (req, res) => {
  try {
    const { search, dateFrom, dateTo, limit = '20', offset = '0' } = req.query;
    
    // Build query - using proper Drizzle ORM syntax
    let query = db.select().from(leads);

    // Apply filters using proper Drizzle conditions
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        sql`${leads.email} ILIKE ${searchTerm} OR ${leads.companyName} ILIKE ${searchTerm}`
      );
    }

    // Get total count for pagination
    const [totalCount] = await db.select({ count: count() }).from(leads);
    const total = totalCount.count;

    // Get paginated results ordered by created_at desc
    const results = await query
      .orderBy(desc(leads.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({
      success: true,
      data: results,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch leads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leads'
    });
  }
});

/**
 * GET /api/admin/customers - Get customers with pagination (renaming users to match requirement)
 */
router.get('/customers', async (req, res) => {
  try {
    const { limit = '20', offset = '0' } = req.query;

    // Get total count
    const [totalCount] = await db.select({ count: count() }).from(users);

    // Get paginated customer data with company info using proper joins
    const results = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
        isAdmin: users.isAdmin,
        legalName: companies.legalName,
        ein: companies.ein,
        entityType: companies.entityType,
        industry: companies.industry,
      })
      .from(users)
      .leftJoin(companies, eq(users.id, companies.userId))
      .orderBy(desc(users.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({
      success: true,
      data: results,
      pagination: {
        total: totalCount.count,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < totalCount.count
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
});

/**
 * GET /api/admin/documents - Get documents with status filtering
 */
router.get('/documents', async (req, res) => {
  try {
    const { status, limit = '20', offset = '0' } = req.query;
    
    // Build query with optional status filter
    let query = db
      .select({
        id: documents.id,
        documentType: documents.documentType,
        status: documents.status,
        createdAt: documents.createdAt,
        fileName: documents.fileName,
        fileSizeBytes: documents.fileSizeBytes,
        downloadCount: documents.downloadCount,
        lastAccessedAt: documents.lastAccessedAt,
        userEmail: users.email,
        companyName: companies.legalName,
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .leftJoin(companies, eq(users.id, companies.userId));

    if (status && (status === 'ready' || status === 'pending')) {
      query = query.where(eq(documents.status, status as string));
    }

    // Get total count
    const [totalCount] = await db.select({ count: count() }).from(documents);

    // Get paginated results
    const results = await query
      .orderBy(desc(documents.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({
      success: true,
      data: results,
      pagination: {
        total: totalCount.count,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < totalCount.count
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    });
  }
});

/**
 * GET /api/admin/payments - Get payment records
 */
router.get('/payments', async (req, res) => {
  try {
    const { limit = '20', offset = '0' } = req.query;

    // Get total count
    const [totalCount] = await db.select({ count: count() }).from(payments);

    // Get paginated payments with user and calculation info
    const results = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        stripePaymentIntentId: payments.stripePaymentIntentId,
        userEmail: users.email,
        companyName: companies.legalName,
        calculatedCredit: calculations.totalCredit,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .leftJoin(companies, eq(users.id, companies.userId))
      .leftJoin(calculations, eq(payments.calculationId, calculations.id))
      .orderBy(desc(payments.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({
      success: true,
      data: results,
      pagination: {
        total: totalCount.count,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < totalCount.count
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
});

/**
 * GET /api/admin/webhooks - Get webhook logs with source filtering (renaming for consistency)
 */
router.get('/webhooks', async (req, res) => {
  try {
    const { source, limit = '20', offset = '0' } = req.query;
    
    // Build query with optional source filter
    let query = db
      .select({
        id: webhookLogs.id,
        source: webhookLogs.source,
        status: webhookLogs.status,
        event: webhookLogs.event,
        responseCode: webhookLogs.responseCode,
        processingTimeMs: webhookLogs.processingTimeMs,
        errorMessage: webhookLogs.errorMessage,
        ipAddress: webhookLogs.ipAddress,
        createdAt: webhookLogs.createdAt,
      })
      .from(webhookLogs);

    if (source && ['stripe', 'make', 'sendgrid'].includes(source as string)) {
      query = query.where(eq(webhookLogs.source, source as string));
    }

    // Get total count
    const [totalCount] = await db.select({ count: count() }).from(webhookLogs);

    // Get paginated results
    const results = await query
      .orderBy(desc(webhookLogs.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({
      success: true,
      data: results,
      pagination: {
        total: totalCount.count,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < totalCount.count
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch webhook logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch webhook logs'
    });
  }
});

/**
 * Get all users with admin privileges to modify
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isAdmin: users.isAdmin,
        status: users.status,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: count() }).from(users);

    res.json({
      users: allUsers,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit),
      },
    });
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * Get audit logs with filtering
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;

    const logs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: count() }).from(auditLogs);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit),
      },
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

/**
 * Get webhook logs with filtering
 */
router.get('/webhook-logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;

    const logs = await db
      .select()
      .from(webhookLogs)
      .orderBy(desc(webhookLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: count() }).from(webhookLogs);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit),
      },
    });
  } catch (error) {
    console.error('Webhook logs error:', error);
    res.status(500).json({ error: 'Failed to fetch webhook logs' });
  }
});

export { router as adminRouter };