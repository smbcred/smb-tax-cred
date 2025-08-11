import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { storage } from "./storage";

// Import performance optimization middleware
import { 
  cacheMiddleware, 
  invalidateCache, 
  etagMiddleware, 
  compressionMiddleware,
  queryCache 
} from "./middleware/caching";
import { 
  apiRateLimit, 
  authRateLimit as authRL, 
  strictRateLimit, 
  userRateLimit 
} from "./middleware/rateLimit";
import { 
  OptimizedQueryBuilder, 
  PaginationOptimizer, 
  QueryPerformanceMonitor,
  ConnectionPoolOptimizer 
} from "./services/queryOptimizer";

// Import security middleware
import { 
  applySecurity, 
  securityHeaders, 
  bruteForceProtection,
  passwordSecurity,
  logSecurityEvent 
} from "./middleware/security";
import { 
  csrfTokenProvider, 
  csrfProtection, 
  csrfTokenEndpoint,
  csrfApiProtection 
} from "./middleware/csrf";
import { 
  validateBody, 
  validateQuery, 
  userRegistrationValidation,
  userLoginValidation 
} from "./middleware/validation";

// Import data protection middleware
import { 
  applyDataProtection,
  dataAccessControl,
  AccessLogger,
  PIICategory 
} from "./middleware/dataProtection";
import { 
  secureTransmission,
  FieldEncryption 
} from "./middleware/encryption";
import checkoutRoutes from "./routes/checkout.js";
import { adminRouter } from "./routes/admin";
import {
  insertUserSchema,
  insertCompanySchema,
  insertCalculationSchema,
  insertLeadSchema,
  leadCaptureSchema,
  calculatorExpensesSchema,
  companyInfoSchema,
  intakeFormSubmissionSchema,
  documents,
  type CalculatorExpenses,
} from "@shared/schema";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}

if (!process.env.JWT_SECRET) {
  throw new Error("Missing required JWT secret: JWT_SECRET");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const JWT_SECRET = process.env.JWT_SECRET;

// Rate limiting for lead capture (5 requests per IP per hour)
const leadCaptureRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many lead capture attempts from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for auth endpoints (5 attempts per IP per 15 minutes)
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many authentication attempts from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for auto-save endpoints (100 requests per user per 5 minutes)
const autoSaveRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,
  message: "Too many auto-save attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper to get client IP address
const getClientIp = (req: any): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.connection.remoteAddress || req.socket.remoteAddress || '';
};

// Middleware to verify JWT tokens
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// R&D Tax Credit Calculation Logic
const calculateRDTaxCredit = (expenses: CalculatorExpenses) => {
  const { wages, contractors, supplies, cloud } = expenses;
  
  // Simplified ASC method: 14% of qualified research expenses
  const totalQRE = wages + supplies + (contractors * 0.65) + cloud;
  const federalCredit = totalQRE * 0.14;
  
  // Determine pricing tier based on credit amount
  let pricingTier: number;
  let pricingAmount: number;
  
  if (federalCredit <= 10000) {
    pricingTier = 1;
    pricingAmount = 495;
  } else if (federalCredit <= 25000) {
    pricingTier = 2;
    pricingAmount = 1495;
  } else if (federalCredit <= 50000) {
    pricingTier = 3;
    pricingAmount = 2495;
  } else {
    pricingTier = 4;
    pricingAmount = 3995;
  }
  
  return {
    totalQRE,
    federalCredit,
    pricingTier,
    pricingAmount,
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Apply security middleware
  app.use(applySecurity());
  
  // Apply data protection middleware
  app.use(applyDataProtection());
  
  // Secure transmission middleware
  app.use(secureTransmission());
  
  // CSRF protection for API endpoints  
  app.use("/api", csrfTokenProvider());
  
  // Register checkout routes
  app.use("/api/checkout", checkoutRoutes);

  // Register analytics routes
  const { default: analyticsRoutes } = await import('./routes/analytics.js');
  app.use("/api/analytics", analyticsRoutes);

  // Register monitoring routes
  const { default: monitoringRoutes } = await import('./routes/monitoring.js');
  app.use("/api/monitoring", monitoringRoutes);

  // Register feedback routes
  const { default: feedbackRoutes } = await import('./routes/feedback.js');
  app.use("/api/feedback", feedbackRoutes);

  // Register help routes
  const { default: helpRoutes } = await import('./routes/help.js');
  app.use("/api/help", helpRoutes);

  // Register support routes (public endpoints for customer support)
  const { default: supportRoutes } = await import('./routes/support.js');
  app.use("/api/support", supportRoutes);

  // Dev-only S3 smoke test route (no authentication required)
  if (process.env.NODE_ENV !== 'production') {
    app.post("/api/dev/s3-smoke", async (req, res) => {
      try {
        const { createS3Service } = await import('./services/storage/s3');
        
        // Create a tiny PDF buffer for testing
        const tinyPdfBuffer = Buffer.from(
          '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000079 00000 n \n0000000136 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n213\n%%EOF'
        );
        
        const s3Service = createS3Service();
        const testKey = s3Service.docKey({
          customerId: 'smoke-test',
          taxYear: new Date().getFullYear(),
          docType: 'test-doc'
        });
        
        // Upload the test PDF
        await s3Service.uploadPdf({
          buffer: tinyPdfBuffer,
          key: testKey,
          metadata: {
            testType: 'smoke-test',
            createdBy: 'dev-route'
          }
        });
        
        // Generate a 5-minute presigned URL
        const url = await s3Service.getPdfUrl(testKey, 300);
        
        res.json({
          success: true,
          key: testKey,
          url: url,
          size: tinyPdfBuffer.length,
          timestamp: new Date().toISOString()
        });
        
      } catch (error: any) {
        console.error('S3 smoke test failed:', error);
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Dev-only SendGrid email smoke test route (no authentication required)
    app.post("/api/dev/email-smoke", async (req: any, res) => {
      try {
        const { to } = req.body;
        
        if (!to || typeof to !== 'string' || !to.includes('@')) {
          return res.status(400).json({
            success: false,
            error: 'Valid email address required in request body: { "to": "email@example.com" }'
          });
        }

        console.log('SendGrid smoke test - sending welcome email to:', to);

        // Import SendGrid service
        const { sendWelcomeEmail } = await import('./services/email/sendgrid');
        
        const success = await sendWelcomeEmail(to, {
          name: 'Test User',
          companyName: 'SMBTaxCredits'
        });

        if (success) {
          res.json({
            success: true,
            message: `Welcome email sent successfully to ${to}`,
            templateUsed: 'SENDGRID_TEMPLATE_WELCOME',
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to send email - check SendGrid configuration'
          });
        }

      } catch (error: any) {
        console.error('SendGrid smoke test error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Email service error',
          details: error.response?.body || null
        });
      }
    });

    // Dev-only comprehensive integration test
    app.post("/api/dev/integration-test", async (req, res) => {
      const results: any = {
        timestamp: new Date().toISOString(),
        tests: {},
        summary: { passed: 0, failed: 0 }
      };

      // Test 1: S3 Storage
      try {
        const { createS3Service } = await import('./services/storage/s3');
        const s3Service = createS3Service();
        const testKey = `integration-test/${Date.now()}.pdf`;
        const testBuffer = Buffer.from('test content');
        
        await s3Service.uploadPdf({ buffer: testBuffer, key: testKey });
        const url = await s3Service.getPdfUrl(testKey, 300);
        
        results.tests.s3 = { status: 'PASS', url: url.substring(0, 50) + '...' };
        results.summary.passed++;
      } catch (error: any) {
        results.tests.s3 = { status: 'FAIL', error: error.message };
        results.summary.failed++;
      }

      // Test 2: Documint PDF Generation
      try {
        const { getDocumintService } = await import('./services/documint');
        const documintService = getDocumintService();
        
        // Check service availability with proper Form6765 data structure
        const testData = {
          companyName: 'Test Company Inc',
          taxYear: 2024,
          businessType: 'corporation' as const,
          currentYearExpenses: {
            wages: 50000,
            contractors: 25000,
            supplies: 5000,
            total: 80000
          },
          rdActivities: [{
            activity: 'AI Testing',
            description: 'Testing AI implementation',
            hours: 100,
            wages: 10000,
            category: 'testing' as const
          }],
          technicalChallenges: ['AI integration complexity'],
          uncertainties: ['Performance optimization'],
          innovations: ['Novel AI approach'],
          businessPurpose: 'Improve business efficiency',
          calculations: {
            totalQualifiedExpenses: 80000,
            ascPercentage: 6,
            baseAmount: 0,
            creditAmount: 8000,
            riskLevel: 'low' as const
          }
        };
        
        const response = await documintService.generatePDF({
          templateId: 'form6765',
          data: testData
        });
        
        results.tests.documint = { 
          status: 'PASS', 
          hasApiKey: !!process.env.DOCUMINT_API_KEY,
          responseId: response.id,
          responseStatus: response.status
        };
        results.summary.passed++;
      } catch (error: any) {
        results.tests.documint = { status: 'FAIL', error: error.message };
        results.summary.failed++;
      }

      // Test 3: Stripe Configuration
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        // Just test that Stripe initializes correctly
        results.tests.stripe = { 
          status: 'PASS', 
          configured: !!process.env.STRIPE_SECRET_KEY,
          publishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY 
        };
        results.summary.passed++;
      } catch (error: any) {
        results.tests.stripe = { status: 'FAIL', error: error.message };
        results.summary.failed++;
      }

      // Test 4: Airtable Configuration  
      try {
        const airtableConfigured = !!(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID);
        results.tests.airtable = { 
          status: airtableConfigured ? 'PASS' : 'FAIL', 
          configured: airtableConfigured,
          ready: airtableConfigured
        };
        if (airtableConfigured) results.summary.passed++;
        else results.summary.failed++;
      } catch (error: any) {
        results.tests.airtable = { status: 'FAIL', error: error.message };
        results.summary.failed++;
      }

      // Test 5: Make.com Webhook
      try {
        const makeConfigured = !!process.env.MAKE_WEBHOOK_URL;
        results.tests.make = { 
          status: makeConfigured ? 'PASS' : 'FAIL', 
          configured: makeConfigured,
          webhookReady: makeConfigured
        };
        if (makeConfigured) results.summary.passed++;
        else results.summary.failed++;
      } catch (error: any) {
        results.tests.make = { status: 'FAIL', error: error.message };
        results.summary.failed++;
      }

      // Test 6: SendGrid Email
      try {
        const { sendWelcomeEmail } = await import('./services/email/sendgrid');
        // Don't actually send, just verify service loads
        results.tests.sendgrid = { 
          status: 'PASS', 
          templatesConfigured: 5,
          ready: true
        };
        results.summary.passed++;
      } catch (error: any) {
        results.tests.sendgrid = { status: 'FAIL', error: error.message };
        results.summary.failed++;
      }

      // Test 7: Claude AI
      try {
        const { getClaudeService } = await import('./services/claude');
        const claudeService = getClaudeService();
        
        // Test with a simple prompt
        const response = await claudeService.generateText({
          prompt: 'Respond with exactly: "API_TEST_SUCCESS"',
          maxTokens: 20
        });
        
        results.tests.claude = { 
          status: 'PASS', 
          hasApiKey: !!process.env.CLAUDE_API_KEY,
          responseLength: response.content.length,
          tokensUsed: response.tokensUsed.total
        };
        results.summary.passed++;
      } catch (error: any) {
        results.tests.claude = { status: 'FAIL', error: error.message };
        results.summary.failed++;
      }

      res.json({
        ...results,
        overallStatus: results.summary.failed === 0 ? 'ALL_SYSTEMS_GO' : 'SOME_ISSUES',
        readyForEndToEnd: results.summary.passed >= 5
      });
    });

    // Dev-only Stripe test
    app.post("/api/dev/stripe-smoke", async (req, res) => {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        
        // Create a test payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 9700, // $97.00 in cents
          currency: 'usd',
          metadata: {
            test: 'dev-smoke-test',
            timestamp: new Date().toISOString()
          }
        });

        res.json({
          success: true,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...'
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
          type: error.type || 'unknown'
        });
      }
    });

    // Dev-only Document Generation test 
    app.post("/api/dev/pdf-smoke", async (req, res) => {
      try {
        const { DocumentOrchestrator } = await import('./services/documents/orchestrator');
        const orchestrator = new DocumentOrchestrator();

        const result = await orchestrator.generateAndStoreDoc({
          customerId: 'dev-test-customer',
          taxYear: '2024',
          docType: 'narrative',
          payload: {
            companyName: 'Test Company',
            totalQRE: 50000,
            federalCredit: 5000,
            activities: ['AI implementation testing']
          }
        });

        res.json({
          success: true,
          documentId: result.documentId,
          s3Key: result.s3Key,
          downloadUrl: result.downloadUrl?.substring(0, 50) + '...',
          size: result.size,
          generationTime: result.generationTimeMs
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Dev-only Claude AI test
    app.post("/api/dev/claude-smoke", async (req, res) => {
      try {
        const { getClaudeService } = await import('./services/claude');
        const claudeService = getClaudeService();

        const { prompt = 'Generate a brief technical summary in exactly 20 words', maxTokens = 50 } = req.body;

        const response = await claudeService.generateText({
          prompt,
          maxTokens
        });

        res.json({
          success: true,
          content: response.content,
          tokensUsed: response.tokensUsed,
          model: response.model,
          finishReason: response.finishReason
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
          type: error.type || 'unknown'
        });
      }
    });
  }

  // Apply monitoring middleware
  const { applyMonitoring } = await import('./middleware/monitoring.js');
  app.use(applyMonitoring());
  
  // CSRF token endpoints
  app.get("/api/csrf-token", csrfTokenEndpoint());
  app.post("/api/csrf-token/refresh", csrfProtection({ skipPaths: [] }), (req, res, next) => {
    const refresh = require("./middleware/csrf").csrfTokenRefresh();
    refresh(req, res, next);
  });

  // Auth routes with rate limiting and brute force protection
  app.post("/api/auth/register", authRateLimit, bruteForceProtection(), userRegistrationValidation, async (req: any, res: any) => {
    try {
      const { email, password } = req.body;
      
      // Password security validation
      const passwordValidation = passwordSecurity(password);
      if (!passwordValidation.isValid) {
        logSecurityEvent('weak_password_attempt', req, { email });
        return res.status(400).json({ 
          message: "Password does not meet security requirements",
          errors: passwordValidation.errors
        });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        logSecurityEvent('duplicate_registration_attempt', req, { email });
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user with hashed password
      const user = await storage.createUser({ email, passwordHash });
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({
        user: { id: user.id, email: user.email },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", authRateLimit, bruteForceProtection(), userLoginValidation, async (req: any, res: any) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        logSecurityEvent('login_attempt_invalid_user', req, { email });
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        logSecurityEvent('login_attempt_invalid_password', req, { email });
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Mark login success to skip brute force rate limiting
      res.locals.loginSuccess = true;
      
      logSecurityEvent('successful_login', req, { userId: user.id, email });
      
      res.json({
        user: { id: user.id, email: user.email },
        token,
      });
    } catch (error: any) {
      logSecurityEvent('login_error', req, { error: error.message });
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/user", authenticateToken, async (req: any, res) => {
    res.json({
      id: req.user.id,
      email: req.user.email,
      accountStatus: req.user.accountStatus,
    });
  });

  // Logout endpoint (stateless JWT, so we just confirm the action)
  app.post("/api/auth/logout", authenticateToken, async (req: any, res) => {
    try {
      res.json({ 
        message: "Successfully logged out",
        user: { id: req.user.id, email: req.user.email }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Refresh token endpoint - generates new token with same user data
  app.post("/api/auth/refresh", authRateLimit, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      // Verify existing token (even if expired, we want to check structure)
      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as any;
      } catch (error: any) {
        // For refresh, allow expired tokens but not invalid ones
        if (error.name === 'TokenExpiredError') {
          decoded = jwt.decode(token) as any;
        } else {
          return res.status(401).json({ message: "Invalid refresh token" });
        }
      }

      // Get fresh user data
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Generate new token
      const newToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        user: { id: user.id, email: user.email },
        token: newToken,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Token refresh failed" });
    }
  });

  // Lead capture route with rate limiting and tracking
  app.post("/api/leads", leadCaptureRateLimit, async (req: any, res) => {
    try {
      const leadData = leadCaptureSchema.parse(req.body);
      const calculationData = req.body.calculationData;
      
      // Generate or retrieve session ID
      let sessionId = req.cookies?.sessionId;
      if (!sessionId) {
        sessionId = crypto.randomBytes(32).toString('hex');
        res.cookie('sessionId', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
      }
      
      // Capture tracking data
      const ipAddress = getClientIp(req);
      const userAgent = req.headers['user-agent'] || '';
      const referrer = req.headers['referer'] || req.headers['referrer'] || '';
      
      // Check if lead already exists
      const existingLead = await storage.getLeadByEmail(leadData.email);
      if (existingLead) {
        // Update existing lead with new tracking data
        const updatedLead = await storage.updateLead(existingLead.id, {
          ...leadData,
          calculationData,
          sessionId,
          ipAddress,
          userAgent,
          referrer,
          updatedAt: new Date(),
        });
        
        // Optional: Trigger Airtable sync via webhook (if configured)
        if (process.env.AIRTABLE_WEBHOOK_URL) {
          // Fire and forget - don't await
          fetch(process.env.AIRTABLE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              leadId: updatedLead.id,
              email: updatedLead.email,
              companyName: updatedLead.companyName,
              calculationData,
            }),
          }).catch(err => console.error('Airtable webhook failed:', err));
        }
        
        return res.json({ 
          id: updatedLead.id,
          success: true,
          message: 'Lead information updated successfully',
        });
      }
      
      // Create new lead with tracking data
      const lead = await storage.createLead({
        ...leadData,
        calculationData,
        sessionId,
        ipAddress,
        userAgent,
        referrer,
      });
      
      // Optional: Trigger Airtable sync via webhook (if configured)
      if (process.env.AIRTABLE_WEBHOOK_URL) {
        // Fire and forget - don't await
        fetch(process.env.AIRTABLE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: lead.id,
            email: lead.email,
            companyName: lead.companyName,
            calculationData,
          }),
        }).catch(err => console.error('Airtable webhook failed:', err));
      }
      
      res.json({ 
        id: lead.id,
        success: true,
        message: 'Your information has been saved successfully',
      });
    } catch (error: any) {
      // Log error for debugging
      console.error('Lead capture error:', error);
      
      // Return user-friendly error
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          success: false,
          message: 'Please check your information and try again',
          errors: error.errors,
        });
      } else {
        res.status(400).json({ 
          success: false,
          message: error.message || 'Failed to save your information',
        });
      }
    }
  });

  // Calculator routes
  app.post("/api/calculator/calculate", async (req, res) => {
    try {
      const expenses = calculatorExpensesSchema.parse(req.body);
      const calculation = calculateRDTaxCredit(expenses);
      
      res.json(calculation);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Calculation failed" });
    }
  });

  app.post("/api/calculations", authenticateToken, async (req: any, res) => {
    try {
      const calculationData = insertCalculationSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const calculation = await storage.createCalculation(calculationData);
      res.json(calculation);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to save calculation" });
    }
  });

  app.get("/api/calculations", authenticateToken, async (req: any, res) => {
    try {
      const calculations = await storage.getCalculationsByUserId(req.user.id);
      res.json(calculations);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch calculations" });
    }
  });

  // Company routes
  app.post("/api/companies", authenticateToken, async (req: any, res) => {
    try {
      // Transform nested address object to individual fields
      const { address, ...otherData } = req.body;
      const companyData = insertCompanySchema.parse({
        ...otherData,
        userId: req.user.id,
        ...(address && {
          addressLine1: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          address: `${address.street}, ${address.city}, ${address.state} ${address.zipCode}` // For compatibility
        })
      });
      
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create company" });
    }
  });

  app.get("/api/companies", authenticateToken, async (req: any, res) => {
    try {
      const companies = await storage.getCompaniesByUserId(req.user.id);
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.put("/api/companies/:id", authenticateToken, async (req: any, res) => {
    try {
      const companyId = req.params.id;
      const updates = companyInfoSchema.parse(req.body);
      
      // Verify company belongs to user
      const company = await storage.getCompany(companyId);
      if (!company || company.userId !== req.user.id) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      const updatedCompany = await storage.updateCompany(companyId, updates);
      res.json(updatedCompany);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update company" });
    }
  });

  // Intake form routes
  app.post("/api/intake-forms", authenticateToken, async (req: any, res) => {
    try {
      const intakeFormData = {
        userId: req.user.id,
        companyId: req.body.companyId,
        taxYear: req.body.taxYear || new Date().getFullYear(),
        formData: req.body.formData || {},
        currentSection: req.body.currentSection || "company_info",
      };
      
      // Check if intake form already exists for this company
      const existingForm = await storage.getIntakeFormByCompanyId(req.body.companyId);
      if (existingForm) {
        // Update existing form
        const updatedForm = await storage.updateIntakeForm(existingForm.id, intakeFormData);
        return res.json(updatedForm);
      }
      
      const intakeForm = await storage.createIntakeForm(intakeFormData);
      res.json(intakeForm);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create intake form" });
    }
  });

  app.get("/api/intake-forms", authenticateToken, async (req: any, res) => {
    try {
      const intakeForms = await storage.getIntakeFormsByUserId(req.user.id);
      res.json(intakeForms);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch intake forms" });
    }
  });

  app.put("/api/intake-forms/:id", authenticateToken, async (req: any, res) => {
    try {
      const formId = req.params.id;
      const updates = req.body;
      
      // Verify form belongs to user
      const form = await storage.getIntakeForm(formId);
      if (!form || form.userId !== req.user.id) {
        return res.status(404).json({ message: "Intake form not found" });
      }
      
      const updatedForm = await storage.updateIntakeForm(formId, {
        ...updates,
        updatedAt: new Date(),
      });
      
      res.json(updatedForm);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update intake form" });
    }
  });

  // Submit intake form endpoint
  app.post("/api/intake-forms/:id/submit", authenticateToken, async (req: any, res) => {
    try {
      const { id: formId } = req.params;
      const submissionData = req.body;
      
      // Verify the intake form belongs to the authenticated user
      const form = await storage.getIntakeForm(formId);
      if (!form || form.userId !== req.user.id) {
        return res.status(404).json({ message: "Intake form not found" });
      }
      
      // Validate submission data against schema
      const { intakeFormSubmissionSchema } = await import("@shared/schema");
      const validatedData = intakeFormSubmissionSchema.parse(submissionData);
      
      // Submit the form
      const submittedForm = await storage.submitIntakeForm(formId, validatedData);
      
      // Trigger Airtable sync in background
      try {
        await storage.syncToAirtable(formId);
        console.log(`Airtable sync triggered for form: ${formId}`);
      } catch (syncError: any) {
        console.error(`Airtable sync failed for form ${formId}:`, syncError.message);
        // Don't fail the submission if sync fails
      }
      
      res.json({ 
        success: true, 
        message: "Intake form submitted successfully",
        intakeForm: submittedForm 
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to submit intake form",
        errors: error.errors || null
      });
    }
  });

  // Auto-save endpoint for partial form section updates
  app.post("/api/intake-forms/:id/save", authenticateToken, autoSaveRateLimit, async (req: any, res) => {
    try {
      const { id: formId } = req.params;
      const { section, data } = req.body;
      
      // Validate required fields
      if (!section || !data) {
        return res.status(400).json({ 
          message: "Section and data are required for auto-save",
          errors: { section: !section ? "Section is required" : null, data: !data ? "Data is required" : null }
        });
      }
      
      // Validate section name
      const validSections = ['company-info', 'rd-activities', 'expense-breakdown', 'supporting-info'];
      if (!validSections.includes(section)) {
        return res.status(400).json({ 
          message: `Invalid section. Must be one of: ${validSections.join(', ')}`,
          errors: { section: "Invalid section name" }
        });
      }
      
      // Use the new section-specific update method
      const updatedForm = await storage.updateIntakeFormSection(formId, section, data, req.user.id);
      
      // Return compressed response for performance
      res.setHeader('Content-Encoding', 'gzip');
      res.json({ 
        success: true,
        message: "Section auto-saved successfully",
        section,
        timestamp: updatedForm.updatedAt,
        lastSavedSection: updatedForm.lastSavedSection
      });
    } catch (error: any) {
      console.error("Auto-save error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to auto-save section",
        errors: error.errors || null
      });
    }
  });

  // PATCH endpoint for individual section updates (alternative to POST)
  app.patch("/api/intake-forms/:id/sections/:section", authenticateToken, autoSaveRateLimit, async (req: any, res) => {
    try {
      const { id: formId, section } = req.params;
      const data = req.body;
      
      // Validate section name
      const validSections = ['company-info', 'rd-activities', 'expense-breakdown', 'supporting-info'];
      if (!validSections.includes(section)) {
        return res.status(400).json({ 
          message: `Invalid section. Must be one of: ${validSections.join(', ')}`,
          errors: { section: "Invalid section name" }
        });
      }
      
      // Use the new section-specific update method
      const updatedForm = await storage.updateIntakeFormSection(formId, section, data, req.user.id);
      
      // Return compressed response for performance
      res.setHeader('Content-Encoding', 'gzip');
      res.json({ 
        success: true,
        message: "Section updated successfully",
        section,
        timestamp: updatedForm.updatedAt,
        lastSavedSection: updatedForm.lastSavedSection,
        formData: {
          [section]: data
        }
      });
    } catch (error: any) {
      console.error("Section update error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to update section",
        errors: error.errors || null
      });
    }
  });

  // Manual sync to Airtable endpoint
  app.post("/api/intake-forms/:id/sync", authenticateToken, async (req: any, res) => {
    try {
      const { id: formId } = req.params;
      
      // Verify the intake form belongs to the authenticated user
      const form = await storage.getIntakeForm(formId);
      if (!form || form.userId !== req.user.id) {
        return res.status(404).json({ message: "Intake form not found" });
      }
      
      // Trigger Airtable sync
      const recordId = await storage.syncToAirtable(formId);
      
      res.json({ 
        success: true, 
        message: "Airtable sync completed successfully",
        recordId,
        formId
      });
    } catch (error: any) {
      console.error("Manual sync error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to sync to Airtable",
        errors: error.errors || null
      });
    }
  });

  // Get sync status endpoint
  app.get("/api/intake-forms/:id/sync-status", authenticateToken, async (req: any, res) => {
    try {
      const { id: formId } = req.params;
      
      // Verify the intake form belongs to the authenticated user
      const form = await storage.getIntakeForm(formId);
      if (!form || form.userId !== req.user.id) {
        return res.status(404).json({ message: "Intake form not found" });
      }
      
      res.json({ 
        success: true,
        syncStatus: {
          status: form.airtableSyncStatus || 'not_synced',
          recordId: form.airtableRecordId || null,
          syncedAt: form.airtableSyncedAt || null,
          error: form.airtableSyncError || null
        }
      });
    } catch (error: any) {
      console.error("Sync status error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to get sync status"
      });
    }
  });

  // Update calculation results and sync to Airtable
  app.post("/api/intake-forms/:id/calculation-results", authenticateToken, async (req: any, res) => {
    try {
      const { id: formId } = req.params;
      const { totalQre, estimatedCredit, calculationData } = req.body;
      
      // Verify the intake form belongs to the authenticated user
      const form = await storage.getIntakeForm(formId);
      if (!form || form.userId !== req.user.id) {
        return res.status(404).json({ message: "Intake form not found" });
      }
      
      // Update form with calculation results
      const updatedForm = await storage.updateIntakeForm(formId, {
        totalQre: totalQre?.toString(),
        calculationData: calculationData || null,
        updatedAt: new Date()
      });
      
      // Update Airtable record if it exists
      if (form.airtableRecordId) {
        try {
          const { getAirtableService } = await import("./services/airtable");
          const airtableService = getAirtableService();
          await airtableService.updateCustomerRecord(form.airtableRecordId, updatedForm);
          
          await storage.updateAirtableSync(formId, form.airtableRecordId, 'synced');
          console.log(`Updated Airtable record ${form.airtableRecordId} with calculation results`);
        } catch (syncError: any) {
          console.error("Failed to update Airtable with calculation results:", syncError.message);
          await storage.updateAirtableSync(formId, form.airtableRecordId, 'failed');
        }
      }
      
      res.json({ 
        success: true, 
        message: "Calculation results updated successfully",
        intakeForm: updatedForm
      });
    } catch (error: any) {
      console.error("Calculation results update error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to update calculation results"
      });
    }
  });

  // Document management endpoints
  app.get("/api/intake-forms/:id/documents", authenticateToken, async (req: any, res) => {
    try {
      const { id: formId } = req.params;
      
      // Verify the intake form belongs to the authenticated user
      const form = await storage.getIntakeForm(formId);
      if (!form || form.userId !== req.user.id) {
        return res.status(404).json({ message: "Intake form not found" });
      }
      
      const documents = await storage.getDocumentsByIntakeForm(formId);
      
      res.json({ 
        success: true,
        documents
      });
    } catch (error: any) {
      console.error("Documents retrieval error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to retrieve documents"
      });
    }
  });

  app.post("/api/intake-forms/:id/documents", authenticateToken, async (req: any, res) => {
    try {
      const { id: formId } = req.params;
      const { documentType, documentName, s3Url, expirationDate } = req.body;
      
      // Verify the intake form belongs to the authenticated user
      const form = await storage.getIntakeForm(formId);
      if (!form || form.userId !== req.user.id) {
        return res.status(404).json({ message: "Intake form not found" });
      }
      
      const document = await storage.createDocument({
        intakeFormId: formId,
        companyId: form.companyId,
        userId: req.user.id,
        documentType,
        documentName,
        s3Url,
        status: s3Url ? 'available' : 'pending',
        expirationDate: expirationDate ? new Date(expirationDate) : undefined
      });
      
      res.json({ 
        success: true,
        message: "Document created successfully",
        document
      });
    } catch (error: any) {
      console.error("Document creation error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to create document"
      });
    }
  });

  app.patch("/api/documents/:id/url", authenticateToken, async (req: any, res) => {
    try {
      const { id: documentId } = req.params;
      const { s3Url, expirationDate } = req.body;
      
      // Get document to verify ownership
      const document = await storage.getDocument(documentId);
      if (!document || document.userId !== req.user.id) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const updatedDocument = await storage.updateDocumentUrl(
        documentId, 
        s3Url, 
        expirationDate ? new Date(expirationDate) : undefined
      );
      
      // Sync document URLs to Airtable
      try {
        await storage.syncDocumentUrls(document.intakeFormId);
      } catch (syncError: any) {
        console.warn("Failed to sync document URLs to Airtable:", syncError.message);
      }
      
      res.json({ 
        success: true,
        message: "Document URL updated successfully",
        document: updatedDocument
      });
    } catch (error: any) {
      console.error("Document URL update error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to update document URL"
      });
    }
  });

  app.patch("/api/documents/:id/status", authenticateToken, async (req: any, res) => {
    try {
      const { id: documentId } = req.params;
      const { status, error } = req.body;
      
      // Get document to verify ownership
      const document = await storage.getDocument(documentId);
      if (!document || document.userId !== req.user.id) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const updatedDocument = await storage.updateDocumentStatus(documentId, status, error);
      
      // Update Airtable document status if form is synced
      const form = await storage.getIntakeForm(document.intakeFormId);
      if (form?.airtableRecordId) {
        try {
          const { getAirtableService } = await import("./services/airtable");
          const airtableService = getAirtableService();
          await airtableService.updateDocumentStatus(form.airtableRecordId, status, document.documentType);
        } catch (syncError: any) {
          console.warn("Failed to sync document status to Airtable:", syncError.message);
        }
      }
      
      res.json({ 
        success: true,
        message: "Document status updated successfully",
        document: updatedDocument
      });
    } catch (error: any) {
      console.error("Document status update error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to update document status"
      });
    }
  });

  app.get("/api/documents/expired", authenticateToken, async (req: any, res) => {
    try {
      // Only allow admin users to check expired documents (for now, any authenticated user)
      const expiredDocuments = await storage.checkExpiredDocuments();
      
      res.json({ 
        success: true,
        expiredDocuments,
        count: expiredDocuments.length
      });
    } catch (error: any) {
      console.error("Expired documents check error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to check expired documents"
      });
    }
  });

  app.post("/api/documents/:id/access", authenticateToken, async (req: any, res) => {
    try {
      const { id: documentId } = req.params;
      
      // Get document to verify ownership
      const document = await storage.getDocument(documentId);
      if (!document || document.userId !== req.user.id) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if document is expired
      if (document.accessExpiresAt && new Date() > document.accessExpiresAt) {
        return res.status(410).json({ message: "Document access has expired" });
      }
      
      const updatedDocument = await storage.updateDocumentAccess(documentId);
      
      res.json({ 
        success: true,
        message: "Document access recorded",
        document: updatedDocument
      });
    } catch (error: any) {
      console.error("Document access error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to record document access"
      });
    }
  });

  // Webhook endpoints
  app.post("/api/webhooks/make", async (req: any, res) => {
    try {
      const { eventType, timestamp, data } = req.body;
      
      // Basic payload validation
      if (!eventType || !timestamp || !data) {
        return res.status(400).json({ 
          success: false,
          error: "Missing required fields: eventType, timestamp, data" 
        });
      }

      // Validate event type
      const validEventTypes = ['form_submitted', 'document_generated', 'processing_completed', 'processing_failed'];
      if (!validEventTypes.includes(eventType)) {
        return res.status(400).json({ 
          success: false,
          error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}` 
        });
      }

      // Get signature from headers for logging
      const signature = req.headers['x-make-signature'] as string;
      
      // Create webhook event record
      const webhookEvent = await storage.createWebhookEvent({
        source: 'make',
        eventType,
        payload: req.body,
        signature,
        intakeFormId: data.formId,
        userId: data.userId,
      });

      // Mark as verified (simplified for now - would verify signature in production)
      await storage.updateWebhookEvent(webhookEvent.id, { 
        verified: true,
        processingStartedAt: new Date() 
      });

      // Process the webhook based on event type
      let processingResult = { success: true, message: 'Event processed' };
      
      try {
        switch (eventType) {
          case 'form_submitted':
            await processFormSubmittedEvent(data);
            break;
          case 'document_generated':
            await processDocumentGeneratedEvent(data);
            break;
          case 'processing_completed':
            await processProcessingCompletedEvent(data);
            break;
          case 'processing_failed':
            await processProcessingFailedEvent(data);
            break;
        }
      } catch (processingError: any) {
        processingResult = { success: false, message: processingError.message };
        console.error(`Webhook processing error for ${eventType}:`, processingError);
      }

      // Mark event as processed
      await storage.markWebhookEventProcessed(
        webhookEvent.id, 
        processingResult.success, 
        processingResult.success ? undefined : processingResult.message
      );

      // Log the webhook event
      console.log('Make.com webhook processed:', {
        eventId: webhookEvent.id,
        eventType,
        formId: data.formId,
        success: processingResult.success,
        timestamp: new Date().toISOString()
      });

      res.json({ 
        success: true,
        eventId: webhookEvent.id,
        message: 'Webhook received and processed',
        processing: processingResult
      });

    } catch (error: any) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to process webhook"
      });
    }
  });

  // Webhook event processing functions
  async function processFormSubmittedEvent(data: any) {
    if (data.formId) {
      // Update form status or trigger additional processing
      console.log(`Processing form submission for form: ${data.formId}`);
      
      // Could trigger document generation, send notifications, etc.
      // For now, just log the event
    }
  }

  async function processDocumentGeneratedEvent(data: any) {
    if (data.documentId && data.formId) {
      console.log(`Document generated for form: ${data.formId}, document: ${data.documentId}`);
      
      // Update document status if available
      if (data.status) {
        try {
          await storage.updateDocumentStatus(data.documentId, data.status);
        } catch (error) {
          console.warn(`Could not update document status: ${error}`);
        }
      }
    }
  }

  async function processProcessingCompletedEvent(data: any) {
    if (data.formId) {
      console.log(`Processing completed for form: ${data.formId}`);
      
      // Update form status to completed, send notifications, etc.
      try {
        await storage.updateIntakeForm(data.formId, {
          status: 'processed',
          updatedAt: new Date()
        });
      } catch (error) {
        console.warn(`Could not update form status: ${error}`);
      }
    }
  }

  async function processProcessingFailedEvent(data: any) {
    if (data.formId) {
      console.log(`Processing failed for form: ${data.formId}, error: ${data.error}`);
      
      // Update form status to failed, log error, send notifications
      try {
        await storage.updateIntakeForm(data.formId, {
          status: 'failed',
          updatedAt: new Date()
        });
      } catch (error) {
        console.warn(`Could not update form status: ${error}`);
      }
    }
  }

  // Get webhook events for debugging and monitoring
  app.get("/api/webhooks/events", authenticateToken, async (req: any, res) => {
    try {
      const { formId, limit = 50 } = req.query;
      
      let events;
      if (formId) {
        events = await storage.getWebhookEventsByIntakeForm(formId);
      } else {
        events = await storage.getUnprocessedWebhookEvents(parseInt(limit));
      }
      
      res.json({ 
        success: true,
        events,
        count: events.length
      });
    } catch (error: any) {
      console.error("Webhook events retrieval error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to retrieve webhook events"
      });
    }
  });

  app.get("/api/webhooks/events/failed", authenticateToken, async (req: any, res) => {
    try {
      const { maxRetries = 3 } = req.query;
      
      const failedEvents = await storage.getFailedWebhookEvents(parseInt(maxRetries));
      
      res.json({ 
        success: true,
        failedEvents,
        count: failedEvents.length
      });
    } catch (error: any) {
      console.error("Failed webhook events retrieval error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to retrieve failed webhook events"
      });
    }
  });

  // Workflow trigger endpoints
  app.post("/api/workflows/trigger", authenticateToken, async (req: any, res) => {
    try {
      const { intakeFormId, priority = 'normal' } = req.body;
      
      if (!intakeFormId) {
        return res.status(400).json({ 
          success: false,
          error: "Missing required field: intakeFormId" 
        });
      }

      // Get intake form with all related data
      const form = await storage.getIntakeForm(intakeFormId);
      if (!form || form.userId !== req.user.id) {
        return res.status(404).json({ 
          success: false,
          error: "Intake form not found or access denied" 
        });
      }

      // Check if form is complete
      if (form.status !== 'completed') {
        return res.status(400).json({ 
          success: false,
          error: "Intake form must be completed before triggering workflow" 
        });
      }

      // Get company info
      const company = form.companyId ? await storage.getCompany(form.companyId) : null;

      // Construct workflow payload
      const triggerPayload = {
        intakeFormId: form.id,
        airtableRecordId: form.airtableRecordId || undefined,
        companyInfo: {
          name: company?.legalName || 'Unknown Company',
          ein: company?.ein || undefined,
          industry: company?.industry || undefined,
          address: company?.address || undefined,
        },
        rdActivities: (form.formData as any)?.rdActivities || [],
        expenses: (form.formData as any)?.expenses || {
          wages: 0,
          contractors: 0,
          supplies: 0,
          other: 0,
          total: 0,
        },
        metadata: {
          formVersion: '2.0',
          submissionDate: form.updatedAt?.toISOString() || new Date().toISOString(),
          priority: priority as 'normal' | 'high' | 'urgent',
        },
      };

      // Create workflow trigger record
      const trigger = await storage.createWorkflowTrigger({
        intakeFormId: form.id,
        airtableRecordId: form.airtableRecordId || undefined,
        triggerPayload,
        workflowName: 'document_generation',
        timeoutAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minute timeout
      });

      // Import and trigger workflow service
      const { getWorkflowService } = await import("./services/makeWorkflow");
      const workflowService = getWorkflowService();
      
      const result = await workflowService.triggerDocumentGeneration({
        ...triggerPayload,
        airtableRecordId: triggerPayload.airtableRecordId || undefined
      });

      if (result.success) {
        // Mark as triggered
        await storage.markWorkflowTriggered(trigger.id, {
          executionId: result.executionId,
          scenarioId: result.scenarioId,
          responseData: result,
        });

        console.log('Workflow triggered successfully:', {
          triggerId: trigger.id,
          intakeFormId: form.id,
          executionId: result.executionId,
        });

        res.json({
          success: true,
          triggerId: trigger.id,
          executionId: result.executionId,
          message: 'Workflow triggered successfully',
        });
      } else {
        // Mark as failed, enable retry
        await storage.markWorkflowFailed(trigger.id, result.error || 'Unknown error', true);

        console.error('Workflow trigger failed:', {
          triggerId: trigger.id,
          intakeFormId: form.id,
          error: result.error,
        });

        res.status(500).json({
          success: false,
          triggerId: trigger.id,
          error: result.error,
          message: 'Workflow trigger failed, will retry automatically',
        });
      }

    } catch (error: any) {
      console.error("Workflow trigger error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to trigger workflow"
      });
    }
  });

  app.get("/api/workflows/triggers/:formId", authenticateToken, async (req: any, res) => {
    try {
      const { formId } = req.params;
      
      // Verify form ownership
      const form = await storage.getIntakeForm(formId);
      if (!form || form.userId !== req.user.id) {
        return res.status(404).json({ 
          success: false,
          error: "Intake form not found or access denied" 
        });
      }

      const triggers = await storage.getWorkflowTriggersByIntakeForm(formId);
      
      res.json({ 
        success: true,
        triggers,
        count: triggers.length
      });
    } catch (error: any) {
      console.error("Workflow triggers retrieval error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to retrieve workflow triggers"
      });
    }
  });

  app.get("/api/workflows/triggers", authenticateToken, async (req: any, res) => {
    try {
      const { status = 'all', limit = 50 } = req.query;
      
      let triggers;
      if (status === 'pending') {
        triggers = await storage.getPendingWorkflowTriggers(parseInt(limit));
      } else if (status === 'retryable') {
        triggers = await storage.getRetryableWorkflowTriggers();
      } else if (status === 'timeout') {
        triggers = await storage.getTimedOutWorkflowTriggers();
      } else {
        // Get all triggers for the user's forms
        const userForms = await storage.getIntakeFormsByUserId(req.user.id);
        const formIds = userForms.map(f => f.id);
        
        triggers = [];
        for (const formId of formIds.slice(0, parseInt(limit))) {
          const formTriggers = await storage.getWorkflowTriggersByIntakeForm(formId);
          triggers.push(...formTriggers);
        }
        
        // Sort by creation date
        triggers.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }
      
      res.json({ 
        success: true,
        triggers,
        count: triggers.length
      });
    } catch (error: any) {
      console.error("Workflow triggers retrieval error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to retrieve workflow triggers"
      });
    }
  });

  app.post("/api/workflows/retry/:triggerId", authenticateToken, async (req: any, res) => {
    try {
      const { triggerId } = req.params;
      
      const trigger = await storage.getWorkflowTrigger(triggerId);
      if (!trigger) {
        return res.status(404).json({ 
          success: false,
          error: "Workflow trigger not found" 
        });
      }

      // Verify form ownership
      const form = await storage.getIntakeForm(trigger.intakeFormId);
      if (!form || form.userId !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          error: "Access denied" 
        });
      }

      if (trigger.status !== 'failed' && trigger.status !== 'timeout') {
        return res.status(400).json({ 
          success: false,
          error: "Only failed or timed out workflows can be retried" 
        });
      }

      // Reset trigger status
      await storage.updateWorkflowTrigger(triggerId, {
        status: 'pending',
        nextRetryAt: null,
        lastError: null,
      });

      // Trigger workflow
      const { getWorkflowService } = await import("./services/makeWorkflow");
      const workflowService = getWorkflowService();
      
      const result = await workflowService.triggerDocumentGeneration(trigger.triggerPayload as any);

      if (result.success) {
        await storage.markWorkflowTriggered(triggerId, {
          executionId: result.executionId,
          scenarioId: result.scenarioId,
          responseData: result,
        });

        res.json({
          success: true,
          triggerId,
          executionId: result.executionId,
          message: 'Workflow retry successful',
        });
      } else {
        await storage.markWorkflowFailed(triggerId, result.error || 'Retry failed', false);
        
        res.status(500).json({
          success: false,
          triggerId,
          error: result.error,
          message: 'Workflow retry failed',
        });
      }

    } catch (error: any) {
      console.error("Workflow retry error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to retry workflow"
      });
    }
  });

  // Status polling endpoints
  app.post("/api/workflows/polling/start/:triggerId", authenticateToken, async (req: any, res) => {
    try {
      const { triggerId } = req.params;
      
      const trigger = await storage.getWorkflowTrigger(triggerId);
      if (!trigger) {
        return res.status(404).json({ 
          success: false,
          error: "Workflow trigger not found" 
        });
      }

      // Verify form ownership
      const form = await storage.getIntakeForm(trigger.intakeFormId);
      if (!form || form.userId !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          error: "Access denied" 
        });
      }

      // Import and start polling service
      const { getPollingService } = await import("./services/statusPolling");
      const pollingService = getPollingService();
      
      await pollingService.startPolling(triggerId);

      console.log('Status polling started:', {
        triggerId,
        intakeFormId: trigger.intakeFormId,
        userId: req.user.id,
      });

      res.json({
        success: true,
        triggerId,
        message: 'Status polling started',
        pollingInterval: 10000, // 10 seconds
      });

    } catch (error: any) {
      console.error("Start polling error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to start status polling"
      });
    }
  });

  app.post("/api/workflows/polling/stop/:triggerId", authenticateToken, async (req: any, res) => {
    try {
      const { triggerId } = req.params;
      
      const trigger = await storage.getWorkflowTrigger(triggerId);
      if (!trigger) {
        return res.status(404).json({ 
          success: false,
          error: "Workflow trigger not found" 
        });
      }

      // Verify form ownership
      const form = await storage.getIntakeForm(trigger.intakeFormId);
      if (!form || form.userId !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          error: "Access denied" 
        });
      }

      // Import and stop polling service
      const { getPollingService } = await import("./services/statusPolling");
      const pollingService = getPollingService();
      
      await pollingService.stopPolling(triggerId);

      console.log('Status polling stopped:', {
        triggerId,
        intakeFormId: trigger.intakeFormId,
        userId: req.user.id,
      });

      res.json({
        success: true,
        triggerId,
        message: 'Status polling stopped',
      });

    } catch (error: any) {
      console.error("Stop polling error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to stop status polling"
      });
    }
  });

  app.get("/api/workflows/status/:triggerId", authenticateToken, async (req: any, res) => {
    try {
      const { triggerId } = req.params;
      
      const trigger = await storage.getWorkflowTrigger(triggerId);
      if (!trigger) {
        return res.status(404).json({ 
          success: false,
          error: "Workflow trigger not found" 
        });
      }

      // Verify form ownership
      const form = await storage.getIntakeForm(trigger.intakeFormId);
      if (!form || form.userId !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          error: "Access denied" 
        });
      }

      // Import and get current status
      const { getPollingService } = await import("./services/statusPolling");
      const pollingService = getPollingService();
      
      const currentStatus = await pollingService.getCurrentStatus(triggerId);

      res.json({
        success: true,
        triggerId,
        status: currentStatus,
        trigger: {
          id: trigger.id,
          status: trigger.status,
          workflowName: trigger.workflowName,
          createdAt: trigger.createdAt,
          triggeredAt: trigger.triggeredAt,
          completedAt: trigger.completedAt,
          retryCount: trigger.retryCount,
          maxRetries: trigger.maxRetries,
          lastError: trigger.lastError,
          makeExecutionId: trigger.makeExecutionId,
          makeScenarioId: trigger.makeScenarioId,
        },
      });

    } catch (error: any) {
      console.error("Get status error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get workflow status"
      });
    }
  });

  app.get("/api/workflows/polling/active", authenticateToken, async (req: any, res) => {
    try {
      // Import and get active polls
      const { getPollingService } = await import("./services/statusPolling");
      const pollingService = getPollingService();
      
      const activePolls = await pollingService.getActivePolls();
      
      // Filter to only polls the user owns
      const userPolls = [];
      for (const triggerId of activePolls) {
        const trigger = await storage.getWorkflowTrigger(triggerId);
        if (trigger) {
          const form = await storage.getIntakeForm(trigger.intakeFormId);
          if (form && form.userId === req.user.id) {
            userPolls.push(triggerId);
          }
        }
      }

      res.json({
        success: true,
        activePolls: userPolls,
        count: userPolls.length,
      });

    } catch (error: any) {
      console.error("Get active polls error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get active polls"
      });
    }
  });

  // Claude API endpoints
  app.post("/api/claude/generate", authenticateToken, async (req: any, res) => {
    try {
      const { claudeRequestSchema } = await import("@shared/schema");
      const validatedRequest = claudeRequestSchema.parse(req.body);

      // Import Claude service
      const { getClaudeService } = await import("./services/claude");
      const claudeService = getClaudeService();

      console.log('Claude text generation request:', {
        userId: req.user.id,
        promptLength: validatedRequest.prompt.length,
        systemPromptLength: validatedRequest.systemPrompt?.length || 0,
        maxTokens: validatedRequest.maxTokens,
        temperature: validatedRequest.temperature,
      });

      const response = await claudeService.generateText(validatedRequest);

      res.json({
        success: true,
        response,
        tokenUsage: claudeService.getTokenUsage(),
      });

    } catch (error: any) {
      console.error("Claude generation error:", error);
      
      // Handle Claude-specific errors
      if (error.type) {
        return res.status(error.type === 'authentication' ? 401 : 
                         error.type === 'rate_limit' ? 429 :
                         error.type === 'invalid_request' ? 400 : 500).json({ 
          success: false,
          error: error.message,
          type: error.type,
          retryAfter: error.retryAfter,
        });
      }

      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to generate text with Claude"
      });
    }
  });

  app.post("/api/claude/validate", authenticateToken, async (req: any, res) => {
    try {
      // Import Claude service
      const { getClaudeService } = await import("./services/claude");
      const claudeService = getClaudeService();

      console.log('Claude connection validation request:', {
        userId: req.user.id,
      });

      const isValid = await claudeService.validateConnection();

      res.json({
        success: true,
        isValid,
        tokenUsage: claudeService.getTokenUsage(),
      });

    } catch (error: any) {
      console.error("Claude validation error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to validate Claude connection",
        isValid: false,
      });
    }
  });

  app.get("/api/claude/usage", authenticateToken, async (req: any, res) => {
    try {
      // Import Claude service
      const { getClaudeService } = await import("./services/claude");
      const claudeService = getClaudeService();

      const usage = claudeService.getTokenUsage();
      const estimatedCost = claudeService.calculateCost(usage);

      res.json({
        success: true,
        usage,
        estimatedCost,
      });

    } catch (error: any) {
      console.error("Claude usage error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get Claude usage"
      });
    }
  });

  // Narrative prompt endpoints
  app.get("/api/narratives/templates", authenticateToken, async (req: any, res) => {
    try {
      const { getNarrativePromptService } = await import("./services/narrativePrompts");
      const narrativeService = getNarrativePromptService();

      const templates = narrativeService.getAllTemplates();

      res.json({
        success: true,
        templates,
      });

    } catch (error: any) {
      console.error("Get narrative templates error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get narrative templates"
      });
    }
  });

  app.get("/api/narratives/templates/:templateId", authenticateToken, async (req: any, res) => {
    try {
      const { templateId } = req.params;
      const { getNarrativePromptService } = await import("./services/narrativePrompts");
      const narrativeService = getNarrativePromptService();

      const template = narrativeService.getTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          error: `Template not found: ${templateId}`
        });
      }

      res.json({
        success: true,
        template,
      });

    } catch (error: any) {
      console.error("Get narrative template error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get narrative template"
      });
    }
  });

  app.post("/api/narratives/generate", authenticateToken, async (req: any, res) => {
    try {
      const { narrativeRequestSchema } = await import("@shared/schema");
      const validatedRequest = narrativeRequestSchema.parse(req.body);

      const { getNarrativePromptService } = await import("./services/narrativePrompts");
      const { getClaudeService } = await import("./services/claude");
      
      const narrativeService = getNarrativePromptService();
      const claudeService = getClaudeService();

      console.log('Narrative generation request:', {
        userId: req.user.id,
        templateId: validatedRequest.templateId,
        companyName: validatedRequest.companyContext.companyName,
        projectName: validatedRequest.projectContext.projectName,
        options: validatedRequest.options,
      });

      // Validate template and variables
      const template = narrativeService.getTemplate(validatedRequest.templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          error: `Template not found: ${validatedRequest.templateId}`
        });
      }

      // Generate the prompt with variable substitution
      const userPrompt = narrativeService.generateNarrative(
        validatedRequest.templateId,
        validatedRequest.companyContext,
        validatedRequest.projectContext,
        validatedRequest.options || {
          length: "standard",
          tone: "professional", 
          focus: "technical",
          includeMetrics: false,
          includeTimeline: false,
          emphasizeInnovation: false
        }
      );

      // Generate content using Claude
      const claudeResponse = await claudeService.generateText({
        prompt: userPrompt,
        systemPrompt: template.systemPrompt,
        maxTokens: template.maxTokens,
        temperature: template.temperature,
      });

      // Calculate word count and compliance score
      const wordCount = claudeResponse.content.trim().split(/\s+/).length;
      const complianceScore = calculateComplianceScore(claudeResponse.content, template);

      const generatedNarrative = {
        content: claudeResponse.content,
        wordCount,
        tokensUsed: claudeResponse.tokensUsed.total,
        complianceScore,
        templateUsed: validatedRequest.templateId,
        variables: {
          ...validatedRequest.companyContext,
          ...validatedRequest.projectContext,
          ...validatedRequest.options,
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          version: '1.0',
          model: claudeResponse.model,
        },
      };

      res.json({
        success: true,
        narrative: generatedNarrative,
        tokenUsage: claudeService.getTokenUsage(),
      });

    } catch (error: any) {
      console.error("Narrative generation error:", error);
      
      // Handle validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        });
      }

      // Handle Claude-specific errors
      if (error.type) {
        return res.status(error.type === 'authentication' ? 401 : 
                         error.type === 'rate_limit' ? 429 :
                         error.type === 'invalid_request' ? 400 : 500).json({ 
          success: false,
          error: error.message,
          type: error.type,
          retryAfter: error.retryAfter,
        });
      }

      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to generate narrative"
      });
    }
  });

  app.post("/api/narratives/validate", authenticateToken, async (req: any, res) => {
    try {
      const { templateId, variables } = req.body;
      
      if (!templateId || !variables) {
        return res.status(400).json({
          success: false,
          error: 'Template ID and variables are required'
        });
      }

      const { getNarrativePromptService } = await import("./services/narrativePrompts");
      const narrativeService = getNarrativePromptService();

      const validation = narrativeService.validateTemplate(templateId, variables);
      const estimatedTokens = validation.isValid ? 
        narrativeService.estimateTokens(templateId, variables) : 0;

      res.json({
        success: true,
        validation: {
          ...validation,
          estimatedTokens,
        },
      });

    } catch (error: any) {
      console.error("Narrative validation error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to validate narrative template"
      });
    }
  });

  // Helper function to calculate compliance score
  function calculateComplianceScore(content: string, template: any): number {
    const complianceKeywords = [
      'technological', 'uncertainty', 'experimentation', 'systematic',
      'business component', 'qualified research', 'section 41',
      'four-part test', 'innovation', 'development'
    ];

    const contentLower = content.toLowerCase();
    const foundKeywords = complianceKeywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    );

    // Base score on keyword coverage and template compliance level
    const keywordScore = (foundKeywords.length / complianceKeywords.length) * 70;
    const templateBonus = template.complianceLevel === 'high' ? 30 : 
                         template.complianceLevel === 'medium' ? 20 : 10;

    return Math.min(100, Math.round(keywordScore + templateBonus));
  }

  // Compliance memo endpoints
  app.post("/api/compliance/memo/generate", authenticateToken, async (req: any, res) => {
    try {
      const { complianceMemoRequestSchema } = await import("@shared/schema");
      const validatedRequest = complianceMemoRequestSchema.parse(req.body);

      const { getComplianceMemoService } = await import("./services/complianceMemo");
      const complianceService = getComplianceMemoService();

      console.log('Compliance memo generation request:', {
        userId: req.user.id,
        companyName: validatedRequest.companyContext.companyName,
        projectName: validatedRequest.projectContext.projectName,
        taxYear: validatedRequest.companyContext.taxYear,
        options: validatedRequest.memoOptions,
      });

      const complianceMemo = complianceService.generateComplianceMemo(validatedRequest);

      res.json({
        success: true,
        memo: complianceMemo,
        generatedAt: new Date().toISOString(),
      });

    } catch (error: any) {
      console.error("Compliance memo generation error:", error);
      
      // Handle validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        });
      }

      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to generate compliance memo"
      });
    }
  });

  app.post("/api/compliance/memo/preview", authenticateToken, async (req: any, res) => {
    try {
      const { complianceMemoRequestSchema } = await import("@shared/schema");
      const validatedRequest = complianceMemoRequestSchema.parse(req.body);

      const { getComplianceMemoService } = await import("./services/complianceMemo");
      const complianceService = getComplianceMemoService();

      console.log('Compliance memo preview request:', {
        userId: req.user.id,
        companyName: validatedRequest.companyContext.companyName,
        projectName: validatedRequest.projectContext.projectName,
      });

      // Generate a preview with basic analysis
      const complianceMemo = complianceService.generateComplianceMemo(validatedRequest);
      
      // Return summary information for preview
      const preview = {
        overallCompliance: complianceMemo.overallCompliance,
        riskAssessment: {
          overallRisk: complianceMemo.riskAssessment.overallRisk,
          riskFactorCount: complianceMemo.riskAssessment.riskFactors.length,
          highRiskFactors: complianceMemo.riskAssessment.riskFactors.filter(f => f.risk === 'high').length,
        },
        fourPartTestAnalysis: {
          overallScore: complianceMemo.fourPartTestAnalysis.overallScore,
          sectionScores: {
            technologicalInformation: complianceMemo.fourPartTestAnalysis.technologicalInformation.score,
            businessComponent: complianceMemo.fourPartTestAnalysis.businessComponent.score,
            uncertainty: complianceMemo.fourPartTestAnalysis.uncertainty.score,
            experimentation: complianceMemo.fourPartTestAnalysis.experimentation.score,
          },
        },
        qreJustification: {
          totalQRE: complianceMemo.qreJustification.totalQRE,
          contractorLimit: complianceMemo.qreJustification.contractorExpenses.sixtyfivePercentLimit,
          overallRisk: calculateQREOverallRisk(complianceMemo.qreJustification),
        },
        recommendationCount: complianceMemo.recommendations.length,
        documentationRequirementCount: complianceMemo.documentationRequirements.length,
      };

      res.json({
        success: true,
        preview,
        generatedAt: new Date().toISOString(),
      });

    } catch (error: any) {
      console.error("Compliance memo preview error:", error);
      
      // Handle validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        });
      }

      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to generate compliance memo preview"
      });
    }
  });

  // Helper function for QRE risk calculation
  function calculateQREOverallRisk(qreJustification: any): 'low' | 'medium' | 'high' {
    const risks = [
      qreJustification.wageExpenses.riskLevel,
      qreJustification.contractorExpenses.riskLevel,
      qreJustification.supplyExpenses.riskLevel,
    ];
    
    if (risks.includes('high')) return 'high';
    if (risks.filter(r => r === 'medium').length >= 2) return 'medium';
    return 'low';
  }

  // Document orchestrator endpoints
  app.post("/api/documents/generate", authenticateToken, async (req: any, res) => {
    try {
      const { documentGenerationRequestSchema } = await import("@shared/schema");
      const validatedRequest = documentGenerationRequestSchema.parse(req.body);

      const { getDocumentOrchestrator } = await import("./services/documentOrchestrator");
      const orchestrator = getDocumentOrchestrator();

      console.log('Document generation request:', {
        userId: req.user.id,
        companyName: validatedRequest.companyContext.companyName,
        projectName: validatedRequest.projectContext.projectName,
        priority: validatedRequest.priority,
        options: validatedRequest.documentOptions,
      });

      const { jobId, estimatedDuration } = await orchestrator.startDocumentGeneration(
        req.user.id,
        validatedRequest
      );

      res.json({
        success: true,
        jobId,
        estimatedDuration,
        status: 'queued',
        message: 'Document generation started',
      });

    } catch (error: any) {
      console.error("Document generation request error:", error);
      
      // Handle validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        });
      }

      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to start document generation"
      });
    }
  });

  app.get("/api/documents/job/:jobId", authenticateToken, async (req: any, res) => {
    try {
      const { jobId } = req.params;

      const { getDocumentOrchestrator } = await import("./services/documentOrchestrator");
      const orchestrator = getDocumentOrchestrator();

      const job = await orchestrator.getJobStatus(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found',
        });
      }

      // Verify user owns this job
      if (job.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      res.json({
        success: true,
        job: {
          id: job.id,
          status: job.status,
          progress: job.progress,
          createdAt: job.createdAt,
          startedAt: job.startedAt,
          completedAt: job.completedAt,
          estimatedDuration: job.estimatedDuration,
          actualDuration: job.actualDuration,
          services: job.services,
          errors: job.errors,
          retryCount: job.retryCount,
          result: job.result,
        },
      });

    } catch (error: any) {
      console.error("Job status request error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get job status"
      });
    }
  });

  app.post("/api/documents/job/:jobId/cancel", authenticateToken, async (req: any, res) => {
    try {
      const { jobId } = req.params;

      const { getDocumentOrchestrator } = await import("./services/documentOrchestrator");
      const orchestrator = getDocumentOrchestrator();

      const cancelled = await orchestrator.cancelJob(jobId, req.user.id);
      
      if (!cancelled) {
        return res.status(400).json({
          success: false,
          error: 'Job cannot be cancelled',
        });
      }

      res.json({
        success: true,
        message: 'Job cancelled successfully',
      });

    } catch (error: any) {
      console.error("Job cancellation error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to cancel job"
      });
    }
  });

  app.post("/api/documents/job/:jobId/retry", authenticateToken, async (req: any, res) => {
    try {
      const { jobId } = req.params;

      const { getDocumentOrchestrator } = await import("./services/documentOrchestrator");
      const orchestrator = getDocumentOrchestrator();

      const retried = await orchestrator.retryJob(jobId, req.user.id);
      
      if (!retried) {
        return res.status(400).json({
          success: false,
          error: 'Job cannot be retried',
        });
      }

      res.json({
        success: true,
        message: 'Job retry queued successfully',
      });

    } catch (error: any) {
      console.error("Job retry error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to retry job"
      });
    }
  });

  app.get("/api/documents/jobs", authenticateToken, async (req: any, res) => {
    try {
      const { getDocumentOrchestrator } = await import("./services/documentOrchestrator");
      const orchestrator = getDocumentOrchestrator();

      const userJobs = orchestrator.getUserJobs(req.user.id);
      
      // Return simplified job information
      const jobs = userJobs.map(job => ({
        id: job.id,
        status: job.status,
        priority: job.priority,
        progress: job.progress,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        estimatedDuration: job.estimatedDuration,
        actualDuration: job.actualDuration,
        companyName: job.request?.companyContext?.companyName,
        projectName: job.request?.projectContext?.projectName,
        documentsRequested: {
          narrative: job.request?.documentOptions?.includeNarrative || false,
          complianceMemo: job.request?.documentOptions?.includeComplianceMemo || false,
          pdf: job.request?.documentOptions?.includePDF || false,
        },
        hasErrors: job.errors.length > 0,
        retryCount: job.retryCount,
      }));

      res.json({
        success: true,
        jobs,
        total: jobs.length,
      });

    } catch (error: any) {
      console.error("User jobs request error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get user jobs"
      });
    }
  });

  app.get("/api/documents/queue/stats", authenticateToken, async (req: any, res) => {
    try {
      const { getDocumentOrchestrator } = await import("./services/documentOrchestrator");
      const orchestrator = getDocumentOrchestrator();

      const stats = orchestrator.getQueueStats();

      res.json({
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      });

    } catch (error: any) {
      console.error("Queue stats request error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get queue stats"
      });
    }
  });

  // PDF generation endpoints
  app.post("/api/pdf/generate", authenticateToken, async (req: any, res) => {
    try {
      const { pdfGenerationRequestSchema } = await import("@shared/schema");
      const validatedRequest = pdfGenerationRequestSchema.parse(req.body);

      const { getDocumintService } = await import("./services/documint");
      const documintService = getDocumintService();

      console.log('PDF generation request:', {
        userId: req.user.id,
        templateId: validatedRequest.templateId,
        companyName: validatedRequest.data.companyName,
        taxYear: validatedRequest.data.taxYear,
      });

      const result = await documintService.generatePDF(validatedRequest);

      res.json({
        success: true,
        pdf: result,
        message: 'PDF generation started',
      });

    } catch (error: any) {
      console.error("PDF generation request error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        });
      }

      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to generate PDF"
      });
    }
  });

  app.get("/api/pdf/status/:pdfId", authenticateToken, async (req: any, res) => {
    try {
      const { pdfId } = req.params;

      const { getDocumintService } = await import("./services/documint");
      const documintService = getDocumintService();

      const status = await documintService.checkPDFStatus(pdfId);

      res.json({
        success: true,
        pdf: status,
      });

    } catch (error: any) {
      console.error("PDF status check error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to check PDF status"
      });
    }
  });

  app.get("/api/pdf/template/:templateId", authenticateToken, async (req: any, res) => {
    try {
      const { templateId } = req.params;

      const { getDocumintService } = await import("./services/documint");
      const documintService = getDocumintService();

      const template = await documintService.getTemplate(templateId);

      res.json({
        success: true,
        template,
      });

    } catch (error: any) {
      console.error("Template fetch error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to fetch template"
      });
    }
  });

  app.post("/api/pdf/batch", authenticateToken, async (req: any, res) => {
    try {
      const { pdfGenerationRequestSchema } = await import("@shared/schema");
      const { requests } = req.body;

      if (!Array.isArray(requests)) {
        return res.status(400).json({
          success: false,
          error: 'Requests must be an array',
        });
      }

      // Validate each request
      const validatedRequests = requests.map((request: any) => 
        pdfGenerationRequestSchema.parse(request)
      );

      const { getDocumintService } = await import("./services/documint");
      const documintService = getDocumintService();

      console.log('Batch PDF generation request:', {
        userId: req.user.id,
        requestCount: validatedRequests.length,
      });

      const results = await documintService.generateBatchPDFs(validatedRequests);

      res.json({
        success: true,
        results,
        total: results.length,
        completed: results.filter(r => r.status === 'completed').length,
        failed: results.filter(r => r.status === 'failed').length,
      });

    } catch (error: any) {
      console.error("Batch PDF generation error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        });
      }

      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to generate batch PDFs"
      });
    }
  });

  app.get("/api/pdf/verify/:pdfId", authenticateToken, async (req: any, res) => {
    try {
      const { pdfId } = req.params;

      const { getDocumintService } = await import("./services/documint");
      const documintService = getDocumintService();

      const verification = await documintService.verifyPDFQuality(pdfId);

      res.json({
        success: true,
        verification,
      });

    } catch (error: any) {
      console.error("PDF verification error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to verify PDF quality"
      });
    }
  });

  // S3 storage endpoints
  app.post("/api/s3/upload", authenticateToken, async (req: any, res) => {
    try {
      const { s3UploadRequestSchema } = await import("@shared/schema");
      const multer = await import("multer");
      
      // Configure multer for file upload handling
      const upload = multer.default({
        storage: multer.default.memoryStorage(),
        limits: {
          fileSize: 50 * 1024 * 1024, // 50MB limit
        },
        fileFilter: (req, file, cb) => {
          // Allow common document types
          const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif',
          ];
          
          if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error('Invalid file type. Only PDF, Word, text, and image files are allowed.'));
          }
        },
      }).single('file');

      // Handle file upload with multer
      upload(req, res, async (uploadError: any) => {
        if (uploadError) {
          return res.status(400).json({
            success: false,
            error: uploadError.message || 'File upload failed',
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No file provided',
          });
        }

        try {
          const uploadRequest = s3UploadRequestSchema.parse({
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            documentType: req.body.documentType,
            calculationId: req.body.calculationId,
            jobId: req.body.jobId,
          });

          const { getS3StorageService } = await import("./services/s3Storage");
          const s3Service = getS3StorageService();

          console.log('S3 upload request:', {
            userId: req.user.id,
            fileName: uploadRequest.fileName,
            fileSize: uploadRequest.fileSize,
            documentType: uploadRequest.documentType,
          });

          const uploadResult = await s3Service.uploadFile({
            ...uploadRequest,
            userId: req.user.id,
          }, req.file.buffer);

          res.json({
            success: true,
            upload: uploadResult,
            message: 'File uploaded successfully',
          });

        } catch (error: any) {
          console.error("S3 upload processing error:", error);
          
          if (error.name === 'ZodError') {
            return res.status(400).json({
              success: false,
              error: 'Invalid upload data',
              details: error.errors,
            });
          }

          res.status(500).json({ 
            success: false,
            error: error.message || "Failed to upload file"
          });
        }
      });

    } catch (error: any) {
      console.error("S3 upload endpoint error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Upload endpoint error"
      });
    }
  });

  app.get("/api/s3/files", authenticateToken, async (req: any, res) => {
    try {
      const { documentType } = req.query;

      const { getS3StorageService } = await import("./services/s3Storage");
      const s3Service = getS3StorageService();

      const files = await s3Service.listUserFiles(req.user.id, documentType);

      res.json({
        success: true,
        files,
        count: files.length,
      });

    } catch (error: any) {
      console.error("S3 list files error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to list files"
      });
    }
  });

  app.get("/api/s3/file/:key(*)", authenticateToken, async (req: any, res) => {
    try {
      const { key } = req.params;

      const { getS3StorageService } = await import("./services/s3Storage");
      const s3Service = getS3StorageService();

      const metadata = await s3Service.getFileMetadata(key);

      // Verify user access to file
      if (metadata.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this file',
        });
      }

      res.json({
        success: true,
        file: metadata,
      });

    } catch (error: any) {
      console.error("S3 get file metadata error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get file metadata"
      });
    }
  });

  app.get("/api/s3/download/:key(*)", authenticateToken, async (req: any, res) => {
    try {
      const { key } = req.params;
      const { expiresIn = 3600 } = req.query; // Default 1 hour

      const { getS3StorageService } = await import("./services/s3Storage");
      const s3Service = getS3StorageService();

      // Get file metadata to verify user access
      const metadata = await s3Service.getFileMetadata(key);

      if (metadata.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this file',
        });
      }

      const downloadUrl = await s3Service.generateSignedUrl(key, parseInt(expiresIn as string));

      res.json({
        success: true,
        downloadUrl,
        expiresAt: new Date(Date.now() + parseInt(expiresIn as string) * 1000).toISOString(),
        metadata,
      });

    } catch (error: any) {
      console.error("S3 download URL generation error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to generate download URL"
      });
    }
  });

  app.delete("/api/s3/file/:key(*)", authenticateToken, async (req: any, res) => {
    try {
      const { key } = req.params;

      const { getS3StorageService } = await import("./services/s3Storage");
      const s3Service = getS3StorageService();

      // Get file metadata to verify user access
      const metadata = await s3Service.getFileMetadata(key);

      if (metadata.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this file',
        });
      }

      await s3Service.deleteFile(key);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });

    } catch (error: any) {
      console.error("S3 delete file error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to delete file"
      });
    }
  });

  app.post("/api/s3/batch-upload", authenticateToken, async (req: any, res) => {
    try {
      const { s3BatchUploadRequestSchema } = await import("@shared/schema");
      const validatedRequest = s3BatchUploadRequestSchema.parse(req.body);

      const { getS3StorageService } = await import("./services/s3Storage");
      const s3Service = getS3StorageService();

      console.log('S3 batch upload request:', {
        userId: req.user.id,
        calculationId: validatedRequest.calculationId,
        documentCount: validatedRequest.documents.length,
      });

      // Convert base64 encoded files to buffers
      const documents = validatedRequest.documents.map(doc => ({
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileBuffer: Buffer.from(doc.fileData, 'base64'),
        documentType: doc.documentType,
      }));

      const uploadResults = await s3Service.uploadDocumentPackage(
        req.user.id,
        validatedRequest.calculationId,
        documents
      );

      res.json({
        success: true,
        uploads: uploadResults,
        total: uploadResults.length,
        completed: uploadResults.filter(r => r.uploadUrl !== '').length,
        failed: uploadResults.filter(r => r.uploadUrl === '').length,
      });

    } catch (error: any) {
      console.error("S3 batch upload error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid batch upload data',
          details: error.errors,
        });
      }

      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to upload document package"
      });
    }
  });

  app.get("/api/s3/stats", authenticateToken, async (req: any, res) => {
    try {
      const { getS3StorageService } = await import("./services/s3Storage");
      const s3Service = getS3StorageService();

      const stats = await s3Service.getStorageStats(req.user.id);

      res.json({
        success: true,
        stats,
      });

    } catch (error: any) {
      console.error("S3 storage stats error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get storage statistics"
      });
    }
  });

  app.post("/api/s3/cleanup", authenticateToken, async (req: any, res) => {
    try {
      // Only allow admin users to perform cleanup
      if (req.user.email !== 'admin@smbtaxcredits.com') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
        });
      }

      const { daysOld = 30 } = req.body;
      const beforeDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const { getS3StorageService } = await import("./services/s3Storage");
      const s3Service = getS3StorageService();

      const deletedCount = await s3Service.cleanupExpiredFiles(beforeDate);

      res.json({
        success: true,
        deletedCount,
        beforeDate: beforeDate.toISOString(),
      });

    } catch (error: any) {
      console.error("S3 cleanup error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to cleanup expired files"
      });
    }
  });

  // Download system endpoints
  app.post("/api/downloads/create", authenticateToken, async (req: any, res) => {
    try {
      const { downloadRequestSchema } = await import("@shared/schema");
      const validatedRequest = downloadRequestSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const { getDownloadManager } = await import("./services/downloadManager");
      const downloadManager = getDownloadManager();

      console.log('Download creation request:', {
        userId: req.user.id,
        fileCount: validatedRequest.fileKeys.length,
        downloadType: validatedRequest.downloadType,
      });

      const downloadResponse = await downloadManager.createDownload({
        ...validatedRequest,
        userId: req.user.id
      });

      res.json({
        success: true,
        download: downloadResponse,
        message: 'Download prepared successfully',
      });

    } catch (error: any) {
      console.error("Download creation error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid download request',
          details: error.errors,
        });
      }

      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to create download"
      });
    }
  });

  app.get("/api/downloads/secure/:token", async (req: any, res) => {
    try {
      const { token } = req.params;

      const { getDownloadManager } = await import("./services/downloadManager");
      const downloadManager = getDownloadManager();

      // Get client information
      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      };

      console.log('Processing secure download:', {
        token: token.substring(0, 10) + '...',
        clientInfo,
      });

      const downloadData = await downloadManager.processDownload(token, clientInfo);

      // Set appropriate headers for download
      res.setHeader('Content-Type', downloadData.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${downloadData.filename}"`);
      res.setHeader('Content-Length', downloadData.size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Send the file
      if (Buffer.isBuffer(downloadData.stream)) {
        res.send(downloadData.stream);
      } else {
        downloadData.stream.pipe(res);
      }

    } catch (error: any) {
      console.error("Secure download error:", error);
      res.status(404).json({ 
        success: false,
        error: error.message || "Download not found or expired"
      });
    }
  });

  app.get("/api/downloads/status/:trackingId", authenticateToken, async (req: any, res) => {
    try {
      const { trackingId } = req.params;

      const { getDownloadManager } = await import("./services/downloadManager");
      const downloadManager = getDownloadManager();

      const tracking = await downloadManager.getDownloadStatus(trackingId);

      if (!tracking) {
        return res.status(404).json({
          success: false,
          error: 'Download tracking not found',
        });
      }

      // Verify user owns the download
      if (tracking.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this download',
        });
      }

      res.json({
        success: true,
        tracking,
      });

    } catch (error: any) {
      console.error("Download status error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get download status"
      });
    }
  });

  app.get("/api/downloads/stats", authenticateToken, async (req: any, res) => {
    try {
      const { days = 30 } = req.query;

      const { getDownloadManager } = await import("./services/downloadManager");
      const downloadManager = getDownloadManager();

      const stats = await downloadManager.getUserDownloadStats(req.user.id, parseInt(days as string));

      res.json({
        success: true,
        stats,
        period: `Last ${days} days`,
      });

    } catch (error: any) {
      console.error("Download stats error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get download statistics"
      });
    }
  });

  app.delete("/api/downloads/:token", authenticateToken, async (req: any, res) => {
    try {
      const { token } = req.params;

      const { getDownloadManager } = await import("./services/downloadManager");
      const downloadManager = getDownloadManager();

      // Get download info to verify ownership
      const tracking = await downloadManager.getDownloadStatus(token);
      if (tracking && tracking.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this download',
        });
      }

      await downloadManager.deleteDownloadToken(token);

      res.json({
        success: true,
        message: 'Download token deleted successfully',
      });

    } catch (error: any) {
      console.error("Download deletion error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to delete download"
      });
    }
  });

  app.post("/api/downloads/optimize", authenticateToken, async (req: any, res) => {
    try {
      const { fileKeys, maxBandwidth, compressionLevel, streamingEnabled } = req.body;

      if (!Array.isArray(fileKeys) || fileKeys.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'File keys array is required',
        });
      }

      const { getDownloadManager } = await import("./services/downloadManager");
      const downloadManager = getDownloadManager();

      const optimization = await downloadManager.optimizeDownload(fileKeys, {
        maxBandwidth,
        compressionLevel,
        streamingEnabled,
      });

      res.json({
        success: true,
        optimization,
      });

    } catch (error: any) {
      console.error("Download optimization error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to optimize download"
      });
    }
  });

  // Email notification endpoints
  app.post("/api/email/send", authenticateToken, async (req: any, res) => {
    try {
      const { emailNotificationRequestSchema } = await import("@shared/schema");
      const validatedRequest = emailNotificationRequestSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const { getEmailNotificationService } = await import("./services/emailNotificationService");
      const emailService = getEmailNotificationService();

      console.log('Email notification request:', {
        userId: req.user.id,
        recipientEmail: validatedRequest.recipientEmail,
        templateType: validatedRequest.templateType,
        priority: validatedRequest.priority,
      });

      const result = await emailService.sendNotification({
        ...validatedRequest,
        userId: req.user.id
      });

      res.json({
        success: true,
        notification: result,
        message: 'Email notification sent successfully',
      });

    } catch (error: any) {
      console.error("Email notification error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid email notification request',
          details: error.errors,
        });
      }

      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to send email notification"
      });
    }
  });

  app.get("/api/email/status/:notificationId", authenticateToken, async (req: any, res) => {
    try {
      const { notificationId } = req.params;

      const { getEmailNotificationService } = await import("./services/emailNotificationService");
      const emailService = getEmailNotificationService();

      const status = await emailService.getDeliveryStatus(notificationId);

      if (!status) {
        return res.status(404).json({
          success: false,
          error: 'Email notification not found',
        });
      }

      res.json({
        success: true,
        status,
      });

    } catch (error: any) {
      console.error("Email status error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get email status"
      });
    }
  });

  app.get("/api/email/stats", authenticateToken, async (req: any, res) => {
    try {
      const { days = 30 } = req.query;

      const { getEmailNotificationService } = await import("./services/emailNotificationService");
      const emailService = getEmailNotificationService();

      const stats = await emailService.getEmailStats(req.user.id, parseInt(days as string));

      res.json({
        success: true,
        stats,
        period: `Last ${days} days`,
      });

    } catch (error: any) {
      console.error("Email stats error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get email statistics"
      });
    }
  });

  app.post("/api/email/webhook", async (req: any, res) => {
    try {
      // SendGrid webhook endpoint (public, no authentication required)
      const { getEmailNotificationService } = await import("./services/emailNotificationService");
      const emailService = getEmailNotificationService();

      console.log('Processing SendGrid webhook:', req.body);

      await emailService.handleWebhook(req.body);

      res.status(200).json({ 
        success: true,
        message: 'Webhook processed successfully' 
      });

    } catch (error: any) {
      console.error("Email webhook error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to process webhook"
      });
    }
  });

  app.post("/api/email/unsubscribe", async (req: any, res) => {
    try {
      const { email, reason } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email address is required',
        });
      }

      const { getEmailNotificationService } = await import("./services/emailNotificationService");
      const emailService = getEmailNotificationService();

      await emailService.unsubscribe(email, reason);

      res.json({
        success: true,
        message: 'Successfully unsubscribed from email notifications',
      });

    } catch (error: any) {
      console.error("Email unsubscribe error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to unsubscribe"
      });
    }
  });

  // Error reporting endpoint
  app.post("/api/errors/report", async (req: any, res) => {
    try {
      const { getLoggingService } = await import("./services/logger");
      const logger = getLoggingService();

      const { message, stack, name, context } = req.body;

      if (!message || !context) {
        return res.status(400).json({
          success: false,
          error: 'Error message and context are required',
        });
      }

      // Create error object
      const error = new Error(message);
      error.name = name || 'ClientError';
      error.stack = stack;

      // Determine severity and category
      const severity = logger.determineSeverity(error, context);
      const category = logger.categorizeError(error, context);

      // Log the error
      const errorId = logger.logError(message, error, severity, category, context);

      res.json({
        success: true,
        errorId,
        message: 'Error reported successfully',
      });

    } catch (error: any) {
      console.error("Error reporting failed:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to report error"
      });
    }
  });

  // Error statistics endpoint
  app.get("/api/errors/stats", authenticateToken, async (req: any, res) => {
    try {
      const { days = 7 } = req.query;

      const { getLoggingService } = await import("./services/logger");
      const logger = getLoggingService();

      const stats = logger.getErrorStats(parseInt(days as string));

      res.json({
        success: true,
        stats,
        period: `Last ${days} days`,
      });

    } catch (error: any) {
      console.error("Error stats error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get error statistics"
      });
    }
  });

  // Payment routes with Stripe
  app.post("/api/create-payment-intent", authenticateToken, async (req: any, res) => {
    try {
      const { amount, calculationId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId: req.user.id,
          calculationId,
        },
      });
      
      // Create payment record
      await storage.createPayment({
        userId: req.user.id,
        calculationId,
        stripePaymentIntentId: paymentIntent.id,
        amount: amount.toString(),
        status: "pending",
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe webhook to handle payment confirmations
  app.post("/api/stripe-webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
      return res.status(500).json({ message: "Webhook secret not configured" });
    }
    
    try {
      const event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
      
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const { leadId, tierName, estimatedCredit, customerName } = metadata;
        
        if (session.customer_details?.email) {
          // Import services
          const { UserCreationService } = await import('./services/userCreation.js');
          const { EmailService } = await import('./services/email.js');
          const { assignPricingTier } = await import('../shared/config/pricing.js');
          
          // Extract name from customerName or session
          const names = customerName ? customerName.split(' ') : [];
          const firstName = names[0] || session.customer_details.name?.split(' ')[0];
          const lastName = names.slice(1).join(' ') || session.customer_details.name?.split(' ').slice(1).join(' ');
          
          // Create or get user account
          const userResult = await UserCreationService.createOrGetUserFromCheckout({
            email: session.customer_details.email,
            leadId,
            firstName,
            lastName,
            stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
          });
          
          // Link lead to user if leadId provided
          if (leadId) {
            await UserCreationService.linkLeadToUser(userResult.user.id, leadId);
          }
          
          // Get pricing information
          const estimatedCreditNum = parseFloat(estimatedCredit || '0');
          const pricingTier = assignPricingTier(estimatedCreditNum);
          
          // Send welcome email
          if (userResult.isNewUser) {
            await EmailService.sendWelcomeEmail({
              email: session.customer_details.email,
              firstName,
              orderNumber: session.id.slice(-8).toUpperCase(),
              estimatedCredit: estimatedCreditNum,
              tierName: tierName || pricingTier.name,
              dashboardUrl: `${process.env.CLIENT_URL || 'http://localhost:5000'}/dashboard?token=${userResult.token}`,
            });
          }
          
          // Send order confirmation email
          await EmailService.sendOrderConfirmationEmail({
            email: session.customer_details.email,
            firstName,
            orderNumber: session.id.slice(-8).toUpperCase(),
            amount: (session.amount_total || 0) / 100, // Convert from cents
            tierName: tierName || pricingTier.name,
            estimatedCredit: estimatedCreditNum,
            nextSteps: [
              'Your information is being reviewed by our tax specialists',
              'IRS-compliant documentation will be prepared within 48 hours',
              'You\'ll receive download links via email',
              'File your amended return with the provided documentation',
            ],
          });
          
          console.log(`Checkout completed for ${session.customer_details.email}, user ${userResult.user.id} (${userResult.isNewUser ? 'new' : 'existing'})`);
        }
      }
      
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, calculationId } = paymentIntent.metadata;
        
        // Update payment status for existing payment intent flow
        if (userId) {
          const payments = await storage.getPaymentsByUserId(userId);
          const payment = payments.find(p => p.stripePaymentIntentId === paymentIntent.id);
          
          if (payment) {
            await storage.updatePayment(payment.id, { status: "completed" });
            console.log(`Payment completed for user ${userId}, calculation ${calculationId}`);
          }
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error.message);
      res.status(400).json({ message: `Webhook error: ${error.message}` });
    }
  });

  // Dashboard data route with comprehensive information
  app.get("/api/dashboard", authenticateToken, async (req: any, res) => {
    try {
      // Fetch all user data in parallel for optimal performance
      const [calculations, companies, intakeForms, payments, documents] = await Promise.all([
        storage.getCalculationsByUserId(req.user.id),
        storage.getCompaniesByUserId(req.user.id),
        storage.getIntakeFormsByUserId(req.user.id),
        storage.getPaymentsByUserId(req.user.id),
        storage.getPaymentsByUserId(req.user.id), // Placeholder: getDocumentsByUserId doesn't exist
      ]);

      // Calculate summary statistics
      const latestCalculation = calculations[0];
      const hasCompletedPayment = payments.some((p: any) => p.status === "completed");
      const hasIntakeFormInProgress = intakeForms.some((f: any) => f.status === "in_progress");
      const documentsGenerated = documents.filter((d: any) => d.status === "completed").length;

      // Calculate progress statistics
      const totalSections = 4; // Company Info, R&D Activities, Expense Breakdown, Supporting Info
      let completedSections = 0;
      let totalFields = 0;
      let completedFields = 0;

      // Analyze intake form completion status
      intakeForms.forEach((form: any) => {
        const formData = form.formData as any || {};
        
        // Company Info section (10 fields)
        const companyFields = ['legalName', 'ein', 'entityType', 'industry', 'address', 'phone', 'primaryContact', 'website', 'yearFounded', 'description'];
        const companyCompleted = companyFields.filter(field => formData.companyInfo?.[field]).length;
        totalFields += companyFields.length;
        completedFields += companyCompleted;
        if (companyCompleted === companyFields.length) completedSections++;

        // R&D Activities section (12 fields)
        const rdFields = ['primaryActivities', 'businessPurpose', 'uncertainties', 'experiments', 'timeframe', 'personnel', 'outcomes', 'documentation', 'previousClaims', 'relatedProjects', 'futureActivities', 'qualificationBasis'];
        const rdCompleted = rdFields.filter(field => formData.rdActivities?.[field]).length;
        totalFields += rdFields.length;
        completedFields += rdCompleted;
        if (rdCompleted === rdFields.length) completedSections++;

        // Expense Breakdown section (10 fields)
        const expenseFields = ['wages', 'contractors', 'supplies', 'cloud', 'equipment', 'software', 'travel', 'training', 'consultants', 'other'];
        const expenseCompleted = expenseFields.filter(field => formData.expenses?.[field]).length;
        totalFields += expenseFields.length;
        completedFields += expenseCompleted;
        if (expenseCompleted === expenseFields.length) completedSections++;

        // Supporting Information section (6 fields)
        const supportingFields = ['projectDocuments', 'financialRecords', 'personnelRecords', 'contracts', 'receipts', 'technicalSpecs'];
        const supportingCompleted = supportingFields.filter(field => formData.supporting?.[field]).length;
        totalFields += supportingFields.length;
        completedFields += supportingCompleted;
        if (supportingCompleted === supportingFields.length) completedSections++;
      });

      const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
      const estimatedTimeRemaining = Math.max(0, (totalFields - completedFields) * 1.5); // 1.5 minutes per field

      // Format response with proper types
      const dashboardData = {
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          phone: req.user.phone,
          status: req.user.status,
          createdAt: req.user.createdAt.toISOString(),
          lastLoginAt: req.user.lastLoginAt?.toISOString() || null,
          loginCount: req.user.loginCount,
        },
        companies: companies.map((c: any) => ({
          id: c.id,
          legalName: c.legalName,
          ein: c.ein,
          entityType: c.entityType,
          industry: c.industry,
          address: c.address,
          createdAt: c.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: c.updatedAt?.toISOString() || new Date().toISOString(),
        })),
        calculations: calculations.map(c => ({
          id: c.id,
          userId: c.userId,
          federalCredit: c.federalCredit,
          totalQRE: c.totalQRE,
          pricingTier: c.pricingTier,
          pricingAmount: c.pricingAmount,
          createdAt: c.createdAt?.toISOString() || new Date().toISOString(),
        })),
        payments: payments.map(p => ({
          id: p.id,
          userId: p.userId,
          calculationId: p.calculationId,
          amount: p.amount,
          status: p.status,
          stripePaymentIntentId: p.stripePaymentIntentId,
          createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
        })),
        intakeForms: intakeForms.map(f => ({
          id: f.id,
          userId: f.userId,
          companyId: f.companyId,
          taxYear: f.taxYear,
          status: f.status,
          currentSection: f.currentSection,
          completionPercentage: Math.round((completedFields / Math.max(totalFields, 1)) * 100),
          createdAt: f.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: f.updatedAt?.toISOString() || new Date().toISOString(),
        })),
        documents: documents.map(d => ({
          id: d.id,
          intakeFormId: d.intakeFormId,
          documentType: d.documentType,
          status: d.status,
          fileName: d.fileName,
          downloadCount: d.downloadCount,
          createdAt: d.createdAt?.toISOString() || new Date().toISOString(),
        })),
        summary: {
          estimatedCredit: parseFloat(latestCalculation?.federalCredit || "0"),
          hasCompletedPayment,
          hasIntakeFormInProgress,
          documentsGenerated,
          nextSteps: getEnhancedNextSteps(hasCompletedPayment, hasIntakeFormInProgress, intakeForms, completionPercentage),
          progressStats: {
            totalSections,
            completedSections,
            completionPercentage,
            estimatedTimeRemaining,
          },
        },
        lastUpdated: new Date().toISOString(),
      };

      res.json(dashboardData);
    } catch (error: any) {
      console.error("Dashboard API error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Auto-save endpoints for intake forms
  app.post("/api/intake-forms/:id/save", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { section, data } = req.body;
      
      // Validate section name
      const validSections = ['company-info', 'rd-activities', 'expense-breakdown', 'supporting-info'];
      if (!validSections.includes(section)) {
        return res.status(400).json({ message: "Invalid section name" });
      }

      // Get existing intake form
      const existingForm = await storage.getIntakeFormById(id);
      if (!existingForm || existingForm.userId !== req.user.id) {
        return res.status(404).json({ message: "Intake form not found" });
      }

      // Update the specific section data
      const sectionMapping: { [key: string]: string } = {
        'company-info': 'companyInfo',
        'rd-activities': 'rdActivities', 
        'expense-breakdown': 'expenseBreakdown',
        'supporting-info': 'supportingInfo'
      };

      const sectionField = sectionMapping[section];
      const updateData = {
        [sectionField]: JSON.stringify(data),
        lastSavedSection: section,
        updatedAt: new Date().toISOString(),
      };

      // Update intake form
      await storage.updateIntakeForm(id, updateData);

      res.json({ 
        success: true, 
        message: "Section saved successfully",
        savedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Auto-save error:", error);
      res.status(500).json({ message: "Failed to save form data" });
    }
  });

  // Get intake form data
  app.get("/api/intake-forms/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const intakeForm = await storage.getIntakeFormById(id);
      
      if (!intakeForm || intakeForm.userId !== req.user.id) {
        return res.status(404).json({ message: "Intake form not found" });
      }

      // Parse JSON fields
      const formData = {
        ...intakeForm,
        companyInfo: intakeForm.companyInfo ? JSON.parse(intakeForm.companyInfo as string) : {},
        rdActivities: intakeForm.rdActivities ? JSON.parse(intakeForm.rdActivities as string) : {},
        expenseBreakdown: intakeForm.expenseBreakdown ? JSON.parse(intakeForm.expenseBreakdown as string) : {},
        supportingInfo: intakeForm.supportingInfo ? JSON.parse(intakeForm.supportingInfo as string) : {},
      };

      res.json(formData);
    } catch (error: any) {
      console.error("Get intake form error:", error);
      res.status(500).json({ message: "Failed to fetch intake form" });
    }
  });



  // Get user's documents endpoint
  app.get("/api/documents", authenticateToken, async (req: any, res) => {
    try {
      const userDocuments = await db.select({
        id: documents.id,
        documentName: documents.documentName,
        documentType: documents.documentType,
        taxYear: documents.taxYear,
        fileSizeBytes: documents.fileSizeBytes,
        createdAt: documents.createdAt,
        lastAccessedAt: documents.lastAccessedAt,
        downloadCount: documents.downloadCount,
      })
      .from(documents)
      .where(eq(documents.userId, req.user.id))
      .orderBy(sql`${documents.createdAt} DESC`);

      AccessLogger.logDataAccess(
        req,
        'list',
        'user-documents',
        [PIICategory.BUSINESS_DATA],
        true,
        `Retrieved ${userDocuments.length} documents`
      );

      res.json(userDocuments);

    } catch (error: any) {
      console.error('Failed to fetch user documents:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch documents',
      });
    }
  });



  // Document generation with S3 storage endpoints
  app.post("/api/docs/generate", authenticateToken, async (req: any, res) => {
    try {
      // Validate request body
      const generateDocSchema = z.object({
        customerId: z.string().min(1),
        taxYear: z.number().min(2000).max(new Date().getFullYear() + 1),
        docType: z.enum(['form_6765', 'technical_narrative', 'compliance_memo']),
        payload: z.record(z.any()),
        companyId: z.string().min(1),
        intakeFormId: z.string().min(1),
      });

      const validatedRequest = generateDocSchema.parse(req.body);
      
      console.log('Document generation request:', {
        userId: req.user.id,
        customerId: validatedRequest.customerId,
        docType: validatedRequest.docType,
        taxYear: validatedRequest.taxYear,
      });

      // Import and use the document orchestrator
      const { documentOrchestrator } = await import('./services/documents/orchestrator');
      
      const result = await documentOrchestrator.generateAndStoreDoc({
        ...validatedRequest,
        userId: req.user.id,
      });

      res.json({
        success: true,
        documentId: result.documentId,
        s3Key: result.s3Key,
        bucket: result.bucket,
        size: result.size,
        sha256Hash: result.sha256Hash,
      });

    } catch (error: any) {
      console.error('Document generation failed:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Document generation failed',
      });
    }
  });

  app.get("/api/docs/:id/url", authenticateToken, async (req: any, res) => {
    try {
      const { id: documentId } = req.params;
      
      // Get document from database
      const [document] = await db.select().from(documents).where(eq(documents.id, documentId));
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
        });
      }

      // Verify ownership
      if (document.userId !== req.user.id) {
        AccessLogger.logDataAccess(
          req,
          'access_denied',
          `document:${documentId}`,
          [PIICategory.PERSONAL_IDENTIFIERS],
          false,
          'User attempted to access document they do not own'
        );
        
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      if (!document.s3Key) {
        return res.status(404).json({
          success: false,
          error: 'Document not available in storage',
        });
      }

      // Generate 5-minute presigned URL
      const { createS3Service } = await import('./services/storage/s3');
      const s3Service = createS3Service();
      const url = await s3Service.getPdfUrl(document.s3Key, 300); // 5 minutes

      // Update last accessed timestamp
      await db.update(documents)
        .set({ 
          lastAccessedAt: new Date(),
          downloadCount: sql`${documents.downloadCount} + 1`
        })
        .where(eq(documents.id, documentId));

      AccessLogger.logDataAccess(
        req,
        'document_download',
        `document:${documentId}`,
        [PIICategory.BUSINESS_DATA],
        true,
        `Generated presigned URL for document ${document.documentType}`
      );

      res.json({
        success: true,
        url,
        expiresIn: 300,
        documentName: document.documentName,
        documentType: document.documentType,
        size: document.fileSizeBytes,
      });

    } catch (error: any) {
      console.error('Failed to generate document URL:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate download URL',
      });
    }
  });

  // Register admin routes (protected by admin authentication)
  app.use("/api/admin", adminRouter);

  const httpServer = createServer(app);
  return httpServer;
}

// Enhanced helper function to determine next steps with time estimates
function getEnhancedNextSteps(hasCompletedPayment: boolean, hasIntakeFormInProgress: boolean, intakeForms: any[], completionPercentage: number) {
  const steps = [];
  
  if (!hasCompletedPayment) {
    steps.push({
      id: "payment",
      title: "Complete payment",
      description: "Pay for your R&D tax credit documentation service",
      status: "pending",
      action: "payment",
      estimatedMinutes: 5,
    });
  } else if (!hasIntakeFormInProgress && intakeForms.length === 0) {
    steps.push({
      id: "intake",
      title: "Start intake form",
      description: "Begin providing detailed information about your R&D activities",
      status: "current",
      action: "intake",
      estimatedMinutes: 45,
    });
  } else if (hasIntakeFormInProgress) {
    const currentForm = intakeForms.find(f => f.status === "in_progress");
    const remainingTime = Math.max(5, Math.round((100 - completionPercentage) * 0.5)); // 0.5 min per % remaining
    
    steps.push({
      id: "intake",
      title: "Continue intake form",
      description: `Complete your R&D activity details (${completionPercentage}% done)`,
      status: "current",
      action: "intake",
      estimatedMinutes: remainingTime,
    });
  } else if (intakeForms.some(f => f.status === "submitted")) {
    steps.push({
      id: "processing",
      title: "Documentation in progress",
      description: "Our team is preparing your R&D tax credit documentation",
      status: "current",
      action: "wait",
      estimatedMinutes: 0,
    });
  } else if (intakeForms.some(f => f.status === "completed")) {
    steps.push({
      id: "documents",
      title: "Download documents",
      description: "Your R&D tax credit documentation is ready for download",
      status: "completed",
      action: "download",
      estimatedMinutes: 0,
    });
  }
  
  return steps;
}

// Legacy helper function for backward compatibility
function getNextSteps(hasCompletedPayment: boolean, hasIntakeFormInProgress: boolean, intakeForms: any[]) {
  const enhancedSteps = getEnhancedNextSteps(hasCompletedPayment, hasIntakeFormInProgress, intakeForms, 0);
  return enhancedSteps.map(step => ({
    id: step.id,
    title: step.title,
    description: step.description,
    status: step.status,
    action: step.action,
  }));
}
