import { Request, Response, NextFunction } from 'express';
import { FieldEncryption, DataMasking } from './encryption';

// Data classification levels
export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

// PII categories for GDPR/CCPA compliance
export enum PIICategory {
  PERSONAL_IDENTIFIERS = 'personal_identifiers',
  FINANCIAL_INFO = 'financial_info',
  CONTACT_INFO = 'contact_info',
  BIOMETRIC_DATA = 'biometric_data',
  LOCATION_DATA = 'location_data',
  DEVICE_INFO = 'device_info'
}

// Data retention policies
export interface DataRetentionPolicy {
  dataType: string;
  retentionPeriod: number; // in days
  purgeMethod: 'soft_delete' | 'hard_delete' | 'anonymize';
  backupRetention: number; // in days
}

// Access logging service
export class AccessLogger {
  private static logs: Array<{
    timestamp: Date;
    userId?: string;
    action: string;
    resource: string;
    dataTypes: PIICategory[];
    ipAddress: string;
    userAgent: string;
    success: boolean;
    reason?: string;
  }> = [];

  static logDataAccess(
    req: Request,
    action: string,
    resource: string,
    dataTypes: PIICategory[],
    success: boolean,
    reason?: string
  ): void {
    const logEntry = {
      timestamp: new Date(),
      userId: (req as any).user?.id,
      action,
      resource,
      dataTypes,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      success,
      reason
    };

    this.logs.push(logEntry);
    
    // Keep only recent logs in memory (last 1000 entries)
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Data Access:', JSON.stringify(logEntry, null, 2));
    }

    // In production, send to audit service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAuditService(logEntry);
    }
  }

  private static sendToAuditService(logEntry: any): void {
    // TODO: Integrate with external audit logging service
    console.log('Audit Log:', JSON.stringify(logEntry));
  }

  static getAccessLogs(filters?: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): typeof AccessLogger.logs {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    return filteredLogs;
  }

  static generateAccessReport(timeframe: 'day' | 'week' | 'month' = 'week'): {
    totalAccesses: number;
    uniqueUsers: number;
    topActions: Array<{ action: string; count: number }>;
    dataTypeAccess: Array<{ type: PIICategory; count: number }>;
    failedAccesses: number;
  } {
    const now = new Date();
    const timeframes = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    const cutoff = new Date(now.getTime() - timeframes[timeframe]);
    const recentLogs = this.logs.filter(log => log.timestamp >= cutoff);

    const uniqueUsers = new Set(recentLogs.map(log => log.userId).filter(Boolean)).size;
    const actionCounts = recentLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dataTypeCounts = recentLogs.reduce((acc, log) => {
      log.dataTypes.forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {} as Record<PIICategory, number>);

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const dataTypeAccess = Object.entries(dataTypeCounts)
      .map(([type, count]) => ({ type: type as PIICategory, count }))
      .sort((a, b) => b.count - a.count);

    const failedAccesses = recentLogs.filter(log => !log.success).length;

    return {
      totalAccesses: recentLogs.length,
      uniqueUsers,
      topActions,
      dataTypeAccess,
      failedAccesses
    };
  }
}

// PII detection and classification
export class PIIDetector {
  private static patterns = {
    [PIICategory.PERSONAL_IDENTIFIERS]: [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{2}-\d{7}\b/, // EIN
    ],
    [PIICategory.FINANCIAL_INFO]: [
      /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/, // Credit card
      /\b\d{9,18}\b/, // Bank account
    ],
    [PIICategory.CONTACT_INFO]: [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\+?1?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}\b/, // Phone
    ]
  };

  static detectPII(text: string): PIICategory[] {
    const detectedCategories: PIICategory[] = [];

    for (const [category, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          detectedCategories.push(category as PIICategory);
          break;
        }
      }
    }

    return detectedCategories;
  }

  static containsPII(data: any): boolean {
    const textData = JSON.stringify(data);
    return this.detectPII(textData).length > 0;
  }

  static classifyData(data: Record<string, any>): DataClassification {
    if (this.containsPII(data)) {
      return DataClassification.CONFIDENTIAL;
    }
    
    // Additional classification logic based on field names
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    for (const field of sensitiveFields) {
      if (data[field]) {
        return DataClassification.RESTRICTED;
      }
    }

    return DataClassification.INTERNAL;
  }
}

// Data access control middleware
export function dataAccessControl(requiredPermissions: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      AccessLogger.logDataAccess(
        req,
        'access_denied',
        req.path,
        [],
        false,
        'No authentication'
      );
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check user permissions (simplified - in real app, check against roles/permissions)
    const userPermissions = user.permissions || [];
    const hasPermission = requiredPermissions.every(perm => 
      userPermissions.includes(perm) || user.role === 'admin'
    );

    if (!hasPermission && requiredPermissions.length > 0) {
      AccessLogger.logDataAccess(
        req,
        'access_denied',
        req.path,
        [],
        false,
        'Insufficient permissions'
      );
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    AccessLogger.logDataAccess(
      req,
      'access_granted',
      req.path,
      PIIDetector.detectPII(JSON.stringify(req.body || {})),
      true
    );

    next();
  };
}

// Data sanitization middleware
export function dataSanitization() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      // Remove potentially dangerous fields
      const dangerousFields = ['__proto__', 'constructor', 'prototype'];
      for (const field of dangerousFields) {
        delete req.body[field];
      }

      // Sanitize string fields
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string') {
          req.body[key] = value.trim();
        }
      }
    }

    next();
  };
}

// Response data filtering
export function filterSensitiveData(data: any, userRole: string = 'user'): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => filterSensitiveData(item, userRole));
  }

  if (typeof data === 'object') {
    const filtered = { ...data };

    // Admin can see more data
    if (userRole !== 'admin') {
      // Remove sensitive fields for non-admin users
      const sensitiveFields = [
        'passwordHash',
        'stripeCustomerId',
        'internalNotes',
        'adminOnlyField'
      ];

      for (const field of sensitiveFields) {
        delete filtered[field];
      }

      // Mask PII fields
      if (filtered.email) filtered.email = DataMasking.maskEmail(filtered.email);
      if (filtered.phone) filtered.phone = DataMasking.maskPhone(filtered.phone);
      if (filtered.ssn) filtered.ssn = DataMasking.maskSSN(filtered.ssn);
    }

    return filtered;
  }

  return data;
}

// Data retention cleanup
export class DataRetention {
  private static policies: DataRetentionPolicy[] = [
    {
      dataType: 'user_sessions',
      retentionPeriod: 30,
      purgeMethod: 'hard_delete',
      backupRetention: 90
    },
    {
      dataType: 'audit_logs',
      retentionPeriod: 365,
      purgeMethod: 'soft_delete',
      backupRetention: 2555 // 7 years
    },
    {
      dataType: 'user_data',
      retentionPeriod: 2555, // 7 years for tax records
      purgeMethod: 'anonymize',
      backupRetention: 2920 // 8 years
    }
  ];

  static getPolicy(dataType: string): DataRetentionPolicy | undefined {
    return this.policies.find(policy => policy.dataType === dataType);
  }

  static addPolicy(policy: DataRetentionPolicy): void {
    const existingIndex = this.policies.findIndex(p => p.dataType === policy.dataType);
    if (existingIndex >= 0) {
      this.policies[existingIndex] = policy;
    } else {
      this.policies.push(policy);
    }
  }

  static async cleanupExpiredData(): Promise<void> {
    console.log('Starting data retention cleanup...');
    
    for (const policy of this.policies) {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriod);
        
        // TODO: Implement actual database cleanup based on policy
        console.log(`Would cleanup ${policy.dataType} older than ${cutoffDate.toISOString()}`);
        
        // Log cleanup activity
        AccessLogger.logDataAccess(
          {} as Request,
          'data_cleanup',
          policy.dataType,
          [],
          true,
          `Cleanup policy executed for ${policy.dataType}`
        );
      } catch (error) {
        console.error(`Failed to cleanup ${policy.dataType}:`, error);
      }
    }
  }
}

// GDPR/CCPA compliance utilities
export class PrivacyCompliance {
  static async handleDataSubjectRequest(
    requestType: 'access' | 'rectification' | 'erasure' | 'portability',
    userId: string,
    requestDetails?: any
  ): Promise<any> {
    AccessLogger.logDataAccess(
      {} as Request,
      `privacy_request_${requestType}`,
      `user:${userId}`,
      [PIICategory.PERSONAL_IDENTIFIERS],
      true,
      `GDPR/CCPA request: ${requestType}`
    );

    switch (requestType) {
      case 'access':
        // Return all user data
        return this.generateDataExport(userId);
      
      case 'rectification':
        // Update user data
        return this.updateUserData(userId, requestDetails);
      
      case 'erasure':
        // Delete user data (right to be forgotten)
        return this.deleteUserData(userId);
      
      case 'portability':
        // Export data in machine-readable format
        return this.generatePortableExport(userId);
      
      default:
        throw new Error('Invalid request type');
    }
  }

  private static async generateDataExport(userId: string): Promise<any> {
    // TODO: Implement actual data export from database
    return {
      userId,
      exportDate: new Date().toISOString(),
      data: {
        // User data would be collected here
      }
    };
  }

  private static async updateUserData(userId: string, updates: any): Promise<any> {
    // TODO: Implement data rectification
    return { success: true, userId, updates };
  }

  private static async deleteUserData(userId: string): Promise<any> {
    // TODO: Implement data erasure
    return { success: true, userId, deletedAt: new Date().toISOString() };
  }

  private static async generatePortableExport(userId: string): Promise<any> {
    // TODO: Implement portable data export
    return {
      format: 'JSON',
      userId,
      exportDate: new Date().toISOString(),
      data: {}
    };
  }
}

// Middleware to apply data protection
export function applyDataProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip authentication for public routes
    const publicRoutes = [
      '/',
      '/login', 
      '/register',
      '/checkout',
      '/how-it-works',
      '/pricing',
      '/faq',
      '/sample-documents',
      '/rd-credit-guide',
      '/qualifying-activities',
      '/blog',
      '/industries',
      '/demo',
      '/api/leads',
      '/api/calculation',
      '/api/calculator',
      '/api/csrf-token'
    ];

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => 
      req.path === route || 
      req.path.startsWith(route + '/') ||
      req.path.startsWith('/api/auth/') // Auth routes are handled separately
    );

    // In development, allow all Vite assets and source files
    const isDevelopmentAsset = process.env.NODE_ENV === 'development' && (
      req.path.startsWith('/@vite') ||
      req.path.startsWith('/@react-refresh') ||
      req.path.startsWith('/@fs/') ||
      req.path.startsWith('/src/') ||
      req.path.startsWith('/node_modules/') ||
      req.path.startsWith('/assets/') ||
      req.path.startsWith('/__vite') ||
      /\.(tsx?|jsx?|css|scss|sass|less|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico|json|map)(\?.*)?$/.test(req.path)
    );
    
    // Apply data sanitization to all routes
    dataSanitization()(req, res, (err?: any) => {
      if (err) return next(err);
      
      if (isPublicRoute || isDevelopmentAsset) {
        // For public routes and dev assets, just log access without authentication
        const dataTypes = PIIDetector.detectPII(JSON.stringify(req.body || {}));
        AccessLogger.logDataAccess(
          req,
          req.method.toLowerCase(),
          req.path,
          dataTypes,
          true,
          isDevelopmentAsset ? 'Development asset access' : 'Public route access'
        );
        return next();
      }
      
      // Apply data access control to protected routes only
      dataAccessControl()(req, res, (err?: any) => {
        if (err) return next(err);
        
        // Log all data access attempts for protected routes
        const dataTypes = PIIDetector.detectPII(JSON.stringify(req.body || {}));
        AccessLogger.logDataAccess(
          req,
          req.method.toLowerCase(),
          req.path,
          dataTypes,
          true
        );
        
        next();
      });
    });
  };
}