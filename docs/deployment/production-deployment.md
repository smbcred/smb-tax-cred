# Production Deployment Guide

## Overview
This guide covers deploying SMBTaxCredits.com to production using Replit Deployments.

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] All required environment variables set in Replit Secrets
- [ ] Database connection string configured (DATABASE_URL)
- [ ] Third-party API keys configured (Stripe, Claude, etc.)
- [ ] Email service configured (SendGrid)
- [ ] Cloud storage configured (AWS S3)

### 2. Code Preparation
- [ ] All tests passing (`npm run build`)
- [ ] No console.log statements in production code
- [ ] Error handling implemented for all API endpoints
- [ ] Rate limiting configured for public endpoints
- [ ] CORS properly configured for production domains

### 3. Security Configuration
- [ ] JWT_SECRET configured with strong random string
- [ ] ENCRYPTION_KEY set for data protection
- [ ] Database credentials secured
- [ ] No hardcoded secrets in code

## Replit Deployment Process

### Step 1: Build Verification
```bash
# Verify build works correctly
npm run build

# Check for TypeScript errors
npm run typecheck || echo "No typecheck script"

# Verify tests pass
npm test || echo "Tests not configured"
```

### Step 2: Environment Setup
Configure these secrets in Replit Secrets tab:

**Required Secrets:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random string for JWT signing
- `ENCRYPTION_KEY` - 32-byte hex string for data encryption

**Optional API Integrations:**
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key  
- `CLAUDE_API_KEY` - Anthropic Claude API key
- `DOCUMINT_API_KEY` - Documint PDF generation API key
- `SENDGRID_API_KEY` - SendGrid email API key
- `AIRTABLE_API_KEY` - Airtable integration key
- `AIRTABLE_BASE_ID` - Airtable base identifier
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AWS_S3_BUCKET` - S3 bucket name
- `MAKE_WEBHOOK_URL` - Make.com webhook URL
- `GOOGLE_ANALYTICS_ID` - Google Analytics tracking ID

### Step 3: Domain Configuration
1. Purchase custom domain (recommended: smbtaxcredits.com)
2. In Replit Deployments, configure custom domain
3. Update CORS settings for production domain
4. Verify SSL certificate automatic provisioning

### Step 4: Deploy to Production
1. Click "Deploy" in Replit interface
2. Select "Autoscale" deployment type for production workloads
3. Configure custom domain if purchased
4. Monitor deployment logs for any errors
5. Verify application loads correctly at production URL

## Post-Deployment Verification

### Health Checks
- [ ] Application loads successfully
- [ ] Database connections working
- [ ] API endpoints responding correctly
- [ ] Authentication flow working
- [ ] Payment processing functional (test mode)
- [ ] Email notifications sending
- [ ] Error monitoring active

### Performance Verification
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] Static assets served efficiently
- [ ] Mobile performance acceptable

### Security Verification
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] No sensitive data exposed in client
- [ ] Error messages don't leak internal info

## Monitoring and Maintenance

### Application Monitoring
Monitor these metrics in production:
- Response times and error rates
- Database performance and connection pool usage
- Memory and CPU utilization
- User session activity
- Payment processing success rates

### Regular Maintenance Tasks
- **Daily**: Monitor error logs and performance metrics
- **Weekly**: Review security logs and user feedback
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Performance optimization review

## Troubleshooting

### Common Issues
1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check database server availability
   - Verify connection pool settings

2. **API Integration Failures**
   - Confirm all API keys are valid
   - Check API rate limits and quotas
   - Verify network connectivity

3. **Performance Issues**
   - Review database query performance
   - Check for memory leaks
   - Optimize bundle sizes
   - Enable caching where appropriate

### Emergency Contacts
- Replit Support: support@replit.com
- Database Provider: [Contact based on provider]
- Domain Registrar: [Contact based on registrar]

## Success Criteria
Deployment is successful when:
- ✅ Application accessible via production URL
- ✅ All core functionality working
- ✅ Performance metrics within acceptable ranges
- ✅ Security measures properly configured
- ✅ Monitoring and alerting active
- ✅ Backup procedures tested