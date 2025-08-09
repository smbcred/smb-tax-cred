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

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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

  // Document operations
  getDocumentsByIntakeFormId(intakeFormId: string): Promise<Document[]>;
  createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document>;

  // Lead operations
  getLead(id: string): Promise<Lead | undefined>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
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

  // Document operations
  async getDocumentsByIntakeFormId(intakeFormId: string): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.intakeFormId, intakeFormId));
  }

  async createDocument(insertDocument: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
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
}

export const storage = new DatabaseStorage();
