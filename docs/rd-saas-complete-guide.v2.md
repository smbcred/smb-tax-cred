> **Doc Integrity & Agent Runbook**
>
> - This file is the **single source of truth** for build order. Every "### Task X.Y.Z" must have **Purpose** and **Key Requirements**.
> - Replit Agent must start at **Task 1.1.1** and proceed numerically.
> - Before coding each task, Agent converts the "Key Requirements" bullets into acceptance checks (Exists, Wired, Validated, Tested, Copy/UX, Security).
> - Agent maintains `/docs/TASKS.md`, `/docs/PROGRESS.md`, and `/docs/BLOCKERS.md`. If any section is missing, Agent must create it.
> - If a task is impossible due to missing secrets/specs, Agent adds an entry to `BLOCKERS.md` and continues to the next unblocked task.
> - Pricing must be imported from `src/config/pricing.ts` (no hardcoded values). Use the new design system tokens by default.

# R&D Tax Credit SAAS - Complete Replit Development Guide

## Overview
This guide provides an exhaustive, step-by-step roadmap for building the entire R&D Tax Credit SAAS platform using Replit. Each task is designed to generate a detailed Replit prompt when requested.

---

# Phase 1: Foundation & MVP (Weeks 1-4)

## Section 1.1: Project Setup & Infrastructure

### Task 1.1.1: Initialize Replit Project
**Purpose**: Set up the base React + Node.js project structure
**Key Requirements**: 
- React frontend with Tailwind CSS
- Express backend
- PostgreSQL database connection
- Environment variable configuration
- Basic folder structure per `rd-credit-file-structure.md`

### Task 1.1.2: Configure Development Environment
**Purpose**: Set up all necessary dependencies and build tools
**Key Requirements**:
- Package.json for frontend and backend
- Webpack/build configuration
- ESLint and Prettier setup
- Git initialization
- Development vs production environments

### Task 1.1.3: Database Schema Creation
**Purpose**: Implement PostgreSQL database structure
**Key Requirements**:
- Users table with authentication fields
- Companies table with business details
- Calculations table for estimates
- Intake forms table
- Documents table
- All relationships per `additional-project-specs.md`

## Section 1.2: Marketing Landing Page

### Task 1.2.1: Create Landing Page Layout
**Purpose**: Build the main marketing page structure
**Key Requirements**:
- Hero section with headline and CTA
- Trust signals section (IRS badges, security icons)
- Benefits/features grid
- How it works (3-step process)
- Pricing preview
- Footer with legal links

### Task 1.2.2: Implement Responsive Design
**Purpose**: Ensure mobile-first responsive layout
**Key Requirements**:
- Mobile breakpoints (sm, md, lg, xl)
- Touch-friendly interactive elements
- Optimized images and loading
- Smooth scrolling navigation
- Hamburger menu for mobile

### Task 1.2.3: Add Marketing Copy & Content
**Purpose**: Populate landing page with conversion-optimized copy
**Key Requirements**:
- Headlines from `Copywriting & Positioning Guide.md`
- Value propositions and benefits
- Social proof placeholders
- FAQ preview section
- CTA buttons with proper messaging

## Section 1.3: Interactive Calculator

### Task 1.3.1: Build Calculator UI Component
**Purpose**: Create the 4-step calculator interface
**Key Requirements**:
- Step 1: Business type selection (grid layout)
- Step 2: Qualifying activities checklist
- Step 3: Expense inputs with validation
- Step 4: Results display with animation
- Progress indicator
- Back/Next navigation

### Task 1.3.2: Implement Calculator Logic
**Purpose**: Add calculation engine and real-time updates
**Key Requirements**:
- QRE calculation formulas
- ASC method implementation (14% simplified)
- Pricing tier assignment logic
- Real-time recalculation on input change
- Input validation and error handling

### Task 1.3.3: Create Results Display
**Purpose**: Show calculation results and pricing
**Key Requirements**:
- Animated number counting
- Federal credit display
- Pricing tier reveal
- ROI messaging
- Blur effect before lead capture
- "See Full Results" CTA

## Section 1.4: Lead Capture System

### Task 1.4.1: Build Lead Capture Modal
**Purpose**: Create email capture overlay
**Key Requirements**:
- Modal overlay with backdrop
- Email, company name, phone fields
- Form validation
- Loading states
- Success/error messages
- Mobile-optimized layout

### Task 1.4.2: Implement Lead Storage
**Purpose**: Save leads to database
**Key Requirements**:
- API endpoint for lead creation
- PostgreSQL lead storage
- Duplicate email checking
- Calculator results association
- Timestamp tracking
- Basic email validation

### Task 1.4.3: Post-Capture Experience
**Purpose**: Show full results after lead capture
**Key Requirements**:
- Remove blur from results
- Show detailed breakdown
- Display pricing tier details
- Add "Get Started" CTA
- Email confirmation message
- Session storage of lead status

## Section 1.5: Payment Integration

### Task 1.5.1: Stripe Checkout Setup
**Purpose**: Integrate Stripe for payment processing
**Key Requirements**:
- Stripe SDK integration
- Checkout session creation
- Dynamic pricing based on tier
- Customer metadata passing
- Success/cancel URL configuration
- Test mode setup

### Task 1.5.2: Create Checkout API
**Purpose**: Backend endpoints for payment
**Key Requirements**:
- POST /api/checkout/session endpoint
- Price calculation verification
- Stripe customer creation
- Metadata for tier and calculator results
- Error handling
- Security validation

### Task 1.5.3: Payment Success Flow
**Purpose**: Handle post-payment experience
**Key Requirements**:
- Success page creation
- Stripe webhook listener
- Account creation trigger
- Welcome email trigger
- Order confirmation display
- Dashboard access button

## Section 1.6: User Authentication

### Task 1.6.1: Implement JWT Authentication
**Purpose**: Set up secure user sessions
**Key Requirements**:
- JWT token generation
- Secure token storage
- Login/logout endpoints
- Password hashing (bcrypt)
- Session management
- Refresh token logic

### Task 1.6.2: Create Login/Register Pages
**Purpose**: Build authentication UI
**Key Requirements**:
- Login form with validation
- Password reset flow
- Registration via Stripe webhook
- Remember me functionality
- Error messaging
- Redirect logic

### Task 1.6.3: Protected Route Implementation
**Purpose**: Secure dashboard and user areas
**Key Requirements**:
- Route authentication middleware
- Token verification
- Automatic redirect to login
- Session timeout handling
- Role-based access (future)

## Section 1.7: User Dashboard

### Task 1.7.1: Dashboard Layout
**Purpose**: Create main dashboard structure
**Key Requirements**:
- Welcome message with user name
- Progress overview card
- Action items checklist
- Document status section
- Navigation menu
- Responsive sidebar

### Task 1.7.2: Progress Tracking Component
**Purpose**: Show intake form completion
**Key Requirements**:
- Visual progress bar
- Section completion indicators
- Time estimates
- Next action prompts
- Percentage complete calculation
- Save indicator

### Task 1.7.3: Dashboard API Integration
**Purpose**: Connect dashboard to backend
**Key Requirements**:
- GET /api/dashboard endpoint
- User data fetching
- Company information display
- Calculation summary
- Document status checking
- Real-time updates

---

# Phase 2: Core Functionality (Weeks 5-8)

## Section 2.1: Intake Form System

### Task 2.1.1: Multi-Step Form Component
**Purpose**: Build comprehensive intake form
**Key Requirements**:
- Section navigation component
- Form state management
- Progress persistence
- Auto-save functionality
- Validation per section
- Mobile-friendly inputs

### Task 2.1.2: Company Information Section
**Purpose**: Collect business details
**Key Requirements**:
- Legal name, EIN fields
- Entity type dropdown
- Address components
- Year founded picker
- NAICS code with search
- Industry selection

### Task 2.1.3: R&D Activities Section
**Purpose**: Capture project details
**Key Requirements**:
- Project name/description fields
- Technical challenges textarea
- Date range pickers
- Success criteria inputs
- Add multiple projects
- Four-part test alignment

### Task 2.1.4: Expense Breakdown Section
**Purpose**: Detailed cost collection
**Key Requirements**:
- Employee expense grid
- Contractor cost inputs
- Supplies categorization
- Cloud/software expenses
- Time allocation percentages
- Automatic calculations

### Task 2.1.5: Supporting Information Section
**Purpose**: Additional data collection
**Key Requirements**:
- Previous credit claims checkbox
- QSB eligibility check
- Gross receipts input
- Payroll tax election
- Document upload placeholders
- Final review summary

### Task 2.1.6: Form Submission & Validation
**Purpose**: Complete intake processing
**Key Requirements**:
- Comprehensive validation
- Submission confirmation
- API endpoint creation
- Database storage
- Status updates
- Next steps display

## Section 2.2: Auto-Save System

### Task 2.2.1: Implement Auto-Save Logic
**Purpose**: Prevent data loss
**Key Requirements**:
- 30-second interval saves
- Debounced input tracking
- Dirty state detection
- Save status indicator
- Conflict resolution
- Offline capability

### Task 2.2.2: Create Save API Endpoints
**Purpose**: Backend for auto-save
**Key Requirements**:
- PATCH endpoints per section
- Partial update handling
- Timestamp tracking
- User verification
- Database optimization
- Response compression

## Section 2.3: Airtable Integration

### Task 2.3.1: Airtable Service Setup
**Purpose**: Connect to Airtable API
**Key Requirements**:
- API authentication
- Base configuration
- Table references
- Field mapping
- Error handling
- Rate limiting

### Task 2.3.2: Customer Record Sync
**Purpose**: Sync data to Airtable
**Key Requirements**:
- Create customer records
- Update existing records
- Field transformation
- Calculation results sync
- Status tracking
- Webhook triggers

### Task 2.3.3: Document URL Management
**Purpose**: Track generated documents
**Key Requirements**:
- URL field updates
- Expiration tracking
- Status synchronization
- Polling mechanism
- Error recovery
- Notification triggers

## Section 2.4: Make.com Integration

### Task 2.4.1: Webhook Endpoint Creation
**Purpose**: Receive Make.com triggers
**Key Requirements**:
- POST /api/webhooks/make endpoint
- Signature verification
- Payload validation
- Status update handling
- Error responses
- Logging system

### Task 2.4.2: Workflow Trigger System
**Purpose**: Initiate document generation
**Key Requirements**:
- Trigger on intake completion
- Payload construction
- Airtable record ID passing
- Retry logic
- Timeout handling
- Status tracking

### Task 2.4.3: Status Polling Service
**Purpose**: Monitor generation progress
**Key Requirements**:
- Polling interval setup
- Status check endpoint
- Progress updates
- Completion detection
- Error handling
- User notifications

---

# Phase 3: Document Generation (Weeks 9-10)

## Section 3.1: Claude API Integration

### Task 3.1.1: Claude Service Setup
**Purpose**: Connect to Claude API
**Key Requirements**:
- API key management
- Request formatting
- Response parsing
- Token management
- Error handling
- Retry logic

### Task 3.1.2: Narrative Prompt Templates
**Purpose**: Create dynamic prompts
**Key Requirements**:
- Technical narrative template
- Variable substitution
- Context injection
- Length control
- Tone consistency
- Compliance focus

### Task 3.1.3: Compliance Memo Generation
**Purpose**: Generate audit defense docs
**Key Requirements**:
- Memo structure template
- Risk assessment logic
- Four-part test mapping
- QRE justification
- IRS alignment
- Professional formatting

## Section 3.2: Document Processing

### Task 3.2.1: Document Orchestrator Service
**Purpose**: Coordinate generation flow
**Key Requirements**:
- Queue management
- Service coordination
- Status tracking
- Error recovery
- Timeout handling
- Result compilation

### Task 3.2.2: PDF Generation Integration
**Purpose**: Create final documents
**Key Requirements**:
- Documint API setup
- Form 6765 template
- Data mapping
- PDF compilation
- Quality verification
- Batch processing

## Section 3.3: File Storage & Delivery

### Task 3.3.1: S3 Integration
**Purpose**: Secure document storage
**Key Requirements**:
- S3 bucket configuration
- Upload functionality
- Folder organization
- Access control
- URL generation
- Expiration settings

### Task 3.3.2: Download System
**Purpose**: User document access
**Key Requirements**:
- Secure URL generation
- Time-limited access
- Download tracking
- Zip functionality
- Mobile compatibility
- Bandwidth optimization

### Task 3.3.3: Email Notification System
**Purpose**: Document ready notifications
**Key Requirements**:
- SendGrid integration
- Email templates
- Dynamic content
- Delivery tracking
- Bounce handling
- Unsubscribe compliance

---

# Phase 4: Polish & Optimization (Weeks 11-12)

## Section 4.1: Error Handling & Recovery

### Task 4.1.1: Global Error Handler
**Purpose**: Comprehensive error management
**Key Requirements**:
- Error boundary implementation
- Logging service
- User-friendly messages
- Recovery options
- Support contact
- Error tracking

### Task 4.1.2: Integration Failure Recovery
**Purpose**: Handle third-party failures
**Key Requirements**:
- Retry mechanisms
- Fallback options
- Queue management
- Manual intervention
- Status reporting
- Notification system

## Section 4.2: Performance Optimization

### Task 4.2.1: Frontend Performance
**Purpose**: Optimize load times
**Key Requirements**:
- Code splitting
- Lazy loading
- Image optimization
- Caching strategy
- Bundle optimization
- CDN implementation

### Task 4.2.2: Backend Optimization
**Purpose**: Improve response times
**Key Requirements**:
- Database indexing
- Query optimization
- Caching layer
- Connection pooling
- Rate limiting
- Load balancing prep

## Section 4.3: Security Hardening

### Task 4.3.1: Security Audit Implementation
**Purpose**: Enhance security posture
**Key Requirements**:
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting
- Security headers

### Task 4.3.2: Data Protection
**Purpose**: Secure sensitive data
**Key Requirements**:
- Encryption at rest
- Secure transmission
- PII handling
- Access logging
- Compliance checks
- Backup strategy

## Section 4.4: User Experience Polish

### Task 4.4.1: Loading States & Feedback
**Purpose**: Improve perceived performance
**Key Requirements**:
- Skeleton screens
- Progress indicators
- Success animations
- Error recovery flows
- Helpful tooltips
- Micro-interactions

### Task 4.4.2: Mobile Optimization
**Purpose**: Perfect mobile experience
**Key Requirements**:
- Touch target sizing
- Gesture support
- Keyboard handling
- Viewport optimization
- Performance testing
- Cross-device QA

## Section 4.5: Analytics & Monitoring

### Task 4.5.1: Analytics Implementation
**Purpose**: Track user behavior
**Key Requirements**:
- Event tracking setup
- Conversion funnel
- User journey mapping
- A/B test framework
- Performance metrics
- Custom dashboards

### Task 4.5.2: Application Monitoring
**Purpose**: Ensure reliability
**Key Requirements**:
- Uptime monitoring
- Error tracking
- Performance alerts
- Database monitoring
- API health checks
- Incident response

---

# Phase 5: Launch Preparation

## Section 5.1: Testing & QA

### Task 5.1.1: Comprehensive Testing Suite
**Purpose**: Ensure quality
**Key Requirements**:
- Unit test coverage
- Integration tests
- E2E test scenarios
- Load testing
- Security testing
- Accessibility audit

### Task 5.1.2: User Acceptance Testing
**Purpose**: Validate user experience
**Key Requirements**:
- Test user recruitment
- Scenario creation
- Feedback collection
- Issue prioritization
- Fix implementation
- Re-testing cycles

## Section 5.2: Documentation & Support

### Task 5.2.1: User Documentation
**Purpose**: Help users succeed
**Key Requirements**:
- Getting started guide
- FAQ compilation
- Video tutorials
- Troubleshooting guide
- Best practices
- Glossary

### Task 5.2.2: Support System Setup
**Purpose**: Handle user inquiries
**Key Requirements**:
- Help desk setup
- Email templates
- Response workflows
- Knowledge base
- Escalation process
- SLA definitions

## Section 5.3: Launch Readiness

### Task 5.3.1: Production Deployment
**Purpose**: Go live preparation
**Key Requirements**:
- Environment setup
- SSL certificates
- Domain configuration
- Backup verification
- Rollback plan
- Launch checklist

### Task 5.3.2: Marketing Launch
**Purpose**: Drive initial traffic
**Key Requirements**:
- Landing page final review
- SEO optimization
- Social media setup
- Email campaigns
- Partner outreach
- PR preparation

---

# Implementation Notes

## How to Use This Guide

1. **For each task**, request a detailed Replit prompt by referencing:
   - The specific task number and name
   - The knowledge base documents
   - The technical requirements

2. **Example request format**:
   "Generate a Replit prompt for Task 1.3.1: Build Calculator UI Component"

3. **The response will include**:
   - Complete component specifications
   - Code structure
   - Integration points
   - Validation rules
   - UI/UX requirements

## Priority Guidelines

- **Critical Path**: Tasks that block others
- **Revenue Impact**: Calculator, payment, intake form
- **User Experience**: Auto-save, error handling, mobile
- **Compliance**: Document generation, IRS requirements

## Dependencies to Track

- **External Services**: API keys needed before integration tasks
- **Database**: Schema must exist before API development
- **Authentication**: Required before protected routes
- **Payment**: Needed before account creation flow

This guide serves as the master blueprint for building the entire R&D Tax Credit SAAS platform on Replit.
