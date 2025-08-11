# Backup and Recovery Procedures

## Overview
Comprehensive backup strategy for SMBTaxCredits.com production environment.

## Backup Strategy

### 1. Database Backups

#### Automated Database Backups
Our PostgreSQL database (Neon) includes automatic backups:
- **Point-in-time recovery**: 7 days retention
- **Daily snapshots**: 30 days retention  
- **Weekly snapshots**: 12 weeks retention
- **Monthly snapshots**: 12 months retention

#### Manual Database Backup
```bash
# Create manual database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Schema-only backup
pg_dump --schema-only $DATABASE_URL > schema_backup_$(date +%Y%m%d).sql
```

#### Database Backup Verification
```bash
# Test restore on development database
createdb test_restore
psql test_restore < backup_20240811_120000.sql

# Verify data integrity
psql test_restore -c "SELECT COUNT(*) FROM users;"
psql test_restore -c "SELECT COUNT(*) FROM companies;"
```

### 2. Application Code Backups

#### Git Repository Backup
- **Primary**: GitHub repository
- **Mirror**: GitLab (automatic sync)
- **Local**: Developer machines with full history

#### Environment Configuration Backup
```bash
# Export environment variables (without secrets)
env | grep -E '^(NODE_ENV|PORT|DATABASE_URL)' > env_backup.txt

# Backup Replit configuration
cp .replit replit_config_backup
cp replit.nix nix_config_backup
```

### 3. File Storage Backups

#### AWS S3 Backup Strategy
- **Cross-region replication**: Enabled
- **Versioning**: Enabled for document storage
- **Lifecycle policies**: Archive old files to Glacier
- **Daily sync**: To backup bucket

#### Local File Backup (if applicable)
```bash
# Backup uploaded files
tar -czf files_backup_$(date +%Y%m%d).tar.gz uploads/

# Sync to cloud storage
aws s3 sync uploads/ s3://backup-bucket/files/
```

### 4. Configuration Backups

#### Application Configuration
- Backup all configuration files
- Document environment variable requirements
- Maintain deployment scripts

#### Third-party Integration Settings
- Stripe webhook configurations
- SendGrid templates
- Airtable base structure
- API key documentation (not the keys themselves)

## Recovery Procedures

### 1. Database Recovery

#### Point-in-Time Recovery
```bash
# Restore to specific timestamp (Neon console)
# 1. Access Neon dashboard
# 2. Select "Restore" from backup section
# 3. Choose point-in-time
# 4. Create new branch for recovery

# Alternative: Manual restore
psql $DATABASE_URL < backup_20240811_120000.sql
```

#### Partial Data Recovery
```bash
# Restore specific table
pg_restore -t users backup_file.sql

# Restore specific schema
pg_restore -n public backup_file.sql
```

### 2. Application Recovery

#### Full Application Restore
1. **Code Recovery**
   ```bash
   git clone https://github.com/username/smbtaxcredits.git
   cd smbtaxcredits
   git checkout production
   ```

2. **Environment Setup**
   ```bash
   # Restore environment variables in Replit Secrets
   # Copy from backup documentation
   ```

3. **Database Connection**
   ```bash
   # Verify database connectivity
   npm run db:migrate
   npm run db:seed # if needed
   ```

4. **Deployment**
   ```bash
   npm run build
   # Deploy via Replit interface
   ```

### 3. File Recovery

#### S3 File Recovery
```bash
# Restore from S3 backup
aws s3 sync s3://backup-bucket/files/ uploads/

# Restore specific file version
aws s3api get-object --bucket backup-bucket --key file.pdf --version-id ABC123 file.pdf
```

## Backup Monitoring

### 1. Automated Monitoring

#### Database Backup Monitoring
```javascript
// Monitor backup status (server/services/backupMonitor.js)
const checkBackupStatus = async () => {
  const lastBackup = await getLastBackupTime();
  const timeSinceBackup = Date.now() - lastBackup;
  
  if (timeSinceBackup > 24 * 60 * 60 * 1000) { // 24 hours
    await sendBackupAlert('Database backup overdue');
  }
};
```

#### File Backup Monitoring
```bash
# Check S3 backup status
aws s3api head-object --bucket backup-bucket --key latest_backup.marker
```

### 2. Backup Verification

#### Weekly Backup Tests
```bash
#!/bin/bash
# weekly_backup_test.sh

# Test database backup
createdb backup_test
pg_restore backup_test < latest_backup.sql
if [ $? -eq 0 ]; then
  echo "Database backup verified successfully"
else
  echo "Database backup verification failed"
fi

# Clean up
dropdb backup_test
```

#### Monthly Recovery Drills
1. **Simulate data loss scenario**
2. **Execute recovery procedures**
3. **Verify application functionality**
4. **Document recovery time**
5. **Update procedures based on findings**

## Backup Security

### 1. Encryption
- All backups encrypted at rest
- Encryption keys managed separately
- Regular key rotation schedule

### 2. Access Control
- Backup access limited to authorized personnel
- Multi-factor authentication required
- Audit logs for backup access

### 3. Secure Transfer
```bash
# Encrypted backup transfer
gpg --cipher-algo AES256 --compress-algo 1 --symmetric backup.sql
scp backup.sql.gpg user@backup-server:/secure/location/
```

## Recovery Time Objectives (RTO)

### Service Level Targets
- **Database recovery**: < 1 hour
- **Application recovery**: < 30 minutes  
- **File recovery**: < 2 hours
- **Full system recovery**: < 4 hours

### Priority Levels
1. **Critical**: Authentication, payment processing
2. **High**: Calculator, lead capture
3. **Medium**: Dashboard, reporting
4. **Low**: Analytics, documentation

## Disaster Recovery Plan

### 1. Communication Plan
- **Emergency contacts**: Development team, stakeholders
- **Notification channels**: Slack, email, SMS
- **Status page**: Communicate with users

### 2. Recovery Sequence
1. **Assess damage**: Determine scope of data loss
2. **Activate recovery team**: Notify key personnel
3. **Begin recovery**: Execute appropriate procedures
4. **Verify functionality**: Test critical features
5. **Communication**: Update stakeholders and users
6. **Post-incident review**: Document lessons learned

### 3. Alternative Infrastructure
- **Backup hosting**: Secondary hosting provider ready
- **Database alternatives**: Read replicas in different regions
- **DNS failover**: Automated failover to backup systems

## Backup Retention Policy

### Database Backups
- **Daily**: 30 days retention
- **Weekly**: 12 weeks retention
- **Monthly**: 12 months retention
- **Yearly**: 7 years retention (compliance)

### File Backups
- **Current versions**: 90 days
- **Historical versions**: 365 days
- **Archive**: Long-term storage in Glacier

### Log Backups
- **Application logs**: 90 days
- **Access logs**: 365 days
- **Audit logs**: 7 years (compliance)

## Compliance Requirements

### Data Protection
- GDPR compliance for EU user data
- PCI DSS for payment information
- SOX compliance for financial records

### Audit Requirements
- Regular backup verification
- Access logging and monitoring
- Incident response documentation

## Emergency Contacts

### Technical Team
- **Lead Developer**: [Contact info]
- **DevOps Engineer**: [Contact info]
- **Database Administrator**: [Contact info]

### Service Providers
- **Neon Database Support**: support@neon.tech
- **Replit Support**: support@replit.com
- **AWS Support**: [Account-specific]

## Success Criteria
Backup procedures are successful when:
- ✅ Automated backups running daily
- ✅ Recovery procedures tested monthly
- ✅ RTO targets consistently met
- ✅ Backup verification automated
- ✅ Security measures implemented
- ✅ Compliance requirements met
- ✅ Documentation kept current