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

// Business types with corresponding icons and descriptions
export const businessTypes: BusinessType[] = [
  {
    id: "software",
    name: "Software Development",
    description: "Custom software, SaaS, mobile apps",
    icon: "fas fa-laptop-code"
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Online retail, marketplaces",
    icon: "fas fa-shopping-cart"
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    description: "Product development, process improvement",
    icon: "fas fa-industry"
  },
  {
    id: "biotech",
    name: "Biotechnology",
    description: "Life sciences, medical research",
    icon: "fas fa-dna"
  },
  {
    id: "fintech",
    name: "Financial Technology",
    description: "Payment systems, trading platforms",
    icon: "fas fa-coins"
  },
  {
    id: "other",
    name: "Other Business",
    description: "Tell us more about your industry",
    icon: "fas fa-building"
  }
];

// Qualifying activities for R&D tax credit
export const qualifyingActivities: QualifyingActivity[] = [
  {
    id: "new_software",
    title: "Developed new software or applications",
    description: "Creating new functionality, features, or systems",
    category: "development"
  },
  {
    id: "process_improvement",
    title: "Improved existing processes or products",
    description: "Enhancing performance, efficiency, or capability",
    category: "improvement"
  },
  {
    id: "new_technology",
    title: "Experimented with new technologies",
    description: "Testing and implementing new technical approaches",
    category: "research"
  },
  {
    id: "technical_challenges",
    title: "Overcame technical challenges",
    description: "Solving complex technical problems or uncertainties",
    category: "problem-solving"
  },
  {
    id: "algorithm_development",
    title: "Developed new algorithms or methods",
    description: "Creating innovative computational or business methods",
    category: "development"
  },
  {
    id: "integration_work",
    title: "System integration and compatibility work",
    description: "Connecting disparate systems or ensuring compatibility",
    category: "integration"
  },
  {
    id: "performance_optimization",
    title: "Performance optimization and scaling",
    description: "Improving system speed, efficiency, or capacity",
    category: "optimization"
  },
  {
    id: "security_implementation",
    title: "Security feature implementation",
    description: "Developing or enhancing security measures",
    category: "security"
  }
];

// Pricing tiers based on calculated credit amounts
export const pricingTiers: PricingTier[] = [
  {
    tier: 1,
    name: "Starter",
    price: 495,
    creditRange: "Up to $10,000",
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
    price: 1495,
    creditRange: "$10,001 - $25,000",
    popular: true,
    features: [
      "Everything in Starter",
      "Detailed narratives",
      "Priority support",
      "Multi-year analysis"
    ]
  },
  {
    tier: 3,
    name: "Scale",
    price: 2495,
    creditRange: "$25,001 - $50,000",
    features: [
      "Everything in Growth",
      "Advanced analytics",
      "Audit support",
      "Dedicated specialist"
    ]
  },
  {
    tier: 4,
    name: "Enterprise",
    price: 3995,
    creditRange: "$50,000+",
    features: [
      "Everything in Scale",
      "Custom consulting",
      "Multi-entity support",
      "Ongoing compliance"
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
 */
export const getPricingTier = (creditAmount: number): PricingTier => {
  if (creditAmount <= 10000) return pricingTiers[0];
  if (creditAmount <= 25000) return pricingTiers[1];
  if (creditAmount <= 50000) return pricingTiers[2];
  return pricingTiers[3];
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
