# Domain Setup Guide

## Overview
Configure custom domain for SMBTaxCredits.com production deployment.

## Recommended Domain Structure

### Primary Domain
- **Production**: `smbtaxcredits.com`
- **Staging**: `staging.smbtaxcredits.com`
- **Development**: Use Replit default (.replit.app)

### Subdomain Strategy
- `www.smbtaxcredits.com` → Redirect to apex domain
- `api.smbtaxcredits.com` → API endpoints (optional)
- `docs.smbtaxcredits.com` → Documentation (optional)
- `status.smbtaxcredits.com` → Status page (optional)

## Domain Registration

### Recommended Registrars
1. **Namecheap** - Good pricing, reliable
2. **Google Domains** - Simple interface, good integration
3. **Cloudflare** - Security features, analytics
4. **GoDaddy** - Well-known, extensive support

### Domain Selection Criteria
- `.com` extension preferred for credibility
- Short, memorable, and brandable
- Avoid hyphens or numbers
- Check trademark conflicts

## DNS Configuration

### Basic DNS Records
```
# Primary domain
Type: A
Name: @
Value: [Replit IP - provided in deployment settings]

# WWW subdomain
Type: CNAME
Name: www
Value: smbtaxcredits.com

# Email (if using custom email)
Type: MX
Name: @
Value: [Email provider MX records]
```

### Replit-Specific Configuration
```
# For Replit Deployments
Type: CNAME
Name: @
Value: [provided by Replit after domain verification]

# Alternative: Use A records if CNAME not supported for apex
Type: A
Name: @
Value: [Replit IP addresses]
```

## Replit Domain Configuration

### Step 1: Add Domain in Replit
1. Open your Repl deployment settings
2. Navigate to "Custom Domains"
3. Click "Add Domain"
4. Enter `smbtaxcredits.com`
5. Follow verification instructions

### Step 2: DNS Verification
Replit will provide verification instructions:
- **Method 1**: CNAME record verification
- **Method 2**: DNS TXT record verification
- **Method 3**: File upload verification

### Step 3: SSL Certificate
- Automatic after domain verification
- Usually provisions within 15 minutes
- Includes both apex and www variants

## Domain Verification Process

### DNS Propagation Check
```bash
# Check if DNS has propagated
dig smbtaxcredits.com
nslookup smbtaxcredits.com

# Check from multiple locations
# Use online tools like whatsmydns.net
```

### Verification Timeline
- **DNS Changes**: 5 minutes to 48 hours
- **SSL Certificate**: 5-15 minutes after verification
- **Full Propagation**: Up to 72 hours globally

## Production Domain Checklist

### Pre-Launch
- [ ] Domain registered and DNS configured
- [ ] Replit domain verification completed
- [ ] SSL certificate provisioned
- [ ] WWW redirect configured
- [ ] Email records configured (if applicable)

### Launch Day
- [ ] DNS propagation verified globally
- [ ] Application accessible via custom domain
- [ ] SSL working correctly (no warnings)
- [ ] Redirects functioning properly
- [ ] Analytics tracking updated for new domain

### Post-Launch
- [ ] Monitor DNS resolution
- [ ] Check SSL certificate status
- [ ] Verify email delivery (if using custom domain)
- [ ] Update any hardcoded domain references

## Email Configuration (Optional)

### Email Hosting Options
1. **Google Workspace** - Professional, reliable
2. **Microsoft 365** - Enterprise features
3. **ProtonMail** - Privacy-focused
4. **Zoho Mail** - Cost-effective

### Basic Email DNS Records
```
# Google Workspace example
Type: MX
Priority: 1
Value: ASPMX.L.GOOGLE.COM.

Type: MX  
Priority: 5
Value: ALT1.ASPMX.L.GOOGLE.COM.

# SPF Record
Type: TXT
Name: @
Value: "v=spf1 include:_spf.google.com ~all"

# DKIM (provided by email host)
Type: TXT
Name: [selector]._domainkey
Value: [DKIM key from email provider]
```

## SEO and Marketing Setup

### Google Search Console
1. Add property for smbtaxcredits.com
2. Verify domain ownership
3. Submit sitemap.xml
4. Monitor search performance

### Analytics Configuration
Update tracking codes for production domain:
- Google Analytics
- Facebook Pixel
- Other marketing tools

### Social Media Updates
Update social media profiles with new domain:
- LinkedIn company page
- Twitter/X profile
- Facebook business page
- Any other social platforms

## Domain Security

### Security Headers
Ensure these headers are configured:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

### Domain Monitoring
Set up monitoring for:
- Domain expiration alerts
- DNS changes
- SSL certificate expiration
- Unauthorized subdomains

## Backup Domain Strategy

### Domain Protection
- Register common variations (.net, .org)
- Protect against typosquatting
- Consider international domains if serving global audience

### Emergency Procedures
- Keep backup domain ready (e.g., smbtaxcredits.net)
- Document DNS configuration
- Maintain access to domain registrar
- Have alternative hosting options

## Performance Optimization

### CDN Configuration
Consider CDN for better performance:
- Cloudflare (free tier available)
- AWS CloudFront
- Google Cloud CDN

### DNS Performance
- Use fast DNS providers
- Configure appropriate TTL values
- Monitor DNS response times

## Troubleshooting

### Common Issues
1. **DNS Not Propagating**
   - Check TTL values
   - Verify record syntax
   - Wait for full propagation (up to 72 hours)

2. **SSL Certificate Issues**
   - Verify domain ownership
   - Check DNS configuration
   - Contact Replit support if needed

3. **Email Not Working**
   - Verify MX records
   - Check SPF/DKIM configuration
   - Test email delivery

### Diagnostic Tools
- **DNS**: dig, nslookup, whatsmydns.net
- **SSL**: SSL Labs, ssllabs.com/ssltest
- **Email**: MXToolbox, mail-tester.com

## Success Criteria
Domain setup is successful when:
- ✅ Custom domain accessible via HTTPS
- ✅ WWW redirect working correctly
- ✅ SSL certificate valid and trusted
- ✅ DNS propagated globally
- ✅ Email configuration working (if applicable)
- ✅ Analytics tracking updated
- ✅ Search console configured