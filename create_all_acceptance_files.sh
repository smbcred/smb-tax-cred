#!/bin/bash

# Create remaining acceptance files for all tasks

# Function to create acceptance file
create_acceptance_file() {
    local task_id="$1"
    local title="$2"
    local purpose="$3"
    shift 3
    local requirements=("$@")
    
    local filename="docs/acceptance/${task_id}.md"
    
    cat > "$filename" << EOF
---
task_id: ${task_id}
title: ${title}
owner: agent
status: todo
---

# Acceptance — Task ${task_id}: ${title}

## Purpose
${purpose}

## Definition of Done (check all)
EOF

    for req in "${requirements[@]}"; do
        echo "- [ ] ${req}" >> "$filename"
    done

    cat >> "$filename" << EOF

## Functional Checks
- [ ] **Exists**: Files/components/routes created.
- [ ] **Wired**: UI → API → DB flow demonstrated.
- [ ] **Validated**: Server-side input validation returns clear errors.
- [ ] **Tested**: At least one unit or integration test (happy + error).
- [ ] **UX/Copy**: Labels/CTAs match guide; mobile-friendly.
- [ ] **Security**: No secrets committed; rate-limit public endpoints.

## Non-Functional (as applicable)
- [ ] **Performance**: No obvious jank; sensible batching/debouncing.
- [ ] **Accessibility**: Labels/focus/roles; AA contrast.
- [ ] **Telemetry**: Key events logged if defined.

## Artifacts to Update
- [ ] \`/docs/TASKS_for_v2.md\` — mark ${task_id} complete.
- [ ] \`/docs/PROGRESS.md\` — what changed and why (file links).
- [ ] \`/docs/BLOCKERS.md\` — add/remove blockers.

## Manual QA Notes
- Steps:
- Results:

## Verification Commands
\`\`\`bash
npm --prefix client run typecheck && npm --prefix client run lint
npm --prefix server run typecheck && npm --prefix server run lint
npm --prefix client run build
npm --prefix server run test
\`\`\`
EOF
}

# Payment Integration (1.5.x)
create_acceptance_file "1.5.1" "Stripe Checkout Setup" "Integrate Stripe for payment processing" \
    "Stripe SDK integration" \
    "Checkout session creation" \
    "Dynamic pricing based on tier" \
    "Customer metadata passing" \
    "Success/cancel URL configuration" \
    "Test mode setup"

create_acceptance_file "1.5.2" "Create Checkout API" "Backend endpoints for payment" \
    "POST /api/checkout/session endpoint" \
    "Price calculation verification" \
    "Stripe customer creation" \
    "Metadata for tier and calculator results" \
    "Error handling" \
    "Security validation"

create_acceptance_file "1.5.3" "Payment Success Flow" "Handle post-payment experience" \
    "Success page creation" \
    "Stripe webhook listener" \
    "Account creation trigger" \
    "Welcome email trigger" \
    "Order confirmation display" \
    "Dashboard access button"

# User Authentication (1.6.x)
create_acceptance_file "1.6.1" "Implement JWT Authentication" "Set up secure user sessions" \
    "JWT token generation" \
    "Secure token storage" \
    "Login/logout endpoints" \
    "Password hashing (bcrypt)" \
    "Session management" \
    "Refresh token logic"

create_acceptance_file "1.6.2" "Create Login/Register Pages" "Build authentication UI" \
    "Login form with validation" \
    "Password reset flow" \
    "Registration via Stripe webhook" \
    "Remember me functionality" \
    "Error messaging" \
    "Redirect logic"

create_acceptance_file "1.6.3" "Protected Route Implementation" "Secure dashboard and user areas" \
    "Route authentication middleware" \
    "Token verification" \
    "Automatic redirect to login" \
    "Session timeout handling" \
    "Role-based access (future)"

# User Dashboard (1.7.x)
create_acceptance_file "1.7.1" "Dashboard Layout" "Create main dashboard structure" \
    "Welcome message with user name" \
    "Progress overview card" \
    "Action items checklist" \
    "Document status section" \
    "Navigation menu" \
    "Responsive sidebar"

create_acceptance_file "1.7.2" "Progress Tracking Component" "Show intake form completion" \
    "Visual progress bar" \
    "Section completion indicators" \
    "Time estimates" \
    "Next action prompts" \
    "Percentage complete calculation" \
    "Save indicator"

create_acceptance_file "1.7.3" "Dashboard API Integration" "Connect dashboard to backend" \
    "GET /api/dashboard endpoint" \
    "User data fetching" \
    "Company information display" \
    "Calculation summary" \
    "Document status checking" \
    "Real-time updates"

# Intake Form System (2.1.x)
create_acceptance_file "2.1.1" "Multi-Step Form Component" "Build comprehensive intake form" \
    "Section navigation component" \
    "Form state management" \
    "Progress persistence" \
    "Auto-save functionality" \
    "Validation per section" \
    "Mobile-friendly inputs"

create_acceptance_file "2.1.2" "Company Information Section" "Collect business details" \
    "Legal name, EIN fields" \
    "Entity type dropdown" \
    "Address components" \
    "Year founded picker" \
    "NAICS code with search" \
    "Industry selection"

create_acceptance_file "2.1.3" "R&D Activities Section" "Capture project details" \
    "Project name/description fields" \
    "Technical challenges textarea" \
    "Date range pickers" \
    "Success criteria inputs" \
    "Add multiple projects" \
    "Four-part test alignment"

create_acceptance_file "2.1.4" "Expense Breakdown Section" "Detailed cost collection" \
    "Employee expense grid" \
    "Contractor cost inputs" \
    "Supplies categorization" \
    "Cloud/software expenses" \
    "Time allocation percentages" \
    "Automatic calculations"

create_acceptance_file "2.1.5" "Supporting Information Section" "Additional data collection" \
    "Previous credit claims checkbox" \
    "QSB eligibility check" \
    "Gross receipts input" \
    "Payroll tax election" \
    "Document upload placeholders" \
    "Final review summary"

create_acceptance_file "2.1.6" "Form Submission & Validation" "Complete intake processing" \
    "Comprehensive validation" \
    "Submission confirmation" \
    "API endpoint creation" \
    "Database storage" \
    "Status updates" \
    "Next steps display"

# Auto-Save System (2.2.x)
create_acceptance_file "2.2.1" "Implement Auto-Save Logic" "Prevent data loss" \
    "30-second interval saves" \
    "Debounced input tracking" \
    "Dirty state detection" \
    "Save status indicator" \
    "Conflict resolution" \
    "Offline capability"

create_acceptance_file "2.2.2" "Create Save API Endpoints" "Backend for auto-save" \
    "PATCH endpoints per section" \
    "Partial update handling" \
    "Timestamp tracking" \
    "User verification" \
    "Database optimization" \
    "Response compression"

# Airtable Integration (2.3.x)
create_acceptance_file "2.3.1" "Airtable Service Setup" "Connect to Airtable API" \
    "API authentication" \
    "Base configuration" \
    "Table references" \
    "Field mapping" \
    "Error handling" \
    "Rate limiting"

create_acceptance_file "2.3.2" "Customer Record Sync" "Sync data to Airtable" \
    "Create customer records" \
    "Update existing records" \
    "Field transformation" \
    "Calculation results sync" \
    "Status tracking" \
    "Webhook triggers"

create_acceptance_file "2.3.3" "Document URL Management" "Track generated documents" \
    "URL field updates" \
    "Expiration tracking" \
    "Status synchronization" \
    "Polling mechanism" \
    "Error recovery" \
    "Notification triggers"

# Make.com Integration (2.4.x)
create_acceptance_file "2.4.1" "Webhook Endpoint Creation" "Receive Make.com triggers" \
    "POST /api/webhooks/make endpoint" \
    "Signature verification" \
    "Payload validation" \
    "Status update handling" \
    "Error responses" \
    "Logging system"

create_acceptance_file "2.4.2" "Workflow Trigger System" "Initiate document generation" \
    "Trigger on intake completion" \
    "Payload construction" \
    "Airtable record ID passing" \
    "Retry logic" \
    "Timeout handling" \
    "Status tracking"

create_acceptance_file "2.4.3" "Status Polling Service" "Monitor generation progress" \
    "Polling interval setup" \
    "Status check endpoint" \
    "Progress updates" \
    "Completion detection" \
    "Error handling" \
    "User notifications"

# Document Generation (3.1.x - 3.3.x)
create_acceptance_file "3.1.1" "Claude Service Setup" "Connect to Claude API" \
    "API key management" \
    "Request formatting" \
    "Response parsing" \
    "Token management" \
    "Error handling" \
    "Retry logic"

create_acceptance_file "3.1.2" "Narrative Prompt Templates" "Create dynamic prompts" \
    "Technical narrative template" \
    "Variable substitution" \
    "Context injection" \
    "Length control" \
    "Tone consistency" \
    "Compliance focus"

create_acceptance_file "3.1.3" "Compliance Memo Generation" "Generate audit defense docs" \
    "Memo structure template" \
    "Risk assessment logic" \
    "Four-part test mapping" \
    "QRE justification" \
    "IRS alignment" \
    "Professional formatting"

create_acceptance_file "3.2.1" "Document Orchestrator Service" "Coordinate generation flow" \
    "Queue management" \
    "Service coordination" \
    "Status tracking" \
    "Error recovery" \
    "Timeout handling" \
    "Result compilation"

create_acceptance_file "3.2.2" "PDF Generation Integration" "Create final documents" \
    "Documint API setup" \
    "Form 6765 template" \
    "Data mapping" \
    "PDF compilation" \
    "Quality verification" \
    "Batch processing"

create_acceptance_file "3.3.1" "S3 Integration" "Secure document storage" \
    "S3 bucket configuration" \
    "Upload functionality" \
    "Folder organization" \
    "Access control" \
    "URL generation" \
    "Expiration settings"

create_acceptance_file "3.3.2" "Download System" "User document access" \
    "Secure URL generation" \
    "Time-limited access" \
    "Download tracking" \
    "Zip functionality" \
    "Mobile compatibility" \
    "Bandwidth optimization"

create_acceptance_file "3.3.3" "Email Notification System" "Document ready notifications" \
    "SendGrid integration" \
    "Email templates" \
    "Dynamic content" \
    "Delivery tracking" \
    "Bounce handling" \
    "Unsubscribe compliance"

# Error Handling & Performance (4.1.x - 4.2.x)
create_acceptance_file "4.1.1" "Global Error Handler" "Comprehensive error management" \
    "Error boundary implementation" \
    "Logging service" \
    "User-friendly messages" \
    "Recovery options" \
    "Support contact" \
    "Error tracking"

create_acceptance_file "4.1.2" "Integration Failure Recovery" "Handle third-party failures" \
    "Retry mechanisms" \
    "Fallback options" \
    "Queue management" \
    "Manual intervention" \
    "Status reporting" \
    "Notification system"

create_acceptance_file "4.2.1" "Frontend Performance" "Optimize load times" \
    "Code splitting" \
    "Lazy loading" \
    "Image optimization" \
    "Caching strategy" \
    "Bundle optimization" \
    "CDN implementation"

create_acceptance_file "4.2.2" "Backend Optimization" "Improve response times" \
    "Database indexing" \
    "Query optimization" \
    "Caching layer" \
    "Connection pooling" \
    "Rate limiting" \
    "Load balancing prep"

# Security & UX (4.3.x - 4.4.x)
create_acceptance_file "4.3.1" "Security Audit Implementation" "Enhance security posture" \
    "Input sanitization" \
    "SQL injection prevention" \
    "XSS protection" \
    "CSRF tokens" \
    "Rate limiting" \
    "Security headers"

create_acceptance_file "4.3.2" "Data Protection" "Secure sensitive data" \
    "Encryption at rest" \
    "Secure transmission" \
    "PII handling" \
    "Access logging" \
    "Compliance checks" \
    "Backup strategy"

create_acceptance_file "4.4.1" "Loading States & Feedback" "Improve perceived performance" \
    "Skeleton screens" \
    "Progress indicators" \
    "Success animations" \
    "Error recovery flows" \
    "Helpful tooltips" \
    "Micro-interactions"

create_acceptance_file "4.4.2" "Mobile Optimization" "Perfect mobile experience" \
    "Touch target sizing" \
    "Gesture support" \
    "Keyboard handling" \
    "Viewport optimization" \
    "Performance testing" \
    "Cross-device QA"

# Analytics & Monitoring (4.5.x)
create_acceptance_file "4.5.1" "Analytics Implementation" "Track user behavior" \
    "Event tracking setup" \
    "Conversion funnel" \
    "User journey mapping" \
    "A/B test framework" \
    "Performance metrics" \
    "Custom dashboards"

create_acceptance_file "4.5.2" "Application Monitoring" "Ensure reliability" \
    "Uptime monitoring" \
    "Error tracking" \
    "Performance alerts" \
    "Database monitoring" \
    "API health checks" \
    "Incident response"

# Testing & Launch (5.x.x)
create_acceptance_file "5.1.1" "Comprehensive Testing Suite" "Ensure quality" \
    "Unit test coverage" \
    "Integration tests" \
    "E2E test scenarios" \
    "Load testing" \
    "Security testing" \
    "Accessibility audit"

create_acceptance_file "5.1.2" "User Acceptance Testing" "Validate user experience" \
    "Test user recruitment" \
    "Scenario creation" \
    "Feedback collection" \
    "Issue prioritization" \
    "Fix implementation" \
    "Re-testing cycles"

create_acceptance_file "5.2.1" "User Documentation" "Help users succeed" \
    "Getting started guide" \
    "FAQ compilation" \
    "Video tutorials" \
    "Troubleshooting guides" \
    "API documentation" \
    "Support articles"

create_acceptance_file "5.2.2" "Support System Setup" "Customer support infrastructure" \
    "Help desk integration" \
    "Ticket routing" \
    "Knowledge base" \
    "Live chat widget" \
    "Escalation procedures" \
    "Response time SLAs"

create_acceptance_file "5.3.1" "Production Deployment" "Launch preparation" \
    "Environment configuration" \
    "SSL certificates" \
    "Domain setup" \
    "Performance monitoring" \
    "Backup procedures" \
    "Rollback strategy"

create_acceptance_file "5.3.2" "Marketing Launch" "Go-to-market execution" \
    "Landing page optimization" \
    "SEO implementation" \
    "Analytics tracking" \
    "Social media setup" \
    "Press kit preparation" \
    "Launch metrics tracking"

echo "Created all acceptance files successfully"