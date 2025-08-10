/**
 * @file pricing.ts
 * @description Pricing tier assignment logic
 * @knowledgeBase pricing_strategy_rd_platform.md
 */

export interface PricingTier {
  tier: number;
  minCredit: number;
  maxCredit: number;
  price: number;
  description: string;
  features: string[];
}

// Pricing tiers based on federal credit amount
export const pricingTiers: PricingTier[] = [
  {
    tier: 0,
    minCredit: 0,
    maxCredit: 5000,
    price: 399,
    description: "Credits under $5,000",
    features: [
      "Federal R&D Credit Forms",
      "Technical Narrative (2-5 pages)",
      "Section 174 Deduction",
      "Compliance Memo",
      "90-day Document Access"
    ]
  },
  {
    tier: 1,
    minCredit: 5000,
    maxCredit: 10000,
    price: 500,
    description: "Credits $5,000-$9,999",
    features: [
      "Everything in Micro tier",
      "Enhanced narrative detail",
      "Priority support",
      "Multi-year guidance",
      "QSB payroll offset prep"
    ]
  },
  {
    tier: 2,
    minCredit: 10000,
    maxCredit: 20000,
    price: 750,
    description: "Credits $10,000-$19,999",
    features: [
      "Everything in Tier 1",
      "Multi-project support",
      "Expedited processing",
      "Executive summary",
      "State credit guidance"
    ]
  },
  {
    tier: 3,
    minCredit: 20000,
    maxCredit: 35000,
    price: 1000,
    description: "Credits $20,000-$34,999",
    features: [
      "Everything in Tier 2",
      "Complex project structures",
      "Department-level breakdowns",
      "Custom narratives"
    ]
  },
  {
    tier: 4,
    minCredit: 35000,
    maxCredit: 50000,
    price: 1250,
    description: "Credits $35,000-$49,999",
    features: [
      "Everything in Tier 3",
      "Dedicated support specialist",
      "Advanced documentation"
    ]
  },
  {
    tier: 5,
    minCredit: 50000,
    maxCredit: 100000,
    price: 1500,
    description: "Credits $50,000-$99,999",
    features: [
      "Everything in Tier 4",
      "Rush processing available",
      "White-glove service"
    ]
  },
  {
    tier: 6,
    minCredit: 100000,
    maxCredit: 200000,
    price: 2000,
    description: "Credits $100,000-$199,999",
    features: [
      "Everything in Tier 5",
      "Enterprise features",
      "Custom solutions",
      "Dedicated account manager"
    ]
  },
  {
    tier: 7,
    minCredit: 200000,
    maxCredit: 999999999,
    price: 2500,
    description: "Credits $200,000+",
    features: [
      "Everything in Tier 6",
      "White-glove service",
      "Full audit defense",
      "Unlimited consulting"
    ]
  }
];

/**
 * Assign pricing tier based on federal credit amount
 */
export function assignPricingTier(federalCredit: number): PricingTier {
  const tier = pricingTiers.find(
    t => federalCredit >= t.minCredit && federalCredit < t.maxCredit
  );
  
  // Default to highest tier if credit exceeds all ranges
  return tier || pricingTiers[pricingTiers.length - 1];
}

/**
 * Calculate ROI based on credit and price
 */
export function calculateROI(creditAmount: number, price: number): number {
  if (price === 0) return 0;
  return Math.round((creditAmount / price) * 100) / 100;
}