import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import crypto from 'crypto';

// S3 storage schemas
export const s3ConfigSchema = z.object({
  accessKeyId: z.string().min(1, "AWS Access Key ID is required"),
  secretAccessKey: z.string().min(1, "AWS Secret Access Key is required"),
  region: z.string().min(1, "AWS Region is required"),
  bucketName: z.string().min(1, "S3 Bucket name is required"),
});

export const s3UploadRequestSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().min(1, "File size must be greater than 0").max(50 * 1024 * 1024, "File size must be less than 50MB"),
  userId: z.string().min(1, "User ID is required"),
  documentType: z.enum(['narrative', 'compliance_memo', 'pdf_form', 'supporting_document', 'calculation']),
  calculationId: z.string().optional(),
  jobId: z.string().optional(),
});

export const s3UploadResponseSchema = z.object({
  uploadUrl: z.string().url("Invalid upload URL"),
  key: z.string(),
  downloadUrl: z.string().url("Invalid download URL"),
  expiresAt: z.string(),
  metadata: z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    documentType: z.string(),
  }),
});

export const s3FileMetadataSchema = z.object({
  key: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  documentType: z.string(),
  userId: z.string(),
  calculationId: z.string().optional(),
  jobId: z.string().optional(),
  uploadedAt: z.string(),
  lastModified: z.string(),
  downloadUrl: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const s3FolderStructureSchema = z.object({
  userId: z.string(),
  calculationId: z.string().optional(),
  jobId: z.string().optional(),
  documentType: z.string(),
  year: z.string(),
  month: z.string(),
});

export type S3Config = z.infer<typeof s3ConfigSchema>;
export type S3UploadRequest = z.infer<typeof s3UploadRequestSchema>;
export type S3UploadResponse = z.infer<typeof s3UploadResponseSchema>;
export type S3FileMetadata = z.infer<typeof s3FileMetadataSchema>;
export type S3FolderStructure = z.infer<typeof s3FolderStructureSchema>;

export class S3StorageService {
  private readonly s3Client: S3Client | null;
  private readonly bucketName: string;
  private readonly isConfigured: boolean;

  constructor() {
    const config = this.loadConfig();
    
    if (config) {
      this.s3Client = new S3Client({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      });
      this.bucketName = config.bucketName;
      this.isConfigured = true;
      
      console.log('S3 Storage Service initialized:', {
        region: config.region,
        bucket: config.bucketName,
      });
    } else {
      this.s3Client = null;
      this.bucketName = 'smbtaxcredits-documents';
      this.isConfigured = false;
      
      console.warn('S3 Storage Service running in fallback mode - AWS credentials not provided');
    }
  }

  private loadConfig(): S3Config | null {
    try {
      const config = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || 'us-east-1',
        bucketName: process.env.AWS_S3_BUCKET || 'smbtaxcredits-documents',
      };

      // Check if required credentials are provided
      if (!config.accessKeyId || !config.secretAccessKey) {
        return null;
      }

      return s3ConfigSchema.parse(config);
    } catch (error) {
      console.error('S3 configuration error:', error);
      return null;
    }
  }

  async uploadFile(request: S3UploadRequest, fileBuffer: Buffer): Promise<S3UploadResponse> {
    if (!this.isConfigured || !this.s3Client) {
      // Return placeholder response when S3 is not configured
      const mockKey = this.generateFileKey(request);
      const mockResponse: S3UploadResponse = {
        uploadUrl: `/api/s3/placeholder-upload/${mockKey}`,
        key: mockKey,
        downloadUrl: `/api/s3/placeholder-download/${mockKey}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        metadata: {
          fileName: request.fileName,
          fileType: request.fileType,
          fileSize: request.fileSize,
          documentType: request.documentType,
        },
      };

      console.log('Generated placeholder S3 response:', {
        key: mockKey,
        fileName: request.fileName,
        documentType: request.documentType,
      });

      return mockResponse;
    }

    try {
      console.log('S3 upload request:', {
        fileName: request.fileName,
        fileType: request.fileType,
        fileSize: request.fileSize,
        documentType: request.documentType,
      });

      const key = this.generateFileKey(request);
      
      // Upload file to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: request.fileType,
        Metadata: {
          fileName: request.fileName,
          documentType: request.documentType,
          userId: request.userId,
          calculationId: request.calculationId || '',
          jobId: request.jobId || '',
          uploadedAt: new Date().toISOString(),
        },
        ServerSideEncryption: 'AES256',
      });

      await this.s3Client.send(uploadCommand);

      // Generate signed download URL with 24-hour expiration
      const downloadUrl = await this.generateSignedUrl(key, 24 * 60 * 60); // 24 hours
      
      const response: S3UploadResponse = {
        uploadUrl: `s3://${this.bucketName}/${key}`,
        key,
        downloadUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          fileName: request.fileName,
          fileType: request.fileType,
          fileSize: request.fileSize,
          documentType: request.documentType,
        },
      };

      console.log('S3 upload completed:', {
        key,
        bucket: this.bucketName,
        downloadUrl: downloadUrl.substring(0, 100) + '...',
      });

      return response;

    } catch (error: any) {
      console.error('S3 upload error:', error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isConfigured || !this.s3Client) {
      // Return placeholder URL when S3 is not configured
      return `/api/s3/placeholder-download/${key}?expires=${Date.now() + expiresIn * 1000}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      console.log('Generated signed URL:', {
        key,
        expiresIn,
        urlLength: signedUrl.length,
      });

      return signedUrl;

    } catch (error: any) {
      console.error('Signed URL generation error:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  async getFileMetadata(key: string): Promise<S3FileMetadata> {
    if (!this.isConfigured || !this.s3Client) {
      // Return placeholder metadata when S3 is not configured
      const parts = key.split('/');
      const fileName = parts[parts.length - 1];
      
      return {
        key,
        fileName,
        fileType: 'application/pdf',
        fileSize: 150000, // ~150KB placeholder
        documentType: 'narrative',
        userId: 'placeholder-user',
        uploadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        downloadUrl: `/api/s3/placeholder-download/${key}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      const downloadUrl = await this.generateSignedUrl(key, 24 * 60 * 60); // 24 hours

      const metadata: S3FileMetadata = {
        key,
        fileName: response.Metadata?.fileName || key.split('/').pop() || key,
        fileType: response.ContentType || 'application/octet-stream',
        fileSize: response.ContentLength || 0,
        documentType: response.Metadata?.documentType || 'unknown',
        userId: response.Metadata?.userId || '',
        calculationId: response.Metadata?.calculationId || undefined,
        jobId: response.Metadata?.jobId || undefined,
        uploadedAt: response.Metadata?.uploadedAt || response.LastModified?.toISOString() || new Date().toISOString(),
        lastModified: response.LastModified?.toISOString() || new Date().toISOString(),
        downloadUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      return metadata;

    } catch (error: any) {
      console.error('Get file metadata error:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.isConfigured || !this.s3Client) {
      console.log('Placeholder file deletion:', { key });
      return;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      
      console.log('S3 file deleted:', { key, bucket: this.bucketName });

    } catch (error: any) {
      console.error('S3 delete error:', error);
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  }

  async listUserFiles(userId: string, documentType?: string): Promise<S3FileMetadata[]> {
    if (!this.isConfigured || !this.s3Client) {
      // Return placeholder file list when S3 is not configured
      const mockFiles: S3FileMetadata[] = [
        {
          key: `users/${userId}/2024/01/narrative/sample-narrative.pdf`,
          fileName: 'sample-narrative.pdf',
          fileType: 'application/pdf',
          fileSize: 145000,
          documentType: 'narrative',
          userId,
          uploadedAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          downloadUrl: `/api/s3/placeholder-download/users/${userId}/2024/01/narrative/sample-narrative.pdf`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      if (documentType) {
        return mockFiles.filter(file => file.documentType === documentType);
      }

      return mockFiles;
    }

    try {
      const prefix = `users/${userId}/`;
      
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: 1000,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Contents) {
        return [];
      }

      const files: S3FileMetadata[] = [];
      
      for (const object of response.Contents) {
        if (!object.Key) continue;
        
        try {
          const metadata = await this.getFileMetadata(object.Key);
          
          if (!documentType || metadata.documentType === documentType) {
            files.push(metadata);
          }
        } catch (error) {
          console.warn('Failed to get metadata for file:', object.Key);
        }
      }

      console.log('Listed user files:', {
        userId,
        documentType,
        count: files.length,
      });

      return files;

    } catch (error: any) {
      console.error('List user files error:', error);
      throw new Error(`Failed to list user files: ${error.message}`);
    }
  }

  private generateFileKey(request: S3UploadRequest): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Create unique filename with timestamp and random suffix
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const fileExtension = this.getFileExtension(request.fileName);
    const cleanFileName = this.sanitizeFileName(request.fileName);
    const uniqueFileName = `${timestamp}-${randomSuffix}-${cleanFileName}`;

    // Folder structure: users/{userId}/{year}/{month}/{documentType}/{fileName}
    let folderPath = `users/${request.userId}/${year}/${month}/${request.documentType}`;
    
    // Add calculation-specific folder if provided
    if (request.calculationId) {
      folderPath += `/calculation-${request.calculationId}`;
    }
    
    // Add job-specific folder if provided
    if (request.jobId) {
      folderPath += `/job-${request.jobId}`;
    }

    const key = `${folderPath}/${uniqueFileName}`;
    
    console.log('Generated S3 key:', {
      originalFileName: request.fileName,
      generatedKey: key,
      documentType: request.documentType,
    });

    return key;
  }

  private sanitizeFileName(fileName: string): string {
    // Remove or replace invalid characters for S3 keys
    return fileName
      .replace(/[^a-zA-Z0-9.\-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(lastDot) : '';
  }

  // Batch operations for document packages
  async uploadDocumentPackage(
    userId: string,
    calculationId: string,
    documents: Array<{
      fileName: string;
      fileType: string;
      fileBuffer: Buffer;
      documentType: S3UploadRequest['documentType'];
    }>
  ): Promise<S3UploadResponse[]> {
    console.log(`Starting batch upload for ${documents.length} documents`);
    
    const uploadPromises = documents.map(async (doc) => {
      const request: S3UploadRequest = {
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileBuffer.length,
        userId,
        documentType: doc.documentType,
        calculationId,
      };

      return this.uploadFile(request, doc.fileBuffer);
    });

    const results = await Promise.allSettled(uploadPromises);
    const uploadResponses: S3UploadResponse[] = [];
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        uploadResponses.push(result.value);
      } else {
        console.error('Batch upload error:', result.reason);
        // Add failed upload with error status
        uploadResponses.push({
          uploadUrl: '',
          key: '',
          downloadUrl: '',
          expiresAt: new Date().toISOString(),
          metadata: {
            fileName: 'failed-upload',
            fileType: 'error',
            fileSize: 0,
            documentType: 'supporting_document',
          },
        });
      }
    }

    console.log(`Batch upload completed: ${uploadResponses.length} results`);
    return uploadResponses;
  }

  // Cleanup expired files
  async cleanupExpiredFiles(beforeDate: Date): Promise<number> {
    if (!this.isConfigured || !this.s3Client) {
      console.log('Cleanup expired files (placeholder mode)');
      return 0;
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1000,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Contents) {
        return 0;
      }

      let deletedCount = 0;
      
      for (const object of response.Contents) {
        if (!object.Key || !object.LastModified) continue;
        
        if (object.LastModified < beforeDate) {
          try {
            await this.deleteFile(object.Key);
            deletedCount++;
          } catch (error) {
            console.warn('Failed to delete expired file:', object.Key);
          }
        }
      }

      console.log('Cleanup completed:', {
        deletedCount,
        beforeDate: beforeDate.toISOString(),
      });

      return deletedCount;

    } catch (error: any) {
      console.error('Cleanup error:', error);
      throw new Error(`Cleanup failed: ${error.message}`);
    }
  }

  // Get storage statistics
  async getStorageStats(userId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
    sizeByType: Record<string, number>;
  }> {
    if (!this.isConfigured || !this.s3Client) {
      // Return placeholder stats when S3 is not configured
      return {
        totalFiles: 5,
        totalSize: 750000, // ~750KB
        filesByType: {
          narrative: 2,
          compliance_memo: 1,
          pdf_form: 1,
          supporting_document: 1,
        },
        sizeByType: {
          narrative: 300000,
          compliance_memo: 150000,
          pdf_form: 200000,
          supporting_document: 100000,
        },
      };
    }

    try {
      const prefix = userId ? `users/${userId}/` : '';
      
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: 1000,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Contents) {
        return {
          totalFiles: 0,
          totalSize: 0,
          filesByType: {},
          sizeByType: {},
        };
      }

      let totalFiles = 0;
      let totalSize = 0;
      const filesByType: Record<string, number> = {};
      const sizeByType: Record<string, number> = {};

      for (const object of response.Contents) {
        if (!object.Key || !object.Size) continue;
        
        totalFiles++;
        totalSize += object.Size;
        
        // Extract document type from key path
        const keyParts = object.Key.split('/');
        const documentType = keyParts.length > 4 ? keyParts[4] : 'unknown';
        
        filesByType[documentType] = (filesByType[documentType] || 0) + 1;
        sizeByType[documentType] = (sizeByType[documentType] || 0) + object.Size;
      }

      console.log('Storage stats:', {
        userId,
        totalFiles,
        totalSize,
        filesByType,
      });

      return {
        totalFiles,
        totalSize,
        filesByType,
        sizeByType,
      };

    } catch (error: any) {
      console.error('Storage stats error:', error);
      throw new Error(`Failed to get storage stats: ${error.message}`);
    }
  }
}

// Singleton instance
let s3StorageService: S3StorageService | null = null;

export function getS3StorageService(): S3StorageService {
  if (!s3StorageService) {
    s3StorageService = new S3StorageService();
  }
  return s3StorageService;
}