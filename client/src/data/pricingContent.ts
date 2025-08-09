/**
 * @file pricingContent.ts
 * @description Pricing tiers with ROI messaging
 * @knowledgeBase pricing_strategy_rd_platform.md
 */

export const pricingContent = {
  headline: "Transparent, Flat-Fee Pricing",
  subheadline: "Keep more of your credit. No percentage cuts.",
  
  tiers: [
    {
      tier: "Tier 1",
      creditRange: "Credits < $10K",
      price: "$500",
      example: "$8K credit = 16x ROI",
      features: [
        "Federal R&D Credit Forms",
        "Technical Narrative (4-8 pages)",
        "Section 174A Deduction",
        "Compliance Memo",
        "90-day Document Access"
      ],
      highlighted: false
    },
    {
      tier: "Tier 2",
      creditRange: "Credits $10K-$20K",
      price: "$750",
      example: "$15K credit = 20x ROI",
      features: [
        "Everything in Tier 1",
        "Enhanced narrative detail",
        "Priority support",
        "Multi-year guidance",
        "QSB payroll offset prep"
      ],
      highlighted: true
    },
    {
      tier: "Tier 3",
      creditRange: "Credits $20K-$30K",
      price: "$1,000",
      example: "$25K credit = 25x ROI",
      features: [
        "Everything in Tier 2",
        "Multi-project support",
        "Expedited processing",
        "Executive summary",
        "State credit guidance"
      ],
      highlighted: false
    },
    {
      tier: "Tier 4",
      creditRange: "Credits $30K-$40K",
      price: "$1,250",
      example: "$35K credit = 28x ROI",
      features: [
        "Everything in Tier 3",
        "Complex project structures",
        "Department-level breakdowns",
        "Custom narratives",
        "Priority phone support"
      ],
      highlighted: false
    },
    {
      tier: "Tier 5",
      creditRange: "Credits $40K-$50K",
      price: "$1,500",
      example: "$45K credit = 30x ROI",
      features: ["Everything in Tier 4", "Dedicated support specialist"],
      highlighted: false
    },
    {
      tier: "Tier 6",
      creditRange: "Credits $50K-$60K",
      price: "$1,750",
      example: "$55K credit = 31x ROI",
      features: ["Everything in Tier 5", "Rush processing available"],
      highlighted: false
    },
    {
      tier: "Tier 7",
      creditRange: "Credits > $60K",
      price: "Custom",
      example: "Contact for enterprise pricing",
      features: ["White-glove service", "Custom solutions"],
      highlighted: false
    }
  ],
  
  additionalYear: {
    price: "$297",
    description: "Add another year",
    note: "Same comprehensive documentation for each additional tax year"
  },
  
  comparison: {
    title: "Compare vs. Traditional Consultants",
    competitor: "20% contingency fee on $50K credit",
    competitorPrice: "$10,000",
    ourPrice: "$1,000",
    savings: "You save $9,000"
  },

  guarantee: "If your final credit is lower than estimated, we automatically refund the difference in pricing tiers."
};