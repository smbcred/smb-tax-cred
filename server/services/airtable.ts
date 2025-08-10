import Airtable from 'airtable';
import type { IntakeForm } from '@shared/schema';

interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tableName: string;
}

interface AirtableRecord {
  id?: string;
  fields: Record<string, any>;
}

interface CustomerRecord {
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  taxYear: number;
  formStatus: string;
  submittedAt?: string;
  totalQRE?: number;
  estimatedCredit?: number;
  processingStatus: string;
  documentUrls?: string[];
  notes?: string;
}

export class AirtableService {
  private base!: Airtable.Base;
  private tableName!: string;
  private isConfigured: boolean = false;

  constructor(config?: AirtableConfig) {
    if (config) {
      this.configure(config);
    }
  }

  configure(config: AirtableConfig): void {
    try {
      if (!config.apiKey || !config.baseId || !config.tableName) {
        throw new Error('Missing required Airtable configuration: apiKey, baseId, or tableName');
      }

      Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: config.apiKey,
      });

      this.base = Airtable.base(config.baseId);
      this.tableName = config.tableName;
      this.isConfigured = true;

      console.log(`Airtable service configured for base: ${config.baseId}, table: ${config.tableName}`);
    } catch (error: any) {
      console.error('Failed to configure Airtable service:', error.message);
      throw new Error(`Airtable configuration failed: ${error.message}`);
    }
  }

  private ensureConfigured(): void {
    if (!this.isConfigured) {
      throw new Error('Airtable service not configured. Call configure() first.');
    }
  }

  // Field mapping from IntakeForm to Airtable Customer Record
  private mapIntakeFormToAirtable(form: IntakeForm): CustomerRecord {
    const companyInfo = form.companyInfo as any || {};
    const expenseData = form.expenseBreakdown as any || {};
    
    return {
      companyName: companyInfo.companyName || 'Unknown Company',
      contactEmail: companyInfo.contactEmail || '',
      contactPhone: companyInfo.contactPhone || '',
      taxYear: form.taxYear,
      formStatus: form.status || 'draft',
      submittedAt: form.submittedAt?.toISOString() || undefined,
      totalQRE: form.totalQre ? parseFloat(form.totalQre.toString()) : undefined,
      estimatedCredit: this.calculateEstimatedCredit(form),
      processingStatus: form.airtableSyncStatus || 'pending',
      documentUrls: [], // Will be populated when documents are generated
      notes: `Form ID: ${form.id}, User ID: ${form.userId}`,
    };
  }

  private calculateEstimatedCredit(form: IntakeForm): number | undefined {
    if (!form.totalQre) return undefined;
    
    const qre = parseFloat(form.totalQre.toString());
    // Simplified credit calculation - 6% for first-time, 14% for established
    const rate = 0.14; // Default to established rate
    return Math.round(qre * rate);
  }

  // Create a new customer record in Airtable
  async createCustomerRecord(intakeForm: IntakeForm): Promise<string> {
    this.ensureConfigured();

    try {
      const customerData = this.mapIntakeFormToAirtable(intakeForm);
      
      const records = await this.base(this.tableName).create([
        {
          fields: {
            'Company Name': customerData.companyName,
            'Contact Email': customerData.contactEmail,
            'Contact Phone': customerData.contactPhone || '',
            'Tax Year': customerData.taxYear,
            'Form Status': customerData.formStatus,
            'Submitted At': customerData.submittedAt || '',
            'Total QRE': customerData.totalQRE || 0,
            'Estimated Credit': customerData.estimatedCredit || 0,
            'Processing Status': customerData.processingStatus,
            'Document URLs': customerData.documentUrls?.join(', ') || '',
            'Notes': customerData.notes || '',
          }
        }
      ], { typecast: true });

      const recordId = records[0].id;
      console.log(`Created Airtable record: ${recordId} for form: ${intakeForm.id}`);
      
      return recordId;
    } catch (error: any) {
      console.error('Failed to create Airtable customer record:', error);
      throw new Error(`Airtable record creation failed: ${error.message}`);
    }
  }

  // Update an existing customer record
  async updateCustomerRecord(recordId: string, intakeForm: IntakeForm): Promise<void> {
    this.ensureConfigured();

    try {
      const customerData = this.mapIntakeFormToAirtable(intakeForm);
      
      await this.base(this.tableName).update([
        {
          id: recordId,
          fields: {
            'Company Name': customerData.companyName,
            'Contact Email': customerData.contactEmail,
            'Contact Phone': customerData.contactPhone || '',
            'Tax Year': customerData.taxYear,
            'Form Status': customerData.formStatus,
            'Submitted At': customerData.submittedAt || '',
            'Total QRE': customerData.totalQRE || 0,
            'Estimated Credit': customerData.estimatedCredit || 0,
            'Processing Status': customerData.processingStatus,
            'Notes': customerData.notes || '',
          }
        }
      ], { typecast: true });

      console.log(`Updated Airtable record: ${recordId} for form: ${intakeForm.id}`);
    } catch (error: any) {
      console.error('Failed to update Airtable customer record:', error);
      throw new Error(`Airtable record update failed: ${error.message}`);
    }
  }



  // Get a customer record by ID
  async getCustomerRecord(recordId: string): Promise<AirtableRecord | null> {
    this.ensureConfigured();

    try {
      const record = await this.base(this.tableName).find(recordId);
      return {
        id: record.id,
        fields: record.fields,
      };
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      console.error('Failed to get Airtable customer record:', error);
      throw new Error(`Airtable record retrieval failed: ${error.message}`);
    }
  }

  // Update processing status
  async updateProcessingStatus(recordId: string, status: string, notes?: string): Promise<void> {
    this.ensureConfigured();

    try {
      const updateFields: Record<string, any> = {
        'Processing Status': status,
      };

      if (notes) {
        updateFields['Notes'] = notes;
      }

      await this.base(this.tableName).update([
        {
          id: recordId,
          fields: updateFields
        }
      ], { typecast: true });

      console.log(`Updated processing status to "${status}" for Airtable record: ${recordId}`);
    } catch (error: any) {
      console.error('Failed to update processing status:', error);
      throw new Error(`Airtable status update failed: ${error.message}`);
    }
  }

  // Trigger webhook for Make.com automation
  async triggerWebhook(intakeForm: IntakeForm, webhookUrl?: string): Promise<boolean> {
    const url = webhookUrl || process.env.MAKE_WEBHOOK_URL;
    
    if (!url) {
      console.warn('No webhook URL configured - skipping webhook trigger');
      return false;
    }

    try {
      const payload = {
        formId: intakeForm.id,
        companyId: intakeForm.companyId,
        userId: intakeForm.userId,
        airtableRecordId: intakeForm.airtableRecordId,
        status: intakeForm.status,
        totalQre: intakeForm.totalQre,
        submittedAt: intakeForm.submittedAt,
        taxYear: intakeForm.taxYear,
        companyInfo: intakeForm.companyInfo,
        calculationData: intakeForm.calculationData,
        timestamp: new Date().toISOString(),
        eventType: 'form_submitted'
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Event-Type': 'intake-form-submission',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
      }

      console.log(`Webhook triggered successfully for form: ${intakeForm.id}`);
      return true;
    } catch (error: any) {
      console.error('Failed to trigger webhook:', error);
      throw new Error(`Webhook trigger failed: ${error.message}`);
    }
  }

  // Sync intake form with calculation results
  async syncWithCalculationResults(intakeForm: IntakeForm, calculationResults?: any): Promise<string> {
    this.ensureConfigured();

    try {
      let recordId = intakeForm.airtableRecordId;
      
      // Create new record if it doesn't exist
      if (!recordId) {
        recordId = await this.createCustomerRecord(intakeForm);
      } else {
        // Update existing record
        await this.updateCustomerRecord(recordId, intakeForm);
      }

      // Update with calculation results if provided
      if (calculationResults) {
        await this.base(this.tableName).update([
          {
            id: recordId,
            fields: {
              'Total QRE': calculationResults.totalQre || 0,
              'Estimated Credit': calculationResults.estimatedCredit || 0,
              'Processing Status': 'calculation_complete',
              'Updated At': new Date().toISOString(),
            }
          }
        ], { typecast: true });
      }

      // Trigger webhook for automation
      try {
        await this.triggerWebhook(intakeForm);
      } catch (webhookError: any) {
        console.warn('Webhook trigger failed, but sync succeeded:', webhookError.message);
      }

      return recordId;
    } catch (error: any) {
      console.error('Failed to sync with calculation results:', error);
      throw new Error(`Calculation results sync failed: ${error.message}`);
    }
  }

  // Update document URLs in Airtable record
  async updateDocumentUrls(recordId: string, documentUrls: Record<string, string>): Promise<void> {
    this.ensureConfigured();

    try {
      const updateFields: Record<string, any> = {
        'Updated At': new Date().toISOString(),
      };

      // Map document types to Airtable fields
      if (documentUrls.compliance_memo) {
        updateFields['Compliance Memo URL'] = documentUrls.compliance_memo;
      }
      if (documentUrls.supporting_docs) {
        updateFields['Supporting Documents URL'] = documentUrls.supporting_docs;
      }
      if (documentUrls.calculation_summary) {
        updateFields['Calculation Summary URL'] = documentUrls.calculation_summary;
      }
      if (documentUrls.tax_forms) {
        updateFields['Tax Forms URL'] = documentUrls.tax_forms;
      }

      await this.base(this.tableName).update([
        {
          id: recordId,
          fields: updateFields
        }
      ], { typecast: true });

      console.log(`Updated document URLs for Airtable record: ${recordId}`);
    } catch (error: any) {
      console.error('Failed to update document URLs:', error);
      throw new Error(`Document URL update failed: ${error.message}`);
    }
  }

  // Update document generation status
  async updateDocumentStatus(recordId: string, status: string, documentType?: string): Promise<void> {
    this.ensureConfigured();

    try {
      const updateFields: Record<string, any> = {
        'Document Generation Status': status,
        'Updated At': new Date().toISOString(),
      };

      if (documentType) {
        updateFields['Current Document Type'] = documentType;
      }

      await this.base(this.tableName).update([
        {
          id: recordId,
          fields: updateFields
        }
      ], { typecast: true });

      console.log(`Updated document status to "${status}" for record: ${recordId}`);
    } catch (error: any) {
      console.error('Failed to update document status:', error);
      throw new Error(`Document status update failed: ${error.message}`);
    }
  }

  // Track document expiration
  async updateDocumentExpiration(recordId: string, documentType: string, expirationDate: Date): Promise<void> {
    this.ensureConfigured();

    try {
      const updateFields: Record<string, any> = {
        [`${documentType} Expiration`]: expirationDate.toISOString(),
        'Updated At': new Date().toISOString(),
      };

      await this.base(this.tableName).update([
        {
          id: recordId,
          fields: updateFields
        }
      ], { typecast: true });

      console.log(`Updated document expiration for ${documentType} in record: ${recordId}`);
    } catch (error: any) {
      console.error('Failed to update document expiration:', error);
      throw new Error(`Document expiration update failed: ${error.message}`);
    }
  }

  // Test connection to Airtable
  async testConnection(): Promise<boolean> {
    this.ensureConfigured();

    try {
      // Try to list records with a limit of 1 to test connection
      const records = await this.base(this.tableName).select({
        maxRecords: 1,
        view: 'Grid view'
      }).firstPage();

      console.log('Airtable connection test successful');
      return true;
    } catch (error: any) {
      console.error('Airtable connection test failed:', error);
      return false;
    }
  }

  // Handle rate limiting with exponential backoff
  private async withRetry<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        
        // Check if it's a rate limit error
        if (error.statusCode === 429 && attempt <= maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    
    throw new Error('Max retries exceeded');
  }
}

// Singleton instance for the application
let airtableService: AirtableService;

export function getAirtableService(): AirtableService {
  if (!airtableService) {
    airtableService = new AirtableService();
    
    // Configure if environment variables are available
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Customers';
    
    if (apiKey && baseId) {
      try {
        airtableService.configure({ apiKey, baseId, tableName });
      } catch (error) {
        console.warn('Failed to auto-configure Airtable service:', error);
      }
    } else {
      console.warn('Airtable not configured - missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID environment variables');
    }
  }
  
  return airtableService;
}

export default AirtableService;