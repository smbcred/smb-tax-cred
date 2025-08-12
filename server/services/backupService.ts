import { promises as fs , createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

// Backup configuration
export interface BackupConfig {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retention: {
    daily: number;    // Keep daily backups for X days
    weekly: number;   // Keep weekly backups for X weeks  
    monthly: number;  // Keep monthly backups for X months
  };
  compression: boolean;
  encryption: boolean;
  destinations: BackupDestination[];
}

// Backup destinations
export interface BackupDestination {
  type: 'local' | 's3' | 'gcs' | 'azure';
  config: Record<string, any>;
  priority: number; // 1 = primary, 2 = secondary, etc.
}

// Backup metadata
export interface BackupMetadata {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental';
  size: number;
  checksum: string;
  tables: string[];
  compressed: boolean;
  encrypted: boolean;
  destination: string;
  status: 'created' | 'in_progress' | 'completed' | 'failed';
  retentionUntil: Date;
}

// Database backup service
export class BackupService {
  private static instance: BackupService;
  private config: BackupConfig;
  private backupHistory: BackupMetadata[] = [];
  private backupDir: string;

  private constructor() {
    this.backupDir = process.env.BACKUP_DIR || './backups';
    this.config = {
      frequency: (process.env.BACKUP_FREQUENCY as any) || 'daily',
      retention: {
        daily: parseInt(process.env.BACKUP_RETENTION_DAILY || '7'),
        weekly: parseInt(process.env.BACKUP_RETENTION_WEEKLY || '4'),
        monthly: parseInt(process.env.BACKUP_RETENTION_MONTHLY || '12'),
      },
      compression: process.env.BACKUP_COMPRESSION !== 'false',
      encryption: process.env.BACKUP_ENCRYPTION === 'true',
      destinations: [
        {
          type: 'local',
          config: { path: this.backupDir },
          priority: 1
        }
      ]
    };

    this.ensureBackupDirectory();
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create backup directory:', error);
    }
  }

  // Create database backup
  async createBackup(type: 'full' | 'incremental' = 'full'): Promise<BackupMetadata> {
    const backupId = this.generateBackupId();
    const timestamp = new Date();
    
    console.log(`Starting ${type} backup: ${backupId}`);

    const metadata: BackupMetadata = {
      id: backupId,
      timestamp,
      type,
      size: 0,
      checksum: '',
      tables: [],
      compressed: this.config.compression,
      encrypted: this.config.encryption,
      destination: 'local',
      status: 'in_progress',
      retentionUntil: this.calculateRetentionDate(timestamp, type)
    };

    try {
      // Create backup file
      const backupPath = await this.performDatabaseBackup(backupId, type);
      
      // Get file stats
      const stats = await fs.stat(backupPath);
      metadata.size = stats.size;
      metadata.checksum = await this.calculateChecksum(backupPath);
      metadata.status = 'completed';

      console.log(`Backup completed: ${backupId} (${metadata.size} bytes)`);
      
      this.backupHistory.push(metadata);
      await this.saveBackupMetadata(metadata);
      
      return metadata;
    } catch (error) {
      console.error(`Backup failed: ${backupId}`, error);
      metadata.status = 'failed';
      this.backupHistory.push(metadata);
      throw error;
    }
  }

  // Perform actual database backup
  private async performDatabaseBackup(backupId: string, type: 'full' | 'incremental'): Promise<string> {
    const filename = `${backupId}.sql${this.config.compression ? '.gz' : ''}`;
    const backupPath = join(this.backupDir, filename);

    // Generate PostgreSQL dump command
    const dumpCommand = this.generateDumpCommand(type);
    
    // For demo purposes, create a sample backup file
    // In production, this would use pg_dump or similar
    const sampleBackup = this.generateSampleBackupData();
    
    if (this.config.compression) {
      // Compress backup
      await this.compressData(sampleBackup, backupPath);
    } else {
      await fs.writeFile(backupPath, sampleBackup);
    }

    return backupPath;
  }

  private generateDumpCommand(type: 'full' | 'incremental'): string {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    const baseCommand = `pg_dump ${dbUrl}`;
    
    if (type === 'incremental') {
      // For incremental backups, we'd typically use WAL or timestamp-based filtering
      return `${baseCommand} --where="updated_at > (SELECT MAX(backup_timestamp) FROM backup_log)"`;
    }
    
    return baseCommand;
  }

  private generateSampleBackupData(): string {
    const timestamp = new Date().toISOString();
    return `-- PostgreSQL database backup
-- Generated: ${timestamp}
-- Backup type: full

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  legal_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sample data would be dumped here
-- INSERT INTO users VALUES (...);
-- INSERT INTO companies VALUES (...);

-- Backup completed: ${timestamp}
`;
  }

  private async compressData(data: string, outputPath: string): Promise<void> {
    const gzip = createGzip();
    const inputStream = require('stream').Readable.from([data]);
    const outputStream = createWriteStream(outputPath);
    
    await pipeline(inputStream, gzip, outputStream);
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);
    
    for await (const chunk of stream) {
      hash.update(chunk);
    }
    
    return hash.digest('hex');
  }

  private generateBackupId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    return `backup-${timestamp}-${random}`;
  }

  private calculateRetentionDate(backupDate: Date, type: 'full' | 'incremental'): Date {
    const retentionDate = new Date(backupDate);
    
    // Default retention periods
    const retentionDays = type === 'full' ? 30 : 7;
    retentionDate.setDate(retentionDate.getDate() + retentionDays);
    
    return retentionDate;
  }

  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = join(this.backupDir, `${metadata.id}.metadata.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  // Restore from backup
  async restoreBackup(backupId: string): Promise<void> {
    console.log(`Starting restore from backup: ${backupId}`);
    
    const metadata = await this.getBackupMetadata(backupId);
    if (!metadata) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    if (metadata.status !== 'completed') {
      throw new Error(`Backup is not in completed state: ${metadata.status}`);
    }

    const backupPath = join(this.backupDir, `${backupId}.sql${metadata.compressed ? '.gz' : ''}`);
    
    try {
      // Verify backup integrity
      const currentChecksum = await this.calculateChecksum(backupPath);
      if (currentChecksum !== metadata.checksum) {
        throw new Error('Backup integrity check failed');
      }

      // Perform restore
      await this.performDatabaseRestore(backupPath, metadata);
      
      console.log(`Restore completed successfully: ${backupId}`);
    } catch (error) {
      console.error(`Restore failed: ${backupId}`, error);
      throw error;
    }
  }

  private async performDatabaseRestore(backupPath: string, metadata: BackupMetadata): Promise<void> {
    // In production, this would use psql to restore the backup
    console.log(`Would restore database from: ${backupPath}`);
    console.log(`Backup metadata:`, metadata);
    
    // For demo, just log the action
    console.log('Database restore completed (simulated)');
  }

  // Clean up old backups
  async cleanupOldBackups(): Promise<void> {
    console.log('Starting backup cleanup...');
    
    const now = new Date();
    const expiredBackups = this.backupHistory.filter(backup => 
      backup.retentionUntil < now && backup.status === 'completed'
    );

    for (const backup of expiredBackups) {
      try {
        await this.deleteBackup(backup.id);
        console.log(`Deleted expired backup: ${backup.id}`);
      } catch (error) {
        console.error(`Failed to delete backup ${backup.id}:`, error);
      }
    }

    // Remove from history
    this.backupHistory = this.backupHistory.filter(backup => backup.retentionUntil >= now);
    
    console.log(`Cleanup completed. Removed ${expiredBackups.length} expired backups.`);
  }

  private async deleteBackup(backupId: string): Promise<void> {
    const backupFile = join(this.backupDir, `${backupId}.sql`);
    const gzipFile = join(this.backupDir, `${backupId}.sql.gz`);
    const metadataFile = join(this.backupDir, `${backupId}.metadata.json`);

    try {
      await fs.unlink(backupFile).catch(() => {}); // Ignore if doesn't exist
      await fs.unlink(gzipFile).catch(() => {}); // Ignore if doesn't exist
      await fs.unlink(metadataFile).catch(() => {}); // Ignore if doesn't exist
    } catch (error) {
      console.error(`Error deleting backup files for ${backupId}:`, error);
    }
  }

  // Get backup metadata
  async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    try {
      const metadataPath = join(this.backupDir, `${backupId}.metadata.json`);
      const content = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  // List all backups
  getBackupHistory(): BackupMetadata[] {
    return [...this.backupHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Verify backup integrity
  async verifyBackup(backupId: string): Promise<boolean> {
    const metadata = await this.getBackupMetadata(backupId);
    if (!metadata) {
      return false;
    }

    const backupPath = join(this.backupDir, `${backupId}.sql${metadata.compressed ? '.gz' : ''}`);
    
    try {
      const currentChecksum = await this.calculateChecksum(backupPath);
      return currentChecksum === metadata.checksum;
    } catch {
      return false;
    }
  }

  // Get backup statistics
  getBackupStats(): {
    total: number;
    successful: number;
    failed: number;
    totalSize: number;
    oldestBackup?: Date;
    newestBackup?: Date;
  } {
    const completedBackups = this.backupHistory.filter(b => b.status === 'completed');
    const failedBackups = this.backupHistory.filter(b => b.status === 'failed');
    
    const totalSize = completedBackups.reduce((sum, backup) => sum + backup.size, 0);
    
    const timestamps = completedBackups.map(b => b.timestamp).sort();
    
    return {
      total: this.backupHistory.length,
      successful: completedBackups.length,
      failed: failedBackups.length,
      totalSize,
      oldestBackup: timestamps[0],
      newestBackup: timestamps[timestamps.length - 1]
    };
  }

  // Schedule automatic backups
  startBackupScheduler(): void {
    const intervals = {
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };

    const interval = intervals[this.config.frequency];
    
    setInterval(async () => {
      try {
        console.log(`Running scheduled ${this.config.frequency} backup...`);
        await this.createBackup('full');
        await this.cleanupOldBackups();
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    }, interval);

    console.log(`Backup scheduler started - ${this.config.frequency} backups enabled`);
  }

  // Update backup configuration
  updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Backup configuration updated:', this.config);
  }

  // Get current configuration
  getConfig(): BackupConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const backupService = BackupService.getInstance();