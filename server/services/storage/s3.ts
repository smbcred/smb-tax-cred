import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}

export interface DocKeyParams {
  customerId: string;
  taxYear: number;
  docType: string;
}

export interface UploadPdfParams {
  buffer: Buffer;
  key: string;
  metadata?: Record<string, string>;
}

export class S3StorageService {
  private client: S3Client;
  private bucketName: string;

  constructor(config: S3Config) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucketName = config.bucketName;
  }

  /**
   * Generate S3 key for document storage
   * Format: customers/{customerId}/{taxYear}/{docType}-{timestamp}.pdf
   */
  docKey({ customerId, taxYear, docType }: DocKeyParams): string {
    const timestamp = Date.now();
    return `customers/${customerId}/${taxYear}/${docType}-${timestamp}.pdf`;
  }

  /**
   * Upload PDF buffer to S3 with security settings
   */
  async uploadPdf({ buffer, key, metadata = {} }: UploadPdfParams): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
      ServerSideEncryption: 'AES256',
      CacheControl: 'private, max-age=0',
      Metadata: {
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    });

    await this.client.send(command);
  }

  /**
   * Generate presigned URL for PDF download
   */
  async getPdfUrl(key: string, expires: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expires });
  }
}

// Factory function to create S3 service from environment variables
export function createS3Service(): S3StorageService {
  const config: S3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-2',
    bucketName: process.env.AWS_S3_BUCKET || 'smbtax-docs-prod',
  };

  if (!config.accessKeyId || !config.secretAccessKey) {
    throw new Error('AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
  }

  return new S3StorageService(config);
}