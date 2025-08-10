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

  // Add document URLs to a customer record
  async updateDocumentUrls(recordId: string, documentUrls: string[]): Promise<void> {
    this.ensureConfigured();

    try {
      await this.base(this.tableName).update([
        {
          id: recordId,
          fields: {
            'Document URLs': documentUrls.join(', '),
            'Processing Status': 'documents_ready',
          }
        }
      ], { typecast: true });

      console.log(`Updated document URLs for Airtable record: ${recordId}`);
    } catch (error: any) {
      console.error('Failed to update document URLs:', error);
      throw new Error(`Airtable document URL update failed: ${error.message}`);
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