# SSL Certificate Configuration

## Overview
Replit Deployments automatically provisions and manages SSL certificates for deployed applications.

## Automatic SSL (Default)

### For Replit Domains (.replit.app)
- SSL certificates are automatically provisioned
- No configuration required
- Certificates auto-renew before expiration
- HTTPS is enforced by default

### Certificate Details
- **Provider**: Let's Encrypt via Replit
- **Validation**: Domain validation (DV)
- **Renewal**: Automatic (30 days before expiration)
- **Encryption**: TLS 1.2/1.3 with modern cipher suites

## Custom Domain SSL

### Prerequisites
1. Custom domain purchased and configured
2. Domain DNS pointing to Replit deployment
3. Domain verification completed

### Configuration Steps
1. **Add Custom Domain in Replit**
   - Navigate to Deployment settings
   - Add custom domain (e.g., smbtaxcredits.com)
   - Wait for domain verification

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: @ (or subdomain)
   Value: [provided by Replit]
   ```

3. **SSL Provisioning**
   - Automatic after domain verification
   - Usually takes 5-15 minutes
   - Certificate includes both www and non-www variants

### SSL Verification
Verify SSL is working correctly:

```bash
# Check certificate details
openssl s_client -connect smbtaxcredits.com:443 -servername smbtaxcredits.com

# Verify SSL grade
curl -I https://smbtaxcredits.com
```

## SSL Security Headers

Our application includes security headers for enhanced HTTPS security:

```javascript
// Implemented in server/middleware/security.ts
{
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      upgradeInsecureRequests: [], // Enforce HTTPS
    },
  },
}
```

## HTTPS Enforcement

### Application Level
- All HTTP requests automatically redirect to HTTPS
- Implemented via Helmet middleware
- Secure cookies enforced in production

### Browser Security
- HSTS header prevents HTTP fallback
- Content Security Policy upgrades insecure requests
- Secure cookie flags prevent transmission over HTTP

## Certificate Monitoring

### Automatic Monitoring
Replit handles:
- Certificate expiration monitoring
- Automatic renewal 30 days before expiration
- Notification of any certificate issues

### Manual Verification
Check certificate status periodically:

```bash
# Check expiration date
echo | openssl s_client -servername smbtaxcredits.com -connect smbtaxcredits.com:443 2>/dev/null | openssl x509 -noout -dates

# Verify certificate chain
curl -I https://smbtaxcredits.com
```

## Troubleshooting

### Common SSL Issues

1. **Certificate Not Provisioning**
   - Verify domain DNS is correct
   - Check domain ownership verification
   - Wait up to 24 hours for propagation

2. **Mixed Content Warnings**
   - Ensure all resources load over HTTPS
   - Update hardcoded HTTP URLs to HTTPS
   - Use protocol-relative URLs where appropriate

3. **Certificate Mismatch**
   - Verify custom domain configuration
   - Check DNS propagation
   - Contact Replit support if issues persist

### Security Best Practices

1. **HSTS Configuration**
   - Include subdomains in HSTS policy
   - Consider HSTS preload submission
   - Monitor for HSTS bypass attempts

2. **Certificate Transparency**
   - Monitor certificate transparency logs
   - Set up alerts for unauthorized certificates
   - Verify only expected certificates are issued

3. **Regular Security Audits**
   - Use SSL Labs test (ssllabs.com)
   - Monitor for protocol vulnerabilities
   - Update security headers as needed

## Emergency Procedures

### Certificate Revocation
If certificate compromise is suspected:
1. Contact Replit support immediately
2. Request certificate revocation
3. Monitor for unauthorized certificate usage
4. Update application secrets if needed

### Backup SSL Configuration
- Document current SSL configuration
- Keep backup of custom domain settings
- Maintain emergency contact procedures
- Test rollback procedures periodically

## Compliance Requirements

### Industry Standards
- PCI DSS compliance for payment processing
- SOC 2 Type II for data handling
- GDPR compliance for EU users

### Certificate Requirements
- Minimum 2048-bit RSA keys
- SHA-256 signature algorithm
- Modern TLS versions only (1.2+)
- Regular security updates

## Success Criteria
SSL configuration is successful when:
- ✅ HTTPS accessible for all domains
- ✅ SSL Labs grade A or higher
- ✅ No mixed content warnings
- ✅ HSTS headers properly configured
- ✅ Certificate auto-renewal working
- ✅ Security headers implemented