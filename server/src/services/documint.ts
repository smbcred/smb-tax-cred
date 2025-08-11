/**
 * @file documint.ts
 * @description Documint PDF generation service integration
 * @author SMBTaxCredits.com Team
 * @date 2025-08-11
 * 
 * Handles R&D Tax Credit document generation using Documint API
 * with S3 storage integration for secure document delivery.
 */

import fetch from 'node-fetch';
import { ObjectStorageService } from '../../objectStorage';

// Environment variables
const DOCUMINT_API_KEY = process.env.DOCUMINT_API_KEY;
const DOCUMINT_CREATE_URL = process.env.DOCUMINT_CREATE_URL || 'https://api.documint.me/1/create';
const DOCUMINT_TEMPLATE_RD_PACKAGE = process.env.DOCUMINT_TEMPLATE_RD_PACKAGE;
const DOCUMINT_PREVIEW = process.env.DOCUMINT_PREVIEW === 'true';

interface DocumintCreateRequest {
  template_id: string;
  data: Record<string, any>;
  output_name?: string;
  webhook_url?: string;
  test?: boolean;
}

interface DocumintCreateResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  error?: string;
}

interface RDPackageData {
  // Company Information
  companyName: string;
  companyAddress: string;
  taxYear: number;
  ein?: string;
  
  // R&D Tax Credit Calculation Results
  federalCredit: number;
  totalQRE: number;
  
  // QRE Breakdown
  qreBreakdown: {
    wages: number;
    contractors: number;
    supplies: number;
    cloudAndSoftware: number;
    total: number;
  };
  
  // Activities and Methodology
  qualifyingActivities: string[];
  businessType: string;
  rdAllocationPercentage: number;
  
  // QSB Analysis (if applicable)
  qsbAnalysis?: {
    isEligible: boolean;
    quarterlyBenefit: number;
    payrollOffsetAvailable: boolean;
  };
  
  // Legislative Context
  legislativeContext?: {
    alerts: Array<{
      type: 'warning' | 'benefit' | 'info';
      message: string;
      impact: string;
    }>;
  };
}

export class DocumintService {
  private objectStorageService: ObjectStorageService;
  
  constructor() {
    this.objectStorageService = new ObjectStorageService();
    
    if (!DOCUMINT_API_KEY) {
      console.warn('DOCUMINT_API_KEY not configured - Documint service disabled');
    }
  }
  
  /**
   * Generate R&D Tax Credit documentation package and store in S3
   */
  async generateAndStoreRDPackage(data: RDPackageData): Promise<{
    documentId: string;
    s3Url?: string;
    previewMode: boolean;
  }> {
    if (!DOCUMINT_API_KEY) {
      throw new Error('Documint API key not configured');
    }
    
    if (!DOCUMINT_TEMPLATE_RD_PACKAGE) {
      throw new Error('Documint R&D template ID not configured');
    }
    
    // Prepare document generation request
    const documintRequest: DocumintCreateRequest = {
      template_id: DOCUMINT_TEMPLATE_RD_PACKAGE,
      data: this.formatDataForTemplate(data),
      output_name: `rd-tax-credit-package-${data.companyName.replace(/[^a-zA-Z0-9]/g, '-')}-${data.taxYear}`,
      test: DOCUMINT_PREVIEW
    };
    
    console.log('Creating document with Documint:', {
      template_id: documintRequest.template_id,
      company: data.companyName,
      preview: DOCUMINT_PREVIEW
    });
    
    // Generate document via Documint API
    const response = await fetch(DOCUMINT_CREATE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DOCUMINT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(documintRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Documint API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json() as DocumintCreateResponse;
    
    if (result.status === 'failed') {
      throw new Error(`Document generation failed: ${result.error}`);
    }
    
    console.log('Document created:', {
      id: result.id,
      status: result.status,
      hasDownloadUrl: !!result.download_url
    });
    
    // If document is immediately available, upload to S3
    let s3Url: string | undefined;
    
    if (result.download_url && result.status === 'completed') {
      try {
        s3Url = await this.uploadDocumentToS3(result.download_url, documintRequest.output_name || result.id);
        console.log('Document uploaded to S3:', s3Url);
      } catch (error) {
        console.error('Failed to upload to S3:', error);
        // Don't fail the entire operation if S3 upload fails
      }
    }
    
    return {
      documentId: result.id,
      s3Url,
      previewMode: DOCUMINT_PREVIEW || false
    };
  }
  
  /**
   * Upload generated document from Documint to S3
   */
  private async uploadDocumentToS3(downloadUrl: string, filename: string): Promise<string> {
    // Download document from Documint
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.status}`);
    }
    
    const documentBuffer = await response.buffer();
    
    // Get upload URL for S3
    const uploadUrl = await this.objectStorageService.getObjectEntityUploadURL();
    
    // Upload to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: documentBuffer,
      headers: {
        'Content-Type': 'application/pdf'
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload to S3: ${uploadResponse.status}`);
    }
    
    // Return the normalized S3 object path
    return this.objectStorageService.normalizeObjectEntityPath(uploadUrl);
  }
  
  /**
   * Format R&D package data for Documint template
   */
  private formatDataForTemplate(data: RDPackageData): Record<string, any> {
    return {
      // Company Information
      company_name: data.companyName,
      company_address: data.companyAddress,
      tax_year: data.taxYear,
      ein: data.ein || '',
      
      // Financial Results
      federal_credit: data.federalCredit,
      federal_credit_formatted: this.formatCurrency(data.federalCredit),
      total_qre: data.totalQRE,
      total_qre_formatted: this.formatCurrency(data.totalQRE),
      
      // QRE Breakdown
      wages_qre: data.qreBreakdown.wages,
      wages_qre_formatted: this.formatCurrency(data.qreBreakdown.wages),
      contractors_qre: data.qreBreakdown.contractors,
      contractors_qre_formatted: this.formatCurrency(data.qreBreakdown.contractors),
      supplies_qre: data.qreBreakdown.supplies,
      supplies_qre_formatted: this.formatCurrency(data.qreBreakdown.supplies),
      cloud_software_qre: data.qreBreakdown.cloudAndSoftware,
      cloud_software_qre_formatted: this.formatCurrency(data.qreBreakdown.cloudAndSoftware),
      
      // Business Context
      business_type: data.businessType,
      rd_allocation_percentage: data.rdAllocationPercentage,
      qualifying_activities: data.qualifyingActivities.join(', '),
      
      // QSB Benefits
      is_qsb_eligible: data.qsbAnalysis?.isEligible || false,
      qsb_quarterly_benefit: data.qsbAnalysis?.quarterlyBenefit || 0,
      qsb_quarterly_benefit_formatted: this.formatCurrency(data.qsbAnalysis?.quarterlyBenefit || 0),
      payroll_offset_available: data.qsbAnalysis?.payrollOffsetAvailable || false,
      
      // Legislative Alerts
      has_legislative_alerts: (data.legislativeContext?.alerts.length || 0) > 0,
      legislative_alerts: data.legislativeContext?.alerts || [],
      
      // Generated metadata
      generated_date: new Date().toLocaleDateString(),
      generated_time: new Date().toLocaleTimeString(),
      document_version: '2025.1'
    };
  }
  
  /**
   * Format currency values for template
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  /**
   * Check if Documint service is configured and available
   */
  isConfigured(): boolean {
    return !!(DOCUMINT_API_KEY && DOCUMINT_TEMPLATE_RD_PACKAGE);
  }
  
  /**
   * Get service configuration status
   */
  getConfig(): {
    hasApiKey: boolean;
    hasTemplateId: boolean;
    createUrl: string;
    previewMode: boolean;
  } {
    return {
      hasApiKey: !!DOCUMINT_API_KEY,
      hasTemplateId: !!DOCUMINT_TEMPLATE_RD_PACKAGE,
      createUrl: DOCUMINT_CREATE_URL,
      previewMode: DOCUMINT_PREVIEW || false
    };
  }
}

// Export singleton instance
export const documintService = new DocumintService();