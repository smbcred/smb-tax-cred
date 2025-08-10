# R&D Tax Credit SAAS - Complete Replit Development Guide (Exhaustive Version)

## Overview
This guide provides an exhaustive, step-by-step roadmap for building the entire R&D Tax Credit SAAS platform (SMBTaxCredits.com) using Replit. Each task references the docs folder structure and accounts for work completed through Task 1.4.1. The platform helps small businesses that experiment with AI tools (ChatGPT, Claude, custom GPTs, automations) claim federal R&D tax credits through a simple, self-serve platform with flat-fee pricing.

## Replit Project Context
Your Replit project has a `/docs` folder containing:
- `project-specs.md` - System architecture, database schema, key components
- `api-documentation.md` - All API endpoints with request/response examples
- `business-rules.md` - R&D qualification rules, pricing tiers, user flow
- `ai-examples.md` - 50+ examples of qualifying AI experimentation
- `design-system.md` - Complete UI/UX guidelines and component library
- `development-guide.md` - Environment setup, workflow, testing, deployment
- `code-standards.md` - TypeScript/React conventions, Git workflow
- `deployment-checklist.md` - Pre-launch checklist, rollback procedures
- `integration-guide.md` - Stripe, Airtable, Make.com, Claude, SendGrid, S3 setup
- `database-guide.md` - PostgreSQL schema, migrations, optimization
- `monitoring-guide.md` - Sentry, analytics, alerts, incident response
- `credit-calculation-guide.md` - IRS rules, calculation methods, validation
- `legal-compliance-guide.md` - Required disclaimers, prohibited claims
- `marketing-copywriting-playbook.md` - Brand voice, messaging, templates

## Core Platform Mission
Turn everyday AI experiments into tax savings for SMBs. If businesses tested, measured, and improved their AI workflows, they may qualify for federal credits worth 10-16% of project costs.

## Technical Stack
- **Frontend**: React 18+ with TypeScript, Tailwind CSS (located in `/client`)
- **Backend**: Node.js with Express (located in `/server`)
- **Database**: PostgreSQL with Drizzle ORM (Neon hosted)
- **External Services**: Stripe, Airtable, Make.com, Claude API, Documint, AWS S3, SendGrid
- **Development**: Replit environment with hot reload

## Work Completed Status
✅ Completed through Task 1.4.1 (Lead Capture Modal)
🔄 Next task: 1.4.2 (Implement Lead Storage Backend)

---

# Phase 1: Foundation & MVP

## Section 1.1: Project Setup & Infrastructure

### Task 1.1.1: Initialize Replit Project ✅ COMPLETED
**Status**: Review and enhance if needed
**Review Checklist**:
- Check `/client` and `/server` folder structure matches `docs/project-specs.md`
- Verify TypeScript configuration in both folders
- Ensure `.env.example` includes all variables from `docs/integration-guide.md`
- Confirm Tailwind CSS setup matches `docs/design-system.md`
- Validate PostgreSQL connection string format

**Enhancement Instructions**:
```
Review the existing project setup against docs/project-specs.md:
1. Verify folder structure matches the specification
2. Check that all base dependencies are installed
3. Ensure environment variables are properly configured
4. Add any missing TypeScript path mappings
5. Confirm Tailwind includes custom design tokens
```

### Task 1.1.2: Configure Development Environment ✅ COMPLETED
**Status**: Review and enhance if needed
**Review Against**: `docs/development-guide.md` and `docs/code-standards.md`

**Enhancement Checklist**:
- Verify ESLint rules match code standards
- Check Prettier configuration for consistency
- Ensure all security packages are installed (helmet, express-rate-limit)
- Confirm Winston logging is configured
- Validate testing setup (Vitest, React Testing Library)

### Task 1.1.3: Database Schema Creation ✅ COMPLETED
**Status**: Review and enhance if needed
**Review Against**: `docs/database-guide.md` and `docs/project-specs.md#database-schema`

**Review Instructions**:
```
Compare existing schema with docs/database-guide.md:
1. Verify all tables exist with correct columns
2. Check foreign key relationships
3. Confirm indexes on frequently queried fields
4. Validate enum types for data integrity
5. Ensure triggers for updated_at timestamps
6. Add any missing fields for AI experimentation tracking
```

## Section 1.2: Marketing Landing Page

### Task 1.2.1: Create Landing Page Layout ✅ COMPLETED
**Status**: Review against AI-forward messaging
**Review Against**: `docs/marketing-copywriting-playbook.md` and `docs/design-system.md`

**Enhancement Focus**:
- Ensure hero headline emphasizes AI experiments: "Your AI Experiments = R&D Tax Credits"
- Verify trust signals include IRS compliance badges
- Check that benefits grid includes AI-specific examples
- Confirm mobile-first responsive design

### Task 1.2.2: Implement Responsive Design ✅ COMPLETED
**Status**: Review mobile experience
**Review Against**: `docs/design-system.md#responsive-breakpoints`

**Mobile Optimization Checklist**:
- Test all breakpoints (640px, 768px, 1024px, 1280px)
- Verify touch targets are minimum 44px
- Check hamburger menu functionality
- Test on Replit mobile preview

### Task 1.2.3: Add Marketing Copy & Content ✅ COMPLETED
**Status**: Review for AI-forward messaging and compliance
**Review Against**: `docs/marketing-copywriting-playbook.md` and `docs/legal-compliance-guide.md`

**Content Audit**:
```
Review all copy against docs/ai-examples.md:
1. Verify 60/25/15 outcome-process-tech ratio
2. Check AI mention budget (≤2 per 150-200 words)
3. Ensure Grade 7-9 reading level
4. Confirm required disclaimers are present
5. Add industry-specific AI examples
```

## Section 1.3: Interactive Calculator

### Task 1.3.1: Build Calculator UI Component ✅ COMPLETED
**Status**: Review for AI activity options
**Review Against**: `docs/business-rules.md#qualifying-activities` and `docs/ai-examples.md`

**AI Activity Enhancement**:
- Ensure Step 2 includes: "Built custom GPTs", "Prompt engineering", "Chatbot development", "Automation workflows"
- Verify visual grid layout for business types
- Check progress indicator functionality

### Task 1.3.2: Implement Calculator Logic Engine ✅ COMPLETED
**Status**: Review calculation accuracy
**Review Against**: `docs/credit-calculation-guide.md` and `docs/business-rules.md#calculation-rules`

**Calculation Audit**:
```
Verify against docs/credit-calculation-guide.md:
1. ASC method: 14% for most, 6% for first-time filers
2. Contractor costs LIMITED to 65%
3. Section 174 capitalization warnings
4. Proper pricing tier assignment
5. Real-time recalculation working
```

### Task 1.3.3: Create Results Display Component ✅ COMPLETED
**Status**: Review visual impact and messaging
**Review Against**: `docs/design-system.md#results-display`

**Results Enhancement**:
- Verify animated counting effect
- Check blur overlay before lead capture
- Ensure personalization mentions AI tools used

## Section 1.4: Lead Capture System

### Task 1.4.1: Build Lead Capture Modal ✅ COMPLETED
**Status**: Current task - review implementation
**Review Against**: `docs/project-specs.md#lead-capture` and `docs/api-documentation.md#lead-endpoints`

**Implementation Review**:
```
Check modal against specifications:
1. Semi-transparent backdrop (rgba(0,0,0,0.5))
2. Form fields: email, company name, phone (optional)
3. Validation using Zod schemas
4. Loading states during submission
5. Mobile-responsive modal sizing
6. Accessibility features (focus trap, ESC key)
```

### Task 1.4.2: Implement Lead Storage Backend 🔄 NEXT TASK
**Purpose**: Save leads to database with proper tracking and integration
**Dependencies**: Task 1.4.1 complete, database schema created
**Docs References**: 
- `docs/api-documentation.md#lead-endpoints` → API specifications
- `docs/database-guide.md#leads-table` → Database structure
- `docs/integration-guide.md#airtable` → Airtable sync requirements

**Detailed Requirements**:

1. **Create Lead API Endpoint** (`/server/src/routes/leads.ts`):
```typescript
// POST /api/leads endpoint with:
- Request validation using express-validator
- Duplicate email checking
- Calculator results association
- IP address and user agent tracking
- Session ID for analytics
- Timestamp recording
```

2. **Lead Service Implementation** (`/server/src/services/lead.service.ts`):
```typescript
// Core functions:
- createLead(data: LeadInput): Promise<Lead>
- checkDuplicateEmail(email: string): Promise<boolean>
- associateCalculation(leadId: string, calculationId: string): Promise<void>
- updateLeadStatus(leadId: string, status: LeadStatus): Promise<void>
```

3. **Database Operations**:
- Insert into leads table with all tracking fields
- Link to calculations table via foreign key
- Set lead_captured_at timestamp
- Store source attribution data

4. **Airtable Sync** (optional at this stage):
- Queue lead for Airtable sync
- Map fields to Airtable schema
- Handle sync failures gracefully

5. **Response Handling**:
- Return lead ID and success status
- Include next steps messaging
- Set secure HTTP-only cookie for session tracking

**Business Context**: Every lead represents a business that has seen the value of their AI experiments and wants to claim credits.

### Task 1.4.3: Post-Capture Experience 
**Purpose**: Show full results and guide user to purchase after lead capture
**Dependencies**: Tasks 1.4.1 and 1.4.2 complete
**Docs References**: 
- `docs/project-specs.md#post-lead-flow` → User experience flow
- `docs/design-system.md#results-reveal` → Animation specifications

**Implementation Details**:

1. **Results Reveal Animation**:
```javascript
// Smooth transition from blurred to clear
- Fade out blur overlay (300ms)
- Scale up results slightly (1.02x)
- Highlight federal credit amount
- Show pricing tier with badge
```

2. **Enhanced Results Display**:
- Detailed calculation breakdown
- "How we calculated this" expandable section
- Qualifying activities summary
- Industry comparison ("Agencies like yours typically claim...")
- Confidence score based on inputs

3. **Clear CTAs**:
- Primary: "Get Your R&D Documents" (to Stripe checkout)
- Secondary: "Download Results PDF" (lead magnet)
- Tertiary: "Schedule Free Consultation" (high-value leads)

4. **Trust Building Elements**:
- "2,847 businesses served" counter
- Security badges (SSL, SOC2)
- "IRS audit-ready documentation" badge
- 100% satisfaction guarantee

5. **Session Persistence**:
- Save calculation state to sessionStorage
- Allow returning to results without recalculating
- "Email sent to [email]" confirmation
- Browser back button handling

**Business Context**: This is the moment to convert interest into purchase by showing value and reducing risk.

## Section 1.5: Payment Integration

### Task 1.5.1: Stripe Checkout Setup
**Purpose**: Integrate Stripe for secure payment processing
**Dependencies**: Section 1.4 complete
**Docs References**: 
- `docs/integration-guide.md#stripe` → Stripe setup guide
- `docs/business-rules.md#pricing-tiers` → Pricing structure
- `docs/api-documentation.md#payment-endpoints` → Payment APIs

**Comprehensive Implementation**:

1. **Stripe Configuration** (`/server/src/config/stripe.ts`):
```typescript
// Initialize Stripe with:
- API keys from environment variables
- Webhook endpoint secret
- Product/price IDs for each tier
- Metadata structure for tracking
```

2. **Checkout Session Creation**:
```typescript
// POST /api/checkout/session
- Validate pricing tier from calculation
- Create Stripe checkout session with:
  - line_items based on tier
  - success_url with session ID
  - cancel_url back to calculator
  - customer_email from lead
  - metadata with calculation details
```

3. **Dynamic Pricing Logic**:
- Map federal credit amount to tier
- Apply any promotional codes
- Include multi-year options
- Add rush processing option ($500 extra)

4. **Security Measures**:
- Verify calculation integrity
- Rate limit checkout attempts
- Log all payment attempts
- Implement idempotency keys

5. **Frontend Integration** (`/client/src/components/checkout/StripeCheckout.tsx`):
```typescript
// Stripe.js integration:
- Load Stripe.js asynchronously
- Redirect to Stripe Checkout
- Handle loading states
- Error boundary for failures
```

**Business Context**: Seamless payment processing with clear pricing builds trust and reduces cart abandonment.

### Task 1.5.2: Create Checkout API
**Purpose**: Backend endpoints for secure payment processing
**Dependencies**: Task 1.5.1 complete
**Docs References**: 
- `docs/api-documentation.md#checkout` → API specifications
- `docs/database-guide.md#subscriptions` → Payment tracking

**Detailed Backend Implementation**:

1. **Checkout Controller** (`/server/src/controllers/checkout.controller.ts`):
```typescript
// Endpoints:
- POST /api/checkout/session - Create checkout
- GET /api/checkout/success - Verify payment
- POST /api/checkout/webhook - Stripe webhooks
```

2. **Price Calculation Service**:
```typescript
// Verify pricing integrity:
- Recalculate based on stored calculation
- Confirm tier assignment
- Apply business rules
- Generate line items
```

3. **Webhook Handler**:
```typescript
// Handle Stripe events:
- checkout.session.completed
- payment_intent.succeeded
- payment_intent.failed
- customer.created
```

4. **Database Updates**:
- Create subscription record
- Update user payment status
- Store Stripe customer ID
- Log transaction details

5. **Error Handling**:
- Webhook signature verification
- Idempotent event processing
- Failed payment recovery
- Comprehensive logging

**Business Context**: Reliable payment processing ensures smooth conversion and proper record-keeping for financial reconciliation.

### Task 1.5.3: Payment Success Flow
**Purpose**: Handle post-payment experience and account creation
**Dependencies**: Tasks 1.5.1 and 1.5.2 complete
**Docs References**: 
- `docs/project-specs.md#payment-success` → Success flow
- `docs/integration-guide.md#email` → Email setup

**Complete Success Implementation**:

1. **Success Page** (`/client/src/pages/PaymentSuccess.tsx`):
```typescript
// Display elements:
- Order confirmation with details
- "What happens next" timeline
- Account creation status
- Access dashboard button
- Download receipt link
```

2. **Account Creation Automation**:
```typescript
// On payment success webhook:
- Create user account if not exists
- Generate secure password
- Associate company and calculation
- Set up dashboard access
- Initialize intake form
```

3. **Welcome Email Sequence**:
```typescript
// SendGrid transactional emails:
1. Immediate: Receipt + login credentials
2. 1 hour: Getting started guide
3. 1 day: Reminder to complete intake
4. 3 days: Case studies + tips
5. 7 days: Check-in from success team
```

4. **Dashboard Initialization**:
- Pre-populate company info from lead
- Show onboarding checklist
- Set up progress tracking
- Enable auto-save for forms

5. **Analytics Tracking**:
- Conversion event to Google Analytics
- Revenue tracking in Stripe
- Cohort tagging for analysis
- Attribution data storage

**Business Context**: A smooth post-payment experience sets the tone for successful document generation and customer satisfaction.

## Section 1.6: User Authentication

### Task 1.6.1: Implement JWT Authentication
**Purpose**: Set up secure user sessions with JWT tokens
**Dependencies**: Section 1.5 complete
**Docs References**: 
- `docs/project-specs.md#authentication` → Auth specifications
- `docs/code-standards.md#security` → Security standards

**Authentication System Details**:

1. **JWT Service** (`/server/src/services/auth.service.ts`):
```typescript
// Core functions:
- generateAccessToken(userId: string): string
- generateRefreshToken(userId: string): string
- verifyToken(token: string): JWTPayload
- refreshAccessToken(refreshToken: string): string
```

2. **Token Configuration**:
```typescript
// JWT settings:
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- RS256 algorithm for production
- Secure HTTP-only cookies
- CSRF protection tokens
```

3. **Password Security**:
```typescript
// Bcrypt implementation:
- Salt rounds: 12
- Password complexity requirements
- Password history (no reuse)
- Account lockout after 5 attempts
```

4. **Session Management**:
- Redis for token blacklist
- Concurrent session limits
- Device tracking
- Activity logging

5. **Middleware** (`/server/src/middleware/auth.middleware.ts`):
```typescript
// Route protection:
- Token validation
- Role-based access
- Rate limiting per user
- Request logging
```

**Business Context**: Secure authentication protects sensitive tax information and ensures compliance with data protection requirements.

### Task 1.6.2: Create Login/Register Pages
**Purpose**: Build authentication UI with excellent UX
**Dependencies**: Task 1.6.1 complete
**Docs References**: 
- `docs/design-system.md#forms` → Form design standards
- `docs/project-specs.md#auth-flow` → Authentication flow

**UI Implementation Details**:

1. **Login Page** (`/client/src/pages/Login.tsx`):
```typescript
// Features:
- Email/password fields
- "Remember me" checkbox
- "Forgot password?" link
- Social login buttons (future)
- Clear error messages
- Loading states
```

2. **Password Reset Flow**:
```typescript
// Multi-step process:
1. Request reset (email input)
2. Check email message
3. Reset form (with token)
4. Success confirmation
5. Auto-redirect to login
```

3. **Registration Flow**:
```typescript
// Via Stripe webhook:
- Auto-created accounts
- Welcome screen on first login
- Password creation prompt
- Profile completion
```

4. **Form Validation**:
```typescript
// React Hook Form + Zod:
- Real-time validation
- Clear error messages
- Accessibility compliant
- Mobile-optimized
```

5. **Security Features**:
- CAPTCHA for repeated attempts
- Honeypot fields
- Rate limiting
- Session fingerprinting

**Business Context**: Simple, secure login maintains user trust while protecting sensitive financial data.

### Task 1.6.3: Protected Route Implementation
**Purpose**: Secure dashboard and user areas with route guards
**Dependencies**: Tasks 1.6.1 and 1.6.2 complete
**Docs References**: 
- `docs/project-specs.md#routing` → Route structure
- `docs/code-standards.md#react-patterns` → React patterns

**Route Protection Implementation**:

1. **Auth Context** (`/client/src/contexts/AuthContext.tsx`):
```typescript
// Global auth state:
- Current user object
- Loading state
- Login/logout methods
- Token refresh logic
- Permission checking
```

2. **Protected Route Component**:
```typescript
// HOC for route protection:
- Check authentication status
- Redirect to login if needed
- Show loading during check
- Preserve intended destination
- Handle expired sessions
```

3. **Route Configuration**:
```typescript
// Protected routes:
- /dashboard/* - Main user area
- /intake/* - Form sections
- /documents/* - Generated files
- /settings/* - Account settings
- /admin/* - Admin panel (future)
```

4. **Session Handling**:
- Auto-refresh before expiry
- Graceful timeout handling
- "Session expiring" warnings
- Remember intended route

5. **Error Boundaries**:
- Auth-specific error handling
- Fallback UI for failures
- Error reporting
- Recovery options

**Business Context**: Proper route protection ensures users can only access their own data while maintaining a smooth experience.