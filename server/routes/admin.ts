/**
 * Admin-only API routes
 */

import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth';
import { db } from '../db';
import { users, companies, auditLogs, webhookLogs, documents, intakeForms } from '../../shared/schema';
import { eq, desc, count, sql } from 'drizzle-orm';

const router = Router();

// Apply admin authentication to all routes
router.use(requireAdmin);

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