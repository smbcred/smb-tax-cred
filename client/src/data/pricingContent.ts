/**
 * @file pricingContent.ts
 * @description Pricing tiers with ROI messaging
 * @knowledgeBase pricing_strategy_rd_platform.md
 */

export const pricingContent = {
  headline: "Simple, Transparent Pricing",
  subheadline: "One flat fee based on your credit size. No surprises.",
  
  tiers: [
    {
      tier: "Starter",
      creditRange: "Credits under $10K",
      price: "$500",
      example: "$8K credit = 16x ROI",
      features: [
        "Federal credit documentation",
        "AI experimentation narrative",
        "IRS-compliant package",
        "CPA-ready format",
        "48-hour delivery"
      ],
      highlighted: false,
      bestFor: "Perfect for: Consultants and small teams experimenting with AI"
    },
    {
      tier: "Growth",
      creditRange: "Credits $10K-$50K",
      price: "$750",
      example: "$30K credit = 40x ROI",
      features: [
        "Everything in Starter",
        "Multiple AI projects",
        "Priority processing",
        "Email support",
        "Complex implementations"
      ],
      highlighted: true,
      bestFor: "Perfect for: Growing businesses and agencies using AI extensively"
    },
    {
      tier: "Scale",
      creditRange: "Credits $50K-$100K",
      price: "$1,000",
      example: "$75K credit = 75x ROI",
      features: [
        "Everything in Growth",
        "Unlimited AI projects",
        "Multi-year documentation",
        "Phone support",
        "Dedicated assistance"
      ],
      highlighted: false,
      bestFor: "Perfect for: Established companies with major AI initiatives"
    },
    {
      tier: "Enterprise",
      creditRange: "Credits over $100K",
      price: "$1,500",
      example: "$150K credit = 100x ROI",
      features: [
        "Everything in Scale",
        "Custom documentation",
        "White-glove service",
        "Audit defense prep",
        "Priority handling"
      ],
      highlighted: false,
      bestFor: "Perfect for: Large-scale AI transformations"
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