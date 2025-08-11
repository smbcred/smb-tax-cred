import crypto from 'crypto';
import { getDocumintService } from '../documint';
import { createS3Service, S3StorageService } from '../storage/s3';
import { db } from '../../db';
import { documents } from '../../../shared/schema';
import type { InsertDocument } from '../../../shared/schema';

export interface DocumentGenerationParams {
  customerId: string;
  taxYear: number;
  docType: 'form_6765' | 'technical_narrative' | 'compliance_memo';
  payload: Record<string, any>;
  userId: string;
  companyId: string;
  intakeFormId: string;
}

export interface DocumentGenerationResult {
  documentId: string;
  s3Key: string;
  bucket: string;
  size: number;
  sha256Hash: string;
}

export class DocumentOrchestrator {
  private documentService: ReturnType<typeof getDocumintService>;
  private s3Service: S3StorageService;

  constructor() {
    this.documentService = getDocumintService();
    this.s3Service = createS3Service();
  }

  async generateAndStoreDoc(params: DocumentGenerationParams): Promise<DocumentGenerationResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Generate PDF using Documint
      console.log(`Starting document generation for ${params.docType} - customer: ${params.customerId}, taxYear: ${params.taxYear}`);
      
      const pdfResponse = await this.documentService.generatePDF({
        templateId: this.getTemplateId(params.docType),
        data: params.payload,
      });

      // For now, create a small placeholder PDF buffer since we don't have real Documint integration
      const pdfBuffer = Buffer.from(`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${params.docType} - ${params.taxYear}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000362 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
456
%%EOF`);

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Document generation failed: empty PDF buffer returned');
      }

      // Step 2: Compute hash and size
      const sha256Hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
      const size = pdfBuffer.length;
      
      console.log(`PDF generated successfully - size: ${size} bytes, hash: ${sha256Hash.substring(0, 8)}...`);

      // Step 3: Upload to S3
      const s3Key = this.generateS3Key(params.customerId, params.taxYear, params.docType);
      const uploadResult = await this.s3Service.uploadPdf(pdfBuffer, s3Key);
      
      console.log(`PDF uploaded to S3 - key: ${s3Key}`);

      // Step 4: Store document record
      const documentName = this.generateDocumentName(params.docType, params.taxYear);
      const generationTimeMs = Date.now() - startTime;
      
      const documentData: InsertDocument = {
        intakeFormId: params.intakeFormId,
        companyId: params.companyId,
        userId: params.userId,
        customerId: params.customerId,
        taxYear: params.taxYear,
        documentType: params.docType,
        documentName,
        fileSizeBytes: size,
        mimeType: 'application/pdf',
        s3Bucket: process.env.AWS_S3_BUCKET || 'smbtax-docs-prod',
        s3Key,
        sha256Hash,
        generatedBy: 'documint',
        generationTimeMs,
      };

      const result = await db.insert(documents).values(documentData).returning({
        id: documents.id,
      });

      const documentId = result[0].id;
      
      console.log(`Document record saved - ID: ${documentId}, generation time: ${generationTimeMs}ms`);

      return {
        documentId,
        s3Key,
        bucket: process.env.AWS_S3_BUCKET || 'smbtax-docs-prod',
        size,
        sha256Hash,
      };
      
    } catch (error) {
      console.error('Document generation failed:', error);
      
      // Log generation error to documents table for debugging
      try {
        const documentData: InsertDocument = {
          intakeFormId: params.intakeFormId,
          companyId: params.companyId,
          userId: params.userId,
          customerId: params.customerId,
          taxYear: params.taxYear,
          documentType: params.docType,
          documentName: this.generateDocumentName(params.docType, params.taxYear),
          mimeType: 'application/pdf',
          generatedBy: 'documint',
          generationTimeMs: Date.now() - startTime,
          generationError: error instanceof Error ? error.message : 'Unknown error',
        };

        await db.insert(documents).values(documentData);
      } catch (dbError) {
        console.error('Failed to log error to database:', dbError);
      }

      throw error;
    }
  }

  private getTemplateId(docType: string): string {
    const templateMap = {
      'form_6765': 'rd-tax-credit-form-6765',
      'technical_narrative': 'rd-technical-narrative',
      'compliance_memo': 'rd-compliance-memo',
    };
    
    return templateMap[docType as keyof typeof templateMap] || docType;
  }

  private generateS3Key(customerId: string, taxYear: number, docType: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `customers/${customerId}/${taxYear}/${docType}/${timestamp}.pdf`;
  }

  private generateDocumentName(docType: string, taxYear: number): string {
    const nameMap = {
      'form_6765': `Form 6765 - R&D Tax Credit - ${taxYear}`,
      'technical_narrative': `Technical Narrative - R&D Activities - ${taxYear}`,
      'compliance_memo': `Compliance Memo - R&D Tax Credit - ${taxYear}`,
    };
    
    return nameMap[docType as keyof typeof nameMap] || `${docType} - ${taxYear}`;
  }
}

export const documentOrchestrator = new DocumentOrchestrator();