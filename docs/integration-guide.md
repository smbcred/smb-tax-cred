# SMBTaxCredits.com - External Integration Guide

## Overview
This guide covers the setup, configuration, and testing of all external service integrations for the R&D Tax Credit platform.

## Table of Contents
1. [Stripe Payment Integration](#stripe-payment-integration)
2. [Airtable Configuration](#airtable-configuration)
3. [Make.com Workflow Setup](#makecom-workflow-setup)
4. [Claude API Integration](#claude-api-integration)
5. [SendGrid Email Configuration](#sendgrid-email-configuration)
6. [AWS S3 Document Storage](#aws-s3-document-storage)

---

## Stripe Payment Integration

### Account Setup
1. Create Stripe account at [stripe.com](https://stripe.com)
2. Complete business verification
3. Enable tax reporting (for 1099s)

### API Keys
```bash
# Test Mode (Development)
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Live Mode (Production)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### Product & Pricing Setup
```javascript
// Create products via Stripe Dashboard or API
const products = [
  {
    name: 'R&D Tax Credit Documentation - Tier 1',
    description: 'Federal credit $0-$4,999',
    price: 50000, // $500 in cents
    metadata: {
      tier: '1',
      creditRange: '0-4999'
    }
  },
  // ... other tiers
];
```

### Checkout Implementation
```typescript
// Frontend: Create checkout session
const createCheckoutSession = async (tier: number, calculationId: string) => {
  const response = await api.post('/api/payments/create-checkout', {
    tier,
    calculationId,
    successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/checkout`
  });
  
  // Redirect to Stripe
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
};

// Backend: Create session endpoint
app.post('/api/payments/create-checkout', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `R&D Tax Credit Documentation - Tier ${req.body.tier}`,
          description: 'IRS-compliant documentation package'
        },
        unit_amount: getTierPrice(req.body.tier)
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: req.body.successUrl,
    cancel_url: req.body.cancelUrl,
    metadata: {
      calculationId: req.body.calculationId,
      tier: req.body.tier
    }
  });
  
  res.json({ sessionId: session.id });
});
```

### Webhook Configuration

1. **Add webhook endpoint in Stripe Dashboard**
   - URL: `https://api.smbtaxcredits.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

2. **Webhook handler implementation**
```typescript
app.post('/api/webhooks/stripe', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutComplete(event.data.object);
          break;
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentFailure(event.data.object);
          break;
      }
      
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);
```

### Testing Stripe Integration
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed

# Test card numbers
4242 4242 4242 4242  # Success
4000 0000 0000 0002  # Decline
```

---

## Airtable Configuration

### Base Setup
1. Create new base: "R&D Tax Credits"
2. Create tables:
   - **Leads**: Contact information from calculator
   - **Customers**: Paid users
   - **Intake Forms**: Form submission data
   - **Documents**: Generated document tracking

### Table Schemas

#### Leads Table
| Field | Type | Description |
|-------|------|-------------|
| Email | Email | Primary key |
| Company Name | Text | Company name |
| Phone | Phone | Optional |
| Federal Credit | Currency | Calculated amount |
| Tier | Number | Pricing tier |
| Created | Date | Auto timestamp |
| Status | Single Select | New/Contacted/Converted |

#### Customers Table
| Field | Type | Description |
|-------|------|-------------|
| Email | Email | Primary key |
| Stripe Customer ID | Text | From Stripe |
| Company Info | Link to Companies | Relationship |
| Subscription Status | Single Select | Active/Inactive |
| Documents | Link to Documents | Relationship |

### API Integration
```typescript
// Initialize Airtable
import Airtable from 'airtable';

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID);

// Create lead record
export const createLead = async (leadData: LeadData) => {
  try {
    const record = await base('Leads').create({
      'Email': leadData.email,
      'Company Name': leadData.companyName,
      'Phone': leadData.phone,
      'Federal Credit': leadData.federalCredit,
      'Tier': leadData.tier,
      'Business Type': leadData.businessType,
      'Status': 'New'
    });
    
    return record.getId();
  } catch (error) {
    console.error('Airtable error:', error);
    throw new Error('Failed to create lead');
  }
};

// Update record status
export const updateLeadStatus = async (email: string, status: string) => {
  const records = await base('Leads').select({
    filterByFormula: `{Email} = '${email}'`
  }).firstPage();
  
  if (records.length > 0) {
    await base('Leads').update(records[0].getId(), {
      'Status': status
    });
  }
};
```

### Automation Setup
1. **New Lead Alert**
   - Trigger: When record created in Leads
   - Action: Send Slack notification
   - Action: Add to email campaign

2. **Conversion Tracking**
   - Trigger: When Status changes to "Converted"
   - Action: Update metrics
   - Action: Create Customer record

---

## Make.com Workflow Setup

### Account Configuration
1. Create Make.com account
2. Create new scenario: "R&D Document Generation"

### Webhook Trigger Setup
```javascript
// Create webhook in Make.com
// Copy webhook URL: https://hook.make.com/xyz123...

// Backend trigger
export const triggerDocumentGeneration = async (intakeFormId: string) => {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  
  const payload = {
    intakeFormId,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  };
  
  const response = await axios.post(webhookUrl, payload, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.MAKE_API_KEY
    }
  });
  
  return response.data;
};
```

### Make.com Workflow Design
```
1. Webhook Trigger
   ↓
2. Get Intake Data (HTTP Request to your API)
   ↓
3. Format Data for Claude (JavaScript module)
   ↓
4. Generate Narrative (Claude API)
   ↓
5. Create Form 6765 (Documint)
   ↓
6. Upload to S3 (AWS S3)
   ↓
7. Update Database (HTTP Request)
   ↓
8. Send Email Notification (SendGrid)
```

### Error Handling in Make.com
```javascript
// Add error handler route
// Set retry attempts: 3
// Retry interval: 5 minutes

// Error notification webhook
if (error) {
  await notifySlack({
    channel: '#alerts',
    message: `Document generation failed: ${error.message}`,
    intakeFormId: data.intakeFormId
  });
}
```

---

## Claude API Integration

### API Setup
```typescript
// Claude client initialization
import Anthropic from '@anthropic-ai/sdk';

const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
```

### Narrative Generation
```typescript
export const generateTechnicalNarrative = async (projectData: ProjectData) => {
  const prompt = `
You are a tax professional preparing IRS Form 6765 documentation.
Generate a technical narrative for the following R&D project:

Company: ${projectData.companyName}
Project: ${projectData.projectName}
Period: ${projectData.startDate} to ${projectData.endDate}

Activities:
${projectData.activities.map(a => `- ${a.description}`).join('\n')}

Technical Challenges:
${projectData.challenges}

Experimentation Process:
${projectData.process}

Results:
${projectData.results}

Please write a 2-3 page technical narrative that:
1. Describes the technological nature of the work
2. Explains the technical uncertainties faced
3. Details the systematic experimentation process
4. Summarizes the results and learnings
5. Uses appropriate technical language for IRS review

Format the narrative with clear sections and professional language.
`;

  try {
    const response = await claude.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to generate narrative');
  }
};
```

### Rate Limiting
```typescript
// Implement rate limiting
import { RateLimiter } from 'limiter';

const claudeLimiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 'minute'
});

export const generateWithRateLimit = async (data: any) => {
  await claudeLimiter.removeTokens(1);
  return generateTechnicalNarrative(data);
};
```

---

## SendGrid Email Configuration

### Account Setup
1. Create SendGrid account
2. Verify sender domain
3. Set up SPF and DKIM records

### Template Creation
Create dynamic templates in SendGrid:

1. **Welcome Email** (d-welcometemplate123)
```html
<h1>Welcome to SMBTaxCredits.com!</h1>
<p>Hi {{firstName}},</p>
<p>Your account has been created. You can now access your dashboard to complete your R&D tax credit documentation.</p>
<a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
```

2. **Payment Confirmation** (d-paymenttemplate456)
```html
<h1>Payment Confirmed</h1>
<p>Thank you for your payment of ${{amount}}.</p>
<p>Your R&D tax credit documentation will be ready within 48 hours.</p>
```

3. **Documents Ready** (d-documentstemplate789)
```html
<h1>Your R&D Tax Credit Documents Are Ready!</h1>
<p>Your documentation package is complete and ready for download.</p>
<a href="{{downloadUrl}}" class="button">Download Documents</a>
<p>This link will expire in 7 days.</p>
```

### Email Service Implementation
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (
  to: string,
  templateId: string,
  dynamicData: any
) => {
  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'SMBTaxCredits.com'
    },
    templateId,
    dynamicTemplateData: dynamicData,
  };
  
  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('SendGrid error:', error);
    throw new Error('Failed to send email');
  }
};

// Usage examples
await sendEmail(
  user.email,
  process.env.SENDGRID_WELCOME_TEMPLATE_ID,
  {
    firstName: user.firstName,
    dashboardUrl: `${process.env.APP_URL}/dashboard`
  }
);
```

---

## AWS S3 Document Storage

### S3 Bucket Configuration
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::smbtaxcredits-documents/*",
      "Condition": {
        "StringLike": {
          "s3:ExistingObjectTag/public": "yes"
        }
      }
    }
  ]
}
```

### CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://smbtaxcredits.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### S3 Service Implementation
```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload document
export const uploadDocument = async (
  key: string,
  buffer: Buffer,
  contentType: string
) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
    Tagging: 'environment=production&type=tax-document'
  });
  
  await s3Client.send(command);
  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
};

// Generate presigned URL
export const getDownloadUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });
  
  // URL expires in 7 days
  const url = await getSignedUrl(s3Client, command, { 
    expiresIn: 604800 
  });
  
  return url;
};

// Document organization
const getDocumentKey = (userId: string, documentType: string): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `users/${userId}/documents/${timestamp}/${documentType}.pdf`;
};
```

### Lifecycle Rules
Set up lifecycle rules in S3:
- Transition to Glacier after 90 days
- Delete after 7 years (IRS requirement)

---

## Integration Testing Checklist

### Stripe
- [ ] Test mode checkout flow works
- [ ] Webhook receives events
- [ ] Payment confirmation emails sent
- [ ] User account created after payment

### Airtable
- [ ] Leads created from calculator
- [ ] Status updates work
- [ ] Automations trigger correctly
- [ ] API rate limits handled

### Make.com
- [ ] Webhook triggers workflow
- [ ] All modules execute successfully
- [ ] Error handling works
- [ ] Retry logic functions

### Claude API
- [ ] Narrative generation works
- [ ] Rate limiting enforced
- [ ] Error handling graceful
- [ ] Output quality acceptable

### SendGrid
- [ ] All templates render correctly
- [ ] Dynamic data populates
- [ ] Emails deliver to inbox
- [ ] Unsubscribe links work

### AWS S3
- [ ] Documents upload successfully
- [ ] Presigned URLs work
- [ ] CORS allows downloads
- [ ] Encryption enabled

## Monitoring & Alerts

Set up monitoring for each integration:
```javascript
// Health check endpoint
app.get('/api/health/integrations', async (req, res) => {
  const status = {
    stripe: await checkStripe(),
    airtable: await checkAirtable(),
    make: await checkMake(),
    claude: await checkClaude(),
    sendgrid: await checkSendGrid(),
    s3: await checkS3(),
  };
  
  const allHealthy = Object.values(status).every(s => s.healthy);
  
  res.status(allHealthy ? 200 : 503).json(status);
});
```