/**
 * @file calculator.service.ts
 * @description R&D Tax Credit calculation service with business logic implementation
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React Query, API Service
 * @knowledgeBase Uses simplified ASC method (14% of QREs) for federal credit calculation
 */

import type { CalculatorExpenses, CalculationResult } from "@shared/schema";

// Additional types for calculator service
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
  popular?: boolean;
  features: string[];
}

// AI-forward business types with smart defaults
export const businessTypes: BusinessType[] = [
  {
    id: "agency",
    name: "Marketing/Creative Agency",
    description: "Custom GPTs, content automation, client solutions",
    icon: "fas fa-palette"
  },
  {
    id: "ecommerce",
    name: "E-commerce/Retail",
    description: "Chatbots, recommendation engines, inventory AI",
    icon: "fas fa-shopping-cart"
  },
  {
    id: "consulting",
    name: "Consulting/Services",
    description: "AI analysis tools, automated reporting, workflows",
    icon: "fas fa-briefcase"
  },
  {
    id: "saas",
    name: "Software/SaaS",
    description: "AI features, integrations, intelligent systems",
    icon: "fas fa-cloud"
  },
  {
    id: "healthcare",
    name: "Healthcare/Wellness",
    description: "Patient chatbots, scheduling AI, data analysis",
    icon: "fas fa-hospital"
  },
  {
    id: "other",
    name: "Other Business",
    description: "Tell us about your AI experiments",
    icon: "fas fa-building"
  }
];

// AI/automation qualifying activities
export const qualifyingActivities: QualifyingActivity[] = [
  {
    id: "custom_gpts",
    title: "Built Custom GPTs or AI Assistants",
    description: "Created specialized AI tools for specific tasks",
    category: "ai"
  },
  {
    id: "prompt_engineering",
    title: "Developed & Tested Prompt Libraries",
    description: "Iteratively improved prompts for consistency",
    category: "ai"
  },
  {
    id: "chatbot_development",
    title: "Created or Refined Chatbots",
    description: "Built conversational AI for business use",
    category: "ai"
  },
  {
    id: "automation_workflows",
    title: "Designed AI-Powered Automations",
    description: "Connected AI to business processes",
    category: "automation"
  },
  {
    id: "data_analysis",
    title: "Built AI Analysis Tools",
    description: "Created tools for data insights",
    category: "ai"
  },
  {
    id: "process_optimization",
    title: "Optimized Processes with AI",
    description: "Improved efficiency through experimentation",
    category: "optimization"
  },
  {
    id: "api_integration",
    title: "Integrated AI APIs & Services",
    description: "Connected OpenAI, Claude, or other AI services",
    category: "integration"
  },
  {
    id: "ml_implementation",
    title: "Implemented Machine Learning Models",
    description: "Trained or deployed ML solutions",
    category: "ai"
  }
];

// Standardized 7-tier pricing structure based on calculated credit amounts
export const pricingTiers: PricingTier[] = [
  {
    tier: 0,
    name: "Micro",
    price: 399,
    creditRange: "Under $5,000",
    features: [
      "Credit calculation",
      "Form 6765 generation", 
      "Basic documentation",
      "Email support"
    ]
  },
  {
    tier: 1,
    name: "Starter",
    price: 500,
    creditRange: "$5,000 - $9,999",
    features: [
      "Everything in Micro",
      "Detailed narratives",
      "Priority support",
      "Multi-year analysis"
    ]
  },
  {
    tier: 2,
    name: "Growth",
    price: 750,
    creditRange: "$10,000 - $19,999",
    popular: true,
    features: [
      "Everything in Starter",
      "Advanced documentation",
      "Audit preparation",
      "Quarterly reviews"
    ]
  },
  {
    tier: 3,
    name: "Professional",
    price: 1000,
    creditRange: "$20,000 - $34,999",
    features: [
      "Everything in Growth",
      "Advanced analytics",
      "Audit support",
      "Dedicated specialist"
    ]
  },
  {
    tier: 4,
    name: "Scale",
    price: 1250,
    creditRange: "$35,000 - $49,999",
    features: [
      "Everything in Professional",
      "Custom consulting",
      "Multi-entity support",
      "Monthly reviews"
    ]
  },
  {
    tier: 5,
    name: "Advanced",
    price: 1500,
    creditRange: "$50,000 - $99,999",
    features: [
      "Everything in Scale",
      "White-glove service",
      "Ongoing compliance",
      "Executive reporting"
    ]
  },
  {
    tier: 6,
    name: "Premium",
    price: 2000,
    creditRange: "$100,000 - $199,999",
    features: [
      "Everything in Advanced",
      "Unlimited consulting",
      "Full audit defense",
      "Custom integration"
    ]
  },
  {
    tier: 7,
    name: "Enterprise",
    price: 2500,
    creditRange: "$200,000+",
    features: [
      "Everything in Premium",
      "White-glove service",
      "Audit defense included",
      "Unlimited support"
    ]
  }
];

/**
 * Calculate R&D Tax Credit using Alternative Simplified Credit (ASC) method
 * Per business rules:
 * - First-time filers (no prior QREs): 6% of current year QREs
 * - With prior QREs: 14% of (QREs - 50% of 3-year average)
 * - Contractor costs limited to 65% per IRC Section 41
 */
export const calculateRDTaxCredit = (
  expenses: CalculatorExpenses, 
  isFirstTimeFiler: boolean = true
): CalculationResult => {
  const { wages, contractors, supplies, cloud } = expenses;
  
  // Apply contractor reduction (65% of contractor costs qualify per IRS)
  const qualifiedContractorCosts = contractors * 0.65;
  
  // Calculate total qualified research expenses
  const totalQRE = wages + supplies + qualifiedContractorCosts + cloud;
  
  // Apply ASC method based on filing history
  // Default to first-time filer (6%) for calculator simplicity
  // Full intake forms will capture prior year data for accurate calculation
  const creditRate = isFirstTimeFiler ? 0.06 : 0.14;
  const federalCredit = totalQRE * creditRate;
  
  // Determine pricing tier based on credit amount
  const pricingTier = getPricingTier(federalCredit);
  
  return {
    totalQRE,
    federalCredit,
    pricingTier: pricingTier.tier,
    pricingAmount: pricingTier.price,
  };
};

/**
 * Determine pricing tier based on calculated federal credit amount
 * Uses standardized 7-tier structure matching calculator engine
 */
export const getPricingTier = (creditAmount: number): PricingTier => {
  if (creditAmount < 5000) return pricingTiers[0];     // Tier 0: Micro (Under $5,000)
  if (creditAmount < 10000) return pricingTiers[1];    // Tier 1: Starter ($5,000-9,999)
  if (creditAmount < 20000) return pricingTiers[2];    // Tier 2: Growth ($10,000-19,999)
  if (creditAmount < 35000) return pricingTiers[3];    // Tier 3: Professional ($20,000-34,999)
  if (creditAmount < 50000) return pricingTiers[4];    // Tier 4: Scale ($35,000-49,999)
  if (creditAmount < 100000) return pricingTiers[5];   // Tier 5: Advanced ($50,000-99,999)
  if (creditAmount < 200000) return pricingTiers[6];   // Tier 6: Premium ($100,000-199,999)
  return pricingTiers[7];  // Tier 7: Enterprise ($200,000+)
};

/**
 * Validate expense inputs to ensure they are valid numbers
 */
export const validateExpenses = (expenses: CalculatorExpenses): string[] => {
  const errors: string[] = [];
  
  if (isNaN(expenses.wages) || expenses.wages < 0) {
    errors.push("Employee wages must be a valid positive number");
  }
  
  if (isNaN(expenses.contractors) || expenses.contractors < 0) {
    errors.push("Contractor costs must be a valid positive number");
  }
  
  if (isNaN(expenses.supplies) || expenses.supplies < 0) {
    errors.push("Supplies cost must be a valid positive number");
  }
  
  if (isNaN(expenses.cloud) || expenses.cloud < 0) {
    errors.push("Cloud services cost must be a valid positive number");
  }
  
  const totalExpenses = expenses.wages + expenses.contractors + expenses.supplies + expenses.cloud;
  if (totalExpenses === 0) {
    errors.push("At least one expense category must be greater than zero");
  }
  
  return errors;
};

/**
 * Format currency values for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format percentage values for display
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Get business type suggestions based on selected activities
 * This helps users choose the most appropriate business category
 */
export const getBusinessTypeSuggestions = (selectedActivities: string[]): BusinessType[] => {
  const suggestions: BusinessType[] = [];
  
  // Logic to suggest business types based on activities
  if (selectedActivities.includes("new_software") || selectedActivities.includes("algorithm_development")) {
    suggestions.push(businessTypes.find(t => t.id === "software")!);
  }
  
  if (selectedActivities.includes("integration_work") || selectedActivities.includes("performance_optimization")) {
    suggestions.push(businessTypes.find(t => t.id === "software")!);
  }
  
  // Add more intelligent suggestions based on activity patterns
  return suggestions.filter((type, index, self) => self.findIndex(t => t.id === type.id) === index);
};

/**
 * Calculate potential state credits (placeholder for future enhancement)
 * Many states offer additional R&D tax credits beyond federal
 */
export const calculateStateCreditEstimate = (federalCredit: number, state?: string): number => {
  // Placeholder implementation - would need state-specific logic
  // California: up to 24% credit
  // New York: up to 9% credit
  // Texas: no state income tax
  
  if (!state) return 0;
  
  const stateMultipliers: { [key: string]: number } = {
    'CA': 0.15, // Rough estimate
    'NY': 0.06,
    'TX': 0,
    'FL': 0,
    'WA': 0,
  };
  
  return federalCredit * (stateMultipliers[state] || 0);
};
