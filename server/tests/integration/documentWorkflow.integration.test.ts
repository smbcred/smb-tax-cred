/**
 * Integration test for complete document generation workflow
 * Tests the S3 storage integration with real AWS services
 */
import { describe, it, expect } from 'vitest';
import { documentOrchestrator } from '../services/documents/orchestrator';
import { createS3Service } from '../services/storage/s3';

describe('Document Generation Workflow Integration', () => {
  it('should complete full document generation and storage workflow', async () => {
    const mockParams = {
      customerId: 'integration-test-customer-' + Date.now(),
      taxYear: 2024,
      docType: 'form_6765' as const,
      payload: {
        companyName: 'Integration Test Corporation',
        ein: '12-3456789',
        businessType: 'corporation',
        currentYearExpenses: {
          wages: 250000,
          contractors: 75000,
          supplies: 15000,
          total: 340000
        },
        calculations: {
          totalQualifiedExpenses: 340000,
          ascPercentage: 14,
          baseAmount: 47600,
          creditAmount: 47600,
          riskLevel: 'low'
        },
        rdActivities: [
          {
            activity: 'AI Model Training',
            description: 'Developing machine learning models for customer predictions',
            hours: 520,
            wages: 45000,
            category: 'experimentation'
          }
        ],
        technicalChallenges: ['Model accuracy optimization', 'Data preprocessing pipeline'],
        uncertainties: ['Feature selection methodology', 'Hyperparameter tuning'],
        innovations: ['Custom neural network architecture', 'Automated feature engineering'],
        businessPurpose: 'Enhance customer experience through predictive analytics'
      },
      userId: 'integration-test-user',
      companyId: 'integration-test-company',
      intakeFormId: 'integration-test-intake'
    };

    console.log('Starting document generation integration test...');
    
    // Step 1: Generate and store document
    const result = await documentOrchestrator.generateAndStoreDoc(mockParams);
    
    expect(result).toMatchObject({
      documentId: expect.any(String),
      s3Key: expect.stringContaining(`customers/${mockParams.customerId}/2024/form_6765/`),
      bucket: expect.any(String),
      size: expect.any(Number),
      sha256Hash: expect.stringMatching(/^[a-f0-9]{64}$/)
    });
    
    console.log('Document generated:', {
      documentId: result.documentId,
      s3Key: result.s3Key,
      size: result.size,
      hash: result.sha256Hash.substring(0, 8) + '...'
    });
    
    // Step 2: Verify S3 storage and generate secure URL
    const s3Service = createS3Service();
    const downloadUrl = await s3Service.getPdfUrl(result.s3Key, 300);
    
    expect(downloadUrl).toMatch(/^https:\/\/.*\.s3\..*\.amazonaws\.com\/.*\?.*Signature=.*/);
    console.log('Secure download URL generated:', downloadUrl.substring(0, 100) + '...');
    
    // Step 3: Verify document is accessible via URL (just check URL structure, don't download)
    const urlParts = new URL(downloadUrl);
    expect(urlParts.hostname).toContain('s3');
    expect(urlParts.hostname).toContain('amazonaws.com');
    expect(urlParts.searchParams.get('X-Amz-Signature')).toBeTruthy();
    expect(urlParts.searchParams.get('X-Amz-Expires')).toBe('300');
    
    console.log('Integration test completed successfully');
  }, 15000); // 15 second timeout for AWS operations

  it('should validate S3 service connectivity', async () => {
    const s3Service = createS3Service();
    
    // Test S3 connectivity with a simple upload/URL generation
    const testKey = `integration-test/smoke-${Date.now()}.pdf`;
    const testPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\nstartxref\n0\n%%EOF');
    
    // Upload test file
    const uploadResult = await s3Service.uploadPdf(testPdf, testKey);
    expect(uploadResult).toBeTruthy();
    
    // Generate download URL
    const downloadUrl = await s3Service.getPdfUrl(testKey, 60);
    expect(downloadUrl).toContain('amazonaws.com');
    
    console.log('S3 service connectivity verified');
  });
});

describe('Document Generation Error Handling', () => {
  it('should handle invalid parameters gracefully', async () => {
    const invalidParams = {
      customerId: '', // Invalid empty string
      taxYear: 1999, // Invalid year
      docType: 'invalid_type' as any,
      payload: {},
      userId: 'test-user',
      companyId: 'test-company',
      intakeFormId: 'test-intake'
    };

    await expect(documentOrchestrator.generateAndStoreDoc(invalidParams)).rejects.toThrow();
  });
});

describe('Document Metadata Verification', () => {
  it('should generate proper document metadata', async () => {
    const result = await documentOrchestrator.generateAndStoreDoc({
      customerId: 'metadata-test-customer',
      taxYear: 2024,
      docType: 'technical_narrative',
      payload: { companyName: 'Test Corp' },
      userId: 'test-user',
      companyId: 'test-company',
      intakeFormId: 'test-intake'
    });

    // Verify S3 key structure
    expect(result.s3Key).toMatch(/^customers\/metadata-test-customer\/2024\/technical_narrative\/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.pdf$/);
    
    // Verify hash format
    expect(result.sha256Hash).toHaveLength(64);
    expect(result.sha256Hash).toMatch(/^[a-f0-9]+$/);
    
    // Verify size is reasonable
    expect(result.size).toBeGreaterThan(0);
    expect(result.size).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
  });
});