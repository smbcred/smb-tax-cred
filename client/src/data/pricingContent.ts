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
      tier: "Micro",
      creditRange: "Under $5,000",
      price: "$399",
      example: "$3K credit = 7.5x ROI",
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
      tier: "Starter",
      creditRange: "$5,000 - $9,999",
      price: "$500",
      example: "$7K credit = 14x ROI",
      features: [
        "Everything in Micro",
        "Multiple AI projects",
        "Priority processing",
        "Email support"
      ],
      highlighted: false,
      bestFor: "Perfect for: Small teams experimenting with AI"
    },
    {
      tier: "Growth",
      creditRange: "$10,000 - $19,999",
      price: "$750",
      example: "$15K credit = 20x ROI",
      features: [
        "Everything in Starter",
        "Unlimited AI projects",
        "Complex implementations",
        "Phone support"
      ],
      highlighted: true,
      bestFor: "Perfect for: Growing agencies using AI extensively"
    },
    {
      tier: "Professional",
      creditRange: "$20,000 - $34,999",
      price: "$1,000",
      example: "$27K credit = 27x ROI",
      features: [
        "Everything in Growth",
        "Multi-year documentation",
        "Dedicated assistance",
        "Expedited processing"
      ],
      highlighted: false,
      bestFor: "Perfect for: Established businesses with AI initiatives"
    },
    {
      tier: "Scale",
      creditRange: "$35,000 - $49,999",
      price: "$1,250",
      example: "$42K credit = 33x ROI",
      features: [
        "Everything in Professional",
        "Custom documentation",
        "White-glove service",
        "Audit preparation support"
      ],
      highlighted: false,
      bestFor: "Perfect for: Companies with major AI transformations"
    },
    {
      tier: "Advanced",
      creditRange: "$50,000 - $99,999",
      price: "$1,500",
      example: "$75K credit = 50x ROI",
      features: [
        "Everything in Scale",
        "Priority handling",
        "Executive summary",
        "Quarterly reviews"
      ],
      highlighted: false,
      bestFor: "Perfect for: Large-scale AI implementations"
    },
    {
      tier: "Premium",
      creditRange: "$100,000 - $199,999",
      price: "$2,000",
      example: "$150K credit = 75x ROI",
      features: [
        "Everything in Advanced",
        "Dedicated account manager",
        "Custom reporting",
        "Full audit defense prep"
      ],
      highlighted: false,
      bestFor: "Perfect for: Enterprise AI transformations"
    },
    {
      tier: "Enterprise",
      creditRange: "$200,000+",
      price: "$2,500",
      example: "$250K credit = 100x ROI",
      features: [
        "Everything in Premium",
        "White-glove service",
        "Audit defense included",
        "Unlimited support"
      ],
      highlighted: false,
      bestFor: "Perfect for: Fortune 500 AI transformations"
    }
  ],
  
  additionalYear: {
    price: "$399",
    description: "Multiple years? Add $399 per year",
    note: "Claim credits for 2022, 2023, and 2024 AI experiments"
  },
  
  comparison: {
    title: "Save Thousands vs Traditional Consultants",
    competitor: "Consultants charge 20% on $30K credit",
    competitorPrice: "$6,000",
    ourPrice: "$1,000",
    savings: "You save $5,000"
  },

  guarantee: "If your final credit is lower than estimated, we automatically refund the difference in pricing tiers."
};