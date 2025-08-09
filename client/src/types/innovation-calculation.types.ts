/**
 * @file innovation-calculation.types.ts
 * @description Type definitions for innovation tax credit calculations
 */

export type BusinessType = 
  | 'professional-services'
  | 'ecommerce-retail'
  | 'healthcare-wellness'
  | 'hospitality-restaurant'
  | 'creative-agency'
  | 'technology-services'
  | 'manufacturing-logistics';

export type InnovationActivity = 
  | 'automation-development'
  | 'custom-solution-development'
  | 'integration-engineering'
  | 'process-optimization'
  | 'experimental-implementation'
  | 'digital-transformation'
  | 'proprietary-tool-creation'
  | 'novel-integration-development'
  | 'breakthrough-process-design';

export type InnovationDepth = 'basic' | 'moderate' | 'extensive';

export interface InnovationInput {
  // Business context
  businessType?: BusinessType;
  teamSize?: number;
  
  // Time investment (hours per week)
  leadershipHours?: number;
  technicalHours?: number;
  supportHours?: number;
  
  // Percentage of time on innovation
  innovationPercentage?: number;
  experimentationAllocation?: number;
  
  // External costs (annual)
  contractorInvestment?: number;
  specializedConsulting?: number;
  trainingInvestment?: number;
  
  // Technology costs (annual)
  softwareSubscriptions?: number;
  platformCosts?: number;
  apiIntegrations?: number;
  
  // Infrastructure
  cloudInfrastructure?: number;
  developmentEnvironments?: number;
  testingSystems?: number;
  
  // Innovation profile
  activities: InnovationActivity[];
  innovationDepth: InnovationDepth;
  
  // Optional context
  hasDocumentation?: boolean;
  priorYearConsideration?: boolean;
  biggestChallenge?: string;
  
  // Compensation (optional - we provide defaults)
  averageCompensation?: {
    leadership?: number;
    technical?: number;
    support?: number;
  };
}

export interface ExpenseBreakdown {
  personnelTime: number;
  externalExperts: number;
  technologyTools: number;
  infrastructure: number;
  total: number;
  distribution: {
    personnel: number;
    external: number;
    technology: number;
    infrastructure: number;
  };
}

export interface InnovationResult {
  expenseBreakdown: ExpenseBreakdown;
  federalCredit: number;
  creditRate: number;
  serviceFee: number;
  roi: number;
  insights: string;
  qualifyingActivities: Array<{
    activity: string;
    description: string;
    impact: string;
  }>;
  recommendations: string[];
  timestamp: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Industry-specific presets
export interface IndustryPreset {
  businessType: BusinessType;
  typicalProfile: string;
  commonActivities: InnovationActivity[];
  averageCreditRange: string;
  exampleProjects: string[];
}