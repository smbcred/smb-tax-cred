import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DocumentOrchestrator, documentOrchestrator } from '../services/documents/orchestrator';

// Mock dependencies
vi.mock('../documint', () => ({
  getDocumintService: () => ({
    generatePDF: vi.fn().mockResolvedValue({
      id: 'test-pdf-id',
      status: 'completed',
      downloadUrl: 'https://test.com/pdf'
    })
  })
}));

vi.mock('../storage/s3', () => ({
  createS3Service: () => ({
    uploadPdf: vi.fn().mockResolvedValue('test-upload-result'),
    getPdfUrl: vi.fn().mockResolvedValue('https://s3.amazonaws.com/test-presigned-url')
  }),
  S3StorageService: class MockS3StorageService {}
}));

vi.mock('../db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'test-document-id' }])
      })
    })
  }
}));

describe('DocumentOrchestrator', () => {
  let orchestrator: DocumentOrchestrator;

  beforeEach(() => {
    orchestrator = new DocumentOrchestrator();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateAndStoreDoc', () => {
    const mockParams = {
      customerId: 'test-customer-123',
      taxYear: 2024,
      docType: 'form_6765' as const,
      payload: { companyName: 'Test Corp', wages: 100000 },
      userId: 'test-user-123',
      companyId: 'test-company-123',
      intakeFormId: 'test-intake-123'
    };

    it('should successfully generate and store document', async () => {
      const result = await orchestrator.generateAndStoreDoc(mockParams);

      expect(result).toEqual({
        documentId: 'test-document-id',
        s3Key: expect.stringMatching(/customers\/test-customer-123\/2024\/form_6765\/.*\.pdf/),
        bucket: 'smbtax-docs-prod',
        size: expect.any(Number),
        sha256Hash: expect.stringMatching(/^[a-f0-9]{64}$/)
      });
    });

    it('should generate correct S3 key format', async () => {
      const result = await orchestrator.generateAndStoreDoc(mockParams);
      
      expect(result.s3Key).toMatch(/^customers\/test-customer-123\/2024\/form_6765\/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.pdf$/);
    });

    it('should handle document generation errors', async () => {
      // Mock PDF generation failure
      const { getDocumintService } = await import('../documint');
      const mockService = getDocumintService();
      vi.mocked(mockService.generatePDF).mockRejectedValue(new Error('PDF generation failed'));

      await expect(orchestrator.generateAndStoreDoc(mockParams)).rejects.toThrow('PDF generation failed');
    });

    it('should handle S3 upload errors', async () => {
      // Mock S3 upload failure
      const { createS3Service } = await import('../storage/s3');
      const mockS3Service = createS3Service();
      vi.mocked(mockS3Service.uploadPdf).mockRejectedValue(new Error('S3 upload failed'));

      await expect(orchestrator.generateAndStoreDoc(mockParams)).rejects.toThrow('S3 upload failed');
    });

    it('should compute SHA256 hash correctly', async () => {
      const result = await orchestrator.generateAndStoreDoc(mockParams);
      
      // SHA256 hash should be 64 characters long and hex
      expect(result.sha256Hash).toHaveLength(64);
      expect(result.sha256Hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate appropriate document names', async () => {
      // This is tested indirectly through the database insert call
      const result = await orchestrator.generateAndStoreDoc(mockParams);
      
      expect(result.documentId).toBe('test-document-id');
    });
  });

  describe('template mapping', () => {
    it('should map document types to correct template IDs', async () => {
      const testCases = [
        { docType: 'form_6765', expectedTemplate: 'rd-tax-credit-form-6765' },
        { docType: 'technical_narrative', expectedTemplate: 'rd-technical-narrative' },
        { docType: 'compliance_memo', expectedTemplate: 'rd-compliance-memo' }
      ];

      for (const testCase of testCases) {
        const mockParams = {
          customerId: 'test-customer',
          taxYear: 2024,
          docType: testCase.docType as any,
          payload: {},
          userId: 'test-user',
          companyId: 'test-company',
          intakeFormId: 'test-intake'
        };

        await orchestrator.generateAndStoreDoc(mockParams);

        const { getDocumintService } = await import('../documint');
        const mockService = getDocumintService();
        expect(mockService.generatePDF).toHaveBeenCalledWith({
          templateId: testCase.expectedTemplate,
          data: mockParams.payload
        });
      }
    });
  });

  describe('singleton instance', () => {
    it('should provide singleton instance', () => {
      expect(documentOrchestrator).toBeInstanceOf(DocumentOrchestrator);
    });
  });
});