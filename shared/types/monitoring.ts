// Monitoring and observability type definitions for R&D Tax Credit SaaS

export interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  responseTime: number;
  details?: Record<string, any>;
  error?: string;
}

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
}

export interface DatabaseMetrics {
  timestamp: Date;
  connectionPool: {
    active: number;
    idle: number;
    waiting: number;
    max: number;
  };
  queryPerformance: {
    avgResponseTime: number;
    slowQueries: number;
    errorRate: number;
  };
  storage: {
    size: number;
    growth: number;
  };
}

export interface APIMetrics {
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize?: number;
  responseSize?: number;
  userAgent?: string;
  ipAddress?: string;
}

export interface ErrorEvent {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'critical';
  message: string;
  stack?: string;
  context: {
    endpoint?: string;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
  };
  resolved: boolean;
  resolvedAt?: Date;
  tags: string[];
}

export interface PerformanceAlert {
  id: string;
  timestamp: Date;
  type: 'latency' | 'error_rate' | 'throughput' | 'resource' | 'uptime';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  threshold: number;
  actualValue: number;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

export interface UptimeStatus {
  service: string;
  status: 'up' | 'down' | 'degraded';
  uptime: number;
  lastCheck: Date;
  incidents: number;
  responseTime: number;
}

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  startTime: Date;
  endTime?: Date;
  affectedServices: string[];
  timeline: IncidentTimelineEntry[];
  rootCause?: string;
  resolution?: string;
}

export interface IncidentTimelineEntry {
  timestamp: Date;
  status: string;
  message: string;
  author: string;
}

export interface MonitoringConfig {
  healthChecks: {
    enabled: boolean;
    interval: number;
    timeout: number;
    endpoints: string[];
  };
  performance: {
    enabled: boolean;
    sampleRate: number;
    thresholds: {
      responseTime: number;
      errorRate: number;
      cpuUsage: number;
      memoryUsage: number;
    };
  };
  alerts: {
    enabled: boolean;
    channels: AlertChannel[];
    escalation: EscalationPolicy[];
  };
  retention: {
    metrics: number; // days
    logs: number; // days
    incidents: number; // days
  };
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

export interface EscalationPolicy {
  level: number;
  delay: number; // minutes
  channels: string[];
}

export interface MonitoringDashboard {
  overview: {
    uptime: number;
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
  };
  services: UptimeStatus[];
  recentAlerts: PerformanceAlert[];
  recentErrors: ErrorEvent[];
  systemMetrics: SystemMetrics;
  databaseMetrics: DatabaseMetrics;
}

export type MonitoringEventType = 
  | 'health_check'
  | 'performance_metric'
  | 'error_event'
  | 'alert_triggered'
  | 'alert_resolved'
  | 'incident_created'
  | 'incident_updated'
  | 'incident_resolved';

export interface MonitoringEvent {
  type: MonitoringEventType;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}