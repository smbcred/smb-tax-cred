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
export const supportCategoryEnum = pgEnum("support_category", ["technical", "billing", "general", "calculator", "documentation", "account"]);
export const supportPriorityEnum = pgEnum("support_priority", ["low", "medium", "high", "urgent"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "waiting_customer", "escalated", "resolved", "closed"]);
export const auditActionEnum = pgEnum("audit_action", ["create", "update", "delete", "view", "approve", "reject", "export", "resend_email", "regenerate_doc", "refund"]);

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
  isAdmin: boolean("is_admin").default(false), // Admin flag for RBAC
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
  
  // Refund fields
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundedAt: timestamp("refunded_at"),
  stripeRefundId: varchar("stripe_refund_id", { length: 255 }),
  
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
  calculationData: jsonb("calculation_data"),
  
  // Processing
  submittedAt: timestamp("submitted_at"),
  processingStartedAt: timestamp("processing_started_at"),
  completedAt: timestamp("completed_at"),
  airtableRecordId: varchar("airtable_record_id", { length: 255 }).unique(),
  airtableSyncStatus: varchar("airtable_sync_status", { length: 50 }).default("pending"),
  airtableSyncedAt: timestamp("airtable_synced_at"),
  airtableSyncError: text("airtable_sync_error"),
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
  sha256Hash: varchar("sha256_hash", { length: 64 }),
  
  // Tax year and customer ID for S3 key generation
  taxYear: integer("tax_year").notNull(),
  customerId: varchar("customer_id", { length: 255 }).notNull(),
  
  // Access control
  accessExpiresAt: timestamp("access_expires_at"),
  downloadCount: integer("download_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  
  // Generation metadata
  generatedBy: varchar("generated_by", { length: 50 }), // 'claude', 'documint', 'manual'
  generationTimeMs: integer("generation_time_ms"),
  generationCostCents: integer("generation_cost_cents"),
  generationError: text("generation_error"),
  
  // Compatibility fields
  fileName: varchar("file_name"),
  status: varchar("status", { length: 50 }).default("pending"),
  expirationDate: timestamp("expiration_date"),
  regeneratedAt: timestamp("regenerated_at"), // For admin regeneration tracking
  userEmail: varchar("user_email", { length: 255 }), // For email resend
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  intakeFormIdIdx: index("idx_documents_intake_form_id").on(table.intakeFormId),
  companyIdIdx: index("idx_documents_company_id").on(table.companyId),
  userIdIdx: index("idx_documents_user_id").on(table.userId),
  documentTypeIdx: index("idx_documents_document_type").on(table.documentType),
  accessExpiresIdx: index("idx_documents_access_expires_at").on(table.accessExpiresAt),
}));

// Webhook events table for tracking and logging
export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  source: varchar("source", { length: 50 }).notNull(), // 'make', 'stripe', 'external'
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: jsonb("payload").notNull(),
  signature: varchar("signature", { length: 500 }),
  verified: boolean("verified").default(false),
  processed: boolean("processed").default(false),
  processingError: text("processing_error"),
  
  // Related entities
  intakeFormId: varchar("intake_form_id").references(() => intakeForms.id),
  userId: varchar("user_id").references(() => users.id),
  
  // Processing metadata
  processingStartedAt: timestamp("processing_started_at"),
  processingCompletedAt: timestamp("processing_completed_at"),
  retryCount: integer("retry_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sourceIdx: index("idx_webhook_events_source").on(table.source),
  eventTypeIdx: index("idx_webhook_events_event_type").on(table.eventType),
  processedIdx: index("idx_webhook_events_processed").on(table.processed),
  intakeFormIdIdx: index("idx_webhook_events_intake_form_id").on(table.intakeFormId),
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

// User feedback and testing data
export const userFeedback = pgTable("user_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }), // Anonymous session tracking
  type: varchar("type", { length: 50 }).notNull(), // 'survey', 'widget', 'interview', 'bug_report'
  category: varchar("category", { length: 50 }).notNull(), // 'ux', 'content', 'technical', 'business'
  severity: varchar("severity", { length: 20 }).notNull().default("medium"), // 'critical', 'high', 'medium', 'low'
  page: varchar("page", { length: 255 }), // Page where feedback was given
  feature: varchar("feature", { length: 100 }), // Specific feature being tested
  rating: integer("rating"), // 1-10 satisfaction rating
  npsScore: integer("nps_score"), // 0-10 Net Promoter Score
  title: varchar("title", { length: 255 }),
  description: text("description"),
  tags: jsonb("tags").default(sql`'[]'::jsonb`),
  metadata: jsonb("metadata").$type<{
    userAgent?: string;
    viewport?: { width: number; height: number };
    task?: string;
    timeSpent?: number;
    completionStatus?: 'completed' | 'abandoned' | 'error';
    testingPhase?: 'moderated' | 'unmoderated' | 'ab_test';
    userPersona?: 'business_owner' | 'accountant' | 'startup_founder';
    referenceId?: string;
  }>(),
  status: varchar("status", { length: 20 }).notNull().default("new"), // 'new', 'reviewed', 'in_progress', 'resolved', 'closed'
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // 'critical', 'high', 'medium', 'low'
  assignedTo: varchar("assigned_to", { length: 255 }),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdIdx: index("idx_user_feedback_user_id").on(table.userId),
  sessionIdIdx: index("idx_user_feedback_session_id").on(table.sessionId),
  typeIdx: index("idx_user_feedback_type").on(table.type),
  categoryIdx: index("idx_user_feedback_category").on(table.category),
  severityIdx: index("idx_user_feedback_severity").on(table.severity),
  statusIdx: index("idx_user_feedback_status").on(table.status),
  priorityIdx: index("idx_user_feedback_priority").on(table.priority),
}));

// Testing sessions and participant tracking
export const testingSessions = pgTable("testing_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'moderated', 'unmoderated', 'ab_test'
  phase: varchar("phase", { length: 50 }).notNull(), // 'recruitment', 'scheduled', 'completed', 'analyzed'
  persona: varchar("persona", { length: 50 }).notNull(), // 'business_owner', 'accountant', 'startup_founder'
  scenarios: jsonb("scenarios").default(sql`'[]'::jsonb`),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  completionRate: integer("completion_rate"), // percentage
  satisfactionScore: integer("satisfaction_score"), // 1-10
  npsScore: integer("nps_score"), // 0-10
  recordingUrl: varchar("recording_url", { length: 500 }),
  notes: text("notes"),
  facilitator: varchar("facilitator", { length: 255 }),
  incentivePaid: boolean("incentive_paid").default(false),
  metadata: jsonb("metadata").$type<{
    recruitmentChannel?: string;
    company?: string;
    industry?: string;
    companySize?: string;
    aiToolUsage?: string[];
    technicalSetup?: string;
    issues?: string[];
    keyInsights?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  participantIdIdx: index("idx_testing_sessions_participant_id").on(table.participantId),
  typeIdx: index("idx_testing_sessions_type").on(table.type),
  phaseIdx: index("idx_testing_sessions_phase").on(table.phase),
  personaIdx: index("idx_testing_sessions_persona").on(table.persona),
}));

// Support tickets table
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  category: supportCategoryEnum("category").notNull(),
  priority: supportPriorityEnum("priority").notNull().default("medium"),
  status: ticketStatusEnum("status").notNull().default("open"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  escalatedAt: timestamp("escalated_at"),
  resolvedAt: timestamp("resolved_at"),
  responseTime: integer("response_time"), // minutes
  satisfactionRating: integer("satisfaction_rating"), // 1-5
  metadata: jsonb("metadata").$type<{
    userAgent?: string;
    ipAddress?: string;
    pageUrl?: string;
    sessionId?: string;
    calculationData?: any;
    browserInfo?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_support_tickets_user_id").on(table.userId),
  emailIdx: index("idx_support_tickets_email").on(table.email),
  categoryIdx: index("idx_support_tickets_category").on(table.category),
  priorityIdx: index("idx_support_tickets_priority").on(table.priority),
  statusIdx: index("idx_support_tickets_status").on(table.status),
  assignedToIdx: index("idx_support_tickets_assigned_to").on(table.assignedTo),
}));

// Support ticket updates/responses table
export const supportTicketUpdates = pgTable("support_ticket_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").references(() => supportTickets.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id), // null if from customer
  message: text("message").notNull(),
  isInternal: boolean("is_internal").default(false), // internal note vs customer-visible
  attachments: jsonb("attachments").default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  ticketIdIdx: index("idx_support_ticket_updates_ticket_id").on(table.ticketId),
  userIdIdx: index("idx_support_ticket_updates_user_id").on(table.userId),
  isInternalIdx: index("idx_support_ticket_updates_is_internal").on(table.isInternal),
}));

// Live chat sessions table
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'ended'
  assignedTo: varchar("assigned_to", { length: 255 }),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  metadata: jsonb("metadata").$type<{
    userAgent?: string;
    ipAddress?: string;
    pageUrl?: string;
    sessionId?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_chat_sessions_user_id").on(table.userId),
  statusIdx: index("idx_chat_sessions_status").on(table.status),
  assignedToIdx: index("idx_chat_sessions_assigned_to").on(table.assignedTo),
}));

// Live chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => chatSessions.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id), // null if from customer
  message: text("message").notNull(),
  isAgent: boolean("is_agent").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("idx_chat_messages_session_id").on(table.sessionId),
  userIdIdx: index("idx_chat_messages_user_id").on(table.userId),
  timestampIdx: index("idx_chat_messages_timestamp").on(table.timestamp),
}));

// Admin audit logs table for tracking administrative actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").references(() => users.id).notNull(),
  action: auditActionEnum("action").notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(), // 'user', 'company', 'document', etc.
  entityId: varchar("entity_id").notNull(),
  before: jsonb("before"), // Previous state (for updates/deletes)
  after: jsonb("after"), // New state (for creates/updates)
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  reason: text("reason"), // Admin's reason for the action
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  adminUserIdIdx: index("idx_audit_logs_admin_user_id").on(table.adminUserId),
  actionIdx: index("idx_audit_logs_action").on(table.action),
  entityTypeIdx: index("idx_audit_logs_entity_type").on(table.entityType),
  entityIdIdx: index("idx_audit_logs_entity_id").on(table.entityId),
  createdAtIdx: index("idx_audit_logs_created_at").on(table.createdAt),
}));

// Webhook logs table for tracking incoming webhooks
export const webhookLogs = pgTable("webhook_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  source: varchar("source", { length: 50 }).notNull(), // 'stripe', 'sendgrid', 'documint', etc.
  status: varchar("status", { length: 20 }).notNull(), // 'success', 'error', 'pending'
  event: varchar("event", { length: 100 }).notNull(),
  payloadSha256: varchar("payload_sha256", { length: 64 }).notNull(), // Hash for security
  responseCode: integer("response_code"),
  processingTimeMs: integer("processing_time_ms"),
  errorMessage: text("error_message"),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sourceIdx: index("idx_webhook_logs_source").on(table.source),
  statusIdx: index("idx_webhook_logs_status").on(table.status),
  eventIdx: index("idx_webhook_logs_event").on(table.event),
  createdAtIdx: index("idx_webhook_logs_created_at").on(table.createdAt),
}));

// Insert schemas
export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verified: true,
  processed: true,
  retryCount: true,
});



export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  priority: true,
  resolvedAt: true,
});

export const insertTestingSessionSchema = createInsertSchema(testingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  incentivePaid: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  responseTime: true,
  escalatedAt: true,
  resolvedAt: true,
});

export const insertSupportTicketUpdateSchema = createInsertSchema(supportTicketUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  startedAt: true,
  endedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
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

// Admin-specific schemas
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({
  id: true,
  createdAt: true,
});



// Workflow triggers table for tracking Make.com workflow executions
export const workflowTriggers = pgTable("workflow_triggers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  intakeFormId: varchar("intake_form_id").notNull().references(() => intakeForms.id),
  airtableRecordId: varchar("airtable_record_id", { length: 255 }),
  
  // Workflow execution details
  workflowId: varchar("workflow_id", { length: 255 }), // Make.com scenario ID
  workflowName: varchar("workflow_name", { length: 255 }).default("document_generation"),
  webhookUrl: text("webhook_url"), // Make.com webhook URL
  
  // Payload and response tracking
  triggerPayload: jsonb("trigger_payload").notNull(),
  responseData: jsonb("response_data"),
  
  // Status and timing
  status: varchar("status", { length: 50 }).default("pending"), // pending, triggered, completed, failed, timeout
  triggeredAt: timestamp("triggered_at"),
  completedAt: timestamp("completed_at"),
  timeoutAt: timestamp("timeout_at"),
  
  // Retry handling
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  nextRetryAt: timestamp("next_retry_at"),
  lastError: text("last_error"),
  
  // Make.com execution tracking
  makeExecutionId: varchar("make_execution_id", { length: 255 }),
  makeScenarioId: varchar("make_scenario_id", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  intakeFormIdIdx: index("idx_workflow_triggers_intake_form_id").on(table.intakeFormId),
  statusIdx: index("idx_workflow_triggers_status").on(table.status),
  nextRetryIdx: index("idx_workflow_triggers_next_retry_at").on(table.nextRetryAt),
  airtableRecordIdIdx: index("idx_workflow_triggers_airtable_record_id").on(table.airtableRecordId),
}));

export const insertWorkflowTriggerSchema = createInsertSchema(workflowTriggers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  retryCount: true,
  triggeredAt: true,
  completedAt: true,
});

// Webhook payload validation schemas
export const makeWebhookPayloadSchema = z.object({
  eventType: z.enum(['form_submitted', 'document_generated', 'processing_completed', 'processing_failed']),
  timestamp: z.string(),
  data: z.object({
    formId: z.string().optional(),
    userId: z.string().optional(),
    companyId: z.string().optional(),
    documentId: z.string().optional(),
    status: z.string().optional(),
    error: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

// Workflow trigger payload schema
// Claude API schemas
export const claudeRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  systemPrompt: z.string().optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
  temperature: z.number().min(0).max(1).optional(),
  metadata: z.record(z.any()).optional(),
});

export const claudeResponseSchema = z.object({
  content: z.string(),
  tokensUsed: z.object({
    input: z.number(),
    output: z.number(),
    total: z.number(),
  }),
  model: z.string(),
  finishReason: z.string(),
  usage: z.object({
    inputTokens: z.number(),
    outputTokens: z.number(),
  }).optional(),
});

export const claudeErrorSchema = z.object({
  type: z.enum(['authentication', 'rate_limit', 'invalid_request', 'api_error', 'network_error']),
  message: z.string(),
  code: z.string().optional(),
  retryAfter: z.number().optional(),
});

export const workflowTriggerPayloadSchema = z.object({
  intakeFormId: z.string(),
  airtableRecordId: z.string().optional(),
  companyInfo: z.object({
    name: z.string(),
    ein: z.string().optional(),
    industry: z.string().optional(),
    address: z.string().optional(),
  }),
  rdActivities: z.array(z.object({
    description: z.string(),
    category: z.string(),
    timeframe: z.string(),
    employees: z.number().optional(),
  })),
  expenses: z.object({
    wages: z.number(),
    contractors: z.number(),
    supplies: z.number(),
    other: z.number(),
    total: z.number(),
  }),
  metadata: z.object({
    formVersion: z.string().optional(),
    submissionDate: z.string(),
    priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
  }),
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
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type WorkflowTrigger = typeof workflowTriggers.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertIntakeForm = z.infer<typeof insertIntakeFormSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type InsertWorkflowTrigger = z.infer<typeof insertWorkflowTriggerSchema>;
export type MakeWebhookPayload = z.infer<typeof makeWebhookPayloadSchema>;
export type WorkflowTriggerPayload = z.infer<typeof workflowTriggerPayloadSchema>;
export type ClaudeRequest = z.infer<typeof claudeRequestSchema>;
export type ClaudeResponse = z.infer<typeof claudeResponseSchema>;
export type ClaudeError = z.infer<typeof claudeErrorSchema>;

// Narrative prompt schemas
export const companyContextSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  employeeCount: z.number().min(1, "Employee count must be positive"),
  yearFounded: z.number().min(1800).max(new Date().getFullYear()).optional(),
  businessType: z.enum(['corporation', 'llc', 'partnership', 'sole_proprietorship']),
  taxYear: z.number().min(2000).max(new Date().getFullYear() + 1),
});

export const rdActivitySchema = z.object({
  activity: z.string().min(1, "Activity name is required"),
  description: z.string().min(10, "Activity description must be at least 10 characters"),
  timeSpent: z.number().min(0, "Time spent must be non-negative"),
  category: z.enum(['experimentation', 'testing', 'analysis', 'development', 'evaluation']),
});

export const projectContextSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().min(50, "Project description must be at least 50 characters"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid start date format"),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid end date format"),
  totalExpenses: z.number().min(0, "Total expenses must be non-negative"),
  wageExpenses: z.number().min(0, "Wage expenses must be non-negative"),
  contractorExpenses: z.number().min(0, "Contractor expenses must be non-negative"),
  supplyExpenses: z.number().min(0, "Supply expenses must be non-negative"),
  uncertainties: z.array(z.string().min(10, "Uncertainty description must be at least 10 characters")),
  technicalChallenges: z.array(z.string().min(10, "Technical challenge description must be at least 10 characters")),
  innovations: z.array(z.string().min(10, "Innovation description must be at least 10 characters")),
  businessPurpose: z.string().min(20, "Business purpose must be at least 20 characters"),
  rdActivities: z.array(rdActivitySchema),
});

export const narrativeOptionsSchema = z.object({
  length: z.enum(['brief', 'standard', 'detailed']).default('standard'),
  tone: z.enum(['professional', 'technical', 'formal']).default('professional'),
  focus: z.enum(['compliance', 'technical', 'business']).default('compliance'),
  includeMetrics: z.boolean().default(true),
  includeTimeline: z.boolean().default(true),
  emphasizeInnovation: z.boolean().default(true),
});

export const narrativeRequestSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  companyContext: companyContextSchema,
  projectContext: projectContextSchema,
  options: narrativeOptionsSchema.optional(),
});

export const narrativeTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  userPrompt: z.string(),
  variables: z.array(z.string()),
  maxTokens: z.number(),
  temperature: z.number(),
  complianceLevel: z.enum(['high', 'medium', 'low']),
});

export const generatedNarrativeSchema = z.object({
  content: z.string(),
  wordCount: z.number(),
  tokensUsed: z.number(),
  complianceScore: z.number(),
  templateUsed: z.string(),
  variables: z.record(z.any()),
  metadata: z.object({
    generatedAt: z.string(),
    version: z.string(),
    model: z.string(),
  }),
});

export type CompanyContext = z.infer<typeof companyContextSchema>;
export type ProjectContext = z.infer<typeof projectContextSchema>;
export type NarrativeOptions = z.infer<typeof narrativeOptionsSchema>;
export type NarrativeRequest = z.infer<typeof narrativeRequestSchema>;
export type NarrativeTemplate = z.infer<typeof narrativeTemplateSchema>;
export type GeneratedNarrative = z.infer<typeof generatedNarrativeSchema>;
export type RdActivity = z.infer<typeof rdActivitySchema>;

// Compliance memo schemas
export const riskFactorSchema = z.object({
  factor: z.string(),
  risk: z.enum(['low', 'medium', 'high']),
  description: z.string(),
  mitigation: z.string(),
});

export const riskAssessmentSchema = z.object({
  overallRisk: z.enum(['low', 'medium', 'high']),
  riskFactors: z.array(riskFactorSchema),
  recommendations: z.array(z.string()),
  documentationGaps: z.array(z.string()),
});

export const testSectionSchema = z.object({
  score: z.number().min(0).max(100),
  evidence: z.array(z.string()),
  gaps: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const fourPartTestAnalysisSchema = z.object({
  technologicalInformation: testSectionSchema,
  businessComponent: testSectionSchema,
  uncertainty: testSectionSchema,
  experimentation: testSectionSchema,
  overallScore: z.number().min(0).max(100),
});

export const qreJustificationSchema = z.object({
  wageExpenses: z.object({
    amount: z.number(),
    justification: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    supportingDocuments: z.array(z.string()),
  }),
  contractorExpenses: z.object({
    amount: z.number(),
    justification: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    supportingDocuments: z.array(z.string()),
    sixtyfivePercentLimit: z.boolean(),
  }),
  supplyExpenses: z.object({
    amount: z.number(),
    justification: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    supportingDocuments: z.array(z.string()),
  }),
  totalQRE: z.number(),
  complianceNotes: z.array(z.string()),
});

export const complianceMemoRequestSchema = z.object({
  companyContext: z.object({
    companyName: z.string().min(1, "Company name is required"),
    taxYear: z.number().min(2000).max(new Date().getFullYear() + 1),
    industry: z.string().min(1, "Industry is required"),
    businessType: z.enum(['corporation', 'llc', 'partnership', 'sole_proprietorship']),
  }),
  projectContext: z.object({
    projectName: z.string().min(1, "Project name is required"),
    projectDescription: z.string().min(50, "Project description must be at least 50 characters"),
    rdActivities: z.array(rdActivitySchema),
    technicalChallenges: z.array(z.string().min(10, "Technical challenge must be at least 10 characters")),
    uncertainties: z.array(z.string().min(10, "Uncertainty must be at least 10 characters")),
    innovations: z.array(z.string().min(10, "Innovation must be at least 10 characters")),
    businessPurpose: z.string().min(20, "Business purpose must be at least 20 characters"),
  }),
  expenseContext: z.object({
    totalExpenses: z.number().min(0, "Total expenses must be non-negative"),
    wageExpenses: z.number().min(0, "Wage expenses must be non-negative"),
    contractorExpenses: z.number().min(0, "Contractor expenses must be non-negative"),
    supplyExpenses: z.number().min(0, "Supply expenses must be non-negative"),
    expenseBreakdown: z.array(z.object({
      category: z.string(),
      amount: z.number(),
      description: z.string(),
    })).optional(),
  }),
  memoOptions: z.object({
    includeRiskAssessment: z.boolean().default(true),
    includeFourPartTest: z.boolean().default(true),
    includeQREAnalysis: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
    detailLevel: z.enum(['summary', 'standard', 'comprehensive']).default('standard'),
  }),
});

export const complianceMemoSchema = z.object({
  id: z.string(),
  companyName: z.string(),
  projectName: z.string(),
  taxYear: z.number(),
  generatedAt: z.string(),
  memoContent: z.string(),
  riskAssessment: riskAssessmentSchema,
  fourPartTestAnalysis: fourPartTestAnalysisSchema,
  qreJustification: qreJustificationSchema,
  overallCompliance: z.object({
    score: z.number().min(0).max(100),
    level: z.enum(['low', 'medium', 'high']),
    summary: z.string(),
  }),
  recommendations: z.array(z.string()),
  documentationRequirements: z.array(z.string()),
  disclaimers: z.array(z.string()),
});

export type RiskFactor = z.infer<typeof riskFactorSchema>;
export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;
export type TestSection = z.infer<typeof testSectionSchema>;
export type FourPartTestAnalysis = z.infer<typeof fourPartTestAnalysisSchema>;
export type QREJustification = z.infer<typeof qreJustificationSchema>;
export type ComplianceMemoRequest = z.infer<typeof complianceMemoRequestSchema>;
export type ComplianceMemo = z.infer<typeof complianceMemoSchema>;

// Document orchestrator schemas
export const documentJobProgressSchema = z.object({
  currentStep: z.string(),
  completedSteps: z.array(z.string()),
  totalSteps: z.number(),
  percentage: z.number().min(0).max(100),
});

export const documentServiceStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  result: z.any().optional(),
  error: z.string().optional(),
});

export const documentJobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'timeout']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  createdAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  estimatedDuration: z.number().optional(),
  actualDuration: z.number().optional(),
  progress: documentJobProgressSchema,
  services: z.object({
    narrative: documentServiceStatusSchema,
    complianceMemo: documentServiceStatusSchema,
    pdfGeneration: documentServiceStatusSchema,
  }),
  request: z.any(),
  result: z.any().optional(),
  errors: z.array(z.object({
    service: z.string(),
    error: z.string(),
    timestamp: z.string(),
    retryCount: z.number().default(0),
  })),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  timeoutMs: z.number().default(300000),
});

export const documentGenerationRequestSchema = z.object({
  companyContext: z.object({
    companyName: z.string().min(1, "Company name is required"),
    taxYear: z.number().min(2000).max(new Date().getFullYear() + 1),
    industry: z.string().min(1, "Industry is required"),
    businessType: z.enum(['corporation', 'llc', 'partnership', 'sole_proprietorship']),
  }),
  projectContext: z.object({
    projectName: z.string().min(1, "Project name is required"),
    projectDescription: z.string().min(50, "Project description must be at least 50 characters"),
    rdActivities: z.array(rdActivitySchema),
    technicalChallenges: z.array(z.string().min(10, "Technical challenge must be at least 10 characters")),
    uncertainties: z.array(z.string().min(10, "Uncertainty must be at least 10 characters")),
    innovations: z.array(z.string().min(10, "Innovation must be at least 10 characters")),
    businessPurpose: z.string().min(20, "Business purpose must be at least 20 characters"),
  }),
  expenseContext: z.object({
    totalExpenses: z.number().min(0, "Total expenses must be non-negative"),
    wageExpenses: z.number().min(0, "Wage expenses must be non-negative"),
    contractorExpenses: z.number().min(0, "Contractor expenses must be non-negative"),
    supplyExpenses: z.number().min(0, "Supply expenses must be non-negative"),
  }),
  documentOptions: z.object({
    includeNarrative: z.boolean().default(true),
    includeComplianceMemo: z.boolean().default(true),
    includePDF: z.boolean().default(true),
    narrativeTemplate: z.string().default('technical_narrative'),
    narrativeOptions: z.object({
      length: z.enum(['brief', 'standard', 'detailed']).default('standard'),
      tone: z.enum(['professional', 'technical', 'formal']).default('professional'),
      focus: z.enum(['compliance', 'technical', 'business']).default('compliance'),
    }),
    memoOptions: z.object({
      includeRiskAssessment: z.boolean().default(true),
      includeFourPartTest: z.boolean().default(true),
      includeQREAnalysis: z.boolean().default(true),
      detailLevel: z.enum(['summary', 'standard', 'comprehensive']).default('standard'),
    }),
  }),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

export const documentGenerationResultSchema = z.object({
  narrative: z.any().optional(),
  complianceMemo: z.any().optional(),
  pdfUrl: z.string().optional(),
  summary: z.object({
    totalDocuments: z.number(),
    generatedAt: z.string(),
    processingTime: z.number(),
    complianceScore: z.number().optional(),
    estimatedCredit: z.number().optional(),
  }),
});

export type DocumentJobProgress = z.infer<typeof documentJobProgressSchema>;
export type DocumentServiceStatus = z.infer<typeof documentServiceStatusSchema>;
export type DocumentJob = z.infer<typeof documentJobSchema>;
export type DocumentGenerationRequest = z.infer<typeof documentGenerationRequestSchema>;
export type DocumentGenerationResult = z.infer<typeof documentGenerationResultSchema>;

// PDF generation schemas
export const form6765DataSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  ein: z.string().optional(),
  taxYear: z.number().min(2000).max(new Date().getFullYear() + 1),
  businessType: z.enum(['corporation', 'llc', 'partnership', 'sole_proprietorship']),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  currentYearExpenses: z.object({
    wages: z.number().min(0),
    contractors: z.number().min(0),
    supplies: z.number().min(0),
    total: z.number().min(0),
  }),
  priorYearData: z.array(z.object({
    year: z.number(),
    expenses: z.number().min(0),
  })).optional(),
  rdActivities: z.array(z.object({
    activity: z.string(),
    description: z.string(),
    hours: z.number().min(0),
    wages: z.number().min(0),
    category: z.enum(['experimentation', 'testing', 'analysis', 'development', 'evaluation']),
  })),
  technicalChallenges: z.array(z.string()),
  uncertainties: z.array(z.string()),
  innovations: z.array(z.string()),
  businessPurpose: z.string(),
  calculations: z.object({
    totalQualifiedExpenses: z.number(),
    averageGrossReceipts: z.number().optional(),
    ascPercentage: z.number(),
    baseAmount: z.number(),
    creditAmount: z.number(),
    riskLevel: z.enum(['low', 'medium', 'high']),
  }),
  attachments: z.object({
    narrativeContent: z.string().optional(),
    complianceMemo: z.string().optional(),
    supportingDocuments: z.array(z.string()).optional(),
  }).optional(),
});

export const pdfGenerationRequestSchema = z.object({
  templateId: z.string(),
  data: form6765DataSchema,
  options: z.object({
    format: z.enum(['pdf', 'docx']).default('pdf'),
    quality: z.enum(['draft', 'standard', 'high']).default('standard'),
    includeAttachments: z.boolean().default(true),
    watermark: z.boolean().default(false),
  }).optional(),
});

export const pdfGenerationResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  downloadUrl: z.string().optional(),
  previewUrl: z.string().optional(),
  metadata: z.object({
    pages: z.number().optional(),
    size: z.number().optional(),
    format: z.string().optional(),
    generatedAt: z.string().optional(),
  }).optional(),
  errors: z.array(z.string()).optional(),
});

export const pdfQualityVerificationSchema = z.object({
  isValid: z.boolean(),
  issues: z.array(z.string()),
  score: z.number().min(0).max(100),
});

export type Form6765Data = z.infer<typeof form6765DataSchema>;
export type PDFGenerationRequest = z.infer<typeof pdfGenerationRequestSchema>;
export type PDFGenerationResponse = z.infer<typeof pdfGenerationResponseSchema>;
export type PDFQualityVerification = z.infer<typeof pdfQualityVerificationSchema>;

// S3 storage schemas
export const s3UploadRequestSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().min(1, "File size must be greater than 0").max(50 * 1024 * 1024, "File size must be less than 50MB"),
  documentType: z.enum(['narrative', 'compliance_memo', 'pdf_form', 'supporting_document', 'calculation']),
  calculationId: z.string().optional(),
  jobId: z.string().optional(),
});

export const s3UploadResponseSchema = z.object({
  uploadUrl: z.string(),
  key: z.string(),
  downloadUrl: z.string(),
  expiresAt: z.string(),
  metadata: z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    documentType: z.string(),
  }),
});

export const s3FileMetadataSchema = z.object({
  key: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  documentType: z.string(),
  userId: z.string(),
  calculationId: z.string().optional(),
  jobId: z.string().optional(),
  uploadedAt: z.string(),
  lastModified: z.string(),
  downloadUrl: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const s3StorageStatsSchema = z.object({
  totalFiles: z.number(),
  totalSize: z.number(),
  filesByType: z.record(z.string(), z.number()),
  sizeByType: z.record(z.string(), z.number()),
});

export const s3BatchUploadRequestSchema = z.object({
  calculationId: z.string(),
  documents: z.array(z.object({
    fileName: z.string(),
    fileType: z.string(),
    documentType: s3UploadRequestSchema.shape.documentType,
    fileData: z.string(), // base64 encoded file data
  })),
});

export type S3UploadRequest = z.infer<typeof s3UploadRequestSchema>;
export type S3UploadResponse = z.infer<typeof s3UploadResponseSchema>;
export type S3FileMetadata = z.infer<typeof s3FileMetadataSchema>;
export type S3StorageStats = z.infer<typeof s3StorageStatsSchema>;
export type S3BatchUploadRequest = z.infer<typeof s3BatchUploadRequestSchema>;

// Download system schemas
export const downloadRequestSchema = z.object({
  fileKeys: z.array(z.string().min(1, "File key is required")),
  downloadType: z.enum(['single', 'zip']),
  expiresIn: z.number().min(60).max(24 * 60 * 60).default(3600), // 1 minute to 24 hours
  trackingEnabled: z.boolean().default(true),
  compressionLevel: z.number().min(0).max(9).default(6),
});

export const downloadResponseSchema = z.object({
  downloadToken: z.string(),
  downloadUrl: z.string(),
  expiresAt: z.string(),
  fileCount: z.number(),
  estimatedSize: z.number(),
  downloadType: z.enum(['single', 'zip']),
  trackingId: z.string(),
});

export const downloadTrackingSchema = z.object({
  trackingId: z.string(),
  downloadToken: z.string(),
  userId: z.string(),
  fileKeys: z.array(z.string()),
  downloadType: z.enum(['single', 'zip']),
  fileCount: z.number(),
  totalSize: z.number(),
  downloadedSize: z.number().default(0),
  downloadedAt: z.string().optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  status: z.enum(['pending', 'started', 'completed', 'failed', 'expired']).default('pending'),
  errorMessage: z.string().optional(),
});

export const downloadStatsSchema = z.object({
  totalDownloads: z.number(),
  totalSize: z.number(),
  downloadsByType: z.record(z.string(), z.number()),
  downloadsByDay: z.array(z.object({
    date: z.string(),
    count: z.number(),
    size: z.number(),
  })),
  topFiles: z.array(z.object({
    fileKey: z.string(),
    fileName: z.string(),
    downloadCount: z.number(),
    lastDownloaded: z.string(),
  })),
});

export type DownloadRequest = z.infer<typeof downloadRequestSchema>;
export type DownloadResponse = z.infer<typeof downloadResponseSchema>;
export type DownloadTracking = z.infer<typeof downloadTrackingSchema>;
export type DownloadStats = z.infer<typeof downloadStatsSchema>;

// Email notification schemas
export const emailNotificationRequestSchema = z.object({
  recipientEmail: z.string().email("Valid email address is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  templateType: z.enum(['document_ready', 'calculation_complete', 'compliance_memo_ready', 'download_ready', 'welcome', 'payment_confirmation']),
  templateData: z.record(z.any()).default({}),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  scheduledAt: z.string().optional(),
  trackingEnabled: z.boolean().default(true),
  unsubscribeEnabled: z.boolean().default(true),
});

export const emailDeliveryStatusSchema = z.object({
  notificationId: z.string(),
  messageId: z.string().optional(),
  status: z.enum(['queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'unsubscribed']),
  recipientEmail: z.string().email(),
  sentAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  openedAt: z.string().optional(),
  clickedAt: z.string().optional(),
  bouncedAt: z.string().optional(),
  failedAt: z.string().optional(),
  errorMessage: z.string().optional(),
  bounceType: z.enum(['soft', 'hard', 'block', 'spam']).optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export const emailStatsSchema = z.object({
  totalSent: z.number(),
  totalDelivered: z.number(),
  totalOpened: z.number(),
  totalClicked: z.number(),
  totalBounced: z.number(),
  totalFailed: z.number(),
  deliveryRate: z.number(),
  openRate: z.number(),
  clickRate: z.number(),
  bounceRate: z.number(),
  recentActivity: z.array(z.object({
    date: z.string(),
    sent: z.number(),
    delivered: z.number(),
    opened: z.number(),
    clicked: z.number(),
  })),
});

export type EmailNotificationRequest = z.infer<typeof emailNotificationRequestSchema>;
export type EmailDeliveryStatus = z.infer<typeof emailDeliveryStatusSchema>;
export type EmailStats = z.infer<typeof emailStatsSchema>;

// Form progress types
export type FormSection = z.infer<typeof formSectionSchema>;
export type FormProgress = z.infer<typeof formProgressSchema>;

// Form progress and multi-step validation schemas
export const formSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  isCompleted: z.boolean(),
  isValid: z.boolean(),
  currentStep: z.number().optional(),
  totalSteps: z.number().optional(),
});

export const formProgressSchema = z.object({
  currentSection: z.string(),
  sections: z.array(formSectionSchema),
  overallProgress: z.number().min(0).max(100),
  isAutoSaving: z.boolean().default(false),
  lastSavedAt: z.string().nullable(),
});

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
  entityType: z.enum(["llc", "corp", "s-corp", "partnership", "sole-proprietorship", "other"]),
  industry: z.string().min(1, "Industry is required"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "ZIP code must be in format 12345 or 12345-6789"),
  }),
  yearFounded: z.number().min(1800, "Year founded must be valid").max(new Date().getFullYear(), "Year founded cannot be in the future"),
  naicsCode: z.string().optional(),
  naicsDescription: z.string().optional(),
  phone: z.string().min(10, "Phone number is required"),
  website: z.string().url("Website must be a valid URL").optional().or(z.literal("")),
});

export const rdProjectSchema = z.object({
  id: z.string().optional(),
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().min(50, "Project description must be at least 50 characters"),
  technicalChallenges: z.string().min(50, "Technical challenges must be at least 50 characters"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date is required"),
  successCriteria: z.string().min(30, "Success criteria must be at least 30 characters"),
  // Four-part test alignment
  businessPurpose: z.string().min(30, "Business purpose must be at least 30 characters"),
  technicalUncertainty: z.string().min(30, "Technical uncertainty must be at least 30 characters"),
  processOfExperimentation: z.string().min(30, "Process of experimentation must be at least 30 characters"),
  technologicalNature: z.string().min(30, "Technological nature must be at least 30 characters"),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Employee expense validation schema
export const employeeExpenseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Employee name is required'),
  role: z.string().min(1, 'Role is required'),
  annualSalary: z.number().min(0, 'Salary must be positive'),
  rdTimePercentage: z.number().min(0, 'R&D time must be at least 0%').max(100, 'R&D time cannot exceed 100%'),
  benefitsRate: z.number().min(0, 'Benefits rate must be positive').max(100, 'Benefits rate cannot exceed 100%'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Contractor expense validation schema
export const contractorExpenseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Contractor name is required'),
  type: z.string().min(1, 'Contractor type is required'),
  totalCost: z.number().min(0, 'Total cost must be positive'),
  rdTimePercentage: z.number().min(0, 'R&D time must be at least 0%').max(100, 'R&D time cannot exceed 100%'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Supply expense validation schema
export const supplyExpenseSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  totalCost: z.number().min(0, 'Total cost must be positive'),
  rdAllocation: z.number().min(0, 'R&D allocation must be at least 0%').max(100, 'R&D allocation cannot exceed 100%'),
  vendor: z.string().optional(),
  purchaseDate: z.string().optional(),
});

// Software expense validation schema
export const softwareExpenseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Software name is required'),
  category: z.string().min(1, 'Category is required'),
  monthlyCost: z.number().min(0, 'Monthly cost must be positive'),
  rdAllocation: z.number().min(0, 'R&D allocation must be at least 0%').max(100, 'R&D allocation cannot exceed 100%'),
  description: z.string().optional(),
  vendor: z.string().optional(),
});

// Supporting information validation schema
export const supportingInfoSchema = z.object({
  hasPreviousClaims: z.boolean(),
  previousClaimYears: z.array(z.string()).optional(),
  previousClaimAmounts: z.record(z.string(), z.number().min(0)).optional(),
  grossReceipts: z.number().min(0, 'Gross receipts must be positive'),
  isQualifiedSmallBusiness: z.boolean(),
  payrollTaxElection: z.enum(['none', 'fica', 'futa']).optional(),
  documentationTypes: z.array(z.string()),
  additionalNotes: z.string().optional(),
});

// Complete intake form submission schema
export const intakeFormSubmissionSchema = z.object({
  companyInfo: companyInfoSchema,
  rdProjects: z.array(rdProjectSchema).min(1, 'At least one R&D project is required'),
  employeeExpenses: z.array(employeeExpenseSchema),
  contractorExpenses: z.array(contractorExpenseSchema),
  supplyExpenses: z.array(supplyExpenseSchema),
  softwareExpenses: z.array(softwareExpenseSchema),
  supportingInfo: supportingInfoSchema,
});

export const rdActivitiesSchema = z.object({
  projects: z.array(rdProjectSchema).min(1, "At least one R&D project is required"),
  overallObjectives: z.string().min(50, "Overall R&D objectives must be at least 50 characters"),
  aiToolsUsed: z.array(z.string()).optional(),
  rdMethodology: z.string().min(50, "R&D methodology must be at least 50 characters"),
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

// Dashboard API response schema
export const dashboardResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    phone: z.string().nullable(),
    status: z.string(),
    createdAt: z.string(),
    lastLoginAt: z.string().nullable(),
    loginCount: z.number(),
  }),
  companies: z.array(z.object({
    id: z.string(),
    legalName: z.string(),
    ein: z.string().nullable(),
    entityType: z.string().nullable(),
    industry: z.string().nullable(),
    address: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
  calculations: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    federalCredit: z.string(),
    totalQRE: z.string(),
    pricingTier: z.number(),
    pricingAmount: z.string(),
    createdAt: z.string(),
  })),
  payments: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    calculationId: z.string().nullable(),
    amount: z.string(),
    status: z.string(),
    stripePaymentIntentId: z.string().nullable(),
    createdAt: z.string(),
  })),
  intakeForms: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    companyId: z.string(),
    taxYear: z.number(),
    status: z.string(),
    currentSection: z.string(),
    completionPercentage: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
  documents: z.array(z.object({
    id: z.string(),
    intakeFormId: z.string(),
    documentType: z.string(),
    status: z.string(),
    fileName: z.string().nullable(),
    downloadCount: z.number(),
    createdAt: z.string(),
  })),
  summary: z.object({
    estimatedCredit: z.number(),
    hasCompletedPayment: z.boolean(),
    hasIntakeFormInProgress: z.boolean(),
    documentsGenerated: z.number(),
    nextSteps: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      status: z.enum(["pending", "current", "completed"]),
      action: z.string(),
      estimatedMinutes: z.number().optional(),
    })),
    progressStats: z.object({
      totalSections: z.number(),
      completedSections: z.number(),
      completionPercentage: z.number(),
      estimatedTimeRemaining: z.number(), // in minutes
    }),
  }),
  lastUpdated: z.string(),
});

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
