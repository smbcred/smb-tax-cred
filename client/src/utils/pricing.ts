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
    maxCredit: 5000,
    price: 500,
    description: "Credits up to $4,999",
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
    minCredit: 5000,
    maxCredit: 10000,
    price: 700,
    description: "Credits $5,000-$9,999",
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
    minCredit: 10000,
    maxCredit: 20000,
    price: 900,
    description: "Credits $10,000-$19,999",
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
    minCredit: 20000,
    maxCredit: 40000,
    price: 1200,
    description: "Credits $20,000-$39,999",
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
    maxCredit: 75000,
    price: 1500,
    description: "Credits $40,000-$74,999",
    features: [
      "Everything in Tier 4",
      "Dedicated support specialist",
      "Advanced documentation"
    ]
  },
  {
    tier: 6,
    minCredit: 75000,
    maxCredit: 150000,
    price: 1800,
    description: "Credits $75,000-$149,999",
    features: [
      "Everything in Tier 5",
      "Rush processing available",
      "White-glove service"
    ]
  },
  {
    tier: 7,
    minCredit: 150000,
    maxCredit: 999999999,
    price: 2000,
    description: "Credits $150,000+",
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