import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { mockClient } from 'aws-sdk-client-mock';
import { S3StorageService } from '../services/storage/s3';

// Create mock for S3 client
const s3Mock = mockClient(S3Client);

// Mock the getSignedUrl function
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn()
}));

const mockGetSignedUrl = getSignedUrl as any;

describe('S3StorageService', () => {
  let s3Service: S3StorageService;
  const mockConfig = {
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret-key',
    region: 'us-east-1',
    bucketName: 'test-bucket'
  };

  beforeEach(() => {
    s3Mock.reset();
    mockGetSignedUrl.mockReset();
    s3Service = new S3StorageService(mockConfig);
  });

  afterEach(() => {
    s3Mock.restore();
  });

  describe('docKey', () => {
    it('should generate correct S3 key format', () => {
      const params = {
        customerId: 'customer-123',
        taxYear: 2024,
        docType: 'form-6765'
      };

      const key = s3Service.docKey(params);
      
      expect(key).toMatch(/^customers\/customer-123\/2024\/form-6765-\d+\.pdf$/);
    });

    it('should include timestamp in key', () => {
      const params = {
        customerId: 'test',
        taxYear: 2024,
        docType: 'test-doc'
      };

      const key1 = s3Service.docKey(params);
      
      // Wait a small amount to ensure different timestamp
      setTimeout(() => {
        const key2 = s3Service.docKey(params);
        expect(key1).not.toBe(key2);
      }, 10);
    });
  });

  describe('uploadPdf', () => {
    it('should upload PDF with correct parameters including AES256 encryption', async () => {
      // Arrange
      const testBuffer = Buffer.from('test pdf content');
      const testKey = 'customers/test/2024/doc-123.pdf';
      const testMetadata = { testField: 'testValue' };

      s3Mock.on(PutObjectCommand).resolves({});

      // Act
      await s3Service.uploadPdf({
        buffer: testBuffer,
        key: testKey,
        metadata: testMetadata
      });

      // Assert
      expect(s3Mock.commandCalls(PutObjectCommand)).toHaveLength(1);
      
      const call = s3Mock.commandCalls(PutObjectCommand)[0];
      const command = call.args[0] as PutObjectCommand;
      
      expect(command.input.Bucket).toBe(mockConfig.bucketName);
      expect(command.input.Key).toBe(testKey);
      expect(command.input.Body).toBe(testBuffer);
      expect(command.input.ContentType).toBe('application/pdf');
      expect(command.input.ServerSideEncryption).toBe('AES256');
      expect(command.input.CacheControl).toBe('private, max-age=0');
      expect(command.input.Metadata).toMatchObject({
        ...testMetadata,
        uploadedAt: expect.any(String)
      });
    });

    it('should include uploadedAt timestamp in metadata', async () => {
      // Arrange
      const testBuffer = Buffer.from('test');
      const testKey = 'test-key';
      
      s3Mock.on(PutObjectCommand).resolves({});

      // Act
      const beforeUpload = new Date().toISOString();
      await s3Service.uploadPdf({ buffer: testBuffer, key: testKey });
      const afterUpload = new Date().toISOString();

      // Assert
      const call = s3Mock.commandCalls(PutObjectCommand)[0];
      const command = call.args[0] as PutObjectCommand;
      const uploadedAt = command.input.Metadata?.uploadedAt;
      
      expect(uploadedAt).toBeDefined();
      expect(uploadedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(uploadedAt!).getTime()).toBeGreaterThanOrEqual(new Date(beforeUpload).getTime());
      expect(new Date(uploadedAt!).getTime()).toBeLessThanOrEqual(new Date(afterUpload).getTime());
    });

    it('should handle upload errors', async () => {
      // Arrange
      const testBuffer = Buffer.from('test');
      const testKey = 'test-key';
      const errorMessage = 'S3 upload failed';
      
      s3Mock.on(PutObjectCommand).rejects(new Error(errorMessage));

      // Act & Assert
      await expect(s3Service.uploadPdf({ buffer: testBuffer, key: testKey }))
        .rejects
        .toThrow(errorMessage);
    });
  });

  describe('getPdfUrl', () => {
    it('should generate presigned URL with correct parameters', async () => {
      // Arrange
      const testKey = 'customers/test/2024/doc-123.pdf';
      const testExpires = 1800; // 30 minutes
      const mockUrl = 'https://test-bucket.s3.amazonaws.com/test-key?signature=abc123';
      
      mockGetSignedUrl.mockResolvedValue(mockUrl);

      // Act
      const url = await s3Service.getPdfUrl(testKey, testExpires);

      // Assert
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(GetObjectCommand),
        { expiresIn: testExpires }
      );
      
      // Verify the GetObjectCommand was created with correct parameters
      const getObjectCommand = mockGetSignedUrl.mock.calls[0][1] as GetObjectCommand;
      expect(getObjectCommand.input.Bucket).toBe(mockConfig.bucketName);
      expect(getObjectCommand.input.Key).toBe(testKey);
      
      expect(url).toBe(mockUrl);
    });

    it('should use default expiration time when not specified', async () => {
      // Arrange
      const testKey = 'test-key';
      const mockUrl = 'https://example.com/test-url';
      
      mockGetSignedUrl.mockResolvedValue(mockUrl);

      // Act
      await s3Service.getPdfUrl(testKey);

      // Assert
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(GetObjectCommand),
        { expiresIn: 3600 } // Default 1 hour
      );
    });

    it('should handle presigned URL generation errors', async () => {
      // Arrange
      const testKey = 'test-key';
      const errorMessage = 'Failed to generate presigned URL';
      
      mockGetSignedUrl.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(s3Service.getPdfUrl(testKey))
        .rejects
        .toThrow(errorMessage);
    });
  });

  describe('error handling', () => {
    it('should throw error when S3 operations fail', async () => {
      // Arrange
      const testBuffer = Buffer.from('test');
      const testKey = 'test-key';
      
      s3Mock.on(PutObjectCommand).rejects(new Error('Access denied'));

      // Act & Assert
      await expect(s3Service.uploadPdf({ buffer: testBuffer, key: testKey }))
        .rejects
        .toThrow('Access denied');
    });
  });
});

// Test the factory function
describe('createS3Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create service with environment variables', async () => {
    // Arrange
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    process.env.AWS_REGION = 'us-west-2';
    process.env.AWS_S3_BUCKET = 'test-bucket';

    // Act
    const { createS3Service } = await import('../services/storage/s3');
    const service = createS3Service();

    // Assert
    expect(service).toBeInstanceOf(S3StorageService);
  });

  it('should throw error when AWS credentials are missing', async () => {
    // Arrange
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;

    // Act & Assert
    const { createS3Service } = await import('../services/storage/s3');
    expect(() => createS3Service()).toThrow('AWS credentials not configured');
  });

  it('should use default values for optional environment variables', async () => {
    // Arrange
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    delete process.env.AWS_REGION;
    delete process.env.AWS_S3_BUCKET;

    // Act
    const { createS3Service } = await import('../services/storage/s3');
    const service = createS3Service();

    // Assert - should not throw and create service with defaults
    expect(service).toBeInstanceOf(S3StorageService);
  });
});