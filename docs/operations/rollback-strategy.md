# Rollback Strategy

## Overview
Comprehensive rollback procedures for SMBTaxCredits.com production deployment.

## Rollback Triggers

### Automatic Rollback Conditions
- **Health check failures**: > 50% for 5 minutes
- **Error rate spike**: > 5% increase in 2 minutes
- **Response time degradation**: > 2x baseline for 3 minutes
- **Database connection failures**: > 10% for 1 minute

### Manual Rollback Scenarios
- Critical security vulnerability discovered
- Data corruption detected
- Payment processing failures
- Major functionality broken
- User-reported critical issues

## Rollback Types

### 1. Code Rollback

#### Git-Based Rollback
```bash
# Identify last known good commit
git log --oneline -10

# Create rollback branch
git checkout -b rollback-to-stable
git reset --hard [last-good-commit-hash]

# Force push to trigger redeployment
git push origin rollback-to-stable --force

# Update main branch if needed
git checkout main
git reset --hard [last-good-commit-hash]
git push origin main --force
```

#### Replit Deployment Rollback
1. Access Replit deployment history
2. Select previous stable version
3. Click "Rollback to this version"
4. Monitor deployment status
5. Verify functionality

### 2. Database Rollback

#### Schema Rollback
```bash
# Run down migrations to previous version
npm run db:migrate:down

# Or rollback to specific migration
npm run db:migrate:down --to=20240810120000

# Verify schema state
npm run db:status
```

#### Data Rollback (Point-in-Time)
```bash
# Using Neon point-in-time recovery
# 1. Access Neon dashboard
# 2. Navigate to Branches
# 3. Create branch from specific timestamp
# 4. Update DATABASE_URL to new branch
# 5. Restart application
```

### 3. Configuration Rollback

#### Environment Variables
```bash
# Backup current environment
env > current_env_backup.txt

# Restore previous environment configuration
# Via Replit Secrets interface:
# 1. Access Secrets tab
# 2. Update affected variables
# 3. Restart deployment
```

#### Feature Flag Rollback
```javascript
// Toggle feature flags for immediate rollback
const featureFlags = {
  newCalculator: false,        // Disable new feature
  enhancedReports: false,      // Disable problematic feature
  paymentV2: false,           // Rollback to old payment flow
  aiDocuments: false          // Disable AI features
};
```

## Rollback Procedures

### 1. Emergency Rollback (< 5 minutes)

#### Immediate Actions
```bash
# 1. Disable problematic features via feature flags
curl -X POST /api/admin/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"newFeature": false}'

# 2. Scale down if necessary
# Via Replit: Reduce autoscale settings

# 3. Enable maintenance mode if needed
echo "MAINTENANCE_MODE=true" >> .env
```

#### Quick Rollback
1. **Access Replit deployment**
2. **Select previous version** (last known good)
3. **Click "Rollback"**
4. **Monitor health checks**
5. **Verify critical functionality**

### 2. Planned Rollback (< 30 minutes)

#### Pre-Rollback Checklist
- [ ] Identify rollback target version
- [ ] Notify stakeholders via status page
- [ ] Export current data if needed
- [ ] Prepare rollback communications

#### Rollback Execution
```bash
# 1. Create rollback branch
git checkout -b rollback-$(date +%Y%m%d-%H%M)
git reset --hard [target-commit]

# 2. Update any necessary configurations
# - Database connection strings
# - API endpoints
# - Feature flags

# 3. Deploy rollback version
git push origin rollback-$(date +%Y%m%d-%H%M)

# 4. Verify deployment
curl -f https://smbtaxcredits.com/api/health
```

#### Post-Rollback Verification
```bash
# Test critical user journeys
curl -X POST /api/auth/login -d '{...}' # Authentication
curl -X POST /api/calculation -d '{...}' # Calculator
curl -X POST /api/checkout -d '{...}' # Payment flow
```

### 3. Database-Specific Rollback

#### Migration Rollback
```bash
# Check current migration status
npm run db:status

# Rollback specific number of migrations
npm run db:migrate:down --steps=3

# Rollback to specific migration
npm run db:migrate:down --to=20240810120000

# Verify database integrity
npm run db:verify
```

#### Data Restoration
```sql
-- Restore specific table from backup
BEGIN;
DROP TABLE IF EXISTS users_backup;
CREATE TABLE users_backup AS SELECT * FROM users;
-- Restore from backup file
\i /path/to/backup/users_table.sql
-- Verify data
SELECT COUNT(*) FROM users;
COMMIT;
```

## Rollback Monitoring

### 1. Health Checks During Rollback

#### Automated Monitoring
```javascript
// Monitor rollback progress
const monitorRollback = async () => {
  const healthChecks = [
    { name: 'API Health', url: '/api/health' },
    { name: 'Database', url: '/api/db/status' },
    { name: 'Authentication', url: '/api/auth/verify' },
    { name: 'Calculator', url: '/api/calculator/test' }
  ];

  for (const check of healthChecks) {
    const response = await fetch(check.url);
    if (!response.ok) {
      console.error(`${check.name} failed during rollback`);
      await sendAlert(`Rollback verification failed: ${check.name}`);
    }
  }
};
```

### 2. User Impact Monitoring
- Monitor user session disruption
- Track error rates and user complaints
- Verify payment processing functionality
- Check critical user flows

## Communication Plan

### 1. Internal Communication

#### Rollback Initiation
```
Subject: EMERGENCY ROLLBACK - SMBTaxCredits Production
Status: IN PROGRESS
Reason: [Brief description]
ETA: [Estimated completion time]
Impact: [User-facing impact]
Actions: [What's being done]
```

#### Rollback Completion
```
Subject: ROLLBACK COMPLETED - SMBTaxCredits Production
Status: COMPLETED
Duration: [Total rollback time]
Resolution: [What was fixed]
Next Steps: [Investigation/prevention measures]
```

### 2. External Communication

#### Status Page Update
```markdown
## [UPDATE] System Rollback in Progress
**Time**: 2:34 PM PST
**Status**: Investigating
**Impact**: Users may experience intermittent issues

We're rolling back a recent deployment to resolve performance issues. 
Service should be fully restored within 15 minutes.

**Update**: Rollback completed. All systems operational.
```

#### User Notification (if needed)
```
We temporarily rolled back a recent update to ensure optimal performance. 
All your data is safe and no action is required on your part.
```

## Prevention Measures

### 1. Pre-Deployment Safeguards
- Comprehensive testing in staging environment
- Gradual feature rollouts with kill switches
- Database migration testing
- Performance regression testing

### 2. Deployment Best Practices
- Blue-green deployments when possible
- Canary releases for major changes
- Automated rollback triggers
- Comprehensive monitoring and alerting

### 3. Rollback Testing
```bash
# Monthly rollback drills
# 1. Deploy test version with known issues
# 2. Trigger automatic rollback
# 3. Measure rollback time
# 4. Verify functionality restoration
# 5. Document lessons learned
```

## Rollback Success Criteria

### Time Objectives
- **Emergency rollback**: < 5 minutes
- **Planned rollback**: < 30 minutes
- **Database rollback**: < 15 minutes
- **Full system verification**: < 10 minutes after rollback

### Functionality Verification
- [ ] Application loads successfully
- [ ] User authentication working
- [ ] Calculator functionality restored
- [ ] Payment processing operational
- [ ] Database queries performing normally
- [ ] No data loss occurred
- [ ] All integrations functioning

## Post-Rollback Analysis

### 1. Incident Documentation
- Root cause analysis
- Timeline of events
- Impact assessment
- Lessons learned
- Prevention measures

### 2. Process Improvement
- Update rollback procedures based on experience
- Enhance monitoring and alerting
- Improve testing procedures
- Train team on new rollback techniques

## Emergency Contacts

### Immediate Response Team
- **Technical Lead**: [Phone/Slack]
- **DevOps Engineer**: [Phone/Slack]
- **Product Owner**: [Phone/Slack]

### Escalation Contacts
- **CTO**: [Phone]
- **CEO**: [Phone]
- **External Support**: Replit, Database provider

## Success Criteria
Rollback strategy is successful when:
- ✅ Rollback procedures documented and tested
- ✅ Automated rollback triggers configured
- ✅ Rollback time objectives consistently met
- ✅ Zero data loss during rollbacks
- ✅ Communication procedures established
- ✅ Team trained on rollback procedures
- ✅ Post-rollback analysis process defined