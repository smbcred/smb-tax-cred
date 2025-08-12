// Centralized pricing configuration for consistent use across frontend and backend
export interface PricingTier {
  tier: number;
  name: string;
  minCredit: number;
  maxCredit: number;
  price: number; // Price in cents for Stripe
  displayPrice: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    tier: 0,
    name: "Micro",
    minCredit: 0,
    maxCredit: 5000,
    price: 39900, // $399 in cents
    displayPrice: "$399",
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
    name: "Starter",
    minCredit: 5000,
    maxCredit: 10000,
    price: 50000, // $500 in cents
    displayPrice: "$500",
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
    name: "Growth",
    minCredit: 10000,
    maxCredit: 20000,
    price: 75000, // $750 in cents
    displayPrice: "$750",
    description: "Credits $10,000-$19,999",
    popular: true,
    features: [
      "Everything in Starter tier",
      "Multi-project support",
      "Expedited processing",
      "Executive summary",
      "State credit guidance"
    ]
  },
  {
    tier: 3,
    name: "Professional",
    minCredit: 20000,
    maxCredit: 35000,
    price: 100000, // $1,000 in cents
    displayPrice: "$1,000",
    description: "Credits $20,000-$34,999",
    features: [
      "Everything in Growth tier",
      "Complex project structures",
      "Department-level breakdowns",
      "Custom narratives"
    ]
  },
  {
    tier: 4,
    name: "Scale",
    minCredit: 35000,
    maxCredit: 50000,
    price: 125000, // $1,250 in cents
    displayPrice: "$1,250",
    description: "Credits $35,000-$49,999",
    features: [
      "Everything in Professional tier",
      "Dedicated support specialist",
      "Advanced documentation"
    ]
  },
  {
    tier: 5,
    name: "Advanced",
    minCredit: 50000,
    maxCredit: 100000,
    price: 150000, // $1,500 in cents
    displayPrice: "$1,500",
    description: "Credits $50,000-$99,999",
    features: [
      "Everything in Scale tier",
      "Rush processing available",
      "White-glove service"
    ]
  },
  {
    tier: 6,
    name: "Premium",
    minCredit: 100000,
    maxCredit: 200000,
    price: 200000, // $2,000 in cents
    displayPrice: "$2,000",
    description: "Credits $100,000-$199,999",
    features: [
      "Everything in Advanced tier",
      "Enterprise features",
      "Custom solutions",
      "Dedicated account manager"
    ]
  },
  {
    tier: 7,
    name: "Enterprise",
    minCredit: 200000,
    maxCredit: Infinity,
    price: 250000, // $2,500 in cents
    displayPrice: "$2,500",
    description: "Credits $200,000+",
    features: [
      "Everything in Premium tier",
      "White-glove service",
      "Audit defense included",
      "Unlimited support"
    ]
  }
];

export function assignPricingTier(estimatedCredit: number): PricingTier {
  return pricingTiers.find(tier => 
    estimatedCredit >= tier.minCredit && estimatedCredit <= tier.maxCredit
  ) || pricingTiers[pricingTiers.length - 1]; // Default to highest tier
}

// Simplified tiers for the new calculator
export const simplifiedTiers = [
  { tier: 0, min: 0, max: 5000, price: 399, priceId: process.env.NODE_ENV === "production" ? "price_live_0" : "price_test_0" },
  { tier: 1, min: 5000, max: 10000, price: 500, priceId: process.env.NODE_ENV === "production" ? "price_live_1" : "price_test_1" },
  { tier: 2, min: 10000, max: 20000, price: 750, priceId: process.env.NODE_ENV === "production" ? "price_live_2" : "price_test_2" },
  { tier: 3, min: 20000, max: 35000, price: 1000, priceId: process.env.NODE_ENV === "production" ? "price_live_3" : "price_test_3" },
  { tier: 4, min: 35000, max: 50000, price: 1250, priceId: process.env.NODE_ENV === "production" ? "price_live_4" : "price_test_4" },
  { tier: 5, min: 50000, max: 100000, price: 1500, priceId: process.env.NODE_ENV === "production" ? "price_live_5" : "price_test_5" },
  { tier: 6, min: 100000, max: 200000, price: 2000, priceId: process.env.NODE_ENV === "production" ? "price_live_6" : "price_test_6" },
  { tier: 7, min: 200000, max: Infinity, price: 2500, priceId: process.env.NODE_ENV === "production" ? "price_live_7" : "price_test_7" },
];

export function tierFor(credit: number) {
  return simplifiedTiers.find(t => credit >= t.min && credit <= t.max) || simplifiedTiers[0];
}