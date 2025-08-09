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
    tier: 1,
    minCredit: 0,
    maxCredit: 10000,
    price: 500,
    description: "Credits < $10K",
    features: [
      "Federal R&D Credit Forms",
      "Technical Narrative (4-8 pages)",
      "Section 174 Deduction",
      "Compliance Memo",
      "90-day Document Access"
    ]
  },
  {
    tier: 2,
    minCredit: 10000,
    maxCredit: 20000,
    price: 750,
    description: "Credits $10K-$20K",
    features: [
      "Everything in Tier 1",
      "Enhanced narrative detail",
      "Priority support",
      "Multi-year guidance",
      "QSB payroll offset prep"
    ]
  },
  {
    tier: 3,
    minCredit: 20000,
    maxCredit: 30000,
    price: 1000,
    description: "Credits $20K-$30K",
    features: [
      "Everything in Tier 2",
      "Multi-project support",
      "Expedited processing",
      "Executive summary",
      "State credit guidance"
    ]
  },
  {
    tier: 4,
    minCredit: 30000,
    maxCredit: 40000,
    price: 1250,
    description: "Credits $30K-$40K",
    features: [
      "Everything in Tier 3",
      "Complex project structures",
      "Department-level breakdowns",
      "Custom narratives"
    ]
  },
  {
    tier: 5,
    minCredit: 40000,
    maxCredit: 50000,
    price: 1500,
    description: "Credits $40K-$50K",
    features: [
      "Everything in Tier 4",
      "Dedicated support specialist",
      "Advanced documentation"
    ]
  },
  {
    tier: 6,
    minCredit: 50000,
    maxCredit: 60000,
    price: 1750,
    description: "Credits $50K-$60K",
    features: [
      "Everything in Tier 5",
      "Rush processing available",
      "White-glove service"
    ]
  },
  {
    tier: 7,
    minCredit: 60000,
    maxCredit: 999999999,
    price: 2000,
    description: "Credits > $60K",
    features: [
      "Enterprise features",
      "Custom solutions",
      "Dedicated account manager"
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