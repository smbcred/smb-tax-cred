import { z } from 'zod';

// Documint API schemas
export const documintTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  fields: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'number', 'date', 'boolean', 'array']),
    required: z.boolean().default(false),
    description: z.string().optional(),
  })),
});

export const form6765DataSchema = z.object({
  // Company Information
  companyName: z.string().min(1, "Company name is required"),
  ein: z.string().optional(),
  taxYear: z.number().min(2000).max(new Date().getFullYear() + 1),
  businessType: z.enum(['corporation', 'llc', 'partnership', 'sole_proprietorship']),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),

  // R&D Credit Calculation
  currentYearExpenses: z.object({
    wages: z.number().min(0, "Wages must be non-negative"),
    contractors: z.number().min(0, "Contractor expenses must be non-negative"),
    supplies: z.number().min(0, "Supply expenses must be non-negative"),
    total: z.number().min(0, "Total expenses must be non-negative"),
  }),
  
  // Prior Year Data (for ASC calculation)
  priorYearData: z.array(z.object({
    year: z.number(),
    expenses: z.number().min(0),
  })).optional(),

  // Activity Summary
  rdActivities: z.array(z.object({
    activity: z.string(),
    description: z.string(),
    hours: z.number().min(0),
    wages: z.number().min(0),
    category: z.enum(['experimentation', 'testing', 'analysis', 'development', 'evaluation']),
  })),

  // Technical Information
  technicalChallenges: z.array(z.string()),
  uncertainties: z.array(z.string()),
  innovations: z.array(z.string()),
  businessPurpose: z.string(),

  // Credit Calculation Results
  calculations: z.object({
    totalQualifiedExpenses: z.number(),
    averageGrossReceipts: z.number().optional(),
    ascPercentage: z.number(),
    baseAmount: z.number(),
    creditAmount: z.number(),
    riskLevel: z.enum(['low', 'medium', 'high']),
  }),

  // Documentation Attachments
  attachments: z.object({
    narrativeContent: z.string().optional(),
    complianceMemo: z.string().optional(),
    supportingDocuments: z.array(z.string()).optional(),
  }).optional(),
});

export const pdfGenerationRequestSchema = z.object({
  templateId: z.string(),
  data: form6765DataSchema,
  options: z.object({
    format: z.enum(['pdf', 'docx']).default('pdf'),
    quality: z.enum(['draft', 'standard', 'high']).default('standard'),
    includeAttachments: z.boolean().default(true),
    watermark: z.boolean().default(false),
  }).optional(),
});

export const pdfGenerationResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  downloadUrl: z.string().optional(),
  previewUrl: z.string().optional(),
  metadata: z.object({
    pages: z.number().optional(),
    size: z.number().optional(),
    format: z.string().optional(),
    generatedAt: z.string().optional(),
  }).optional(),
  errors: z.array(z.string()).optional(),
});

export type DocumintTemplate = z.infer<typeof documintTemplateSchema>;
export type Form6765Data = z.infer<typeof form6765DataSchema>;
export type PDFGenerationRequest = z.infer<typeof pdfGenerationRequestSchema>;
export type PDFGenerationResponse = z.infer<typeof pdfGenerationResponseSchema>;

export class DocumintService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.documint.me/1';
  private readonly form6765TemplateId = 'form-6765-rd-credit';

  constructor() {
    this.apiKey = process.env.DOCUMINT_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('DOCUMINT_API_KEY not provided - PDF generation will use placeholder functionality');
    }
  }

  async generatePDF(request: PDFGenerationRequest): Promise<PDFGenerationResponse> {
    if (!this.apiKey) {
      // Return placeholder response when API key is not available
      const placeholderResponse: PDFGenerationResponse = {
        id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed',
        downloadUrl: `/api/documents/placeholder-form-6765.pdf`,
        previewUrl: `/api/documents/placeholder-form-6765-preview.pdf`,
        metadata: {
          pages: 4,
          size: 145000, // ~145KB
          format: 'pdf',
          generatedAt: new Date().toISOString(),
        },
      };

      console.log('Generated placeholder PDF response:', {
        id: placeholderResponse.id,
        templateId: request.templateId,
        companyName: request.data.companyName,
      });

      return placeholderResponse;
    }

    try {
      console.log('Generating PDF with Documint:', {
        templateId: request.templateId,
        companyName: request.data.companyName,
        taxYear: request.data.taxYear,
        totalExpenses: request.data.currentYearExpenses.total,
      });

      const response = await fetch(`${this.baseUrl}/templates/${request.templateId}/render`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: this.mapToTemplateFields(request.data),
          options: request.options || {},
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Documint API error: ${response.status} - ${error}`);
      }

      const result = await response.json();
      
      const validatedResponse = pdfGenerationResponseSchema.parse(result);
      
      console.log('PDF generation completed:', {
        id: validatedResponse.id,
        status: validatedResponse.status,
        pages: validatedResponse.metadata?.pages,
      });

      return validatedResponse;

    } catch (error: any) {
      console.error('PDF generation error:', error);
      
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  async getTemplate(templateId: string): Promise<DocumintTemplate> {
    if (!this.apiKey) {
      // Return placeholder template structure
      return {
        id: templateId,
        name: 'Form 6765 - R&D Tax Credit',
        description: 'IRS Form 6765 for Research and Development Tax Credit',
        fields: this.getForm6765Fields(),
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Documint API error: ${response.status} - ${error}`);
      }

      const template = await response.json();
      return documintTemplateSchema.parse(template);

    } catch (error: any) {
      console.error('Template fetch error:', error);
      throw new Error(`Failed to fetch template: ${error.message}`);
    }
  }

  async checkPDFStatus(pdfId: string): Promise<PDFGenerationResponse> {
    if (!this.apiKey) {
      // Return placeholder completed status
      return {
        id: pdfId,
        status: 'completed',
        downloadUrl: `/api/documents/${pdfId}.pdf`,
        previewUrl: `/api/documents/${pdfId}-preview.pdf`,
        metadata: {
          pages: 4,
          size: 145000,
          format: 'pdf',
          generatedAt: new Date().toISOString(),
        },
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/documents/${pdfId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Documint API error: ${response.status} - ${error}`);
      }

      const result = await response.json();
      return pdfGenerationResponseSchema.parse(result);

    } catch (error: any) {
      console.error('PDF status check error:', error);
      throw new Error(`Failed to check PDF status: ${error.message}`);
    }
  }

  private mapToTemplateFields(data: Form6765Data): Record<string, any> {
    // Map our structured data to Form 6765 template fields
    return {
      // Part I - Current Year Credit
      companyName: data.companyName,
      ein: data.ein || '',
      taxYear: data.taxYear,
      businessType: this.mapBusinessType(data.businessType),
      
      // Address information
      street: data.address?.street || '',
      city: data.address?.city || '',
      state: data.address?.state || '',
      zipCode: data.address?.zipCode || '',

      // Line 1 - Qualified research expenses
      wages: data.currentYearExpenses.wages,
      contractors: Math.min(data.currentYearExpenses.contractors, data.currentYearExpenses.wages * 0.65), // 65% limit
      supplies: data.currentYearExpenses.supplies,
      totalQualifiedExpenses: data.currentYearExpenses.total,

      // Line 2-5 - Base amount calculation
      averageGrossReceipts: data.calculations.averageGrossReceipts || 0,
      ascPercentage: data.calculations.ascPercentage,
      baseAmount: data.calculations.baseAmount,

      // Line 6 - Credit calculation
      creditAmount: data.calculations.creditAmount,
      riskLevel: data.calculations.riskLevel,

      // Activity details
      rdActivities: data.rdActivities.map(activity => ({
        description: activity.activity,
        details: activity.description,
        hours: activity.hours,
        wages: activity.wages,
        category: activity.category,
      })),

      // Technical documentation
      technicalChallenges: data.technicalChallenges.join('\n\n'),
      uncertainties: data.uncertainties.join('\n\n'),
      innovations: data.innovations.join('\n\n'),
      businessPurpose: data.businessPurpose,

      // Attachments
      narrativeIncluded: !!data.attachments?.narrativeContent,
      complianceMemoIncluded: !!data.attachments?.complianceMemo,
      supportingDocsCount: data.attachments?.supportingDocuments?.length || 0,

      // Generation metadata
      generatedDate: new Date().toLocaleDateString(),
      generatedTime: new Date().toLocaleTimeString(),
    };
  }

  private mapBusinessType(businessType: string): string {
    const typeMap: Record<string, string> = {
      'corporation': 'Corporation',
      'llc': 'Limited Liability Company',
      'partnership': 'Partnership',
      'sole_proprietorship': 'Sole Proprietorship',
    };
    
    return typeMap[businessType] || businessType;
  }

  private getForm6765Fields() {
    return [
      { name: 'companyName', type: 'text' as const, required: true, description: 'Company legal name' },
      { name: 'ein', type: 'text' as const, required: false, description: 'Employer Identification Number' },
      { name: 'taxYear', type: 'number' as const, required: true, description: 'Tax year for credit claim' },
      { name: 'businessType', type: 'text' as const, required: true, description: 'Type of business entity' },
      { name: 'street', type: 'text' as const, required: false, description: 'Business address street' },
      { name: 'city', type: 'text' as const, required: false, description: 'Business address city' },
      { name: 'state', type: 'text' as const, required: false, description: 'Business address state' },
      { name: 'zipCode', type: 'text' as const, required: false, description: 'Business address ZIP code' },
      { name: 'wages', type: 'number' as const, required: true, description: 'Qualified research wages' },
      { name: 'contractors', type: 'number' as const, required: true, description: 'Qualified contractor expenses' },
      { name: 'supplies', type: 'number' as const, required: true, description: 'Qualified supply expenses' },
      { name: 'totalQualifiedExpenses', type: 'number' as const, required: true, description: 'Total qualified research expenses' },
      { name: 'averageGrossReceipts', type: 'number' as const, required: false, description: 'Average gross receipts for ASC calculation' },
      { name: 'ascPercentage', type: 'number' as const, required: true, description: 'Alternative Simplified Credit percentage' },
      { name: 'baseAmount', type: 'number' as const, required: true, description: 'Base amount for credit calculation' },
      { name: 'creditAmount', type: 'number' as const, required: true, description: 'Calculated research credit amount' },
      { name: 'rdActivities', type: 'array' as const, required: true, description: 'List of R&D activities' },
      { name: 'technicalChallenges', type: 'text' as const, required: true, description: 'Technical challenges encountered' },
      { name: 'uncertainties', type: 'text' as const, required: true, description: 'Technical uncertainties resolved' },
      { name: 'innovations', type: 'text' as const, required: true, description: 'Innovations developed' },
      { name: 'businessPurpose', type: 'text' as const, required: true, description: 'Business purpose of R&D activities' },
    ];
  }

  // Batch processing capability
  async generateBatchPDFs(requests: PDFGenerationRequest[]): Promise<PDFGenerationResponse[]> {
    console.log(`Starting batch PDF generation for ${requests.length} documents`);
    
    const batchSize = 5; // Process 5 PDFs at a time
    const results: PDFGenerationResponse[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(requests.length / batchSize)}`);
      
      const batchPromises = batch.map(request => this.generatePDF(request));
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('Batch PDF generation error:', result.reason);
          // Add failed result with error status
          results.push({
            id: `failed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: 'failed',
            errors: [result.reason.message || 'Unknown error'],
          });
        }
      }
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Batch PDF generation completed: ${results.length} results`);
    return results;
  }

  // Quality verification
  async verifyPDFQuality(pdfId: string): Promise<{
    isValid: boolean;
    issues: string[];
    score: number;
  }> {
    const status = await this.checkPDFStatus(pdfId);
    
    const issues: string[] = [];
    let score = 100;
    
    // Check if PDF was generated successfully
    if (status.status !== 'completed') {
      issues.push('PDF generation not completed');
      score -= 50;
    }
    
    // Check for errors
    if (status.errors && status.errors.length > 0) {
      issues.push(...status.errors);
      score -= status.errors.length * 10;
    }
    
    // Check metadata quality
    if (!status.metadata) {
      issues.push('Missing PDF metadata');
      score -= 10;
    } else {
      if (!status.metadata.pages || status.metadata.pages < 1) {
        issues.push('Invalid page count');
        score -= 15;
      }
      
      if (!status.metadata.size || status.metadata.size < 1000) {
        issues.push('PDF file too small - may be corrupted');
        score -= 20;
      }
    }
    
    // Check download URL availability
    if (!status.downloadUrl) {
      issues.push('Download URL not available');
      score -= 25;
    }
    
    const isValid = score >= 70 && issues.length === 0;
    
    console.log('PDF quality verification:', {
      pdfId,
      isValid,
      score,
      issueCount: issues.length,
    });
    
    return {
      isValid,
      issues,
      score: Math.max(0, score),
    };
  }
}

// Singleton instance
let documintService: DocumintService | null = null;

export function getDocumintService(): DocumintService {
  if (!documintService) {
    documintService = new DocumintService();
  }
  return documintService;
}