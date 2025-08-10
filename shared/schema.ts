import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, jsonb, boolean, uuid, pgEnum, inet, date, bigint, char, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enum types for better data integrity
export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "suspended"]);
export const entityTypeEnum = pgEnum("entity_type", ["c-corp", "s-corp", "llc", "partnership", "sole-proprietorship"]);
export const intakeStatusEnum = pgEnum("intake_status", ["not_started", "in_progress", "submitted", "processing", "completed"]);
export const documentTypeEnum = pgEnum("document_type", ["form_6765", "form_8974", "technical_narrative", "compliance_memo", "expense_workbook", "state_form"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["pending", "completed", "failed", "refunded"]);
export const airtableSyncStatusEnum = pgEnum("airtable_sync_status", ["pending", "synced", "failed", "retry"]);

// Users table with enhanced fields
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }), // For compatibility - nullable
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  loginCount: integer("login_count").default(0),
  status: varchar("status", { length: 50 }).default("active"),
  createdFromLead: boolean("created_from_lead").default(true),
  leadCapturedAt: timestamp("lead_captured_at"),
  accountStatus: varchar("account_status", { length: 50 }).default("active"), // For compatibility
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("idx_users_email").on(table.email),
  stripeCustomerIdx: index("idx_users_stripe_customer_id").on(table.stripeCustomerId),
  statusIdx: index("idx_users_status").on(table.status),
}));

// Companies table with comprehensive business information
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  dbaName: varchar("dba_name", { length: 255 }),
  ein: varchar("ein", { length: 20 }),
  entityType: varchar("entity_type", { length: 50 }),
  incorporationState: char("incorporation_state", { length: 2 }),
  naicsCode: varchar("naics_code", { length: 10 }),
  naicsDescription: varchar("naics_description", { length: 255 }),
  yearFounded: integer("year_founded"),
  firstRevenueDate: date("first_revenue_date"),
  website: varchar("website", { length: 255 }),
  addressLine1: varchar("address_line1", { length: 255 }),
  addressLine2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: char("state", { length: 2 }),
  zipCode: varchar("zip_code", { length: 10 }),
  phone: varchar("phone", { length: 20 }),
  primaryContactName: varchar("primary_contact_name", { length: 255 }),
  primaryContactEmail: varchar("primary_contact_email", { length: 255 }),
  primaryContactPhone: varchar("primary_contact_phone", { length: 20 }),
  airtableRecordId: varchar("airtable_record_id", { length: 255 }).unique(),
  airtableSyncStatus: varchar("airtable_sync_status", { length: 50 }).default("pending"),
  industry: varchar("industry", { length: 100 }), // For compatibility
  address: text("address"), // For compatibility
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_companies_user_id").on(table.userId),
  einIdx: index("idx_companies_ein").on(table.ein),
  airtableRecordIdx: index("idx_companies_airtable_record_id").on(table.airtableRecordId),
}));

// Calculations table with enhanced tracking
export const calculations = pgTable("calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  companyId: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }),
  // Calculator inputs
  businessType: varchar("business_type", { length: 50 }),
  totalEmployees: integer("total_employees"),
  technicalEmployees: integer("technical_employees"),
  averageTechnicalSalary: decimal("average_technical_salary", { precision: 12, scale: 2 }),
  rdAllocationPercentage: integer("rd_allocation_percentage").default(100),
  contractorCosts: decimal("contractor_costs", { precision: 12, scale: 2 }),
  softwareCosts: decimal("software_costs", { precision: 12, scale: 2 }),
  cloudCosts: decimal("cloud_costs", { precision: 12, scale: 2 }),
  otherCosts: decimal("other_costs", { precision: 12, scale: 2 }),
  // Prior year data
  isFirstTimeFiler: boolean("is_first_time_filer").default(true),
  priorYearQREs: jsonb("prior_year_qres").default('[]'),
  // ASC calculation details
  ascMethod: varchar("asc_method", { length: 20 }), // 'first-time' or 'repeat'
  creditRate: decimal("credit_rate", { precision: 4, scale: 2 }), // 0.06 or 0.14
  baseAmount: decimal("base_amount", { precision: 12, scale: 2 }),
  excessQRE: decimal("excess_qre", { precision: 12, scale: 2 }),
  // Calculated results
  totalQRE: decimal("total_qre", { precision: 12, scale: 2 }),
  federalCredit: decimal("federal_credit", { precision: 12, scale: 2 }),
  stateCredit: decimal("state_credit", { precision: 12, scale: 2 }).default('0'),
  totalBenefit: decimal("total_benefit", { precision: 12, scale: 2 }),
  pricingTier: integer("pricing_tier"),
  tierName: varchar("tier_name", { length: 50 }),
  servicePrice: decimal("service_price", { precision: 10, scale: 2 }),
  // Additional data
  taxYear: integer("tax_year").default(sql`EXTRACT(YEAR FROM CURRENT_DATE)`),
  qualifyingActivities: jsonb("qualifying_activities"),
  calculationMethod: varchar("calculation_method", { length: 20 }).default("asc"),
  calculationData: jsonb("calculation_data"),
  warnings: jsonb("warnings").default('[]'),
  assumptions: jsonb("assumptions").default('[]'),
  // Lead tracking
  isLead: boolean("is_lead").default(true),
  leadConvertedAt: timestamp("lead_converted_at"),
  sessionId: varchar("session_id", { length: 255 }),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  // Compatibility fields
  expenses: jsonb("expenses"), // { wages, contractors, supplies, cloud }
  pricingAmount: decimal("pricing_amount", { precision: 10, scale: 2 }), // For compatibility
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_calculations_user_id").on(table.userId),
  companyIdIdx: index("idx_calculations_company_id").on(table.companyId),
  createdAtIdx: index("idx_calculations_created_at").on(table.createdAt),
  pricingTierIdx: index("idx_calculations_pricing_tier").on(table.pricingTier),
  isLeadIdx: index("idx_calculations_is_lead").on(table.isLead),
}));

// Subscriptions table (renamed from payments for clarity)
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  companyId: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  calculationId: varchar("calculation_id").references(() => calculations.id),
  
  // Stripe data
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id", { length: 255 }).unique(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).unique(),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
  
  // Pricing details
  pricingTier: integer("pricing_tier").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  additionalYears: integer("additional_years").default(0),
  additionalYearsPrice: decimal("additional_years_price", { precision: 10, scale: 2 }).default("0"),
  rushProcessing: boolean("rush_processing").default(false),
  rushProcessingPrice: decimal("rush_processing_price", { precision: 10, scale: 2 }).default("0"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  
  // Service details
  taxYears: jsonb("tax_years").notNull(), // Array of years
  federalCreditEstimate: decimal("federal_credit_estimate", { precision: 12, scale: 2 }),
  stateCreditsIncluded: jsonb("state_credits_included"), // Array of states
  
  // Status
  status: varchar("status", { length: 50 }).default("pending"),
  paidAt: timestamp("paid_at"),
  refundedAt: timestamp("refunded_at"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundReason: text("refund_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_subscriptions_user_id").on(table.userId),
  companyIdIdx: index("idx_subscriptions_company_id").on(table.companyId),
  calculationIdIdx: index("idx_subscriptions_calculation_id").on(table.calculationId),
  stripeCheckoutIdx: index("idx_subscriptions_stripe_checkout").on(table.stripeCheckoutSessionId),
  statusIdx: index("idx_subscriptions_status").on(table.status),
}));

// Keep payments table for backward compatibility
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

// Intake forms table with comprehensive tracking
export const intakeForms = pgTable("intake_forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  taxYear: integer("tax_year").notNull(),
  status: varchar("status", { length: 50 }).default("not_started"),
  
  // Form sections as JSONB for flexibility
  companyInfo: jsonb("company_info").default(sql`'{}'::jsonb`),
  rdActivities: jsonb("rd_activities").default(sql`'{}'::jsonb`),
  expenseBreakdown: jsonb("expense_breakdown").default(sql`'{}'::jsonb`),
  supportingInfo: jsonb("supporting_info").default(sql`'{}'::jsonb`),
  
  // Progress tracking
  sectionsCompleted: integer("sections_completed").default(0),
  totalSections: integer("total_sections").default(4),
  lastSavedSection: varchar("last_saved_section", { length: 50 }),
  
  // Calculated values
  totalWages: decimal("total_wages", { precision: 12, scale: 2 }),
  totalSupplies: decimal("total_supplies", { precision: 12, scale: 2 }),
  totalContractors: decimal("total_contractors", { precision: 12, scale: 2 }),
  totalCloudSoftware: decimal("total_cloud_software", { precision: 12, scale: 2 }),
  totalQre: decimal("total_qre", { precision: 12, scale: 2 }),
  
  // Processing
  submittedAt: timestamp("submitted_at"),
  processingStartedAt: timestamp("processing_started_at"),
  completedAt: timestamp("completed_at"),
  airtableRecordId: varchar("airtable_record_id", { length: 255 }).unique(),
  airtableSyncStatus: varchar("airtable_sync_status", { length: 50 }).default("pending"),
  makeWebhookSent: boolean("make_webhook_sent").default(false),
  makeRunId: varchar("make_run_id", { length: 255 }),
  
  // Compatibility fields
  currentSection: varchar("current_section", { length: 50 }).default("company_info"),
  formData: jsonb("form_data"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdIdx: index("idx_intake_forms_company_id").on(table.companyId),
  userIdIdx: index("idx_intake_forms_user_id").on(table.userId),
  statusIdx: index("idx_intake_forms_status").on(table.status),
  taxYearIdx: index("idx_intake_forms_tax_year").on(table.taxYear),
  airtableRecordIdx: index("idx_intake_forms_airtable_record_id").on(table.airtableRecordId),
}));

// Documents table with enhanced tracking
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  intakeFormId: varchar("intake_form_id").references(() => intakeForms.id, { onDelete: "cascade" }).notNull(),
  companyId: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  documentType: varchar("document_type", { length: 50 }).notNull(),
  documentName: varchar("document_name", { length: 255 }).notNull(),
  fileSizeBytes: bigint("file_size_bytes", { mode: "number" }),
  mimeType: varchar("mime_type", { length: 100 }).default("application/pdf"),
  
  // S3 storage
  s3Bucket: varchar("s3_bucket", { length: 255 }),
  s3Key: varchar("s3_key", { length: 500 }),
  s3Url: text("s3_url"),
  s3VersionId: varchar("s3_version_id", { length: 255 }),
  
  // Access control
  accessExpiresAt: timestamp("access_expires_at"),
  downloadCount: integer("download_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  
  // Generation metadata
  generatedBy: varchar("generated_by", { length: 50 }), // 'claude', 'documint', 'manual'
  generationTimeMs: integer("generation_time_ms"),
  generationCostCents: integer("generation_cost_cents"),
  
  // Compatibility fields
  fileName: varchar("file_name"),
  status: varchar("status", { length: 50 }).default("pending"),
  expirationDate: timestamp("expiration_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  intakeFormIdIdx: index("idx_documents_intake_form_id").on(table.intakeFormId),
  companyIdIdx: index("idx_documents_company_id").on(table.companyId),
  userIdIdx: index("idx_documents_user_id").on(table.userId),
  documentTypeIdx: index("idx_documents_document_type").on(table.documentType),
  accessExpiresIdx: index("idx_documents_access_expires_at").on(table.accessExpiresAt),
}));

// Leads table for email capture
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 50 }),
  calculationData: jsonb("calculation_data"),
  
  // Tracking fields
  sessionId: varchar("session_id", { length: 255 }),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  
  // Status
  status: varchar("status", { length: 50 }).default("new"),
  convertedToUser: boolean("converted_to_user").default(false),
  convertedAt: timestamp("converted_at"),
  
  // Airtable sync
  airtableRecordId: varchar("airtable_record_id", { length: 255 }),
  airtableSyncStatus: varchar("airtable_sync_status", { length: 50 }).default("pending"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("idx_leads_email").on(table.email),
  sessionIdx: index("idx_leads_session_id").on(table.sessionId),
  statusIdx: index("idx_leads_status").on(table.status),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
  password: true,
  status: true,
  loginCount: true,
  accountStatus: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  airtableSyncStatus: true,
  industry: true,
  address: true,
});

export const insertCalculationSchema = createInsertSchema(calculations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  taxYear: true,
  calculationMethod: true,
  isLead: true,
  expenses: true,
  pricingAmount: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
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
  status: true,
  sectionsCompleted: true,
  totalSections: true,
  airtableSyncStatus: true,
  makeWebhookSent: true,
  currentSection: true,
  formData: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloadCount: true,
  fileName: true,
  status: true,
  expirationDate: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  convertedToUser: true,
  convertedAt: true,
  airtableSyncStatus: true,
});

// Select types
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Calculation = typeof calculations.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type IntakeForm = typeof intakeForms.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Lead = typeof leads.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertIntakeForm = z.infer<typeof insertIntakeFormSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
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
