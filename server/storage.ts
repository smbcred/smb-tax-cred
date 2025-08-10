import {
  users,
  companies,
  calculations,
  payments,
  intakeForms,
  documents,
  leads,
  type User,
  type Company,
  type Calculation,
  type Payment,
  type IntakeForm,
  type Document,
  type Lead,
  type InsertUser,
  type InsertCompany,
  type InsertCalculation,
  type InsertPayment,
  type InsertIntakeForm,
  type InsertLead,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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

  // Document operations
  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocumentsByIntakeFormId(intakeFormId: string): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.intakeFormId, intakeFormId));
  }

  async getDocumentsByUserId(userId: string): Promise<Document[]> {
    // Join documents with intake forms to get user documents
    const result = await db
      .select()
      .from(documents)
      .innerJoin(intakeForms, eq(documents.intakeFormId, intakeForms.id))
      .where(eq(intakeForms.userId, userId));
    
    return result.map(row => row.documents);
  }

  async createDocument(insertDocument: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const [document] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return document;
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
      const recordId = await airtableService.createCustomerRecord(form);
      
      // Update the intake form with Airtable sync info
      await this.updateIntakeForm(intakeFormId, {
        airtableRecordId: recordId,
        airtableSyncStatus: 'synced',
        airtableSyncedAt: new Date(),
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
}

export const storage = new DatabaseStorage();
