# Performance Monitoring

## Overview
Comprehensive performance monitoring setup for SMBTaxCredits.com production environment.

## Key Performance Indicators (KPIs)

### Application Performance
- **Response Time**: API endpoints < 500ms (95th percentile)
- **Page Load Time**: < 3 seconds (95th percentile)
- **Uptime**: > 99.9% availability
- **Error Rate**: < 0.1% of total requests
- **Database Query Time**: < 100ms average

### Business Metrics
- **Calculator Completion Rate**: > 85%
- **Payment Success Rate**: > 99%
- **Lead Conversion Rate**: > 15%
- **User Session Duration**: > 5 minutes average
- **Bounce Rate**: < 40%

## Monitoring Tools and Setup

### 1. Application Performance Monitoring (APM)

#### Built-in Monitoring (Implemented)
```javascript
// server/middleware/monitoring.js
export const applyMonitoring = () => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Log performance metrics
      console.log({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      
      // Alert on slow requests
      if (duration > 2000) {
        console.warn(`Slow request detected: ${req.method} ${req.url} took ${duration}ms`);
      }
    });
    
    next();
  };
};
```

#### External APM Tools
Recommended third-party monitoring services:

1. **Replit Native Monitoring**
   - Built-in deployment metrics
   - Resource usage tracking
   - Error monitoring

2. **New Relic** (Recommended)
   ```javascript
   // Add to package.json
   "newrelic": "^11.0.0"
   
   // Add to server startup
   require('newrelic');
   ```

3. **DataDog**
   ```javascript
   // Add DataDog tracing
   const tracer = require('dd-trace').init();
   ```

### 2. Real User Monitoring (RUM)

#### Google Analytics 4
```html
<!-- Already implemented in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### Core Web Vitals Monitoring
```javascript
// client/src/utils/performance.ts (already implemented)
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};
```

### 3. Database Performance Monitoring

#### PostgreSQL Monitoring
```sql
-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- Monitor database connections
SELECT count(*) as connection_count
FROM pg_stat_activity
WHERE state = 'active';

-- Monitor table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Neon Database Monitoring
- Built-in metrics dashboard
- Connection pool monitoring
- Query performance insights
- Storage usage tracking

### 4. Infrastructure Monitoring

#### Replit Deployment Metrics
Monitor via Replit dashboard:
- CPU usage
- Memory consumption
- Network I/O
- Disk usage
- Request volume

#### Custom Health Checks
```javascript
// server/routes/health.ts (implemented)
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: await checkDatabaseHealth(),
    services: await checkExternalServices()
  };
  
  res.json(health);
});
```

## Alerting Configuration

### 1. Critical Alerts (Immediate Response)

#### High Priority Alerts
- **Application Down**: Response to health check fails
- **Database Connection Lost**: Unable to connect to database
- **Payment Processing Failed**: Stripe webhook failures
- **High Error Rate**: > 5% error rate for > 5 minutes
- **Slow Response Times**: > 5 seconds for > 10 requests

#### Alert Delivery
```javascript
// server/services/alerting.js
const sendCriticalAlert = async (message) => {
  // Send to multiple channels
  await Promise.all([
    sendSlackAlert(message),
    sendEmailAlert(message),
    sendSMSAlert(message) // For critical issues only
  ]);
};
```

### 2. Warning Alerts (Monitor Closely)

#### Medium Priority Alerts
- **Elevated Response Times**: > 2 seconds average for > 10 minutes
- **Increased Error Rate**: > 1% error rate for > 15 minutes
- **Database Slow Queries**: > 500ms average for > 5 minutes
- **Memory Usage High**: > 80% memory usage for > 20 minutes
- **High Load**: > 80% CPU usage for > 15 minutes

### 3. Informational Alerts

#### Low Priority Alerts
- **Daily Summary Reports**: Performance metrics summary
- **Weekly Trends**: Performance trend analysis
- **Monthly Reports**: Comprehensive performance review
- **Deployment Notifications**: Successful deployments

## Performance Optimization

### 1. Frontend Optimization

#### Bundle Optimization
```javascript
// vite.config.ts (already configured)
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  }
});
```

#### Lazy Loading
```javascript
// Implemented in client/src/App.tsx
const LazyComponent = lazy(() => import('./pages/Dashboard'));
```

#### Caching Strategy
```javascript
// Service worker for static assets
const CACHE_NAME = 'smbtaxcredits-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];
```

### 2. Backend Optimization

#### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_calculations_user_id ON calculations(user_id);
CREATE INDEX CONCURRENTLY idx_companies_user_id ON companies(user_id);
```

#### API Response Optimization
```javascript
// Implement response compression
app.use(compression());

// Cache static responses
app.use('/api/static', express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

#### Connection Pooling
```javascript
// Database connection pooling (already configured in Drizzle)
const db = drizzle(sql, {
  logger: true,
  pool: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});
```

## Performance Monitoring Dashboard

### 1. Key Metrics Dashboard

#### Application Health
- Response time trends (hourly, daily, weekly)
- Error rate tracking
- Uptime percentage
- Active user sessions
- Request volume patterns

#### Business Metrics
- Calculator usage and completion rates
- Payment processing metrics
- Lead generation and conversion
- User engagement metrics
- Feature adoption rates

### 2. Custom Dashboards

#### Technical Dashboard
```javascript
// Example dashboard queries
const getTechnicalMetrics = async () => {
  return {
    avgResponseTime: await getAverageResponseTime(),
    errorRate: await getErrorRate(),
    activeConnections: await getActiveConnections(),
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
};
```

#### Business Dashboard
```javascript
const getBusinessMetrics = async () => {
  return {
    dailyActiveUsers: await getDailyActiveUsers(),
    calculatorCompletions: await getCalculatorCompletions(),
    paymentSuccessRate: await getPaymentSuccessRate(),
    leadConversions: await getLeadConversions()
  };
};
```

## Performance Testing

### 1. Load Testing

#### Test Scenarios
```javascript
// Load testing with Artillery
module.exports = {
  config: {
    target: 'https://smbtaxcredits.com',
    phases: [
      { duration: '2m', arrivalRate: 10 },
      { duration: '5m', arrivalRate: 50 },
      { duration: '2m', arrivalRate: 100 }
    ]
  },
  scenarios: [
    {
      name: 'Calculator Flow',
      weight: 70,
      flow: [
        { get: { url: '/' } },
        { post: { url: '/api/calculation', json: calculatorData } }
      ]
    }
  ]
};
```

### 2. Performance Regression Testing

#### Automated Performance Tests
```bash
#!/bin/bash
# performance_test.sh

# Build application
npm run build

# Start application
npm start &
APP_PID=$!

# Wait for startup
sleep 10

# Run performance tests
npm run test:performance

# Stop application
kill $APP_PID

# Analyze results
npm run analyze:performance
```

## Capacity Planning

### 1. Resource Scaling

#### Auto-scaling Configuration
- **CPU Threshold**: Scale up at 70% usage
- **Memory Threshold**: Scale up at 80% usage
- **Response Time**: Scale up if > 2 seconds average
- **Queue Length**: Scale up if > 100 pending requests

#### Database Scaling
- **Connection Pool**: Adjust based on load
- **Read Replicas**: For read-heavy operations
- **Caching Layer**: Redis for frequently accessed data

### 2. Growth Planning

#### Traffic Projections
- **Month 1**: 1,000 daily active users
- **Month 6**: 5,000 daily active users
- **Year 1**: 20,000 daily active users

#### Infrastructure Requirements
- **Current**: 1 CPU, 2GB RAM, 100GB storage
- **6 Months**: 2 CPU, 4GB RAM, 500GB storage
- **1 Year**: 4 CPU, 8GB RAM, 1TB storage

## Success Criteria
Performance monitoring is successful when:
- ✅ Real-time performance metrics available
- ✅ Automated alerting for critical issues
- ✅ Performance trends tracked and analyzed
- ✅ SLA targets consistently met
- ✅ Optimization opportunities identified
- ✅ Capacity planning data available
- ✅ Performance regression testing automated