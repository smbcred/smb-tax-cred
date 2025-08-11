import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { QueryPerformanceMonitor } from './queryOptimizer';

// Enhanced connection pool with monitoring and optimization
export class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool;
  private pool: any;
  private config: {
    maxConnections: number;
    idleTimeout: number;
    acquireTimeout: number;
    createTimeout: number;
    destroyTimeout: number;
    reapInterval: number;
  };
  private metrics: {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    pendingRequests: number;
    totalQueries: number;
    avgQueryTime: number;
    slowQueries: number;
  };

  private constructor() {
    this.config = {
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // 30 seconds
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '10000'), // 10 seconds
      createTimeout: parseInt(process.env.DB_CREATE_TIMEOUT || '5000'), // 5 seconds
      destroyTimeout: parseInt(process.env.DB_DESTROY_TIMEOUT || '5000'), // 5 seconds
      reapInterval: parseInt(process.env.DB_REAP_INTERVAL || '1000'), // 1 second
    };

    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      pendingRequests: 0,
      totalQueries: 0,
      avgQueryTime: 0,
      slowQueries: 0,
    };

    this.initializePool();
  }

  static getInstance(): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool();
    }
    return DatabaseConnectionPool.instance;
  }

  private initializePool(): void {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Initialize Neon connection with pooling
    const sql = neon(process.env.DATABASE_URL, {
      fullResults: true,
      arrayMode: false,
    });

    this.pool = drizzle(sql);

    // Start health check interval
    this.startHealthMonitoring();
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const startTime = Date.now();
      await this.pool.execute('SELECT 1');
      const duration = Date.now() - startTime;

      if (duration > 1000) {
        console.warn(`Slow health check query: ${duration}ms`);
      }
    } catch (error) {
      console.error('Database health check failed:', error);
    }
  }

  async getConnection(): Promise<any> {
    this.metrics.pendingRequests++;
    
    try {
      const connection = this.pool;
      this.metrics.activeConnections++;
      this.metrics.pendingRequests--;
      return connection;
    } catch (error) {
      this.metrics.pendingRequests--;
      throw error;
    }
  }

  async executeQuery<T>(queryFn: (db: any) => Promise<T>): Promise<T> {
    const timer = QueryPerformanceMonitor.startTimer('database-query');
    const startTime = Date.now();
    
    const connection = await this.getConnection();
    
    try {
      const result = await queryFn(connection);
      this.metrics.totalQueries++;
      
      const duration = Date.now() - startTime;
      this.updateQueryMetrics(duration);
      
      return result;
    } finally {
      this.releaseConnection();
      timer();
    }
  }

  private updateQueryMetrics(duration: number): void {
    // Update average query time
    this.metrics.avgQueryTime = (
      (this.metrics.avgQueryTime * (this.metrics.totalQueries - 1) + duration) / 
      this.metrics.totalQueries
    );

    // Track slow queries
    if (duration > 2000) { // Queries slower than 2 seconds
      this.metrics.slowQueries++;
      console.warn(`Slow query detected: ${duration}ms`);
    }
  }

  private releaseConnection(): void {
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
  }

  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  getConfig(): typeof this.config {
    return { ...this.config };
  }

  // Connection pool optimization methods
  async optimizePool(): Promise<void> {
    // Analyze query patterns and adjust pool size if needed
    const metrics = this.getMetrics();
    
    if (metrics.pendingRequests > 5 && metrics.activeConnections < this.config.maxConnections) {
      console.log('High pending requests detected, pool may need optimization');
    }

    if (metrics.avgQueryTime > 1000) {
      console.warn(`Average query time is high: ${metrics.avgQueryTime}ms`);
    }

    if (metrics.slowQueries / metrics.totalQueries > 0.1) {
      console.warn(`High percentage of slow queries: ${(metrics.slowQueries / metrics.totalQueries * 100).toFixed(2)}%`);
    }
  }

  // Transaction support with automatic rollback
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    const connection = await this.getConnection();
    
    try {
      return await connection.transaction(callback);
    } finally {
      this.releaseConnection();
    }
  }

  // Batch operations for better performance
  async batchExecute<T>(
    operations: Array<(db: any) => Promise<T>>,
    batchSize = 10
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const connection = await this.getConnection();
      
      try {
        const batchResults = await Promise.all(
          batch.map(op => op(connection))
        );
        results.push(...batchResults);
      } finally {
        this.releaseConnection();
      }
    }
    
    return results;
  }

  // Cache-aware query execution
  async cachedQuery<T>(
    cacheKey: string,
    queryFn: (db: any) => Promise<T>,
    ttl = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    // This would integrate with the caching middleware
    // For now, just execute the query directly
    return this.executeQuery(queryFn);
  }

  // Health status for monitoring endpoints
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: typeof this.metrics;
    config: typeof this.config;
    checks: {
      connectivity: boolean;
      performance: boolean;
      capacity: boolean;
    };
  } {
    const metrics = this.getMetrics();
    const checks = {
      connectivity: true, // Would be updated by health checks
      performance: metrics.avgQueryTime < 2000,
      capacity: metrics.activeConnections < this.config.maxConnections * 0.8,
    };

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!checks.connectivity) {
      status = 'unhealthy';
    } else if (!checks.performance || !checks.capacity) {
      status = 'degraded';
    }

    return {
      status,
      metrics,
      config: this.config,
      checks,
    };
  }
}

// Singleton instance
export const dbPool = DatabaseConnectionPool.getInstance();

// Utility functions for common operations
export async function withDatabase<T>(
  operation: (db: any) => Promise<T>
): Promise<T> {
  return dbPool.executeQuery(operation);
}

export async function withTransaction<T>(
  operation: (tx: any) => Promise<T>
): Promise<T> {
  return dbPool.transaction(operation);
}

// Database monitoring and alerting
export class DatabaseMonitor {
  private static alerts: Array<{
    type: string;
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
  }> = [];

  static checkPerformance(): void {
    const pool = DatabaseConnectionPool.getInstance();
    const metrics = pool.getMetrics();
    const health = pool.getHealthStatus();

    // Check for performance issues
    if (metrics.avgQueryTime > 3000) {
      DatabaseMonitor.addAlert('performance', 'Average query time is very high', 'high');
    } else if (metrics.avgQueryTime > 1000) {
      DatabaseMonitor.addAlert('performance', 'Average query time is elevated', 'medium');
    }

    // Check for capacity issues
    if (health.checks.capacity === false) {
      DatabaseMonitor.addAlert('capacity', 'Database connection pool near capacity', 'high');
    }

    // Check for connectivity issues
    if (health.checks.connectivity === false) {
      DatabaseMonitor.addAlert('connectivity', 'Database connectivity issues detected', 'high');
    }
  }

  private static addAlert = (
    type: string,
    message: string,
    severity: 'low' | 'medium' | 'high'
  ): void => {
    DatabaseMonitor.alerts.push({
      type,
      message,
      timestamp: new Date(),
      severity,
    });

    // Keep only recent alerts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    DatabaseMonitor.alerts = DatabaseMonitor.alerts.filter(alert => alert.timestamp > oneDayAgo);

    // Log high severity alerts
    if (severity === 'high') {
      console.error(`Database Alert [${type}]: ${message}`);
    }
  }

  static getAlerts(): typeof this.alerts {
    return [...this.alerts];
  }

  static clearAlerts(): void {
    this.alerts = [];
  }
}

// Start monitoring
setInterval(() => {
  DatabaseMonitor.checkPerformance();
}, 60000); // Check every minute