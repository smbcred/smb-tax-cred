import { z } from 'zod';
import crypto from 'crypto';
import JSZip from 'jszip';
import { getS3StorageService } from './s3Storage';

// Download system schemas
export const downloadRequestSchema = z.object({
  fileKeys: z.array(z.string().min(1, "File key is required")),
  downloadType: z.enum(['single', 'zip'], { description: 'Type of download: single file or zip package' }),
  expiresIn: z.number().min(60).max(24 * 60 * 60).default(3600), // 1 minute to 24 hours, default 1 hour
  userId: z.string().min(1, "User ID is required"),
  trackingEnabled: z.boolean().default(true),
  compressionLevel: z.number().min(0).max(9).default(6), // ZIP compression level
});

export const downloadResponseSchema = z.object({
  downloadToken: z.string(),
  downloadUrl: z.string().url(),
  expiresAt: z.string(),
  fileCount: z.number(),
  estimatedSize: z.number(),
  downloadType: z.enum(['single', 'zip']),
  trackingId: z.string(),
});

export const downloadTrackingSchema = z.object({
  trackingId: z.string(),
  downloadToken: z.string(),
  userId: z.string(),
  fileKeys: z.array(z.string()),
  downloadType: z.enum(['single', 'zip']),
  fileCount: z.number(),
  totalSize: z.number(),
  downloadedSize: z.number().default(0),
  downloadedAt: z.string().optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  status: z.enum(['pending', 'started', 'completed', 'failed', 'expired']).default('pending'),
  errorMessage: z.string().optional(),
});

export const downloadStatsSchema = z.object({
  totalDownloads: z.number(),
  totalSize: z.number(),
  downloadsByType: z.record(z.string(), z.number()),
  downloadsByDay: z.array(z.object({
    date: z.string(),
    count: z.number(),
    size: z.number(),
  })),
  topFiles: z.array(z.object({
    fileKey: z.string(),
    fileName: z.string(),
    downloadCount: z.number(),
    lastDownloaded: z.string(),
  })),
});

export type DownloadRequest = z.infer<typeof downloadRequestSchema>;
export type DownloadResponse = z.infer<typeof downloadResponseSchema>;
export type DownloadTracking = z.infer<typeof downloadTrackingSchema>;
export type DownloadStats = z.infer<typeof downloadStatsSchema>;

export class DownloadManager {
  private readonly downloadTokens: Map<string, {
    tracking: DownloadTracking;
    expiresAt: Date;
  }> = new Map();

  private readonly downloadHistory: DownloadTracking[] = [];
  private readonly maxHistorySize = 10000; // Keep last 10k downloads

  constructor() {
    // Cleanup expired tokens every hour
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000);

    console.log('Download Manager initialized');
  }

  async createDownload(request: DownloadRequest): Promise<DownloadResponse> {
    try {
      console.log('Creating download:', {
        userId: request.userId,
        fileCount: request.fileKeys.length,
        downloadType: request.downloadType,
        expiresIn: request.expiresIn,
      });

      // Validate file access for user
      const s3Service = getS3StorageService();
      const fileMetadataList = [];
      let totalSize = 0;

      for (const fileKey of request.fileKeys) {
        try {
          const metadata = await s3Service.getFileMetadata(fileKey);
          
          // Verify user owns the file
          if (metadata.userId !== request.userId) {
            throw new Error(`Access denied to file: ${fileKey}`);
          }

          fileMetadataList.push(metadata);
          totalSize += metadata.fileSize;
        } catch (error: any) {
          console.error(`Failed to validate file access: ${fileKey}`, error);
          throw new Error(`Invalid file access: ${fileKey}`);
        }
      }

      // Generate secure download token
      const downloadToken = this.generateSecureToken();
      const trackingId = this.generateTrackingId();
      const expiresAt = new Date(Date.now() + request.expiresIn * 1000);

      // Create tracking record
      const tracking: DownloadTracking = {
        trackingId,
        downloadToken,
        userId: request.userId,
        fileKeys: request.fileKeys,
        downloadType: request.downloadType,
        fileCount: request.fileKeys.length,
        totalSize,
        downloadedSize: 0,
        startedAt: new Date().toISOString(),
        status: 'pending',
      };

      // Store download session
      this.downloadTokens.set(downloadToken, {
        tracking,
        expiresAt,
      });

      // Add to history if tracking enabled
      if (request.trackingEnabled) {
        this.addToHistory(tracking);
      }

      // Create download URL
      const downloadUrl = `/api/downloads/secure/${downloadToken}`;

      const response: DownloadResponse = {
        downloadToken,
        downloadUrl,
        expiresAt: expiresAt.toISOString(),
        fileCount: request.fileKeys.length,
        estimatedSize: totalSize,
        downloadType: request.downloadType,
        trackingId,
      };

      console.log('Download created successfully:', {
        trackingId,
        downloadToken: downloadToken.substring(0, 10) + '...',
        fileCount: request.fileKeys.length,
        totalSize,
      });

      return response;

    } catch (error: any) {
      console.error('Failed to create download:', error);
      throw new Error(`Download creation failed: ${error.message}`);
    }
  }

  async processDownload(downloadToken: string, clientInfo?: {
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{
    contentType: string;
    filename: string;
    stream: NodeJS.ReadableStream | Buffer;
    size: number;
  }> {
    console.log('Processing download:', {
      token: downloadToken.substring(0, 10) + '...',
      clientInfo,
    });

    // Validate download token
    const downloadSession = this.downloadTokens.get(downloadToken);
    if (!downloadSession) {
      throw new Error('Invalid or expired download token');
    }

    if (downloadSession.expiresAt < new Date()) {
      this.downloadTokens.delete(downloadToken);
      throw new Error('Download token has expired');
    }

    const { tracking } = downloadSession;

    try {
      // Update tracking status
      tracking.status = 'started';
      tracking.downloadedAt = new Date().toISOString();
      if (clientInfo) {
        tracking.ipAddress = clientInfo.ipAddress;
        tracking.userAgent = clientInfo.userAgent;
      }

      const s3Service = getS3StorageService();

      if (tracking.downloadType === 'single') {
        // Single file download
        if (tracking.fileKeys.length !== 1) {
          throw new Error('Single download must have exactly one file');
        }

        const fileKey = tracking.fileKeys[0];
        const metadata = await s3Service.getFileMetadata(fileKey);
        
        // For placeholder mode, return mock content  
        if (!(s3Service as any).isConfigured) {
          const mockContent = Buffer.from(`Mock content for file: ${metadata.fileName}\nGenerated at: ${new Date().toISOString()}\nFile size: ${metadata.fileSize} bytes`);
          
          tracking.downloadedSize = mockContent.length;
          tracking.status = 'completed';
          tracking.completedAt = new Date().toISOString();

          return {
            contentType: metadata.fileType,
            filename: metadata.fileName,
            stream: mockContent,
            size: mockContent.length,
          };
        }

        // Real S3 download would go here
        await s3Service.generateSignedUrl(fileKey, 3600);
        
        // For now, return placeholder content since we don't have actual S3 streaming
        const mockContent = Buffer.from(`Placeholder content for: ${metadata.fileName}`);
        tracking.downloadedSize = metadata.fileSize;
        tracking.status = 'completed';
        tracking.completedAt = new Date().toISOString();

        return {
          contentType: metadata.fileType,
          filename: metadata.fileName,
          stream: mockContent,
          size: metadata.fileSize,
        };

      } else {
        // ZIP package download
        return await this.createZipDownload(tracking, s3Service);
      }

    } catch (error: any) {
      console.error('Download processing error:', error);
      tracking.status = 'failed';
      tracking.errorMessage = error.message;
      throw error;
    }
  }

  private async createZipDownload(tracking: DownloadTracking, s3Service: any): Promise<{
    contentType: string;
    filename: string;
    stream: Buffer;
    size: number;
  }> {
    console.log('Creating ZIP download for', tracking.fileKeys.length, 'files');

    const zip = new JSZip();
    let totalProcessedSize = 0;

    // Add files to ZIP
    for (const fileKey of tracking.fileKeys) {
      try {
        const metadata = await s3Service.getFileMetadata(fileKey);
        
        // For placeholder mode, add mock content
        let fileContent: Buffer;
        if (!(s3Service as any).isConfigured) {
          fileContent = Buffer.from(`Mock content for: ${metadata.fileName}\nOriginal size: ${metadata.fileSize} bytes\nGenerated at: ${new Date().toISOString()}`);
        } else {
          // In real implementation, this would fetch actual file content
          fileContent = Buffer.from(`Placeholder content for: ${metadata.fileName}`);
        }

        // Organize files by document type in ZIP
        const folderName = this.getZipFolderName(metadata.documentType);
        const fileName = metadata.fileName;
        const zipPath = `${folderName}/${fileName}`;

        zip.file(zipPath, fileContent);
        totalProcessedSize += fileContent.length;

        console.log(`Added to ZIP: ${zipPath} (${fileContent.length} bytes)`);

      } catch (error: any) {
        console.warn(`Failed to add file to ZIP: ${fileKey}`, error);
        // Continue with other files
      }
    }

    // Add README file with download information
    const readmeContent = this.generateZipReadme(tracking);
    zip.file('README.txt', readmeContent);

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6, // Default compression level
      },
    });

    tracking.downloadedSize = zipBuffer.length;
    tracking.status = 'completed';
    tracking.completedAt = new Date().toISOString();

    // Generate ZIP filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `smbtaxcredits-documents-${timestamp}.zip`;

    console.log('ZIP created successfully:', {
      filename,
      size: zipBuffer.length,
      fileCount: tracking.fileKeys.length,
    });

    return {
      contentType: 'application/zip',
      filename,
      stream: zipBuffer,
      size: zipBuffer.length,
    };
  }

  private getZipFolderName(documentType: string): string {
    switch (documentType) {
      case 'narrative': return '01-Narratives';
      case 'compliance_memo': return '02-Compliance-Memos';
      case 'pdf_form': return '03-IRS-Forms';
      case 'supporting_document': return '04-Supporting-Documents';
      case 'calculation': return '05-Calculations';
      default: return '06-Other-Documents';
    }
  }

  private generateZipReadme(tracking: DownloadTracking): string {
    return `R&D Tax Credit Document Package
Generated: ${new Date().toISOString()}
Download ID: ${tracking.trackingId}

Contents:
${tracking.fileKeys.map((key, index) => `${index + 1}. ${key.split('/').pop()}`).join('\n')}

Document Organization:
- 01-Narratives: R&D activity narratives and descriptions
- 02-Compliance-Memos: IRS compliance documentation
- 03-IRS-Forms: Form 6765 and related tax forms
- 04-Supporting-Documents: Additional supporting materials
- 05-Calculations: R&D credit calculations and worksheets
- 06-Other-Documents: Miscellaneous documents

Total Files: ${tracking.fileCount}
Total Size: ${this.formatFileSize(tracking.totalSize)}

For questions about these documents, please contact SMBTaxCredits.com support.

IMPORTANT: These documents contain sensitive tax information. 
Please store securely and do not share with unauthorized parties.`;
  }

  async getDownloadStatus(trackingId: string): Promise<DownloadTracking | null> {
    // Search in active downloads
    for (const [token, session] of Array.from(this.downloadTokens.entries())) {
      if (session.tracking.trackingId === trackingId) {
        return session.tracking;
      }
    }

    // Search in history
    return this.downloadHistory.find(h => h.trackingId === trackingId) || null;
  }

  async getUserDownloadStats(userId: string, days: number = 30): Promise<DownloadStats> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Filter downloads for user within time period
    const userDownloads = this.downloadHistory.filter(d => 
      d.userId === userId && 
      new Date(d.startedAt) >= cutoffDate
    );

    // Add active downloads
    for (const session of Array.from(this.downloadTokens.values())) {
      if (session.tracking.userId === userId && 
          new Date(session.tracking.startedAt) >= cutoffDate) {
        userDownloads.push(session.tracking);
      }
    }

    const totalDownloads = userDownloads.length;
    const totalSize = userDownloads.reduce((sum, d) => sum + d.downloadedSize, 0);

    // Group by download type
    const downloadsByType: Record<string, number> = {};
    userDownloads.forEach(d => {
      downloadsByType[d.downloadType] = (downloadsByType[d.downloadType] || 0) + 1;
    });

    // Group by day
    const downloadsByDay: Array<{ date: string; count: number; size: number }> = [];
    const dayGroups = new Map<string, { count: number; size: number }>();

    userDownloads.forEach(d => {
      const date = d.startedAt.split('T')[0];
      const existing = dayGroups.get(date) || { count: 0, size: 0 };
      existing.count++;
      existing.size += d.downloadedSize;
      dayGroups.set(date, existing);
    });

    for (const [date, stats] of Array.from(dayGroups.entries())) {
      downloadsByDay.push({ date, ...stats });
    }

    // Sort by date
    downloadsByDay.sort((a, b) => a.date.localeCompare(b.date));

    // Top files (placeholder - would need more detailed tracking)
    const topFiles = userDownloads
      .filter(d => d.fileKeys.length === 1)
      .map(d => ({
        fileKey: d.fileKeys[0],
        fileName: d.fileKeys[0].split('/').pop() || 'unknown',
        downloadCount: 1,
        lastDownloaded: d.startedAt,
      }))
      .slice(0, 10);

    return {
      totalDownloads,
      totalSize,
      downloadsByType,
      downloadsByDay,
      topFiles,
    };
  }

  async deleteDownloadToken(downloadToken: string): Promise<void> {
    this.downloadTokens.delete(downloadToken);
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateTrackingId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private addToHistory(tracking: DownloadTracking): void {
    this.downloadHistory.push({ ...tracking });
    
    // Keep history size manageable
    if (this.downloadHistory.length > this.maxHistorySize) {
      this.downloadHistory.splice(0, this.downloadHistory.length - this.maxHistorySize);
    }
  }

  private cleanupExpiredTokens(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [token, session] of Array.from(this.downloadTokens.entries())) {
      if (session.expiresAt < now) {
        // Update tracking to expired status
        session.tracking.status = 'expired';
        this.downloadTokens.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired download tokens`);
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Bandwidth optimization utilities
  async optimizeDownload(fileKeys: string[], options: {
    maxBandwidth?: number; // bytes per second
    compressionLevel?: number;
    streamingEnabled?: boolean;
  } = {}): Promise<{
    optimizedSize: number;
    estimatedTime: number;
    compressionRatio: number;
  }> {
    const s3Service = getS3StorageService();
    let totalSize = 0;
    let compressedSize = 0;

    for (const fileKey of fileKeys) {
      const metadata = await s3Service.getFileMetadata(fileKey);
      totalSize += metadata.fileSize;
      
      // Estimate compression ratio based on file type
      const compressionRatio = this.getCompressionRatio(metadata.fileType);
      compressedSize += Math.floor(metadata.fileSize * compressionRatio);
    }

    const maxBandwidth = options.maxBandwidth || 1024 * 1024; // Default 1MB/s
    const estimatedTime = Math.ceil(compressedSize / maxBandwidth);
    const overallCompressionRatio = totalSize > 0 ? compressedSize / totalSize : 1;

    return {
      optimizedSize: compressedSize,
      estimatedTime,
      compressionRatio: overallCompressionRatio,
    };
  }

  private getCompressionRatio(fileType: string): number {
    // Estimate compression ratios for different file types
    switch (fileType.toLowerCase()) {
      case 'application/pdf': return 0.9; // PDFs compress slightly
      case 'image/jpeg':
      case 'image/jpg': return 0.95; // JPEGs already compressed
      case 'image/png': return 0.8; // PNGs compress well
      case 'text/plain': return 0.3; // Text compresses very well
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 
        return 0.6; // Word docs compress well
      default: return 0.7; // Default compression ratio
    }
  }
}

// Singleton instance
let downloadManager: DownloadManager | null = null;

export function getDownloadManager(): DownloadManager {
  if (!downloadManager) {
    downloadManager = new DownloadManager();
  }
  return downloadManager;
}