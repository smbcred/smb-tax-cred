#!/bin/bash

# Create acceptance directory
mkdir -p docs/acceptance

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

# Create acceptance files for Phase 1 tasks (MVP)
create_acceptance_file "1.1.1" "Initialize Replit Project" "Set up the base React + Node.js project structure" \
    "React frontend with Tailwind CSS" \
    "Express backend" \
    "PostgreSQL database connection" \
    "Environment variable configuration" \
    "Basic folder structure per rd-credit-file-structure.md"

create_acceptance_file "1.1.2" "Configure Development Environment" "Set up all necessary dependencies and build tools" \
    "Package.json for frontend and backend" \
    "Webpack/build configuration" \
    "ESLint and Prettier setup" \
    "Git initialization" \
    "Development vs production environments"

create_acceptance_file "1.1.3" "Database Schema Creation" "Implement PostgreSQL database structure" \
    "Users table with authentication fields" \
    "Companies table with business details" \
    "Calculations table for estimates" \
    "Intake forms table" \
    "Documents table" \
    "All relationships per additional-project-specs.md"

create_acceptance_file "1.2.1" "Create Landing Page Layout" "Build the main marketing page structure" \
    "Hero section with headline and CTA" \
    "Trust signals section (IRS badges, security icons)" \
    "Benefits/features grid" \
    "How it works (3-step process)" \
    "Pricing preview" \
    "Footer with legal links"

create_acceptance_file "1.2.2" "Implement Responsive Design" "Ensure mobile-first responsive layout" \
    "Mobile breakpoints (sm, md, lg, xl)" \
    "Touch-friendly interactive elements" \
    "Optimized images and loading" \
    "Smooth scrolling navigation" \
    "Hamburger menu for mobile"

create_acceptance_file "1.2.3" "Add Marketing Copy & Content" "Populate landing page with conversion-optimized copy" \
    "Headlines from Copywriting & Positioning Guide.md" \
    "Value propositions and benefits" \
    "Social proof placeholders" \
    "FAQ preview section" \
    "CTA buttons with proper messaging"

create_acceptance_file "1.3.1" "Build Calculator UI Component" "Create the 4-step calculator interface" \
    "Step 1: Business type selection (grid layout)" \
    "Step 2: Qualifying activities checklist" \
    "Step 3: Expense inputs with validation" \
    "Step 4: Results display with animation" \
    "Progress indicator" \
    "Back/Next navigation"

create_acceptance_file "1.3.2" "Implement Calculator Logic" "Add calculation engine and real-time updates" \
    "QRE calculation formulas" \
    "ASC method implementation (14% simplified)" \
    "Pricing tier assignment logic" \
    "Real-time recalculation on input change" \
    "Input validation and error handling"

create_acceptance_file "1.3.3" "Create Results Display" "Show calculation results and pricing" \
    "Animated number counting" \
    "Federal credit display" \
    "Pricing tier reveal" \
    "ROI messaging" \
    "Blur effect before lead capture" \
    "See Full Results CTA"

create_acceptance_file "1.4.1" "Build Lead Capture Modal" "Create email capture overlay" \
    "Modal overlay with backdrop" \
    "Email, company name, phone fields" \
    "Form validation" \
    "Loading states" \
    "Success/error messages" \
    "Mobile-optimized layout"

create_acceptance_file "1.4.2" "Implement Lead Storage" "Save leads to database" \
    "API endpoint for lead creation" \
    "PostgreSQL lead storage" \
    "Duplicate email checking" \
    "Calculator results association" \
    "Timestamp tracking" \
    "Basic email validation"

create_acceptance_file "1.4.3" "Post-Capture Experience" "Show full results after lead capture" \
    "Remove blur from results" \
    "Show detailed breakdown" \
    "Display pricing tier details" \
    "Add Get Started CTA" \
    "Email confirmation message" \
    "Session storage of lead status"

echo "Created acceptance files for Phase 1 (MVP) tasks"