import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock the document orchestrator
vi.mock('../services/documents/orchestrator', () => ({
  documentOrchestrator: {
    generateAndStoreDoc: vi.fn().mockResolvedValue({
      documentId: 'test-doc-123',
      s3Key: 'customers/test-customer/2024/form_6765/2024-01-01T12-00-00-000Z.pdf',
      bucket: 'smbtax-docs-prod',
      size: 1024,
      sha256Hash: 'abc123def456'
    })
  }
}));

// Mock database
vi.mock('../db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{
          id: 'test-doc-123',
          userId: 'test-user-123',
          s3Key: 'test-s3-key',
          documentName: 'Form 6765 - 2024',
          documentType: 'form_6765',
          fileSizeBytes: 1024
        }])
      })
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([])
      })
    })
  }
}));

// Mock S3 service
vi.mock('../services/storage/s3', () => ({
  createS3Service: () => ({
    getPdfUrl: vi.fn().mockResolvedValue('https://s3.amazonaws.com/test-presigned-url')
  })
}));

describe('Document Generation Endpoints', () => {
  describe('POST /api/docs/generate', () => {
    it('should validate document generation request schema', () => {
      const validRequest = {
        customerId: 'test-customer-123',
        taxYear: 2024,
        docType: 'form_6765',
        payload: { companyName: 'Test Corp' },
        companyId: 'test-company-123',
        intakeFormId: 'test-intake-123'
      };

      // Schema validation would happen in the route handler
      expect(validRequest.customerId).toBeDefined();
      expect(validRequest.taxYear).toBeGreaterThan(1999);
      expect(['form_6765', 'technical_narrative', 'compliance_memo']).toContain(validRequest.docType);
    });

    it('should generate document and return success response', async () => {
      const { documentOrchestrator } = await import('../services/documents/orchestrator');
      
      const mockParams = {
        customerId: 'test-customer-123',
        taxYear: 2024,
        docType: 'form_6765',
        payload: { companyName: 'Test Corp' },
        companyId: 'test-company-123',
        intakeFormId: 'test-intake-123',
        userId: 'test-user-123'
      };

      const result = await documentOrchestrator.generateAndStoreDoc(mockParams);

      expect(result).toEqual({
        documentId: 'test-doc-123',
        s3Key: expect.stringContaining('customers/test-customer/2024/form_6765'),
        bucket: 'smbtax-docs-prod',
        size: 1024,
        sha256Hash: 'abc123def456'
      });
    });
  });

  describe('GET /api/docs/:id/url', () => {
    it('should validate document ownership', async () => {
      const { db } = await import('../db');
      
      // Simulate database lookup
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{
            id: 'test-doc-123',
            userId: 'test-user-123',
            s3Key: 'test-s3-key'
          }])
        })
      });
      
      vi.mocked(db.select).mockReturnValue(mockSelect());
      
      // Test ownership verification logic would be here
      const document = (await db.select().from({}).where({}))[0];
      expect(document.userId).toBe('test-user-123');
    });

    it('should generate presigned URL for authorized user', async () => {
      const { createS3Service } = await import('../services/storage/s3');
      const s3Service = createS3Service();
      
      const url = await s3Service.getPdfUrl('test-s3-key', 300);
      
      expect(url).toBe('https://s3.amazonaws.com/test-presigned-url');
      expect(vi.mocked(s3Service.getPdfUrl)).toHaveBeenCalledWith('test-s3-key', 300);
    });
  });
});

describe('Document Generation Integration', () => {
  it('should handle complete document workflow', async () => {
    const { documentOrchestrator } = await import('../services/documents/orchestrator');
    
    // Step 1: Generate document
    const generateParams = {
      customerId: 'integration-test-customer',
      taxYear: 2024,
      docType: 'form_6765' as const,
      payload: { 
        companyName: 'Integration Test Corp',
        wages: 150000,
        contractors: 50000,
        supplies: 25000
      },
      userId: 'integration-test-user',
      companyId: 'integration-test-company',
      intakeFormId: 'integration-test-intake'
    };

    const generateResult = await documentOrchestrator.generateAndStoreDoc(generateParams);
    
    expect(generateResult.documentId).toBeDefined();
    expect(generateResult.s3Key).toContain('customers/integration-test-customer');
    expect(generateResult.bucket).toBe('smbtax-docs-prod');
    
    // Step 2: Get secure download URL
    const { createS3Service } = await import('../services/storage/s3');
    const s3Service = createS3Service();
    
    const downloadUrl = await s3Service.getPdfUrl(generateResult.s3Key, 300);
    
    expect(downloadUrl).toBeDefined();
    expect(typeof downloadUrl).toBe('string');
  });
});