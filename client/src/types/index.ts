export interface CalculatorExpenses {
  wages: number;
  contractors: number;
  supplies: number;
  cloud: number;
}

export interface CalculationResult {
  totalQRE: number;
  federalCredit: number;
  pricingTier: number;
  pricingAmount: number;
}

export interface LeadCaptureData {
  email: string;
  companyName: string;
  phoneNumber: string;
}

export interface BusinessType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface QualifyingActivity {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface PricingTier {
  tier: number;
  name: string;
  price: number;
  creditRange: string;
  features: string[];
  popular?: boolean;
}

export interface CompanyInfo {
  legalName: string;
  ein: string;
  entityType: "llc" | "corp" | "s-corp" | "partnership" | "other";
  industry: string;
  address: string;
}

export interface DashboardData {
  user: {
    id: string;
    email: string;
  };
  calculations: any[];
  companies: any[];
  intakeForms: any[];
  payments: any[];
  summary: {
    estimatedCredit: number;
    hasCompletedPayment: boolean;
    hasIntakeFormInProgress: boolean;
    nextSteps: NextStep[];
  };
}

export interface NextStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "current" | "completed";
  action: string;
}
