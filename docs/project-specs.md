# SMBTaxCredits.com - Technical Project Specifications

## Overview
SMBTaxCredits.com is a self-serve SaaS platform that helps small businesses document their AI experimentation work to claim federal R&D tax credits worth 10-16% of project costs. The platform automates the complex documentation process, converting test-and-learn activities into IRS-compliant filing packages.

## System Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript  
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Authentication**: JWT with bcrypt
- **Integrations**: Stripe, Airtable, Make.com, Claude API, Documint, AWS S3, SendGrid

### File Structure
```
/smbtaxcredits-platform
├── /frontend
│   ├── /src
│   │   ├── /components    # Reusable UI components
│   │   ├── /pages        # Route-level components
│   │   ├── /services     # API integration layer
│   │   ├── /utils        # Helper functions
│   │   └── /types        # TypeScript definitions
│   └── /public           # Static assets
├── /backend
│   ├── /src
│   │   ├── /routes       # API endpoints
│   │   ├── /controllers  # Request handlers
│   │   ├── /services     # Business logic
│   │   ├── /database     # Schemas & migrations
│   │   └── /middleware   # Auth, validation, etc.
│   └── /integrations     # External service adapters
└── /shared              # Shared types & utilities
```

## Database Schema

### Core Tables
```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies Table  
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  ein VARCHAR(20),
  entity_type VARCHAR(50),
  naics_code VARCHAR(10),
  year_founded INTEGER,
  airtable_record_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Calculations Table
CREATE TABLE calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  business_type VARCHAR(50),
  qualifying_activities TEXT[],
  federal_credit DECIMAL(12,2),
  pricing_tier INTEGER,
  calculation_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Intake Forms Table
CREATE TABLE intake_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  status VARCHAR(50) DEFAULT 'in_progress',
  form_sections JSONB,
  completed_at TIMESTAMP,
  airtable_sync_status VARCHAR(50),
  make_webhook_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intake_form_id UUID REFERENCES intake_forms(id),
  document_type VARCHAR(50),
  s3_key TEXT,
  s3_url TEXT,
  file_size_bytes BIGINT,
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions Table (Stripe)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  amount_cents INTEGER,
  status VARCHAR(50),
  tier INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Key Components

### 1. Interactive Calculator
- 4-step flow: Business Type → Activities → Expenses → Results
- Real-time federal credit calculation (10-14% of QREs)
- Dynamic pricing tiers based on credit amount
- Lead capture modal at peak interest
- Mobile-responsive design

### 2. User Dashboard
- Progress tracking for intake forms
- Document status monitoring
- Download center for completed documents
- Account management

### 3. Smart Intake Forms
- Multi-section form with auto-save
- Progress persistence across sessions
- Validation with helpful error messages
- AI-specific project templates
- Dynamic field visibility based on answers

### 4. Document Generation Pipeline
1. User completes intake form
2. Data syncs to Airtable via API
3. Make.com webhook triggers generation
4. Claude API generates narratives
5. Documint creates PDFs
6. Files stored in AWS S3
7. SendGrid sends delivery email

## Security & Performance

### Security Measures
- JWT tokens with 24-hour expiration
- bcrypt password hashing (10 salt rounds)
- Input sanitization on all forms
- Rate limiting: 100 requests/15 minutes
- HTTPS everywhere
- Environment variables for secrets

### Performance Optimization
- Code splitting for faster initial load
- Lazy loading for dashboard sections
- Database indexes on frequently queried fields
- CDN for static assets
- Caching strategy for calculator results
- Connection pooling for database

## Development Standards

### Code Quality
- TypeScript strict mode enabled
- ESLint + Prettier for consistency
- Comprehensive JSDoc comments
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical flows

### Git Workflow
- Feature branches from `main`
- PR reviews required
- Semantic commit messages
- Automated tests on push

## Deployment

### Environment Variables
```bash
# Application
NODE_ENV=production
APP_URL=https://smbtaxcredits.com
API_URL=https://api.smbtaxcredits.com

# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=...

# External Services
STRIPE_SECRET_KEY=...
AIRTABLE_API_KEY=...
CLAUDE_API_KEY=...
SENDGRID_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### Monitoring
- Application logs with Winston
- Error tracking with Sentry
- Performance monitoring
- Uptime monitoring
- Weekly backup schedule

## Future Enhancements
- Multi-year credit support
- State credit calculations
- White-label partner portal
- Advanced analytics dashboard
- API for third-party integrations