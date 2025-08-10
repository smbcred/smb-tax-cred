import {
  users,
  companies,
  calculations,
  payments,
  intakeForms,
  documents,
  leads,
  webhookEvents,
  workflowTriggers,
  type User,
  type Company,
  type Calculation,
  type Payment,
  type IntakeForm,
  type Document,
  type Lead,
  type WebhookEvent,
  type WorkflowTrigger,
  type InsertUser,
  type InsertCompany,
  type InsertCalculation,
  type InsertPayment,
  type InsertIntakeForm,
  type InsertLead,
  type WorkflowTriggerPayload,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, isNotNull, lt } from "drizzle-orm";

// Type for user creation with just essential fields
type CreateUserData = {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  stripeCustomerId?: string;
};

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: CreateUserData): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Company operations
  getCompany(id: string): Promise<Company | undefined>;
  getCompaniesByUserId(userId: string): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<Company>): Promise<Company>;

  // Calculation operations
  getCalculation(id: string): Promise<Calculation | undefined>;
  getCalculationsByUserId(userId: string): Promise<Calculation[]>;
  createCalculation(calculation: InsertCalculation): Promise<Calculation>;
  updateCalculation(id: string, updates: Partial<Calculation>): Promise<Calculation>;

  // Payment operations
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;

  // Intake form operations
  getIntakeForm(id: string): Promise<IntakeForm | undefined>;
  getIntakeFormsByUserId(userId: string): Promise<IntakeForm[]>;
  getIntakeFormByCompanyId(companyId: string): Promise<IntakeForm | undefined>;
  createIntakeForm(intakeForm: InsertIntakeForm): Promise<IntakeForm>;
  updateIntakeForm(id: string, updates: Partial<IntakeForm>): Promise<IntakeForm>;
  updateIntakeFormSection(id: string, section: string, data: any, userId: string): Promise<IntakeForm>;
  submitIntakeForm(id: string, submissionData: any): Promise<IntakeForm>;

  // Document operations
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByIntakeFormId(intakeFormId: string): Promise<Document[]>;
  getDocumentsByUserId(userId: string): Promise<Document[]>;
  createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document>;

  // Lead operations
  getLead(id: string): Promise<Lead | undefined>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead>;

  // Airtable sync operations
  syncToAirtable(intakeFormId: string): Promise<string>;
  updateAirtableSync(intakeFormId: string, recordId: string, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      status: "active",
      accountStatus: "active",
      createdFromLead: false,
      emailVerified: false,
      loginCount: 0,
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Company operations
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompaniesByUserId(userId: string): Promise<Company[]> {
    return db.select().from(companies).where(eq(companies.userId, userId));
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  // Calculation operations
  async getCalculation(id: string): Promise<Calculation | undefined> {
    const [calculation] = await db.select().from(calculations).where(eq(calculations.id, id));
    return calculation;
  }

  async getCalculationsByUserId(userId: string): Promise<Calculation[]> {
    return db
      .select()
      .from(calculations)
      .where(eq(calculations.userId, userId))
      .orderBy(desc(calculations.createdAt));
  }

  async createCalculation(insertCalculation: InsertCalculation): Promise<Calculation> {
    const [calculation] = await db.insert(calculations).values(insertCalculation).returning();
    return calculation;
  }

  async updateCalculation(id: string, updates: Partial<Calculation>): Promise<Calculation> {
    const [calculation] = await db
      .update(calculations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(calculations.id, id))
      .returning();
    return calculation;
  }

  // Payment operations
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // Intake form operations
  async getIntakeForm(id: string): Promise<IntakeForm | undefined> {
    const [intakeForm] = await db.select().from(intakeForms).where(eq(intakeForms.id, id));
    return intakeForm;
  }

  async getIntakeFormById(id: string): Promise<IntakeForm | undefined> {
    const [intakeForm] = await db.select().from(intakeForms).where(eq(intakeForms.id, id));
    return intakeForm;
  }

  async getIntakeFormsByUserId(userId: string): Promise<IntakeForm[]> {
    return db.select().from(intakeForms).where(eq(intakeForms.userId, userId));
  }

  async getIntakeFormByCompanyId(companyId: string): Promise<IntakeForm | undefined> {
    const [intakeForm] = await db
      .select()
      .from(intakeForms)
      .where(eq(intakeForms.companyId, companyId));
    return intakeForm;
  }

  async createIntakeForm(insertIntakeForm: InsertIntakeForm): Promise<IntakeForm> {
    const [intakeForm] = await db.insert(intakeForms).values(insertIntakeForm).returning();
    return intakeForm;
  }

  async updateIntakeForm(id: string, updates: Partial<IntakeForm>): Promise<IntakeForm> {
    const [intakeForm] = await db
      .update(intakeForms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(intakeForms.id, id))
      .returning();
    return intakeForm;
  }

  async updateIntakeFormSection(id: string, section: string, data: any, userId: string): Promise<IntakeForm> {
    // First verify the form belongs to the user
    const existingForm = await this.getIntakeForm(id);
    if (!existingForm || existingForm.userId !== userId) {
      throw new Error('Intake form not found or access denied');
    }

    // Build the update object based on the section
    const updates: Partial<IntakeForm> = {
      lastSavedSection: section,
      updatedAt: new Date(),
    };

    // Map section names to database columns
    switch (section) {
      case 'company-info':
        updates.companyInfo = data;
        break;
      case 'rd-activities':
        updates.rdActivities = data;
        break;
      case 'expense-breakdown':
        updates.expenseBreakdown = data;
        break;
      case 'supporting-info':
        updates.supportingInfo = data;
        break;
      default:
        throw new Error(`Invalid section: ${section}`);
    }

    const [intakeForm] = await db
      .update(intakeForms)
      .set(updates)
      .where(and(eq(intakeForms.id, id), eq(intakeForms.userId, userId)))
      .returning();
    
    if (!intakeForm) {
      throw new Error('Failed to update intake form section');
    }
    
    return intakeForm;
  }

  async submitIntakeForm(id: string, submissionData: any): Promise<IntakeForm> {
    const [intakeForm] = await db
      .update(intakeForms)
      .set({ 
        formData: submissionData,
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(intakeForms.id, id))
      .returning();
    return intakeForm;
  }



  // Lead operations
  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.email, email));
    return lead;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set({ ...updates })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  // Airtable sync operations
  async syncToAirtable(intakeFormId: string): Promise<string> {
    const form = await this.getIntakeForm(intakeFormId);
    if (!form) {
      throw new Error(`Intake form not found: ${intakeFormId}`);
    }

    try {
      const { getAirtableService } = await import("./services/airtable");
      const airtableService = getAirtableService();
      
      // Use enhanced sync method with calculation results
      const recordId = await airtableService.syncWithCalculationResults(form, form.calculationData);
      
      // Update the intake form with Airtable sync info
      await this.updateIntakeForm(intakeFormId, {
        airtableRecordId: recordId,
        airtableSyncStatus: 'synced',
        airtableSyncedAt: new Date(),
        airtableSyncError: null,
        makeWebhookSent: true,
      });

      return recordId;
    } catch (error: any) {
      // Update sync status to failed
      await this.updateIntakeForm(intakeFormId, {
        airtableSyncStatus: 'failed',
        airtableSyncError: error.message,
      });
      throw error;
    }
  }

  async updateAirtableSync(intakeFormId: string, recordId: string, status: string): Promise<void> {
    const updates: Partial<IntakeForm> = {
      airtableRecordId: recordId,
      airtableSyncStatus: status,
      airtableSyncedAt: new Date(),
    };

    if (status === 'failed') {
      updates.airtableSyncError = 'Sync operation failed';
    } else {
      updates.airtableSyncError = null;
    }

    await this.updateIntakeForm(intakeFormId, updates);
  }

  // Document URL and status management
  async createDocument(documentData: {
    intakeFormId: string;
    companyId: string;
    userId: string;
    documentType: string;
    documentName: string;
    s3Url?: string;
    status?: string;
    expirationDate?: Date;
  }): Promise<Document> {
    const document = await db.insert(documents).values({
      id: generateId(),
      ...documentData,
      status: documentData.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning().then(rows => rows[0]);

    return document;
  }

  async updateDocumentUrl(documentId: string, s3Url: string, expirationDate?: Date): Promise<Document> {
    const updateData: any = {
      s3Url,
      status: 'available',
      updatedAt: new Date(),
    };

    if (expirationDate) {
      updateData.accessExpiresAt = expirationDate;
      updateData.expirationDate = expirationDate; // Compatibility field
    }

    const document = await db.update(documents)
      .set(updateData)
      .where(eq(documents.id, documentId))
      .returning()
      .then(rows => rows[0]);

    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    return document;
  }

  async updateDocumentStatus(documentId: string, status: string, error?: string): Promise<Document> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (error) {
      updateData.generationError = error;
    }

    const document = await db.update(documents)
      .set(updateData)
      .where(eq(documents.id, documentId))
      .returning()
      .then(rows => rows[0]);

    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    return document;
  }

  async getDocumentsByIntakeForm(intakeFormId: string): Promise<Document[]> {
    return db.select()
      .from(documents)
      .where(eq(documents.intakeFormId, intakeFormId))
      .orderBy(desc(documents.createdAt));
  }

  async getDocument(documentId: string): Promise<Document | null> {
    const result = await db.select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);
    
    return result[0] || null;
  }

  async checkExpiredDocuments(): Promise<Document[]> {
    return db.select()
      .from(documents)
      .where(
        and(
          isNotNull(documents.accessExpiresAt),
          lt(documents.accessExpiresAt, new Date()),
          eq(documents.status, 'available')
        )
      );
  }

  async updateDocumentAccess(documentId: string): Promise<Document> {
    const document = await db.update(documents)
      .set({
        downloadCount: sql`${documents.downloadCount} + 1`,
        lastAccessedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId))
      .returning()
      .then(rows => rows[0]);

    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    return document;
  }

  // Sync document URLs to Airtable
  async syncDocumentUrls(intakeFormId: string): Promise<void> {
    const form = await this.getIntakeForm(intakeFormId);
    if (!form || !form.airtableRecordId) {
      throw new Error(`Intake form not found or not synced to Airtable: ${intakeFormId}`);
    }

    const docs = await this.getDocumentsByIntakeForm(intakeFormId);
    const documentUrls: Record<string, string> = {};

    // Map document types to URLs
    docs.forEach(doc => {
      if (doc.s3Url && doc.status === 'available') {
        documentUrls[doc.documentType] = doc.s3Url;
      }
    });

    if (Object.keys(documentUrls).length > 0) {
      const { getAirtableService } = await import("./services/airtable");
      const airtableService = getAirtableService();
      await airtableService.updateDocumentUrls(form.airtableRecordId, documentUrls);
    }
  }

  // Webhook event management
  async createWebhookEvent(eventData: {
    source: string;
    eventType: string;
    payload: any;
    signature?: string;
    intakeFormId?: string;
    userId?: string;
  }): Promise<WebhookEvent> {
    const event = await db.insert(webhookEvents).values({
      id: generateId(),
      ...eventData,
      verified: false,
      processed: false,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning().then(rows => rows[0]);

    return event;
  }

  async updateWebhookEvent(eventId: string, updates: Partial<WebhookEvent>): Promise<WebhookEvent> {
    const event = await db.update(webhookEvents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(webhookEvents.id, eventId))
      .returning()
      .then(rows => rows[0]);

    if (!event) {
      throw new Error(`Webhook event not found: ${eventId}`);
    }

    return event;
  }

  async markWebhookEventProcessed(eventId: string, success: boolean, error?: string): Promise<WebhookEvent> {
    const updates: Partial<WebhookEvent> = {
      processed: true,
      processingCompletedAt: new Date(),
    };

    if (!success && error) {
      updates.processingError = error;
      updates.retryCount = sql`${webhookEvents.retryCount} + 1`;
    }

    return this.updateWebhookEvent(eventId, updates);
  }

  async getWebhookEvent(eventId: string): Promise<WebhookEvent | null> {
    const result = await db.select()
      .from(webhookEvents)
      .where(eq(webhookEvents.id, eventId))
      .limit(1);
    
    return result[0] || null;
  }

  async getWebhookEventsByIntakeForm(intakeFormId: string): Promise<WebhookEvent[]> {
    return db.select()
      .from(webhookEvents)
      .where(eq(webhookEvents.intakeFormId, intakeFormId))
      .orderBy(desc(webhookEvents.createdAt));
  }

  async getUnprocessedWebhookEvents(limit = 50): Promise<WebhookEvent[]> {
    return db.select()
      .from(webhookEvents)
      .where(eq(webhookEvents.processed, false))
      .orderBy(desc(webhookEvents.createdAt))
      .limit(limit);
  }

  async getFailedWebhookEvents(maxRetries = 3): Promise<WebhookEvent[]> {
    return db.select()
      .from(webhookEvents)
      .where(
        and(
          eq(webhookEvents.processed, false),
          gte(webhookEvents.retryCount, maxRetries),
          isNotNull(webhookEvents.processingError)
        )
      )
      .orderBy(desc(webhookEvents.createdAt));
  }

  // Workflow trigger management
  async createWorkflowTrigger(triggerData: {
    intakeFormId: string;
    airtableRecordId?: string;
    triggerPayload: WorkflowTriggerPayload;
    workflowId?: string;
    workflowName?: string;
    webhookUrl?: string;
    maxRetries?: number;
    timeoutAt?: Date;
  }): Promise<WorkflowTrigger> {
    const trigger = await db.insert(workflowTriggers).values({
      id: generateId(),
      ...triggerData,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning().then(rows => rows[0]);

    return trigger;
  }

  async updateWorkflowTrigger(triggerId: string, updates: Partial<WorkflowTrigger>): Promise<WorkflowTrigger> {
    const trigger = await db.update(workflowTriggers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workflowTriggers.id, triggerId))
      .returning()
      .then(rows => rows[0]);

    if (!trigger) {
      throw new Error(`Workflow trigger not found: ${triggerId}`);
    }

    return trigger;
  }

  async markWorkflowTriggered(triggerId: string, makeData?: {
    executionId?: string;
    scenarioId?: string;
    responseData?: any;
  }): Promise<WorkflowTrigger> {
    const updates: Partial<WorkflowTrigger> = {
      status: 'triggered',
      triggeredAt: new Date(),
    };

    if (makeData) {
      updates.makeExecutionId = makeData.executionId;
      updates.makeScenarioId = makeData.scenarioId;
      updates.responseData = makeData.responseData;
    }

    return this.updateWorkflowTrigger(triggerId, updates);
  }

  async markWorkflowCompleted(triggerId: string, responseData?: any): Promise<WorkflowTrigger> {
    return this.updateWorkflowTrigger(triggerId, {
      status: 'completed',
      completedAt: new Date(),
      responseData,
    });
  }

  async markWorkflowFailed(triggerId: string, error: string, shouldRetry = false): Promise<WorkflowTrigger> {
    const trigger = await this.getWorkflowTrigger(triggerId);
    if (!trigger) {
      throw new Error(`Workflow trigger not found: ${triggerId}`);
    }

    const updates: Partial<WorkflowTrigger> = {
      lastError: error,
      retryCount: trigger.retryCount + 1,
    };

    if (shouldRetry && trigger.retryCount < trigger.maxRetries) {
      // Calculate next retry time with exponential backoff
      const delayMs = Math.min(1000 * Math.pow(2, trigger.retryCount), 30000);
      updates.nextRetryAt = new Date(Date.now() + delayMs);
      updates.status = 'pending'; // Will be retried
    } else {
      updates.status = 'failed';
    }

    return this.updateWorkflowTrigger(triggerId, updates);
  }

  async markWorkflowTimeout(triggerId: string): Promise<WorkflowTrigger> {
    return this.updateWorkflowTrigger(triggerId, {
      status: 'timeout',
      completedAt: new Date(),
    });
  }

  async getWorkflowTrigger(triggerId: string): Promise<WorkflowTrigger | null> {
    const result = await db.select()
      .from(workflowTriggers)
      .where(eq(workflowTriggers.id, triggerId))
      .limit(1);
    
    return result[0] || null;
  }

  async getWorkflowTriggersByIntakeForm(intakeFormId: string): Promise<WorkflowTrigger[]> {
    return db.select()
      .from(workflowTriggers)
      .where(eq(workflowTriggers.intakeFormId, intakeFormId))
      .orderBy(desc(workflowTriggers.createdAt));
  }

  async getPendingWorkflowTriggers(limit = 50): Promise<WorkflowTrigger[]> {
    return db.select()
      .from(workflowTriggers)
      .where(eq(workflowTriggers.status, 'pending'))
      .orderBy(desc(workflowTriggers.createdAt))
      .limit(limit);
  }

  async getRetryableWorkflowTriggers(): Promise<WorkflowTrigger[]> {
    const now = new Date();
    return db.select()
      .from(workflowTriggers)
      .where(
        and(
          eq(workflowTriggers.status, 'pending'),
          isNotNull(workflowTriggers.nextRetryAt),
          lt(workflowTriggers.nextRetryAt, now)
        )
      )
      .orderBy(desc(workflowTriggers.nextRetryAt));
  }

  async getTimedOutWorkflowTriggers(): Promise<WorkflowTrigger[]> {
    const now = new Date();
    return db.select()
      .from(workflowTriggers)
      .where(
        and(
          eq(workflowTriggers.status, 'triggered'),
          isNotNull(workflowTriggers.timeoutAt),
          lt(workflowTriggers.timeoutAt, now)
        )
      )
      .orderBy(desc(workflowTriggers.timeoutAt));
  }
}

export const storage = new DatabaseStorage();
