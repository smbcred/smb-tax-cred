import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage';
import { SupportService } from '../services/supportService';
import { 
  insertSupportTicketSchema, 
  insertSupportTicketUpdateSchema,
  insertChatSessionSchema,
  insertChatMessageSchema 
} from '@shared/schema';

const router = Router();

// Rate limiting for support requests (10 tickets per hour per IP)
const supportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Too many support requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for chat messages (100 messages per 10 minutes)
const chatRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  message: "Too many chat messages, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
});

// Create support ticket
router.post('/tickets', supportRateLimit, async (req, res) => {
  try {
    const ticketData = insertSupportTicketSchema.parse(req.body);
    
    // Auto-categorize if not provided
    if (!ticketData.category) {
      ticketData.category = SupportService.categorizeTicket(ticketData.subject, ticketData.message);
    }
    
    // Auto-prioritize if not provided
    if (!ticketData.priority) {
      ticketData.priority = SupportService.calculatePriority(
        ticketData.category,
        ticketData.subject + ' ' + ticketData.message
      );
    }
    
    // Add metadata
    const metadata = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      pageUrl: req.get('Referer'),
      sessionId: req.session?.id || 'anonymous',
      ...(ticketData.metadata || {})
    };
    
    const ticket = await storage.createSupportTicket({
      ...ticketData,
      metadata
    });
    
    // Generate auto-response
    const autoResponse = SupportService.generateAutoResponse(ticket.category);
    
    // Add initial auto-response update
    await storage.createSupportTicketUpdate({
      ticketId: ticket.id,
      message: autoResponse,
      isInternal: false
    });
    
    res.status(201).json({
      success: true,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt
      },
      autoResponse
    });
  } catch (error: any) {
    console.error('Support ticket creation error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || "Failed to create support ticket" 
    });
  }
});

// Get support tickets (authenticated users only)
router.get('/tickets', async (req: any, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }
    
    const tickets = await storage.getSupportTicketsByUserId(req.user.id);
    res.json({
      success: true,
      tickets
    });
  } catch (error: any) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch support tickets" 
    });
  }
});

// Get specific ticket with updates
router.get('/tickets/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const ticket = await storage.getSupportTicket(id);
    
    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        message: "Ticket not found" 
      });
    }
    
    // Check if user owns the ticket (if authenticated)
    if (req.user && ticket.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }
    
    const updates = await storage.getSupportTicketUpdates(id);
    
    res.json({
      success: true,
      ticket,
      updates: updates.filter(update => !update.isInternal) // Hide internal notes from customers
    });
  } catch (error: any) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch support ticket" 
    });
  }
});

// Add update to ticket
router.post('/tickets/:id/updates', async (req: any, res) => {
  try {
    const { id } = req.params;
    const updateData = insertSupportTicketUpdateSchema.parse(req.body);
    
    const ticket = await storage.getSupportTicket(id);
    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        message: "Ticket not found" 
      });
    }
    
    // Check if user owns the ticket (if authenticated)
    if (req.user && ticket.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }
    
    const update = await storage.createSupportTicketUpdate({
      ...updateData,
      ticketId: id,
      userId: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      update
    });
  } catch (error: any) {
    console.error('Error creating ticket update:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || "Failed to add update" 
    });
  }
});

// Support metrics (public endpoint for status page)
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await storage.getSupportMetrics();
    res.json({
      success: true,
      metrics
    });
  } catch (error: any) {
    console.error('Error fetching support metrics:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch support metrics" 
    });
  }
});

// Knowledge base search integration
router.get('/knowledge-base/search', async (req, res) => {
  try {
    const { q, category } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    
    // Integrate with help system for knowledge base search
    const results = await storage.searchKnowledgeBase(q as string, category as string);
    
    res.json({
      success: true,
      query: q,
      category: category || 'all',
      results
    });
  } catch (error: any) {
    console.error('Knowledge base search error:', error);
    res.status(500).json({ 
      success: false,
      message: "Search failed" 
    });
  }
});

// Live chat endpoints
router.post('/chat/start', chatRateLimit, async (req, res) => {
  try {
    const sessionData = insertChatSessionSchema.parse(req.body);
    
    const metadata = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      pageUrl: req.get('Referer'),
      sessionId: req.session?.id || 'anonymous'
    };
    
    const session = await storage.createChatSession({
      ...sessionData,
      metadata
    });
    
    res.status(201).json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        startedAt: session.startedAt
      }
    });
  } catch (error: any) {
    console.error('Chat session creation error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || "Failed to start chat session" 
    });
  }
});

router.post('/chat/:sessionId/message', chatRateLimit, async (req: any, res) => {
  try {
    const { sessionId } = req.params;
    const messageData = insertChatMessageSchema.parse(req.body);
    
    const session = await storage.getChatSession(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: "Chat session not found" 
      });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: "Chat session is not active" 
      });
    }
    
    const message = await storage.createChatMessage({
      ...messageData,
      sessionId,
      userId: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message
    });
  } catch (error: any) {
    console.error('Chat message creation error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || "Failed to send message" 
    });
  }
});

export default router;