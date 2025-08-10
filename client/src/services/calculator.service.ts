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
    tier: 1,
    name: "Starter",
    price: 500,
    creditRange: "$0 - $4,999",
    features: [
      "Credit calculation",
      "Form 6765 generation", 
      "Basic documentation",
      "Email support"
    ]
  },
  {
    tier: 2,
    name: "Growth",
    price: 700,
    creditRange: "$5,000 - $9,999",
    features: [
      "Everything in Starter",
      "Detailed narratives",
      "Priority support",
      "Multi-year analysis"
    ]
  },
  {
    tier: 3,
    name: "Professional",
    price: 900,
    creditRange: "$10,000 - $19,999",
    popular: true,
    features: [
      "Everything in Growth",
      "Advanced documentation",
      "Audit preparation",
      "Quarterly reviews"
    ]
  },
  {
    tier: 4,
    name: "Scale",
    price: 1200,
    creditRange: "$20,000 - $39,999",
    features: [
      "Everything in Professional",
      "Advanced analytics",
      "Audit support",
      "Dedicated specialist"
    ]
  },
  {
    tier: 5,
    name: "Advanced",
    price: 1500,
    creditRange: "$40,000 - $74,999",
    features: [
      "Everything in Scale",
      "Custom consulting",
      "Multi-entity support",
      "Monthly reviews"
    ]
  },
  {
    tier: 6,
    name: "Premium",
    price: 1800,
    creditRange: "$75,000 - $149,999",
    features: [
      "Everything in Advanced",
      "White-glove service",
      "Ongoing compliance",
      "Executive reporting"
    ]
  },
  {
    tier: 7,
    name: "Enterprise",
    price: 2000,
    creditRange: "$150,000+",
    features: [
      "Everything in Premium",
      "Unlimited consulting",
      "Full audit defense",
      "Custom integration"
    ]
  }
];

/**
 * Calculate R&D Tax Credit using simplified ASC method
 * Federal credit = 14% of qualified research expenses (QREs)
 * Contractor costs are reduced by 35% per IRS guidelines
 */
export const calculateRDTaxCredit = (expenses: CalculatorExpenses): CalculationResult => {
  const { wages, contractors, supplies, cloud } = expenses;
  
  // Apply contractor reduction (65% of contractor costs qualify)
  const qualifiedContractorCosts = contractors * 0.65;
  
  // Calculate total qualified research expenses
  const totalQRE = wages + supplies + qualifiedContractorCosts + cloud;
  
  // Apply simplified ASC method: 14% federal credit rate
  const federalCredit = totalQRE * 0.14;
  
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
  if (creditAmount < 5000) return pricingTiers[0];     // Tier 1: Starter ($0-4,999)
  if (creditAmount < 10000) return pricingTiers[1];    // Tier 2: Growth ($5,000-9,999)
  if (creditAmount < 20000) return pricingTiers[2];    // Tier 3: Professional ($10,000-19,999)
  if (creditAmount < 40000) return pricingTiers[3];    // Tier 4: Scale ($20,000-39,999)
  if (creditAmount < 75000) return pricingTiers[4];    // Tier 5: Advanced ($40,000-74,999)
  if (creditAmount < 150000) return pricingTiers[5];   // Tier 6: Premium ($75,000-149,999)
  return pricingTiers[6];  // Tier 7: Enterprise ($150,000+)
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
