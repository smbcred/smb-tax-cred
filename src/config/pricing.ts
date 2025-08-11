/**
 * Single source of truth for pricing configuration
 * All pricing displays must import from this file - no hardcoded values
 */

export interface PricingTier {
  tier: number;
  name: string;
  price: number;
  federalCreditMin: number;
  federalCreditMax: number | null;
  description: string;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    tier: 1,
    name: "Starter",
    price: 495,
    federalCreditMin: 0,
    federalCreditMax: 10000,
    description: "Perfect for small AI experiments",
    features: [
      "Up to $10K federal credit",
      "Basic R&D documentation",
      "Email support",
      "IRS-compliant forms"
    ]
  },
  {
    tier: 2,
    name: "Growth", 
    price: 1495,
    federalCreditMin: 10001,
    federalCreditMax: 25000,
    description: "Ideal for growing AI initiatives",
    features: [
      "Up to $25K federal credit",
      "Enhanced documentation",
      "Priority support",
      "Advanced compliance checks"
    ]
  },
  {
    tier: 3,
    name: "Scale",
    price: 2495,
    federalCreditMin: 25001,
    federalCreditMax: 50000,
    description: "For established AI programs",
    features: [
      "Up to $50K federal credit",
      "Comprehensive documentation",
      "Dedicated support",
      "Custom reporting"
    ]
  },
  {
    tier: 4,
    name: "Enterprise",
    price: 3995,
    federalCreditMin: 50001,
    federalCreditMax: null,
    description: "Maximum AI tax benefits",
    features: [
      "$50K+ federal credit",
      "White-glove service",
      "Expert consultation",
      "Multi-year planning"
    ]
  }
];

export function getPricingTier(federalCredit: number): PricingTier {
  return PRICING_TIERS.find(tier => {
    return federalCredit >= tier.federalCreditMin && 
           (tier.federalCreditMax === null || federalCredit <= tier.federalCreditMax);
  }) || PRICING_TIERS[PRICING_TIERS.length - 1];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}