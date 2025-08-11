// Application monitoring service for R&D Tax Credit SaaS
// Provides comprehensive monitoring, alerting, and observability

import { EventEmitter } from 'events';
import os from 'os';
import process from 'process';
import { 
  HealthCheck, 
  SystemMetrics, 
  DatabaseMetrics, 
  APIMetrics,
  ErrorEvent, 
  PerformanceAlert, 
  UptimeStatus,
  IncidentReport,
  MonitoringConfig,
  MonitoringDashboard,
  MonitoringEvent
} from '../../shared/types/monitoring';

class MonitoringService extends EventEmitter {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private systemMetrics: SystemMetrics[] = [];
  private databaseMetrics: DatabaseMetrics[] = [];
  private apiMetrics: APIMetrics[] = [];
  private errorEvents: ErrorEvent[] = [];
  private performanceAlerts: PerformanceAlert[] = [];
  private uptimeStatuses: Map<string, UptimeStatus> = new Map();
  private incidents: Map<string, IncidentReport> = new Map();
  private config: MonitoringConfig;
  private startTime: Date;
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;

  constructor(config?: Partial<MonitoringConfig>) {
    super();
    this.startTime = new Date();
    this.config = {
      healthChecks: {
        enabled: true,
        interval: 30000, // 30 seconds
        timeout: 5000, // 5 seconds
        endpoints: ['/api/health', '/api/auth/user']
      },
      performance: {
        enabled: true,
        sampleRate: 1.0,
        thresholds: {
          responseTime: 2000, // 2 seconds
          errorRate: 0.05, // 5%
          cpuUsage: 0.8, // 80%
          memoryUsage: 0.85 // 85%
        }
      },
      alerts: {
        enabled: true,
        channels: [],
        escalation: []
      },
      retention: {
        metrics: 30, // 30 days
        logs: 7, // 7 days
        incidents: 90 // 90 days
      },
      ...config
    };

    this.initializeServices();
  }

  private initializeServices(): void {
    if (this.config.healthChecks.enabled) {
      this.startHealthChecks();
    }

    if (this.config.performance.enabled) {
      this.startMetricsCollection();
    }

    // Initialize default uptime statuses
    this.uptimeStatuses.set('api', {
      service: 'api',
      status: 'up',
      uptime: 100,
      lastCheck: new Date(),
      incidents: 0,
      responseTime: 0
    });

    this.uptimeStatuses.set('database', {
      service: 'database',
      status: 'up',
      uptime: 100,
      lastCheck: new Date(),
      incidents: 0,
      responseTime: 0
    });
  }

  /**
   * Start automated health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthChecks.interval);
  }

  /**
   * Start system metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 60000); // Every minute
  }

  /**
   * Perform health checks for all configured endpoints
   */
  private async performHealthChecks(): Promise<void> {
    for (const endpoint of this.config.healthChecks.endpoints) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.healthChecks.timeout);
        
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        const healthCheck: HealthCheck = {
          id: `${endpoint}-${Date.now()}`,
          name: endpoint,
          status: response.ok ? 'healthy' : 'unhealthy',
          timestamp: new Date(),
          responseTime,
          details: {
            statusCode: response.status,
            contentType: response.headers.get('content-type')
          }
        };

        this.healthChecks.set(endpoint, healthCheck);
        this.updateUptimeStatus(endpoint, healthCheck);
        this.emit('health_check', healthCheck);

      } catch (error) {
        const healthCheck: HealthCheck = {
          id: `${endpoint}-${Date.now()}`,
          name: endpoint,
          status: 'unhealthy',
          timestamp: new Date(),
          responseTime: this.config.healthChecks.timeout,
          error: error instanceof Error ? error.message : 'Unknown error'
        };

        this.healthChecks.set(endpoint, healthCheck);
        this.updateUptimeStatus(endpoint, healthCheck);
        this.emit('health_check', healthCheck);
        this.createErrorEvent('Health check failed', error as Error, { endpoint });
      }
    }
  }

  /**
   * Collect system performance metrics
   */
  private collectSystemMetrics(): void {
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: {
        usage: process.cpuUsage().user / 1000000, // Convert to seconds
        load: os.loadavg()
      },
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal
      },
      disk: {
        used: 0, // Would need additional library for disk usage
        total: 0,
        percentage: 0
      },
      uptime: Date.now() - this.startTime.getTime()
    };

    this.systemMetrics.push(metrics);
    this.emit('system_metrics', metrics);

    // Check for performance alerts
    this.checkPerformanceThresholds(metrics);

    // Cleanup old metrics
    this.cleanupOldData();
  }

  /**
   * Track API request metrics
   */
  public trackAPIRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    options?: {
      requestSize?: number;
      responseSize?: number;
      userAgent?: string;
      ipAddress?: string;
    }
  ): void {
    const metric: APIMetrics = {
      timestamp: new Date(),
      endpoint,
      method,
      statusCode,
      responseTime,
      ...options
    };

    this.apiMetrics.push(metric);
    this.emit('api_metric', metric);

    // Check for performance issues
    if (responseTime > this.config.performance.thresholds.responseTime) {
      this.createPerformanceAlert(
        'latency',
        'high',
        `Slow API response: ${endpoint}`,
        'response_time',
        this.config.performance.thresholds.responseTime,
        responseTime
      );
    }
  }

  /**
   * Create and track error events
   */
  public createErrorEvent(
    message: string,
    error: Error,
    context: Record<string, any> = {}
  ): string {
    const errorEvent: ErrorEvent = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level: 'error',
      message,
      stack: error.stack,
      context,
      resolved: false,
      tags: ['error', context.endpoint ? 'api' : 'system']
    };

    this.errorEvents.push(errorEvent);
    this.emit('error_event', errorEvent);

    return errorEvent.id;
  }

  /**
   * Create performance alert
   */
  private createPerformanceAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    metric: string,
    threshold: number,
    actualValue: number
  ): string {
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      severity,
      message,
      metric,
      threshold,
      actualValue,
      resolved: false,
      metadata: {}
    };

    this.performanceAlerts.push(alert);
    this.emit('performance_alert', alert);

    return alert.id;
  }

  /**
   * Check system metrics against performance thresholds
   */
  private checkPerformanceThresholds(metrics: SystemMetrics): void {
    const { thresholds } = this.config.performance;

    if (metrics.cpu.usage > thresholds.cpuUsage) {
      this.createPerformanceAlert(
        'resource',
        'high',
        'High CPU usage detected',
        'cpu_usage',
        thresholds.cpuUsage,
        metrics.cpu.usage
      );
    }

    if (metrics.memory.percentage > thresholds.memoryUsage) {
      this.createPerformanceAlert(
        'resource',
        'high',
        'High memory usage detected',
        'memory_usage',
        thresholds.memoryUsage,
        metrics.memory.percentage
      );
    }
  }

  /**
   * Update uptime status based on health check
   */
  private updateUptimeStatus(service: string, healthCheck: HealthCheck): void {
    const existing = this.uptimeStatuses.get(service);
    if (!existing) return;

    const isUp = healthCheck.status === 'healthy';
    
    this.uptimeStatuses.set(service, {
      ...existing,
      status: isUp ? 'up' : 'down',
      lastCheck: healthCheck.timestamp,
      responseTime: healthCheck.responseTime,
      incidents: isUp ? existing.incidents : existing.incidents + 1
    });
  }

  /**
   * Get monitoring dashboard data
   */
  public getDashboard(): MonitoringDashboard {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentMetrics = this.apiMetrics.filter(m => m.timestamp >= oneHourAgo);
    const totalRequests = recentMetrics.length;
    const errorRequests = recentMetrics.filter(m => m.statusCode >= 400).length;
    const avgResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
      : 0;

    const uptime = (Date.now() - this.startTime.getTime()) / (Date.now() - this.startTime.getTime()) * 100;

    return {
      overview: {
        uptime,
        totalRequests,
        errorRate: totalRequests > 0 ? errorRequests / totalRequests : 0,
        avgResponseTime
      },
      services: Array.from(this.uptimeStatuses.values()),
      recentAlerts: this.performanceAlerts
        .filter(a => !a.resolved)
        .slice(-10)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      recentErrors: this.errorEvents
        .filter(e => !e.resolved)
        .slice(-10)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      systemMetrics: this.systemMetrics[this.systemMetrics.length - 1] || {
        timestamp: new Date(),
        cpu: { usage: 0, load: [0, 0, 0] },
        memory: { used: 0, total: 0, percentage: 0 },
        disk: { used: 0, total: 0, percentage: 0 },
        uptime: 0
      },
      databaseMetrics: this.databaseMetrics[this.databaseMetrics.length - 1] || {
        timestamp: new Date(),
        connectionPool: { active: 0, idle: 0, waiting: 0, max: 10 },
        queryPerformance: { avgResponseTime: 0, slowQueries: 0, errorRate: 0 },
        storage: { size: 0, growth: 0 }
      }
    };
  }

  /**
   * Resolve alert by ID
   */
  public resolveAlert(alertId: string): boolean {
    const alert = this.performanceAlerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.emit('alert_resolved', alert);
      return true;
    }
    return false;
  }

  /**
   * Resolve error by ID
   */
  public resolveError(errorId: string): boolean {
    const error = this.errorEvents.find(e => e.id === errorId);
    if (error && !error.resolved) {
      error.resolved = true;
      error.resolvedAt = new Date();
      this.emit('error_resolved', error);
      return true;
    }
    return false;
  }

  /**
   * Get health status for specific service
   */
  public getHealthStatus(service?: string): HealthCheck[] {
    if (service) {
      const healthCheck = this.healthChecks.get(service);
      return healthCheck ? [healthCheck] : [];
    }
    return Array.from(this.healthChecks.values());
  }

  /**
   * Cleanup old monitoring data based on retention policy
   */
  private cleanupOldData(): void {
    const now = new Date();
    const metricsRetention = new Date(now.getTime() - this.config.retention.metrics * 24 * 60 * 60 * 1000);
    const logsRetention = new Date(now.getTime() - this.config.retention.logs * 24 * 60 * 60 * 1000);

    // Cleanup old metrics
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp >= metricsRetention);
    this.databaseMetrics = this.databaseMetrics.filter(m => m.timestamp >= metricsRetention);
    this.apiMetrics = this.apiMetrics.filter(m => m.timestamp >= metricsRetention);

    // Cleanup old logs
    this.errorEvents = this.errorEvents.filter(e => e.timestamp >= logsRetention);
    this.performanceAlerts = this.performanceAlerts.filter(a => a.timestamp >= logsRetention);
  }

  /**
   * Stop monitoring services
   */
  public stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
export default monitoringService;