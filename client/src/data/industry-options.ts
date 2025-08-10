// Industry categories for business classification
export interface IndustryOption {
  value: string;
  label: string;
  description: string;
}

export const industryOptions: IndustryOption[] = [
  {
    value: "technology",
    label: "Technology & Software",
    description: "Software development, IT services, SaaS, hardware, telecommunications"
  },
  {
    value: "professional-services",
    label: "Professional Services",
    description: "Consulting, legal, accounting, engineering, design, marketing"
  },
  {
    value: "healthcare",
    label: "Healthcare & Life Sciences",
    description: "Medical practices, hospitals, pharmaceuticals, biotech, medical devices"
  },
  {
    value: "financial-services",
    label: "Financial Services",
    description: "Banking, insurance, investment, fintech, payment processing"
  },
  {
    value: "manufacturing",
    label: "Manufacturing & Industrial",
    description: "Production, assembly, industrial equipment, chemicals, materials"
  },
  {
    value: "retail-ecommerce",
    label: "Retail & E-commerce",
    description: "Online retail, physical stores, consumer goods, marketplace platforms"
  },
  {
    value: "real-estate-construction",
    label: "Real Estate & Construction",
    description: "Property development, construction, property management, architecture"
  },
  {
    value: "transportation-logistics",
    label: "Transportation & Logistics",
    description: "Shipping, delivery, warehousing, supply chain, freight"
  },
  {
    value: "agriculture-food",
    label: "Agriculture & Food",
    description: "Farming, food production, restaurants, food processing, beverages"
  },
  {
    value: "energy-utilities",
    label: "Energy & Utilities",
    description: "Oil & gas, renewable energy, electric utilities, water, waste management"
  },
  {
    value: "media-entertainment",
    label: "Media & Entertainment",
    description: "Publishing, broadcasting, gaming, film, music, digital content"
  },
  {
    value: "education",
    label: "Education & Training",
    description: "Schools, universities, online education, training programs, EdTech"
  },
  {
    value: "nonprofit",
    label: "Nonprofit & Government",
    description: "Charitable organizations, government agencies, public services"
  },
  {
    value: "other",
    label: "Other",
    description: "Industries not listed above"
  }
];

export const entityTypeOptions = [
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corp", label: "C Corporation" },
  { value: "s-corp", label: "S Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "sole-proprietorship", label: "Sole Proprietorship" },
  { value: "other", label: "Other" }
];

export const usStates = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" }
];