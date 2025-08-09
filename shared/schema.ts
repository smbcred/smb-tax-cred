import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  accountStatus: varchar("account_status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  ein: varchar("ein", { length: 20 }),
  entityType: varchar("entity_type", { length: 50 }),
  industry: varchar("industry", { length: 100 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calculations table
export const calculations = pgTable("calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  companyId: varchar("company_id").references(() => companies.id),
  businessType: varchar("business_type", { length: 100 }),
  qualifyingActivities: jsonb("qualifying_activities"),
  expenses: jsonb("expenses"), // { wages, contractors, supplies, cloud }
  totalQRE: decimal("total_qre", { precision: 12, scale: 2 }),
  federalCredit: decimal("federal_credit", { precision: 12, scale: 2 }),
  pricingTier: integer("pricing_tier"),
  pricingAmount: decimal("pricing_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  calculationId: varchar("calculation_id").references(() => calculations.id).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Intake forms table
export const intakeForms = pgTable("intake_forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  status: varchar("status", { length: 50 }).default("in_progress"),
  currentSection: varchar("current_section", { length: 50 }).default("company_info"),
  formData: jsonb("form_data"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  intakeFormId: varchar("intake_form_id").references(() => intakeForms.id).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(),
  fileName: varchar("file_name"),
  s3Url: varchar("s3_url", { length: 500 }),
  status: varchar("status", { length: 50 }).default("pending"),
  expirationDate: timestamp("expiration_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table for email capture
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 50 }),
  calculationData: jsonb("calculation_data"),
  status: varchar("status", { length: 50 }).default("new"),
  convertedToUser: boolean("converted_to_user").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCalculationSchema = createInsertSchema(calculations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntakeFormSchema = createInsertSchema(intakeForms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

// Select types
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Calculation = typeof calculations.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type IntakeForm = typeof intakeForms.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Lead = typeof leads.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertIntakeForm = z.infer<typeof insertIntakeFormSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;

// Additional validation schemas
export const leadCaptureSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  companyName: z.string().min(1, "Company name is required"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

export const calculatorExpensesSchema = z.object({
  wages: z.number().min(0, "Wages must be a positive number"),
  contractors: z.number().min(0, "Contractor costs must be a positive number"),
  supplies: z.number().min(0, "Supplies cost must be a positive number"),
  cloud: z.number().min(0, "Cloud services cost must be a positive number"),
});

export const companyInfoSchema = z.object({
  legalName: z.string().min(1, "Legal business name is required"),
  ein: z.string().regex(/^\d{2}-\d{7}$/, "EIN must be in format 12-3456789"),
  entityType: z.enum(["llc", "corp", "s-corp", "partnership", "other"]),
  industry: z.string().min(1, "Industry is required"),
  address: z.string().min(1, "Business address is required"),
});

export type LeadCaptureData = z.infer<typeof leadCaptureSchema>;
export type CalculatorExpenses = z.infer<typeof calculatorExpensesSchema>;
export type CompanyInfoData = z.infer<typeof companyInfoSchema>;

// Calculation result type
export type CalculationResult = {
  totalQRE: number;
  federalCredit: number;
  pricingTier: number;
  pricingAmount: number;
};
