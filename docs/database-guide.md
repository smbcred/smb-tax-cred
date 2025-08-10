# SMBTaxCredits.com - Database Guide

## Overview
This guide covers PostgreSQL database management, optimization, and best practices for the R&D Tax Credit platform.

## Table of Contents
1. [Database Schema](#database-schema)
2. [Migration Procedures](#migration-procedures)
3. [Backup Strategies](#backup-strategies)
4. [Query Optimization](#query-optimization)
5. [Index Management](#index-management)
6. [Connection Management](#connection-management)
7. [Security Practices](#security-practices)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Database Schema

### Entity Relationship Diagram
```
users (1) ─────────── (1) companies
  │                         │
  │                         ├─── (n) calculations
  │                         ├─── (n) intake_forms
  └─── (n) sessions         └─── (n) documents
        │
        └─── (n) subscriptions
```

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  stripe_customer_id VARCHAR(255) UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_from_lead BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### Companies Table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  ein VARCHAR(20) UNIQUE,
  entity_type entity_type NOT NULL,
  formation_date DATE,
  naics_code VARCHAR(10),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  country VARCHAR(2) DEFAULT 'US',
  employee_count INTEGER,
  airtable_record_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_ein ON companies(ein);
CREATE INDEX idx_companies_airtable_record_id ON companies(airtable_record_id);
```

#### Calculations Table
```sql
CREATE TABLE calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  business_type VARCHAR(50) NOT NULL,
  qualifying_activities TEXT[],
  
  -- Expense details
  total_wages DECIMAL(12,2),
  rd_wages DECIMAL(12,2),
  total_contractors DECIMAL(12,2),
  rd_contractors DECIMAL(12,2),
  total_supplies DECIMAL(12,2),
  rd_supplies DECIMAL(12,2),
  total_software DECIMAL(12,2),
  rd_software DECIMAL(12,2),
  
  -- Calculated amounts
  total_qres DECIMAL(12,2),
  federal_credit DECIMAL(12,2),
  credit_rate DECIMAL(4,3),
  pricing_tier INTEGER,
  service_fee DECIMAL(10,2),
  
  -- Additional data
  calculation_method VARCHAR(20) DEFAULT 'regular',
  calculation_data JSONB,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calculations_company_id ON calculations(company_id);
CREATE INDEX idx_calculations_tax_year ON calculations(tax_year);
CREATE INDEX idx_calculations_created_at ON calculations(created_at);
```

#### Intake Forms Table
```sql
CREATE TABLE intake_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  calculation_id UUID REFERENCES calculations(id),
  tax_year INTEGER NOT NULL,
  status intake_status DEFAULT 'not_started',
  
  -- Form sections (JSONB for flexibility)
  company_info JSONB,
  rd_activities JSONB,
  technical_narrative JSONB,
  expense_details JSONB,
  four_part_test JSONB,
  certifications JSONB,
  
  -- Progress tracking
  current_section VARCHAR(50),
  completed_sections TEXT[],
  completion_percentage INTEGER DEFAULT 0,
  
  -- Sync status
  airtable_sync_status airtable_sync_status DEFAULT 'pending',
  airtable_record_id VARCHAR(255),
  make_webhook_triggered BOOLEAN DEFAULT FALSE,
  make_webhook_triggered_at TIMESTAMP,
  
  -- Timestamps
  started_at TIMESTAMP,
  last_saved_at TIMESTAMP,
  submitted_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_intake_forms_company_id ON intake_forms(company_id);
CREATE INDEX idx_intake_forms_status ON intake_forms(status);
CREATE INDEX idx_intake_forms_tax_year ON intake_forms(tax_year);
CREATE INDEX idx_intake_forms_submitted_at ON intake_forms(submitted_at);
```

#### Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intake_form_id UUID REFERENCES intake_forms(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Document details
  document_type document_type NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  tax_year INTEGER NOT NULL,
  
  -- Storage
  s3_key TEXT NOT NULL,
  s3_bucket VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  
  -- Access
  download_url TEXT,
  download_url_expires_at TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP,
  
  -- Metadata
  generation_time_ms INTEGER,
  generated_by VARCHAR(50), -- 'system', 'manual', 'make.com'
  metadata JSONB,
  
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_documents_intake_form_id ON documents(intake_form_id);
CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_tax_year ON documents(tax_year);
```

### Supporting Tables

#### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  calculation_id UUID REFERENCES calculations(id),
  
  -- Stripe details
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_checkout_session_id VARCHAR(255) UNIQUE,
  
  -- Payment details
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status subscription_status NOT NULL,
  tier INTEGER NOT NULL,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

## Migration Procedures

### Migration Tools Setup
```bash
# Install migration tool
npm install -D drizzle-kit

# Migration commands in package.json
"scripts": {
  "migrate:generate": "drizzle-kit generate:pg",
  "migrate:run": "drizzle-kit push:pg",
  "migrate:status": "drizzle-kit studio",
  "migrate:rollback": "node scripts/rollback-migration.js"
}
```

### Creating Migrations
```typescript
// Example migration: Add new column
// migrations/001_add_phone_verified.sql
ALTER TABLE users 
ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;

-- Add index if needed
CREATE INDEX idx_users_phone_verified ON users(phone_verified) 
WHERE phone_verified = TRUE;
```

### Migration Best Practices
1. **Always backup before migrations**
```bash
pg_dump -h localhost -U postgres smbtaxcredits > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. **Test migrations on staging first**
```sql
-- Test on staging database
BEGIN;
-- Run migration SQL
-- Verify results
ROLLBACK; -- or COMMIT if successful
```

3. **Version control migrations**
```
/migrations
  ├── 001_initial_schema.sql
  ├── 002_add_documents_table.sql
  ├── 003_add_indexes.sql
  └── migration_log.json
```

### Zero-Downtime Migrations
```sql
-- Example: Rename column without downtime
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN email_address VARCHAR(255);

-- Step 2: Copy data
UPDATE users SET email_address = email;

-- Step 3: Add constraints
ALTER TABLE users ALTER COLUMN email_address SET NOT NULL;

-- Step 4: Update application to use new column

-- Step 5: Drop old column (after deployment)
ALTER TABLE users DROP COLUMN email;
```

---

## Backup Strategies

### Automated Backup Script
```bash
#!/bin/bash
# backup-database.sh

# Configuration
DB_NAME="smbtaxcredits"
BACKUP_DIR="/backups/postgres"
S3_BUCKET="smbtaxcredits-backups"
RETENTION_DAYS=30

# Create backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Perform backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://$S3_BUCKET/postgres/

# Clean old local backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

# Clean old S3 backups
aws s3 ls s3://$S3_BUCKET/postgres/ | \
  awk '{print $4}' | \
  while read file; do
    FILE_DATE=$(echo $file | grep -oP '\d{8}')
    if [[ $(date -d "$FILE_DATE" +%s) -lt $(date -d "$RETENTION_DAYS days ago" +%s) ]]; then
      aws s3 rm s3://$S3_BUCKET/postgres/$file
    fi
  done
```

### Backup Schedule (Cron)
```bash
# Daily backups at 2 AM
0 2 * * * /scripts/backup-database.sh

# Weekly full backup on Sunday
0 3 * * 0 pg_dump -Fc smbtaxcredits > /backups/weekly/backup_$(date +\%Y\%m\%d).dump

# Monthly archive on 1st
0 4 1 * * /scripts/archive-monthly-backup.sh
```

### Point-in-Time Recovery Setup
```sql
-- Enable WAL archiving
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'aws s3 cp %p s3://smbtaxcredits-backups/wal/%f';

-- Restart PostgreSQL
SELECT pg_reload_conf();
```

---

## Query Optimization

### Common Query Patterns

#### 1. Get User Dashboard Data
```sql
-- Optimized query with proper joins and limits
WITH recent_calculations AS (
  SELECT 
    c.*,
    ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.created_at DESC) as rn
  FROM calculations c
  WHERE c.company_id = $1
)
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  co.name as company_name,
  co.ein,
  rc.federal_credit as latest_credit,
  rc.tax_year as latest_tax_year,
  if.status as intake_status,
  if.completion_percentage,
  COUNT(DISTINCT d.id) as document_count
FROM users u
JOIN companies co ON co.user_id = u.id
LEFT JOIN recent_calculations rc ON rc.company_id = co.id AND rc.rn = 1
LEFT JOIN intake_forms if ON if.company_id = co.id AND if.status != 'completed'
LEFT JOIN documents d ON d.company_id = co.id
WHERE u.id = $2
GROUP BY u.id, u.email, u.first_name, u.last_name, 
         co.name, co.ein, rc.federal_credit, rc.tax_year,
         if.status, if.completion_percentage;
```

#### 2. Search Companies with Filters
```sql
-- Use indexes effectively
CREATE INDEX idx_companies_search ON companies 
  USING gin(to_tsvector('english', name || ' ' || COALESCE(legal_name, '')));

-- Search query
SELECT c.*, u.email, 
       COUNT(DISTINCT calc.id) as calculation_count,
       MAX(calc.federal_credit) as max_credit
FROM companies c
JOIN users u ON u.id = c.user_id
LEFT JOIN calculations calc ON calc.company_id = c.id
WHERE 
  to_tsvector('english', c.name || ' ' || COALESCE(c.legal_name, '')) 
  @@ plainto_tsquery('english', $1)
  AND c.created_at >= $2
  AND c.created_at <= $3
GROUP BY c.id, u.email
ORDER BY c.created_at DESC
LIMIT 50 OFFSET $4;
```

### Query Performance Analysis
```sql
-- Enable query timing
\timing on

-- Analyze query plan
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM calculations 
WHERE company_id = '123' 
ORDER BY created_at DESC;

-- Find slow queries
SELECT 
  query,
  mean_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- queries taking > 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Query Optimization Tips
1. **Use appropriate indexes**
2. **Avoid N+1 queries**
3. **Use CTEs for complex queries**
4. **Limit result sets early**
5. **Use prepared statements**

---

## Index Management

### Essential Indexes
```sql
-- Primary lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_calculations_company_id ON calculations(company_id);
CREATE INDEX idx_intake_forms_company_id ON intake_forms(company_id);
CREATE INDEX idx_documents_company_id ON documents(company_id);

-- Foreign key relationships
CREATE INDEX idx_calculations_company_id_tax_year 
  ON calculations(company_id, tax_year);
CREATE INDEX idx_documents_intake_form_id_type 
  ON documents(intake_form_id, document_type);

-- Status and filtering
CREATE INDEX idx_intake_forms_status_submitted 
  ON intake_forms(status, submitted_at) 
  WHERE status = 'submitted';

-- Date range queries
CREATE INDEX idx_calculations_created_at ON calculations(created_at DESC);
CREATE INDEX idx_documents_generated_at ON documents(generated_at DESC);

-- Partial indexes for common queries
CREATE INDEX idx_active_subscriptions 
  ON subscriptions(user_id, status) 
  WHERE status = 'active';
```

### Index Maintenance
```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Find unused indexes
SELECT 
  schemaname || '.' || tablename AS table,
  indexname AS index,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname !~ '^pk_'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Rebuild bloated indexes
REINDEX INDEX CONCURRENTLY idx_calculations_company_id;

-- Monitor index bloat
SELECT
  schemaname || '.' || tablename AS table,
  indexname AS index,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size,
  ROUND(100 * (pg_relation_size(indexrelid) - pg_relation_size(indexrelid::regclass)) / 
    pg_relation_size(indexrelid)::numeric, 2) AS bloat_pct
FROM pg_stat_user_indexes
WHERE pg_relation_size(indexrelid) > 10485760  -- 10MB
ORDER BY bloat_pct DESC;
```

---

## Connection Management

### Connection Pool Configuration
```typescript
// Database connection pool setup
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Pool configuration
  max: 20,                     // Maximum connections
  min: 5,                      // Minimum connections
  idleTimeoutMillis: 30000,    // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Timeout for new connections
  
  // SSL for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Health check
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.end();
});
```

### Connection Monitoring
```sql
-- View current connections
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  state_change,
  query_start,
  LEFT(query, 50) as query_preview
FROM pg_stat_activity
WHERE datname = 'smbtaxcredits'
ORDER BY query_start DESC;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'smbtaxcredits'
  AND state = 'idle'
  AND state_change < CURRENT_TIMESTAMP - INTERVAL '10 minutes';

-- Connection pool stats
SELECT 
  COUNT(*) as total_connections,
  COUNT(*) FILTER (WHERE state = 'active') as active,
  COUNT(*) FILTER (WHERE state = 'idle') as idle,
  COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity
WHERE datname = 'smbtaxcredits';
```

---

## Security Practices

### User Permissions
```sql
-- Create application user
CREATE USER app_user WITH ENCRYPTED PASSWORD 'secure_password';

-- Grant minimal permissions
GRANT CONNECT ON DATABASE smbtaxcredits TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Create read-only user for analytics
CREATE USER analytics_user WITH ENCRYPTED PASSWORD 'analytics_password';
GRANT CONNECT ON DATABASE smbtaxcredits TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Revoke unnecessary permissions
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
```

### Row-Level Security
```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY users_own_data ON users
  FOR ALL 
  USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY companies_own_data ON companies
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Set user context in application
SET LOCAL app.current_user_id = '123e4567-e89b-12d3-a456-426614174000';
```

### Data Encryption
```sql
-- Encrypt sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt SSN
ALTER TABLE users ADD COLUMN ssn_encrypted BYTEA;

-- Encrypt data
UPDATE users 
SET ssn_encrypted = pgp_sym_encrypt(ssn, 'encryption_key')
WHERE ssn IS NOT NULL;

-- Decrypt data
SELECT pgp_sym_decrypt(ssn_encrypted, 'encryption_key') as ssn
FROM users
WHERE id = $1;
```

---

## Monitoring & Maintenance

### Performance Monitoring Queries
```sql
-- Database size
SELECT 
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'smbtaxcredits';

-- Table sizes
SELECT
  schemaname AS schema,
  tablename AS table,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS data_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Cache hit ratio
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit)  as heap_hit,
  CASE 
    WHEN sum(heap_blks_hit) + sum(heap_blks_read) = 0 THEN 0
    ELSE sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))::float
  END as cache_hit_ratio
FROM pg_statio_user_tables;
```

### Maintenance Tasks
```sql
-- Weekly maintenance script
-- vacuum_maintenance.sql

-- Vacuum and analyze all tables
VACUUM ANALYZE;

-- Reindex bloated indexes
REINDEX TABLE users;
REINDEX TABLE companies;
REINDEX TABLE calculations;

-- Update table statistics
ANALYZE users;
ANALYZE companies;
ANALYZE calculations;
ANALYZE intake_forms;
ANALYZE documents;

-- Clean up old sessions
DELETE FROM sessions 
WHERE last_activity < CURRENT_TIMESTAMP - INTERVAL '30 days';

-- Archive old calculations
INSERT INTO calculations_archive 
SELECT * FROM calculations 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';

DELETE FROM calculations 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';
```

### Monitoring Checklist
- [ ] Database size growth rate
- [ ] Connection pool utilization
- [ ] Query performance (p95, p99)
- [ ] Index usage and bloat
- [ ] Replication lag (if applicable)
- [ ] Backup success rate
- [ ] Disk space availability
- [ ] Error log patterns