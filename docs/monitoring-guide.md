# SMBTaxCredits.com - Monitoring & Observability Guide

## Overview
This guide covers comprehensive monitoring, logging, alerting, and observability practices for the R&D Tax Credit platform.

## Table of Contents
1. [Error Tracking (Sentry)](#error-tracking-sentry)
2. [Performance Monitoring](#performance-monitoring)
3. [Analytics Implementation](#analytics-implementation)
4. [Log Aggregation](#log-aggregation)
5. [Alert Configuration](#alert-configuration)
6. [Custom Dashboards](#custom-dashboards)
7. [Incident Response](#incident-response)
8. [Health Checks](#health-checks)

---

## Error Tracking (Sentry)

### Sentry Setup

#### Frontend Configuration
```typescript
// client/src/lib/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    
    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION,
    
    // Filtering
    beforeSend(event, hint) {
      // Filter out known issues
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }
      
      // Add user context
      if (window.currentUser) {
        event.user = {
          id: window.currentUser.id,
          email: window.currentUser.email,
        };
      }
      
      return event;
    },
  });
};

// Error boundary integration
export const ErrorFallback = ({ error, resetError }) => {
  React.useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  
  return (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
      <button onClick={resetError}>Try again</button>
    </div>
  );
};
```

#### Backend Configuration
```typescript
// server/src/lib/sentry.ts
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

export const initSentry = (app: Express) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
      new Tracing.Integrations.Postgres(),
    ],
    
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    beforeSend(event, hint) {
      // Sanitize sensitive data
      if (event.request?.data) {
        delete event.request.data.password;
        delete event.request.data.ssn;
        delete event.request.data.creditCard;
      }
      
      return event;
    },
  });
  
  // Request handler
  app.use(Sentry.Handlers.requestHandler());
  
  // Tracing handler
  app.use(Sentry.Handlers.tracingHandler());
};

// Error handler (must be after all other middleware)
export const sentryErrorHandler = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture 4xx and 5xx errors
    if (error.status >= 400) {
      return true;
    }
    return false;
  },
});
```

### Custom Error Context
```typescript
// Add business context to errors
export const captureBusinessError = (
  error: Error,
  context: {
    userId?: string;
    companyId?: string;
    action?: string;
    metadata?: any;
  }
) => {
  Sentry.withScope((scope) => {
    scope.setContext('business', context);
    scope.setLevel('error');
    
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    
    Sentry.captureException(error);
  });
};

// Usage
try {
  await generateDocuments(intakeFormId);
} catch (error) {
  captureBusinessError(error, {
    userId: user.id,
    companyId: company.id,
    action: 'document_generation',
    metadata: { intakeFormId, documentType }
  });
}
```

---

## Performance Monitoring

### Application Performance Monitoring (APM)

#### Frontend Performance
```typescript
// client/src/lib/performance.ts
import { getCLS, getFID, getLCP, getTTFB, getFCP } from 'web-vitals';

export const initPerformanceMonitoring = () => {
  // Send to analytics
  const sendToAnalytics = (metric: any) => {
    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
      });
    }
    
    // Send to custom monitoring
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
      }),
    });
  };
  
  // Core Web Vitals
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
  getFCP(sendToAnalytics);
  
  // Custom metrics
  measureCalculatorPerformance();
  measureAPILatency();
};

// Calculator performance
const measureCalculatorPerformance = () => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'calculator-calculation') {
        sendToAnalytics({
          name: 'calculator_calculation_time',
          value: entry.duration,
        });
      }
    }
  });
  
  observer.observe({ entryTypes: ['measure'] });
};

// API latency tracking
const measureAPILatency = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const start = performance.now();
    const response = await originalFetch(...args);
    const duration = performance.now() - start;
    
    // Track API calls
    if (args[0].toString().includes('/api/')) {
      sendToAnalytics({
        name: 'api_latency',
        value: duration,
        endpoint: args[0],
        status: response.status,
      });
    }
    
    return response;
  };
};
```

#### Backend Performance
```typescript
// server/src/middleware/performance.ts
import { performance } from 'perf_hooks';
import { StatsD } from 'node-statsd';

const statsd = new StatsD({
  host: process.env.STATSD_HOST || 'localhost',
  port: 8125,
});

export const performanceMiddleware = (req, res, next) => {
  const start = performance.now();
  
  // Track response time
  res.on('finish', () => {
    const duration = performance.now() - start;
    const route = req.route?.path || 'unknown';
    
    // Send metrics
    statsd.timing(`api.response_time`, duration, [`route:${route}`, `method:${req.method}`]);
    statsd.increment(`api.requests`, 1, [`route:${route}`, `status:${res.statusCode}`]);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn('Slow request detected:', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        query: req.query,
      });
    }
  });
  
  next();
};

// Database query monitoring
export const monitorDatabaseQueries = (pool) => {
  const originalQuery = pool.query.bind(pool);
  
  pool.query = async (text, params) => {
    const start = performance.now();
    
    try {
      const result = await originalQuery(text, params);
      const duration = performance.now() - start;
      
      // Track query performance
      statsd.timing('db.query_time', duration);
      
      // Log slow queries
      if (duration > 100) {
        console.warn('Slow query detected:', {
          query: text.substring(0, 100),
          duration: `${duration}ms`,
          rows: result.rowCount,
        });
      }
      
      return result;
    } catch (error) {
      statsd.increment('db.query_errors');
      throw error;
    }
  };
  
  return pool;
};
```

---

## Analytics Implementation

### Google Analytics 4 Setup
```html
<!-- client/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    send_page_view: false // We'll handle this manually
  });
</script>
```

### Custom Analytics Events
```typescript
// client/src/lib/analytics.ts
export const analytics = {
  // Page views
  trackPageView: (pagePath: string, pageTitle?: string) => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
  },
  
  // Calculator events
  trackCalculatorStart: () => {
    window.gtag('event', 'calculator_start', {
      event_category: 'engagement',
    });
  },
  
  trackCalculatorComplete: (federalCredit: number, tier: number) => {
    window.gtag('event', 'calculator_complete', {
      event_category: 'engagement',
      value: federalCredit,
      custom_parameter: { tier },
    });
  },
  
  // Conversion events
  trackLeadCapture: (source: string) => {
    window.gtag('event', 'generate_lead', {
      event_category: 'conversion',
      event_label: source,
    });
  },
  
  trackPurchase: (value: number, tier: number) => {
    window.gtag('event', 'purchase', {
      transaction_id: Date.now().toString(),
      value: value,
      currency: 'USD',
      items: [{
        item_id: `tier_${tier}`,
        item_name: `R&D Tax Credit Documentation - Tier ${tier}`,
        price: value,
        quantity: 1,
      }],
    });
  },
  
  // User behavior
  trackIntakeProgress: (section: string, percentage: number) => {
    window.gtag('event', 'form_progress', {
      event_category: 'engagement',
      event_label: section,
      value: percentage,
    });
  },
};

// Auto-track route changes
export const initRouteTracking = (history) => {
  history.listen((location) => {
    analytics.trackPageView(location.pathname);
  });
};
```

### Server-Side Analytics
```typescript
// server/src/lib/analytics.ts
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE,
});

export const trackServerEvent = async (event: {
  eventName: string;
  userId?: string;
  properties?: any;
  timestamp?: Date;
}) => {
  const dataset = bigquery.dataset('analytics');
  const table = dataset.table('events');
  
  const row = {
    event_name: event.eventName,
    user_id: event.userId,
    properties: JSON.stringify(event.properties),
    timestamp: event.timestamp || new Date(),
    server_timestamp: new Date(),
  };
  
  await table.insert([row]);
};

// Usage
await trackServerEvent({
  eventName: 'document_generation_complete',
  userId: user.id,
  properties: {
    documentType: 'form_6765',
    generationTime: 4523,
    success: true,
  },
});
```

---

## Log Aggregation

### Structured Logging Setup
```typescript
// server/src/lib/logger.ts
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const esTransport = new ElasticsearchTransport({
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL,
    auth: {
      username: process.env.ELASTICSEARCH_USER,
      password: process.env.ELASTICSEARCH_PASS,
    },
  },
  index: 'smbtaxcredits-logs',
});

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  
  defaultMeta: {
    service: 'api',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
  
  transports: [
    // Console for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
      level: 'debug',
    }),
    
    // File for production
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760,
      maxFiles: 5,
    }),
    
    // Elasticsearch for aggregation
    esTransport,
  ],
});

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
      correlationId: req.id,
    });
  });
  
  next();
};

// Business event logging
export const logBusinessEvent = (event: string, data: any) => {
  logger.info(event, {
    eventType: 'business',
    eventName: event,
    ...data,
  });
};
```

### Log Aggregation Queries
```json
// Elasticsearch queries for Kibana

// Find all errors in last hour
{
  "query": {
    "bool": {
      "must": [
        { "term": { "level": "error" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}

// Track API performance
{
  "aggs": {
    "routes": {
      "terms": { "field": "path.keyword" },
      "aggs": {
        "avg_duration": { "avg": { "field": "duration" } },
        "percentiles": { "percentiles": { "field": "duration" } }
      }
    }
  }
}

// User activity timeline
{
  "query": {
    "term": { "userId": "user-123" }
  },
  "sort": [{ "@timestamp": "desc" }]
}
```

---

## Alert Configuration

### Alert Rules
```yaml
# alerts/production.yml
groups:
  - name: application
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
        labels:
          severity: critical
          
      # API latency
      - alert: HighAPILatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 10m
        annotations:
          summary: "High API latency"
          description: "95th percentile latency is {{ $value }} seconds"
        labels:
          severity: warning
          
      # Database connections
      - alert: DatabaseConnectionPoolExhausted
        expr: pg_stat_database_numbackends / pg_stat_database_max_connections > 0.8
        for: 5m
        annotations:
          summary: "Database connection pool near limit"
          description: "{{ $value }}% of connections in use"
        labels:
          severity: warning
          
      # Document generation failures
      - alert: DocumentGenerationFailures
        expr: rate(document_generation_failures_total[5m]) > 0.1
        for: 5m
        annotations:
          summary: "Document generation failing"
          description: "{{ $value }} failures per second"
        labels:
          severity: critical
          
      # Payment failures
      - alert: PaymentProcessingFailures
        expr: rate(stripe_payment_failures_total[15m]) > 0.2
        for: 5m
        annotations:
          summary: "Payment processing issues"
          description: "{{ $value }} payment failures per second"
        labels:
          severity: critical
```

### PagerDuty Integration
```typescript
// server/src/lib/alerting.ts
import { PagerDuty } from 'node-pagerduty';

const pd = new PagerDuty({
  serviceKey: process.env.PAGERDUTY_SERVICE_KEY,
});

export const createIncident = async (
  title: string,
  details: any,
  severity: 'critical' | 'error' | 'warning' | 'info' = 'error'
) => {
  try {
    const incident = await pd.incidents.createIncident({
      incident: {
        type: 'incident',
        title,
        service: {
          id: process.env.PAGERDUTY_SERVICE_ID,
          type: 'service_reference',
        },
        urgency: severity === 'critical' ? 'high' : 'low',
        body: {
          type: 'incident_body',
          details: JSON.stringify(details, null, 2),
        },
      },
    });
    
    logger.error('PagerDuty incident created', {
      incidentId: incident.id,
      title,
      severity,
    });
    
    return incident;
  } catch (error) {
    logger.error('Failed to create PagerDuty incident', error);
  }
};

// Auto-create incidents for critical errors
export const handleCriticalError = async (error: Error, context: any) => {
  // Log to Sentry
  Sentry.captureException(error, { extra: context });
  
  // Create PagerDuty incident for critical issues
  if (context.severity === 'critical') {
    await createIncident(
      `Critical Error: ${error.message}`,
      {
        error: error.stack,
        context,
        timestamp: new Date().toISOString(),
      },
      'critical'
    );
  }
};

// Slack notifications for warnings
import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export const sendSlackAlert = async (
  message: string,
  channel: string = '#alerts',
  severity: 'info' | 'warning' | 'error' = 'info'
) => {
  const color = {
    info: '#36a64f',
    warning: '#ff9900',
    error: '#ff0000',
  }[severity];
  
  await slack.chat.postMessage({
    channel,
    attachments: [{
      color,
      title: `SMBTaxCredits Alert - ${severity.toUpperCase()}`,
      text: message,
      ts: Math.floor(Date.now() / 1000).toString(),
    }],
  });
};
```

---

## Custom Dashboards

### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "title": "SMBTaxCredits.com - Production Metrics",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [{
          "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))",
          "legendFormat": "{{ route }}"
        }]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [{
          "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100"
        }]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [{
          "expr": "count(distinct user_id) by (user_id)"
        }]
      },
      {
        "title": "Document Generation Success Rate",
        "type": "gauge",
        "targets": [{
          "expr": "sum(rate(document_generation_success[1h])) / sum(rate(document_generation_total[1h])) * 100"
        }]
      },
      {
        "title": "Revenue (Last 24h)",
        "type": "stat",
        "targets": [{
          "expr": "sum(stripe_payment_amount_sum) by (currency)"
        }]
      }
    ]
  }
}
```

### Business Metrics Dashboard
```typescript
// server/src/lib/metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const register = new Registry();

// Business metrics
export const metrics = {
  // Revenue metrics
  revenueTotal: new Counter({
    name: 'revenue_total',
    help: 'Total revenue processed',
    labelNames: ['tier', 'currency'],
    registers: [register],
  }),
  
  // Conversion funnel
  calculatorStarts: new Counter({
    name: 'calculator_starts_total',
    help: 'Number of calculator sessions started',
    registers: [register],
  }),
  
  calculatorCompletions: new Counter({
    name: 'calculator_completions_total',
    help: 'Number of calculator completions',
    labelNames: ['business_type'],
    registers: [register],
  }),
  
  leadsCaptured: new Counter({
    name: 'leads_captured_total',
    help: 'Number of leads captured',
    labelNames: ['source'],
    registers: [register],
  }),
  
  conversions: new Counter({
    name: 'conversions_total',
    help: 'Number of paying customers',
    labelNames: ['tier'],
    registers: [register],
  }),
  
  // Document metrics
  documentsGenerated: new Counter({
    name: 'documents_generated_total',
    help: 'Number of documents generated',
    labelNames: ['type', 'status'],
    registers: [register],
  }),
  
  documentGenerationTime: new Histogram({
    name: 'document_generation_duration_seconds',
    help: 'Time to generate documents',
    labelNames: ['type'],
    buckets: [1, 5, 10, 30, 60, 120, 300],
    registers: [register],
  }),
  
  // Active metrics
  activeIntakeForms: new Gauge({
    name: 'active_intake_forms',
    help: 'Number of active intake forms',
    labelNames: ['status'],
    registers: [register],
  }),
};

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Update metrics in business logic
export const trackRevenue = (amount: number, tier: number) => {
  metrics.revenueTotal.labels(tier.toString(), 'USD').inc(amount);
};

export const trackConversion = (tier: number) => {
  metrics.conversions.labels(tier.toString()).inc();
};
```

---

## Incident Response

### Incident Response Playbook
```markdown
# Incident Response Procedures

## Severity Levels
- **P1 (Critical)**: Complete service outage, data loss, security breach
- **P2 (Major)**: Significant functionality broken, payments failing
- **P3 (Minor)**: Partial functionality affected, workarounds available
- **P4 (Low)**: Cosmetic issues, minor bugs

## Response Times
- P1: 15 minutes
- P2: 1 hour
- P3: 4 hours
- P4: Next business day

## Incident Commander Checklist
1. [ ] Acknowledge alert
2. [ ] Assess severity
3. [ ] Create incident channel (#incident-YYYYMMDD-description)
4. [ ] Notify stakeholders
5. [ ] Begin investigation
6. [ ] Implement fix
7. [ ] Verify resolution
8. [ ] Write postmortem

## Common Playbooks

### Database Outage
1. Check connection pool status
2. Verify database server health
3. Check for long-running queries
4. Restart connection pool if needed
5. Failover to replica if available

### Payment Processing Failure
1. Check Stripe status page
2. Verify API keys
3. Check webhook signatures
4. Review error logs
5. Contact Stripe support if needed

### High Error Rate
1. Check error logs
2. Identify error pattern
3. Check recent deployments
4. Rollback if necessary
5. Implement hotfix
```

### Automated Runbooks
```typescript
// server/src/lib/runbooks.ts
export const runbooks = {
  highErrorRate: async () => {
    const steps = [];
    
    // Step 1: Gather information
    const errorRate = await getErrorRate();
    steps.push(`Current error rate: ${errorRate}%`);
    
    // Step 2: Check recent deployments
    const recentDeploys = await getRecentDeployments();
    if (recentDeploys.length > 0) {
      steps.push(`Recent deployment: ${recentDeploys[0].version} at ${recentDeploys[0].timestamp}`);
    }
    
    // Step 3: Identify top errors
    const topErrors = await getTopErrors();
    steps.push(`Top errors: ${topErrors.map(e => e.message).join(', ')}`);
    
    // Step 4: Suggest actions
    if (errorRate > 10) {
      steps.push('RECOMMENDATION: Consider rolling back recent deployment');
    }
    
    return steps;
  },
  
  databaseSlow: async () => {
    const steps = [];
    
    // Check connection count
    const connections = await getActiveConnections();
    steps.push(`Active connections: ${connections.active}/${connections.max}`);
    
    // Check slow queries
    const slowQueries = await getSlowQueries();
    steps.push(`Slow queries: ${slowQueries.length}`);
    
    // Check locks
    const locks = await getDatabaseLocks();
    if (locks.length > 0) {
      steps.push(`Active locks: ${locks.length}`);
      steps.push('RECOMMENDATION: Review and kill blocking queries');
    }
    
    return steps;
  },
};
```

---

## Health Checks

### Application Health Endpoints
```typescript
// server/src/routes/health.ts
import { Router } from 'express';

const router = Router();

// Basic health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Detailed health check
router.get('/health/detailed', async (req, res) => {
  const checks = await runHealthChecks();
  const overall = Object.values(checks).every(check => check.status === 'healthy');
  
  res.status(overall ? 200 : 503).json({
    status: overall ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  });
});

// Individual component checks
async function runHealthChecks() {
  return {
    database: await checkDatabase(),
    redis: await checkRedis(),
    stripe: await checkStripe(),
    s3: await checkS3(),
    airtable: await checkAirtable(),
    sendgrid: await checkSendGrid(),
  };
}

async function checkDatabase() {
  try {
    const start = Date.now();
    await db.query('SELECT 1');
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
}

async function checkStripe() {
  try {
    const start = Date.now();
    await stripe.customers.list({ limit: 1 });
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
}
```

### Synthetic Monitoring
```typescript
// monitors/synthetic.ts
import { chromium } from 'playwright';

export const syntheticMonitors = {
  // Test calculator flow
  calculatorFlow: async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.goto('https://smbtaxcredits.com');
      
      // Click calculate button
      await page.click('text=Calculate My Credit');
      
      // Fill calculator
      await page.selectOption('[name=businessType]', 'agency');
      await page.click('[name=activities][value=custom_gpt]');
      await page.fill('[name=wages]', '500000');
      
      // Submit
      await page.click('text=Calculate');
      
      // Verify results
      await page.waitForSelector('.results-card');
      const creditAmount = await page.textContent('.federal-credit');
      
      if (!creditAmount.includes(')) {
        throw new Error('Credit amount not displayed');
      }
      
      return { success: true, creditAmount };
    } catch (error) {
      await page.screenshot({ path: 'error-screenshot.png' });
      throw error;
    } finally {
      await browser.close();
    }
  },
  
  // Test payment flow
  paymentFlow: async () => {
    // Similar synthetic test for payment
  },
};

// Run monitors on schedule
setInterval(async () => {
  for (const [name, monitor] of Object.entries(syntheticMonitors)) {
    try {
      const result = await monitor();
      metrics.syntheticSuccess.labels(name).inc();
    } catch (error) {
      metrics.syntheticFailure.labels(name).inc();
      await sendSlackAlert(`Synthetic monitor failed: ${name}`, '#alerts', 'error');
    }
  }
}, 300000); // Every 5 minutes
```

## Monitoring Checklist

### Daily Checks
- [ ] Review error rates
- [ ] Check conversion funnel
- [ ] Monitor API latency
- [ ] Review failed payments
- [ ] Check document generation success
- [ ] Review user feedback

### Weekly Reviews
- [ ] Analyze performance trends
- [ ] Review error patterns
- [ ] Check infrastructure costs
- [ ] Update alert thresholds
- [ ] Review security alerts
- [ ] Plan performance improvements

### Monthly Analysis
- [ ] Complete metrics review
- [ ] Infrastructure capacity planning
- [ ] Cost optimization review
- [ ] Update monitoring coverage
- [ ] Review incident postmortems
- [ ] Update runbooks and playbooks