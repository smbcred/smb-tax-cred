// Expense categories and data for R&D tax credit calculation

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  examples: string[];
  rdQualified: boolean;
}

export interface SoftwareCategory {
  id: string;
  name: string;
  description: string;
  examples: string[];
  rdRelevance: 'high' | 'medium' | 'low';
}

export const SUPPLY_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'raw-materials',
    name: 'Raw Materials',
    description: 'Materials consumed in R&D activities',
    examples: ['Manufacturing components', 'Testing materials', 'Prototyping supplies'],
    rdQualified: true
  },
  {
    id: 'office-supplies',
    name: 'Office Supplies',
    description: 'General office and administrative supplies',
    examples: ['Paper', 'Pens', 'Basic office materials'],
    rdQualified: false
  },
  {
    id: 'lab-equipment',
    name: 'Laboratory Equipment',
    description: 'Scientific and testing equipment',
    examples: ['Testing instruments', 'Measurement devices', 'Research tools'],
    rdQualified: true
  },
  {
    id: 'computer-hardware',
    name: 'Computer Hardware',
    description: 'Computing equipment for R&D',
    examples: ['Development servers', 'Testing devices', 'Specialized hardware'],
    rdQualified: true
  },
  {
    id: 'safety-equipment',
    name: 'Safety Equipment',
    description: 'Safety gear and protective equipment',
    examples: ['Protective gear', 'Safety equipment', 'Emergency supplies'],
    rdQualified: false
  }
];

export const SOFTWARE_CATEGORIES: SoftwareCategory[] = [
  {
    id: 'development-tools',
    name: 'Development Tools',
    description: 'Software development and coding tools',
    examples: ['IDEs', 'Version control', 'Code analysis tools'],
    rdRelevance: 'high'
  },
  {
    id: 'ai-ml-platforms',
    name: 'AI/ML Platforms',
    description: 'Artificial intelligence and machine learning services',
    examples: ['OpenAI API', 'AWS SageMaker', 'Google Cloud AI'],
    rdRelevance: 'high'
  },
  {
    id: 'cloud-infrastructure',
    name: 'Cloud Infrastructure',
    description: 'Cloud computing and hosting services',
    examples: ['AWS EC2', 'Azure VMs', 'Google Cloud Compute'],
    rdRelevance: 'medium'
  },
  {
    id: 'database-services',
    name: 'Database Services',
    description: 'Database and data storage solutions',
    examples: ['MongoDB Atlas', 'AWS RDS', 'Firebase'],
    rdRelevance: 'medium'
  },
  {
    id: 'analytics-tools',
    name: 'Analytics Tools',
    description: 'Data analysis and business intelligence',
    examples: ['Google Analytics', 'Mixpanel', 'Tableau'],
    rdRelevance: 'medium'
  },
  {
    id: 'testing-tools',
    name: 'Testing Tools',
    description: 'Software testing and quality assurance',
    examples: ['Selenium', 'Jest', 'Cypress'],
    rdRelevance: 'high'
  },
  {
    id: 'design-tools',
    name: 'Design Tools',
    description: 'UI/UX design and prototyping software',
    examples: ['Figma', 'Adobe Creative Suite', 'Sketch'],
    rdRelevance: 'low'
  },
  {
    id: 'office-productivity',
    name: 'Office Productivity',
    description: 'General productivity and communication tools',
    examples: ['Microsoft Office', 'Slack', 'Zoom'],
    rdRelevance: 'low'
  }
];

export const JOB_ROLES = [
  'Software Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Research Scientist',
  'Product Manager',
  'DevOps Engineer',
  'QA Engineer',
  'UI/UX Designer',
  'Project Manager',
  'Business Analyst',
  'System Administrator',
  'Database Administrator',
  'Security Engineer',
  'Other'
];

export const CONTRACTOR_TYPES = [
  'Independent Contractor',
  'Consulting Firm',
  'Freelance Developer',
  'Research Institution',
  'External Lab',
  'Other'
];