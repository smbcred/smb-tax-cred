/**
 * @file pricingContent.ts
 * @description Pricing tiers with ROI messaging
 * @knowledgeBase pricing_strategy_rd_platform.md
 */

export const pricingContent = {
  headline: "Simple, Transparent Pricing",
  subheadline: "Just one flat fee—we never take a percentage of your credit like traditional consultants.",
  
  tiers: [
    {
      tier: "Starter",
      creditRange: "$0 - $4,999",
      price: "$500",
      example: "$3K credit = 6x ROI",
      features: [
        "Federal credit documentation",
        "AI experimentation narrative",
        "IRS-compliant package",
        "CPA-ready format",
        "48-hour delivery"
      ],
      highlighted: false,
      bestFor: "Perfect for: Solopreneurs and consultants testing AI tools"
    },
    {
      tier: "Growth",
      creditRange: "$5,000 - $9,999",
      price: "$700",
      example: "$7K credit = 10x ROI",
      features: [
        "Everything in Starter",
        "Multiple AI projects",
        "Priority processing",
        "Email support"
      ],
      highlighted: false,
      bestFor: "Perfect for: Small teams experimenting with AI"
    },
    {
      tier: "Professional",
      creditRange: "$10,000 - $19,999",
      price: "$900",
      example: "$15K credit = 16x ROI",
      features: [
        "Everything in Growth",
        "Unlimited AI projects",
        "Complex implementations",
        "Phone support"
      ],
      highlighted: true,
      bestFor: "Perfect for: Growing agencies using AI extensively"
    },
    {
      tier: "Scale",
      creditRange: "$20,000 - $39,999",
      price: "$1,200",
      example: "$30K credit = 25x ROI",
      features: [
        "Everything in Professional",
        "Multi-year documentation",
        "Dedicated assistance",
        "Expedited processing"
      ],
      highlighted: false,
      bestFor: "Perfect for: Established businesses with AI initiatives"
    },
    {
      tier: "Advanced",
      creditRange: "$40,000 - $74,999",
      price: "$1,500",
      example: "$60K credit = 40x ROI",
      features: [
        "Everything in Scale",
        "Custom documentation",
        "White-glove service",
        "Audit preparation support"
      ],
      highlighted: false,
      bestFor: "Perfect for: Companies with major AI transformations"
    },
    {
      tier: "Premium",
      creditRange: "$75,000 - $149,999",
      price: "$1,800",
      example: "$100K credit = 55x ROI",
      features: [
        "Everything in Advanced",
        "Priority handling",
        "Executive summary",
        "Quarterly reviews"
      ],
      highlighted: false,
      bestFor: "Perfect for: Large-scale AI implementations"
    },
    {
      tier: "Enterprise",
      creditRange: "$150,000+",
      price: "$2,000",
      example: "$200K credit = 100x ROI",
      features: [
        "Everything in Premium",
        "Dedicated account manager",
        "Custom reporting",
        "Full audit defense prep"
      ],
      highlighted: false,
      bestFor: "Perfect for: Enterprise AI transformations"
    }
  ],
  
  additionalYear: {
    price: "$297",
    description: "Multiple years? Add $297 per year",
    note: "Claim credits for 2022, 2023, and 2024 AI experiments"
  },
  
  comparison: {
    title: "Save Thousands vs Traditional Consultants",
    competitor: "Consultants charge 20% on $30K credit",
    competitorPrice: "$6,000",
    ourPrice: "$750",
    savings: "You save $5,250"
  },

  guarantee: "If your final credit is lower than estimated, we automatically refund the difference in pricing tiers."
};