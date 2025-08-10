# SMBTaxCredits.com - Complete Project Instructions

## 🎯 Project Overview

SMBTaxCredits.com is a self-serve SaaS platform that helps small businesses document their AI experimentation work to claim federal R&D tax credits. We convert practical test-and-learn activities with ChatGPT, Claude, custom GPTs, and automations into IRS-compliant documentation worth 10-16% of project costs.

### Core Mission
**"Turn everyday AI experiments into tax savings"** - We serve businesses USING AI tools, not building them. No special degree required—if you tested, measured, and improved, you may qualify.

### Target Audience
- **Marketing/Creative Agencies**: Custom GPTs, prompt libraries, AI workflows
- **E-commerce Brands**: Chatbots, recommendation engines, automations
- **Consultants**: AI analysis tools, automated reporting
- **Service Businesses**: AI scheduling, operations automation
- **Content Creators**: AI content systems, custom workflows

## ⚠️ CRITICAL UPDATES - MUST READ

### Recent Law Changes (2022-2025)
**SECTION 174 CAPITALIZATION REQUIREMENT**: For tax years 2022-2025, R&D expenses must be capitalized and amortized over 5 years (domestic) or 15 years (foreign) instead of immediate expensing. This significantly impacts cash flow. Always warn users about this when discussing credits for these years.

### Calculation Accuracy Rules
- Use Alternative Simplified Credit (ASC) method for most SMBs
- First-time filers with no prior QREs: 6% credit rate
- With prior year QREs: 14% of excess over 50% of 3-year average
- **Contractor costs LIMITED to 65%** per IRC Section 41
- Startup payroll offset increased to $500,000 (was $250,000)
- Federal credits only (no state credits)

### Legal Compliance Requirements
- **NEVER** guarantee credits or audit outcomes
- **NEVER** provide tax advice
- **ALWAYS** include disclaimers
- **NEVER** claim IRS approval or certification
- Use "may qualify" not "will qualify"
- We are a documentation service, NOT tax advisors

## 📁 Project Structure

```
/smbtaxcredits-platform
├── /client                    # React frontend application
│   ├── /src
│   │   ├── /components       # UI components by feature
│   │   ├── /providers        # Context providers (Theme, Auth)
│   │   ├── /styles          # Global styles and design system
│   │   ├── /pages           # Route-level components
│   │   ├── /services        # API integration layer
│   │   ├── /hooks           # Custom React hooks
│   │   └── /data            # Static data and constants
│   ├── tailwind.config.js    # Tailwind configuration
│   └── index.html
├── /server                    # Node.js/Express backend
│   ├── /src
│   │   ├── /routes          # API endpoints
│   │   ├── /controllers     # Request handlers
│   │   ├── /services        # Business logic
│   │   ├── /database        # Schemas & migrations
│   │   └── /middleware      # Auth, validation, etc.
│   └── /integrations        # External service adapters
├── /docs                      # Project documentation
│   ├── project-specs.md
│   ├── api-documentation.md
│   ├── business-rules.md
│   ├── ai-examples.md
│   ├── design-system.md
│   ├── development-guide.md
│   ├── code-standards.md
│   ├── deployment-checklist.md
│   ├── integration-guide.md
│   ├── database-guide.md
│   ├── monitoring-guide.md
│   ├── credit-calculation-guide.md
│   ├── legal-compliance-guide.md
│   └── marketing-copywriting-playbook.md
└── /shared                    # Shared types and utilities
```

## 🎨 Design System Implementation

### Setup
The design system is implemented through:
- **Global Styles**: `/client/src/styles/global-styles.css`
- **Tailwind Config**: `/client/tailwind.config.js`
- **Theme Provider**: `/client/src/providers/ThemeProvider.tsx`

### Core Design Tokens
```css
/* Colors */
--color-ink: #0B0C0E;        /* Primary text */
--color-blue: #2E5AAC;       /* Primary brand/CTAs */
--color-emerald: #1E8E5A;    /* Success states */
--color-cloud: #F5F7FA;      /* Backgrounds */

/* Typography */
--font-sans: 'Inter', system-ui;
--fs-h1: 2.25rem;            /* Page titles */
--fs-body: 1rem;             /* Default text */

/* Spacing (4px base) */
--space-4: 1rem;             /* 16px */
--space-6: 1.5rem;           /* 24px */
```

### Component Classes
```css
.btn-primary     /* Blue CTA buttons */
.btn-secondary   /* Bordered buttons */
.card           /* Content cards */
.form-input     /* Form inputs */
.alert          /* Alert boxes */
```

### Using the Design System
```jsx
// With Tailwind utilities
<button className="bg-blue text-paper px-6 py-3 rounded-md hover:bg-blue-600">
  Calculate Credit
</button>

// With component classes
<button className="btn btn-primary">
  Calculate Credit
</button>

// With Theme Provider
import { useTheme } from '@/providers/ThemeProvider';
const { theme, mode, toggleMode } = useTheme();
```

## 📚 Documentation Guide

### How to Use the Docs

Each document serves a specific purpose. Reference them as needed:

#### Core Product Documentation
- **`project-specs.md`** - System architecture, database schema, key components
- **`api-documentation.md`** - All API endpoints with request/response examples
- **`business-rules.md`** - R&D qualification rules, pricing tiers, user flow
- **`ai-examples.md`** - 50+ examples of qualifying AI experimentation
- **`design-system.md`** - Complete UI/UX guidelines and component library

#### Development & Operations
- **`development-guide.md`** - Environment setup, workflow, testing, deployment
- **`code-standards.md`** - TypeScript/React conventions, Git workflow
- **`deployment-checklist.md`** - Pre-launch checklist, rollback procedures

#### Infrastructure & Integrations
- **`integration-guide.md`** - Stripe, Airtable, Make.com, Claude, SendGrid, S3 setup
- **`database-guide.md`** - PostgreSQL schema, migrations, optimization
- **`monitoring-guide.md`** - Sentry, analytics, alerts, incident response

#### Compliance & Business
- **`credit-calculation-guide.md`** - IRS rules, calculation methods, validation
- **`legal-compliance-guide.md`** - Required disclaimers, prohibited claims
- **`marketing-copywriting-playbook.md`** - Brand voice, messaging, templates

### Quick Reference Links
- Setting up environment: See `development-guide.md#environment-setup`
- Adding new component: See `code-standards.md#react-component-standards`
- Styling guidelines: See `design-system.md`
- API integration: See `api-documentation.md`
- Deployment steps: See `deployment-checklist.md`

## 💡 Key Business Rules

### What Qualifies as R&D (Four-Part Test)
All four must be met:
1. **Technological in Nature** - Computer science, engineering
2. **Elimination of Uncertainty** - Technical uncertainty existed
3. **Process of Experimentation** - Systematic testing/iteration
4. **Business Component** - New/improved functionality

### Qualified Research Expenses (QREs)
```
✅ INCLUDE:
- W-2 wages (100% if substantially engaged)
- Contractor costs (LIMITED to 65%)
- Supplies used in R&D
- Cloud computing for R&D
- Software licenses for R&D

❌ EXCLUDE:
- Land or buildings
- General admin costs
- Marketing expenses
- Foreign research
- Funded research
```

### Pricing Tiers (Based on Federal Credit)
•	Tier 0 (Micro): <$5,000 credit → $399
•	Tier 1: $5,000–$9,999 → $500
•	Tier 2: $10,000–$19,999 → $750
•	Tier 3: $20,000–$34,999 → $1,000
•	Tier 4: $35,000–$49,999 → $1,250
•	Tier 5: $50,000–$99,999 → $1,500
•	Tier 6: $100,000–$199,999 → $2,000
•	Tier 7 (Ceiling): $200,000+ → $2,500
Add-on: Additional years (same client, same session): $399 per extra year (flat, regardless of credit size), only after paying full price for the first year.

## ✍️ Marketing & Copywriting

### Brand Voice: "The Smart Friend Who Knows Taxes"
- **Approachable**: Conversational, not corporate
- **Confident**: Know our stuff without talking down
- **Practical**: Real outcomes, not theory
- **Encouraging**: "You've got this, and we'll help"

### Key Messaging
1. **AI-Forward Positioning**: "The only R&D platform built for businesses using AI, not building it"
2. **Simplicity Promise**: "30 minutes from experiments to IRS-ready documents"
3. **Transparent Pricing**: "Flat fee based on your credit. No percentages, no surprises."

### Copy Quick Reference
```
✅ ALWAYS SAY:
- "Calculate your potential credit"
- "Based on your AI experiments"
- "May qualify for federal credits"
- "Turn tests into tax savings"

❌ NEVER SAY:
- "Guaranteed approval/savings"
- "Maximize your refund"
- "IRS-approved methods"
- "We are tax experts"
```

### Required Disclaimer (Every Page)
```
This tool provides estimates based on current federal tax law. 
Actual credits depend on your specific circumstances and IRS 
examination. Consult a tax professional before claiming credits.
```

## 🔧 Technical Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Build**: Vite

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: JWT + bcrypt
- **Validation**: Express Validator

### Integrations
- **Payments**: Stripe
- **Workflow**: Airtable + Make.com
- **AI**: Claude API
- **Documents**: Documint
- **Storage**: AWS S3
- **Email**: SendGrid

## 🚀 Development Workflow

### Getting Started
```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development
npm run dev
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit with conventional format
git commit -m "feat(calculator): add multi-year support"

# Types: feat, fix, docs, style, refactor, test, chore
```

### Testing Requirements
- Unit tests for calculation logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Accessibility testing (WCAG AA)

## 📊 Key User Flows

### 1. Discovery → Conversion
```
Landing Page → Calculator → Lead Capture → Results → Payment
```

### 2. Documentation Collection
```
Dashboard → Company Info → R&D Activities → Expenses → Review → Submit
```

### 3. Document Generation
```
Intake Complete → Airtable Sync → Make.com Trigger → Claude Generation → PDF Creation → S3 Upload → Email Delivery
```

## 🎯 Component-Specific Guidelines

### Calculator Component
- Use ASC calculation method
- Include Section 174 warnings
- Validate contractor 65% limit
- Show confidence scoring
- Display all required disclaimers

### Dashboard
- Show progress percentage
- Auto-save every 30 seconds
- Clear next steps
- Helpful empty states

### Intake Forms
- One section at a time
- Progress indicator
- Contextual help text
- Save and resume functionality

## 🔍 Common Implementation Patterns

### API Calls
```typescript
// Use the API service layer
import { calculatorService } from '@/services/calculator.service';

const result = await calculatorService.estimate({
  businessType: 'agency',
  qualifyingActivities: ['custom_gpt', 'prompt_engineering'],
  wages: { w2Wages: 500000, rdAllocation: 0.4 }
});
```

### Error Handling
```typescript
try {
  const result = await generateDocuments(intakeFormId);
} catch (error) {
  // User-friendly message
  showError('Unable to generate documents. Please try again.');
  
  // Log for debugging
  captureException(error, { intakeFormId });
}
```

### Form Validation
```typescript
// Use Zod schemas
const schema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  ein: z.string().regex(/^\d{2}-\d{7}$/, 'Format: 12-3456789'),
});
```

## 📝 Testing Checklist

Before any deployment:
- [ ] All calculations match IRS formulas
- [ ] Disclaimers appear on all pages
- [ ] No prohibited marketing language
- [ ] Section 174 warnings present
- [ ] Contractor 65% limit enforced
- [ ] Mobile responsive
- [ ] Accessibility compliant
- [ ] Error states handled
- [ ] Loading states smooth

## 🆘 Quick Answers to Common Questions

### "Will I definitely get this credit?"
"The calculator shows your potential credit based on the information provided. Actual IRS approval depends on meeting all requirements and proper documentation. We recommend consulting a tax professional."

### "Is this IRS-approved?"
"We follow IRS guidelines for R&D credit calculations, but we are not affiliated with or endorsed by the IRS. Our tool helps you prepare documentation to support your claim."

### "What about Section 174?"
"Important: For 2022-2025, you must capitalize and amortize R&D expenses over 5 years instead of deducting them immediately. This affects your cash flow even if you get the credit. Consult your tax advisor."

### "Do you guarantee audit protection?"
"We cannot guarantee audit outcomes. We provide documentation to support your R&D activities, but the IRS makes final determinations. Keep all original records and consider professional representation if audited."

## 🎉 Final Reminders

1. **We translate, not complicate** - Bridge AI experimentation and tax code
2. **Examples over explanations** - Show what qualifies with stories
3. **Compliance is critical** - Always include disclaimers
4. **SMB language always** - Their words, not tax jargon
5. **Test everything** - Calculations, copy, and user flows

When building features, ask:
- Is the calculation accurate?
- Are disclaimers visible?
- Does copy match our voice?
- Is the next step clear?
- Would an SMB understand?

**Remember**: We help businesses document their AI experiments for tax credits. We do not provide tax advice or guarantee outcomes. When in doubt, err on the side of caution and transparency.