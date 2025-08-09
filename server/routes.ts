import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertCompanySchema,
  insertCalculationSchema,
  insertLeadSchema,
  leadCaptureSchema,
  calculatorExpensesSchema,
  companyInfoSchema,
  type CalculatorExpenses,
} from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}

if (!process.env.JWT_SECRET) {
  throw new Error("Missing required JWT secret: JWT_SECRET");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const JWT_SECRET = process.env.JWT_SECRET;

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
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const { email, password } = userData;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({ email, passwordHash, password });
      
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

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({
        user: { id: user.id, email: user.email },
        token,
      });
    } catch (error: any) {
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

  // Lead capture route
  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = leadCaptureSchema.parse(req.body);
      const calculationData = req.body.calculationData;
      
      // Check if lead already exists
      const existingLead = await storage.getLeadByEmail(leadData.email);
      if (existingLead) {
        // Update existing lead
        const updatedLead = await storage.updateLead(existingLead.id, {
          ...leadData,
          calculationData,
        });
        return res.json(updatedLead);
      }
      
      // Create new lead
      const lead = await storage.createLead({
        ...leadData,
        calculationData,
      });
      
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to capture lead" });
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
      const companyData = insertCompanySchema.parse({
        ...req.body,
        userId: req.user.id,
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
      
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, calculationId } = paymentIntent.metadata;
        
        // Update payment status
        const payments = await storage.getPaymentsByUserId(userId);
        const payment = payments.find(p => p.stripePaymentIntentId === paymentIntent.id);
        
        if (payment) {
          await storage.updatePayment(payment.id, { status: "completed" });
          
          // Here you would trigger the document generation process
          // For now, we'll just log it
          console.log(`Payment completed for user ${userId}, calculation ${calculationId}`);
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error.message);
      res.status(400).json({ message: `Webhook error: ${error.message}` });
    }
  });

  // Dashboard data route
  app.get("/api/dashboard", authenticateToken, async (req: any, res) => {
    try {
      const [calculations, companies, intakeForms, payments] = await Promise.all([
        storage.getCalculationsByUserId(req.user.id),
        storage.getCompaniesByUserId(req.user.id),
        storage.getIntakeFormsByUserId(req.user.id),
        storage.getPaymentsByUserId(req.user.id),
      ]);

      const latestCalculation = calculations[0];
      const hasCompletedPayment = payments.some(p => p.status === "completed");
      const hasIntakeFormInProgress = intakeForms.some(f => f.status === "in_progress");

      res.json({
        user: req.user,
        calculations,
        companies,
        intakeForms,
        payments,
        summary: {
          estimatedCredit: latestCalculation?.federalCredit || 0,
          hasCompletedPayment,
          hasIntakeFormInProgress,
          nextSteps: getNextSteps(hasCompletedPayment, hasIntakeFormInProgress, intakeForms),
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to determine next steps
function getNextSteps(hasCompletedPayment: boolean, hasIntakeFormInProgress: boolean, intakeForms: any[]) {
  const steps = [];
  
  if (!hasCompletedPayment) {
    steps.push({
      id: "payment",
      title: "Complete payment",
      description: "Pay for your R&D tax credit documentation service",
      status: "pending",
      action: "payment",
    });
  } else if (!hasIntakeFormInProgress && intakeForms.length === 0) {
    steps.push({
      id: "intake",
      title: "Complete intake form",
      description: "Provide detailed information about your R&D activities",
      status: "current",
      action: "intake",
    });
  } else if (hasIntakeFormInProgress) {
    steps.push({
      id: "intake",
      title: "Complete intake form",
      description: "Continue filling out your R&D activity details",
      status: "current", 
      action: "intake",
    });
  } else {
    steps.push({
      id: "documents",
      title: "Review generated documents",
      description: "Your IRS-compliant documentation is being prepared",
      status: "pending",
      action: "documents",
    });
  }
  
  return steps;
}
