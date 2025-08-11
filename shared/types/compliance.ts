// Data protection and compliance types

export enum PrivacyRegulation {
  GDPR = 'gdpr',
  CCPA = 'ccpa',
  HIPAA = 'hipaa',
  COPPA = 'coppa',
  PIPEDA = 'pipeda'
}

export enum DataProcessingPurpose {
  SERVICE_DELIVERY = 'service_delivery',
  LEGAL_COMPLIANCE = 'legal_compliance',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  SECURITY = 'security',
  CUSTOMER_SUPPORT = 'customer_support'
}

export enum ConsentType {
  NECESSARY = 'necessary',
  FUNCTIONAL = 'functional',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing'
}

export interface DataProcessingRecord {
  id: string;
  userId: string;
  purpose: DataProcessingPurpose;
  dataTypes: string[];
  legalBasis: string;
  retentionPeriod: number; // in days
  thirdPartySharing: boolean;
  crossBorderTransfer: boolean;
  timestamp: Date;
  consentId?: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  type: ConsentType;
  granted: boolean;
  timestamp: Date;
  expiresAt?: Date;
  ipAddress: string;
  userAgent: string;
  method: 'explicit' | 'implicit' | 'opt_out';
  purposes: DataProcessingPurpose[];
  version: string; // Privacy policy version
}

export interface PrivacyRequest {
  id: string;
  userId: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestDate: Date;
  completionDate?: Date;
  requestDetails: Record<string, any>;
  responseData?: Record<string, any>;
  verificationMethod: string;
  regulationContext: PrivacyRegulation;
  notes?: string;
}

export interface DataBreachIncident {
  id: string;
  discovered: Date;
  reported: Date;
  type: 'confidentiality' | 'integrity' | 'availability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: number;
  dataTypes: string[];
  description: string;
  rootCause?: string;
  containmentActions: string[];
  notificationRequired: boolean;
  regulatorsNotified: boolean;
  usersNotified: boolean;
  status: 'open' | 'investigating' | 'contained' | 'resolved';
}

export interface ComplianceAuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  dataAccessed: string[];
  purpose: DataProcessingPurpose;
  legalBasis: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  result: 'success' | 'failure' | 'unauthorized';
  details?: Record<string, any>;
}

export interface RetentionSchedule {
  id: string;
  dataType: string;
  legalRequirement?: string;
  businessRequirement?: string;
  retentionPeriod: number; // in days
  disposalMethod: 'delete' | 'anonymize' | 'archive';
  reviewCycle: number; // in days
  lastReview: Date;
  nextReview: Date;
  approvedBy: string;
  status: 'active' | 'suspended' | 'under_review';
}

export interface PrivacyImpactAssessment {
  id: string;
  projectName: string;
  description: string;
  dataTypes: string[];
  processingPurposes: DataProcessingPurpose[];
  thirdParties: string[];
  riskLevel: 'low' | 'medium' | 'high';
  mitigationMeasures: string[];
  completedBy: string;
  completedDate: Date;
  reviewDate: Date;
  status: 'draft' | 'completed' | 'approved' | 'rejected';
  regulatoryConsultation: boolean;
}

export interface DataMapRecord {
  id: string;
  dataElement: string;
  category: 'personal' | 'sensitive' | 'public' | 'internal';
  source: string;
  storage: string[];
  processing: string[];
  retention: number; // in days
  sharing: string[];
  protection: string[];
  lastUpdated: Date;
}

// API request/response types
export interface PrivacyDashboardData {
  consentStats: {
    total: number;
    granted: number;
    declined: number;
    expired: number;
  };
  requestStats: {
    pending: number;
    completed: number;
    overdue: number;
  };
  complianceScore: number;
  dataBreaches: number;
  lastAudit: Date;
}

export interface ConsentManagementRequest {
  userId: string;
  consents: Array<{
    type: ConsentType;
    granted: boolean;
    purposes: DataProcessingPurpose[];
  }>;
}

export interface PrivacyRequestSubmission {
  type: PrivacyRequest['type'];
  requestDetails: Record<string, any>;
  verificationData: {
    email: string;
    additionalInfo?: Record<string, any>;
  };
  regulationContext: PrivacyRegulation;
}

export interface DataExportResponse {
  userId: string;
  exportDate: Date;
  format: 'json' | 'csv' | 'xml';
  data: {
    profile: Record<string, any>;
    calculations: Record<string, any>[];
    documents: Record<string, any>[];
    auditLog: ComplianceAuditLog[];
  };
  metadata: {
    totalRecords: number;
    dataTypes: string[];
    exportVersion: string;
  };
}

// Validation schemas (for use with Zod)
export const privacyRequestSchema = {
  type: ['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'],
  requestDetails: 'object',
  verificationData: {
    email: 'string',
    additionalInfo: 'object?'
  },
  regulationContext: ['gdpr', 'ccpa', 'hipaa', 'coppa', 'pipeda']
};

export const consentRecordSchema = {
  type: ['necessary', 'functional', 'analytics', 'marketing'],
  granted: 'boolean',
  purposes: 'array',
  method: ['explicit', 'implicit', 'opt_out'],
  version: 'string'
};

// Utility types
export type DataSubjectRights = {
  [K in PrivacyRegulation]: Array<PrivacyRequest['type']>;
};

export const DATA_SUBJECT_RIGHTS: DataSubjectRights = {
  [PrivacyRegulation.GDPR]: ['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'],
  [PrivacyRegulation.CCPA]: ['access', 'erasure', 'portability'],
  [PrivacyRegulation.HIPAA]: ['access', 'rectification'],
  [PrivacyRegulation.COPPA]: ['access', 'erasure'],
  [PrivacyRegulation.PIPEDA]: ['access', 'rectification']
};

export interface ComplianceConfiguration {
  applicableRegulations: PrivacyRegulation[];
  consentRequired: ConsentType[];
  retentionDefaults: Record<string, number>;
  dataProcessingPurposes: DataProcessingPurpose[];
  thirdPartySharing: boolean;
  crossBorderTransfers: boolean;
  automatedDecisionMaking: boolean;
  dataProtectionOfficer?: {
    name: string;
    email: string;
    phone?: string;
  };
}