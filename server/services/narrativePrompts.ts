import { z } from 'zod';

// Template variable schemas
export const companyContextSchema = z.object({
  companyName: z.string(),
  industry: z.string(),
  employeeCount: z.number(),
  yearFounded: z.number().optional(),
  businessType: z.enum(['corporation', 'llc', 'partnership', 'sole_proprietorship']),
  taxYear: z.number(),
});

export const projectContextSchema = z.object({
  projectName: z.string(),
  projectDescription: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  totalExpenses: z.number(),
  wageExpenses: z.number(),
  contractorExpenses: z.number(),
  supplyExpenses: z.number(),
  uncertainties: z.array(z.string()),
  technicalChallenges: z.array(z.string()),
  innovations: z.array(z.string()),
  businessPurpose: z.string(),
  rdActivities: z.array(z.object({
    activity: z.string(),
    description: z.string(),
    timeSpent: z.number(),
    category: z.enum(['experimentation', 'testing', 'analysis', 'development', 'evaluation']),
  })),
});

export const narrativeOptionsSchema = z.object({
  length: z.enum(['brief', 'standard', 'detailed']).default('standard'),
  tone: z.enum(['professional', 'technical', 'formal']).default('professional'),
  focus: z.enum(['compliance', 'technical', 'business']).default('compliance'),
  includeMetrics: z.boolean().default(true),
  includeTimeline: z.boolean().default(true),
  emphasizeInnovation: z.boolean().default(true),
});

export type CompanyContext = z.infer<typeof companyContextSchema>;
export type ProjectContext = z.infer<typeof projectContextSchema>;
export type NarrativeOptions = z.infer<typeof narrativeOptionsSchema>;

export interface NarrativeTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  variables: string[];
  maxTokens: number;
  temperature: number;
  complianceLevel: 'high' | 'medium' | 'low';
}

export interface GeneratedNarrative {
  content: string;
  wordCount: number;
  tokensUsed: number;
  complianceScore: number;
  templateUsed: string;
  variables: Record<string, any>;
  metadata: {
    generatedAt: string;
    version: string;
    model: string;
  };
}

export class NarrativePromptService {
  private templates: Map<string, NarrativeTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Technical Narrative Template
    this.templates.set('technical_narrative', {
      id: 'technical_narrative',
      name: 'Technical R&D Narrative',
      description: 'Comprehensive technical narrative for R&D tax credit documentation',
      complianceLevel: 'high',
      maxTokens: 3000,
      temperature: 0.3,
      variables: [
        'companyName', 'industry', 'projectName', 'projectDescription', 
        'technicalChallenges', 'innovations', 'uncertainties', 'rdActivities',
        'businessPurpose', 'totalExpenses', 'taxYear'
      ],
      systemPrompt: `You are a technical writing specialist with expertise in R&D tax credit documentation. Your task is to create comprehensive, IRS-compliant narratives that demonstrate qualified research activities under Section 41 of the Internal Revenue Code.

Key Requirements:
- Focus on the four-part test: Technological information, Business component, Uncertainty, Experimentation
- Use precise technical language while remaining accessible
- Emphasize innovation and technological advancement
- Demonstrate systematic experimentation and evaluation
- Avoid overly promotional language
- Maintain professional, objective tone
- Include specific metrics and timelines when available
- Reference relevant industry standards and practices

Compliance Guidelines:
- Activities must be undertaken for the purpose of discovering information that is technological in nature
- The application of such information must be intended for use in developing a new or improved business component
- Substantially all activities must relate to elements of uncertainty
- Activities must constitute elements of a process of experimentation

Never make claims about tax savings or guarantee outcomes. Use "may qualify" language throughout.`,

      userPrompt: `Create a comprehensive technical narrative for the following R&D project:

Company Information:
- Company: {{companyName}}
- Industry: {{industry}}
- Tax Year: {{taxYear}}

Project Details:
- Project Name: {{projectName}}
- Description: {{projectDescription}}
- Business Purpose: {{businessPurpose}}
- Total Project Investment: ${{totalExpenses}}

Technical Challenges:
{{#each technicalChallenges}}
- {{this}}
{{/each}}

Innovations Developed:
{{#each innovations}}
- {{this}}
{{/each}}

Areas of Uncertainty:
{{#each uncertainties}}
- {{this}}
{{/each}}

R&D Activities Performed:
{{#each rdActivities}}
- {{activity}}: {{description}} ({{timeSpent}} hours, {{category}})
{{/each}}

Structure the narrative to clearly demonstrate:
1. Technological nature of the information being sought
2. Business component development or improvement
3. Technological uncertainties that existed
4. Systematic experimentation process undertaken
5. Qualified research expenses incurred

The narrative should be {{length}} in length with a {{tone}} tone, focusing on {{focus}} aspects. Total length should be approximately {{targetWords}} words.`
    });

    // Compliance Memo Template
    this.templates.set('compliance_memo', {
      id: 'compliance_memo',
      name: 'R&D Tax Credit Compliance Memo',
      description: 'Legal compliance memo demonstrating Section 41 qualification',
      complianceLevel: 'high',
      maxTokens: 2500,
      temperature: 0.2,
      variables: [
        'companyName', 'projectName', 'taxYear', 'totalExpenses', 
        'wageExpenses', 'contractorExpenses', 'supplyExpenses',
        'rdActivities', 'technicalChallenges', 'uncertainties'
      ],
      systemPrompt: `You are a tax compliance specialist creating documentation for R&D tax credit claims. Your memo must demonstrate clear compliance with IRS Section 41 requirements and Treasury Regulations.

Critical Compliance Elements:
- Four-part test qualification (Section 1.41-4(a))
- Qualified research expense categories (wages, contractor costs, supplies)
- Documentation of systematic experimentation
- Technological uncertainty demonstration
- Business component improvement evidence

Legal Standards:
- Reference specific IRC sections and Treasury Regulations
- Use precise legal terminology
- Provide objective analysis without advocacy
- Document evidence systematically
- Address potential challenges or limitations

Risk Management:
- Identify documentation gaps
- Highlight strongest compliance arguments
- Note areas requiring additional support
- Provide recommendations for strengthening the claim

Use formal legal memo format with clear headings, numbered sections, and supporting citations.`,

      userPrompt: `MEMORANDUM

TO: {{companyName}} Tax Department
FROM: R&D Tax Credit Documentation Team
DATE: [Current Date]
RE: R&D Tax Credit Qualification Analysis - {{projectName}} (Tax Year {{taxYear}})

I. EXECUTIVE SUMMARY

Analyze the qualification of {{projectName}} for R&D tax credit under Internal Revenue Code Section 41.

Project Investment Summary:
- Total Qualified Expenses: ${{totalExpenses}}
- Wage Expenses: ${{wageExpenses}}
- Contractor Expenses: ${{contractorExpenses}}  
- Supply Expenses: ${{supplyExpenses}}

II. FOUR-PART TEST ANALYSIS

Conduct detailed analysis against the four-part test requirements:

Technical Challenges Addressed:
{{#each technicalChallenges}}
- {{this}}
{{/each}}

Technological Uncertainties:
{{#each uncertainties}}
- {{this}}
{{/each}}

Research Activities:
{{#each rdActivities}}
- {{activity}}: {{description}}
{{/each}}

III. COMPLIANCE ASSESSMENT

Evaluate compliance with Treasury Regulation requirements and provide risk assessment.

IV. DOCUMENTATION RECOMMENDATIONS

Suggest additional documentation needed to strengthen the claim.

The memo should maintain a formal legal tone and provide objective analysis of qualification factors.`
    });

    // Executive Summary Template
    this.templates.set('executive_summary', {
      id: 'executive_summary',
      name: 'Executive Summary',
      description: 'High-level business summary of R&D activities and tax benefits',
      complianceLevel: 'medium',
      maxTokens: 1500,
      temperature: 0.4,
      variables: [
        'companyName', 'industry', 'projectName', 'totalExpenses',
        'estimatedCredit', 'innovations', 'businessImpact', 'taxYear'
      ],
      systemPrompt: `You are a business communications specialist creating executive summaries for R&D tax credit documentation. Your audience includes C-level executives, CFOs, and tax directors who need clear, concise summaries of R&D activities and potential tax benefits.

Focus Areas:
- Business value and strategic importance
- Innovation outcomes and competitive advantages
- Financial investment and potential tax benefits
- Risk mitigation and compliance assurance
- Clear, jargon-free language for executives

Executive Communication Style:
- Lead with business impact
- Use bullet points and clear headings
- Quantify benefits where possible
- Address strategic implications
- Maintain professional, confident tone
- Include key metrics and timelines

Compliance Notes:
- Use "may qualify" language for tax benefits
- Avoid guarantee statements
- Focus on qualified activities and expenses
- Reference professional tax guidance`,

      userPrompt: `Create an executive summary for {{companyName}}'s R&D tax credit opportunity:

EXECUTIVE SUMMARY: {{projectName}} R&D Tax Credit Analysis

Company: {{companyName}} ({{industry}} sector)
Tax Year: {{taxYear}}
Total R&D Investment: ${{totalExpenses}}
Estimated Tax Credit Range: ${{estimatedCredit}}

Key Innovations:
{{#each innovations}}
- {{this}}
{{/each}}

Business Impact:
{{businessImpact}}

The summary should be concise (approximately 300-500 words) and focus on business value, strategic importance, and potential tax benefits. Use clear, executive-level language that demonstrates the value of the R&D activities and compliance with tax regulations.`
    });

    // Project Detail Template
    this.templates.set('project_detail', {
      id: 'project_detail',
      name: 'Detailed Project Documentation',
      description: 'Comprehensive project-level documentation with technical details',
      complianceLevel: 'high',
      maxTokens: 4000,
      temperature: 0.3,
      variables: [
        'projectName', 'projectDescription', 'startDate', 'endDate',
        'technicalChallenges', 'rdActivities', 'uncertainties', 'innovations',
        'businessPurpose', 'totalExpenses', 'timeline'
      ],
      systemPrompt: `You are a technical documentation specialist creating detailed project documentation for R&D tax credit purposes. Your documentation must provide comprehensive evidence of qualified research activities while maintaining technical accuracy and compliance with IRS requirements.

Documentation Standards:
- Chronological activity tracking
- Detailed technical descriptions
- Uncertainty identification and resolution
- Experimentation methodology
- Results and outcomes documentation
- Resource allocation and expense tracking

Technical Writing Requirements:
- Use specific, measurable language
- Include technical specifications when relevant
- Document decision-making processes
- Show iterative development and testing
- Demonstrate systematic approach
- Link activities to business objectives

Compliance Integration:
- Map activities to Section 41 requirements
- Demonstrate technological nature
- Show business component development
- Evidence systematic experimentation
- Document qualified expense categories`,

      userPrompt: `Create comprehensive project documentation for:

PROJECT: {{projectName}}
DURATION: {{startDate}} to {{endDate}}
DESCRIPTION: {{projectDescription}}
BUSINESS PURPOSE: {{businessPurpose}}

TECHNICAL CHALLENGES ADDRESSED:
{{#each technicalChallenges}}
{{@index}}. {{this}}
{{/each}}

RESEARCH & DEVELOPMENT ACTIVITIES:
{{#each rdActivities}}
Activity: {{activity}}
Description: {{description}}
Time Investment: {{timeSpent}} hours
Category: {{category}}
---
{{/each}}

TECHNOLOGICAL UNCERTAINTIES:
{{#each uncertainties}}
- {{this}}
{{/each}}

INNOVATIONS & OUTCOMES:
{{#each innovations}}
- {{this}}
{{/each}}

PROJECT INVESTMENT: ${{totalExpenses}}

Create a detailed technical narrative that documents the systematic research process, demonstrates compliance with R&D tax credit requirements, and provides comprehensive evidence of qualified research activities. The documentation should be thorough enough to support tax credit claims while maintaining technical accuracy and professional presentation.`
    });
  }

  generateNarrative(
    templateId: string,
    companyContext: CompanyContext,
    projectContext: ProjectContext,
    options: NarrativeOptions = {
      length: 'standard',
      tone: 'professional', 
      focus: 'compliance',
      includeMetrics: true,
      includeTimeline: true,
      emphasizeInnovation: true
    }
  ): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate that all required variables are provided
    const variables = this.extractVariables(companyContext, projectContext, options);
    this.validateVariables(template.variables, variables);

    // Generate target word count based on length option
    const targetWords = this.calculateTargetWords(options.length || 'standard');
    variables.targetWords = targetWords.toString();
    variables.length = options.length || 'standard';
    variables.tone = options.tone || 'professional';
    variables.focus = options.focus || 'compliance';

    // Substitute variables in both system and user prompts
    const systemPrompt = this.substituteVariables(template.systemPrompt, variables);
    const userPrompt = this.substituteVariables(template.userPrompt, variables);

    return userPrompt;
  }

  private extractVariables(
    companyContext: CompanyContext,
    projectContext: ProjectContext,
    options: NarrativeOptions
  ): Record<string, any> {
    const variables: Record<string, any> = {
      // Company context
      ...companyContext,
      
      // Project context
      ...projectContext,
      
      // Calculated fields
      estimatedCredit: Math.round(projectContext.totalExpenses * 0.1), // Rough 10% estimate
      businessImpact: this.generateBusinessImpact(projectContext),
      timeline: this.formatProjectTimeline(projectContext.startDate, projectContext.endDate),
    };

    return variables;
  }

  private generateBusinessImpact(projectContext: ProjectContext): string {
    const impacts = [
      'Enhanced technological capabilities and competitive positioning',
      'Improved operational efficiency through innovative solutions',
      'Development of proprietary intellectual property and know-how',
      'Strengthened market position through technological advancement'
    ];
    
    return impacts.join('. ');
  }

  private formatProjectTimeline(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    return `${duration}-month development period from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
  }

  private validateVariables(required: string[], provided: Record<string, any>): void {
    const missing = required.filter(variable => !(variable in provided));
    if (missing.length > 0) {
      throw new Error(`Missing required variables: ${missing.join(', ')}`);
    }
  }

  private calculateTargetWords(length: string): number {
    switch (length) {
      case 'brief': return 500;
      case 'standard': return 1000;
      case 'detailed': return 2000;
      default: return 1000;
    }
  }

  private substituteVariables(template: string, variables: Record<string, any>): string {
    let result = template;

    // Handle simple variable substitution {{variable}}
    result = result.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return variables[variable]?.toString() || match;
    });

    // Handle array iterations {{#each array}}...{{/each}}
    result = result.replace(/\{\{#each (\w+)\}\}(.*?)\{\{\/#each\}\}/g, (match, arrayName, itemTemplate) => {
      const array = variables[arrayName];
      if (!Array.isArray(array)) return '';
      
      return array.map((item, index) => {
        let itemResult = itemTemplate;
        
        // Handle {{this}} for simple arrays
        itemResult = itemResult.replace(/\{\{this\}\}/g, item.toString());
        
        // Handle {{@index}} for array index
        itemResult = itemResult.replace(/\{\{@index\}\}/g, (index + 1).toString());
        
        // Handle object properties {{property}}
        if (typeof item === 'object') {
          Object.keys(item).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            itemResult = itemResult.replace(regex, item[key]?.toString() || '');
          });
        }
        
        return itemResult;
      }).join('\n');
    });

    return result;
  }

  getTemplate(templateId: string): NarrativeTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): NarrativeTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCompliance(level: 'high' | 'medium' | 'low'): NarrativeTemplate[] {
    return this.getAllTemplates().filter(template => template.complianceLevel === level);
  }

  validateTemplate(templateId: string, variables: Record<string, any>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const template = this.templates.get(templateId);
    if (!template) {
      return {
        isValid: false,
        errors: [`Template not found: ${templateId}`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    const missing = template.variables.filter(variable => !(variable in variables));
    if (missing.length > 0) {
      errors.push(`Missing required variables: ${missing.join(', ')}`);
    }

    // Check for empty or undefined values
    template.variables.forEach(variable => {
      const value = variables[variable];
      if (value === undefined || value === null || value === '') {
        warnings.push(`Variable '${variable}' is empty or undefined`);
      }
    });

    // Check array variables have content
    ['technicalChallenges', 'innovations', 'uncertainties', 'rdActivities'].forEach(arrayVar => {
      if (variables[arrayVar] && Array.isArray(variables[arrayVar]) && variables[arrayVar].length === 0) {
        warnings.push(`Array variable '${arrayVar}' is empty`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  estimateTokens(templateId: string, variables: Record<string, any>): number {
    const template = this.templates.get(templateId);
    if (!template) return 0;

    const prompt = this.generateNarrative(
      templateId,
      variables as CompanyContext,
      variables as ProjectContext,
      variables as NarrativeOptions
    );

    // Rough estimation: 4 characters per token
    return Math.ceil((template.systemPrompt.length + prompt.length) / 4);
  }
}

// Singleton instance
let narrativePromptService: NarrativePromptService | null = null;

export function getNarrativePromptService(): NarrativePromptService {
  if (!narrativePromptService) {
    narrativePromptService = new NarrativePromptService();
  }
  return narrativePromptService;
}

export function setNarrativePromptService(service: NarrativePromptService): void {
  narrativePromptService = service;
}