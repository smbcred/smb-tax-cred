# SMBTaxCredits.com - AI Assistant Instructions

## Project Overview
This platform helps small businesses document their AI experimentation work to claim federal R&D tax credits. We convert practical test-and-learn activities into IRS-compliant documentation packages.

## Core Business Context

### What We Do
- Help SMBs claim 10-16% of AI experimentation costs as federal tax credits
- Generate IRS Form 6765, technical narratives, and compliance memos
- Provide flat-fee pricing ($500-$2,000) based on credit amount
- Deliver complete filing packages in 48 hours

### Who We Serve
Small businesses experimenting with AI tools:
- **Marketing Agencies**: Custom GPTs, prompt libraries, AI workflows
- **E-commerce**: Chatbots, recommendation engines, automations
- **Consultants**: AI analysis tools, automated reporting
- **Service Businesses**: AI scheduling, operations automation
- **Content Creators**: AI content systems, custom workflows

## Key Technical Details

## Project Knowledge Index
- **Business Logic**: See inline comments in `/src/services/`
- **UI Components**: Context in `/src/components/` headers
- **API Specs**: Documented in route handlers `/src/routes/`
- **Database Schema**: See `/database/schema.sql`

### Architecture
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express + PostgreSQL
- Integrations: Stripe, Airtable, Make.com, Claude API, Documint, AWS S3

### User Flow
1. Interactive calculator → Lead capture → Stripe payment
2. Smart intake forms → Progress dashboard
3. Automated generation → Document delivery

## AI-Specific Context

### What Qualifies as R&D
Focus on TEST-AND-LEARN activities:
- **Prompt Engineering**: Iterating prompts to improve accuracy
- **Custom GPTs**: Building specialized assistants with retrieval
- **Chatbot Tuning**: Testing responses, reducing error rates
- **Automation Workflows**: LLM-based routing and classification
- **Data Processing**: AI-powered cleanup and normalization

### Required Documentation
Users need to provide:
- Prompt/version history with change notes
- Small evaluation sets (10-50 examples)
- Before/after metrics (error rates, time saved)
- Test logs with dates and participants

## Voice and Messaging Guidelines

### Language Rules
- **Reading Level**: Grade 7-9, sentences ≤20-22 words
- **AI Mentions**: Max 2 per 150-200 words
- **Synonyms**: Rotate: assistant, automation, workflow, integration
- **Examples**: 1 concrete use case per 120-150 words

### Message Balance
- 60% outcomes (tax savings, business improvement)
- 25% process/qualification
- 15% technology

### Plain Language Terms
- R&D activities → "innovation projects"
- QREs → "eligible project costs"
- Technical uncertainty → "problems you hadn't solved before"
- Four-part test → "qualification criteria"
- Process of experimentation → "test-and-learn cycles"

## Development Guidelines

### Code Standards
- TypeScript throughout (strict mode)
- Functional React components with hooks
- Comprehensive error handling
- Mobile-first responsive design
- Accessibility (WCAG AA compliance)

### Testing Requirements
- Unit tests for calculation logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Manual QA for form workflows

### Security Priorities
- JWT authentication with bcrypt
- Input sanitization on all forms
- Rate limiting on API endpoints
- Secure file storage in S3
- PCI compliance for payments

## Common Tasks

### When Adding Features
1. Check project knowledge base for specs
2. Follow existing patterns in codebase
3. Add appropriate tests
4. Update documentation
5. Consider mobile experience

### When Fixing Bugs
1. Reproduce in development
2. Check error logs
3. Test edge cases
4. Verify fix doesn't break existing features
5. Add regression test

### When Helping Users
1. Use plain language (no tax jargon)
2. Provide AI-specific examples
3. Emphasize documentation importance
4. Focus on business outcomes
5. Keep federal-only scope clear

## Integration Points

### External Services
- **Stripe**: Payment processing, dynamic pricing tiers
- **Airtable**: Lead tracking, workflow management
- **Make.com**: Automation orchestration
- **Claude API**: Narrative generation
- **Documint**: PDF creation
- **SendGrid**: Email delivery
- **AWS S3**: Document storage

### Webhook Flows
1. Stripe payment → Create user account
2. Intake complete → Trigger Make.com workflow
3. Documents ready → Send email notification

## Quick Reference

### Pricing Tiers
- Tier 1: $0-4,999 credit → $500
- Tier 2: $5,000-9,999 → $700
- Tier 3: $10,000-19,999 → $900
- Tier 4: $20,000-39,999 → $1,200
- Tier 5: $40,000-74,999 → $1,500
- Tier 6: $75,000-149,999 → $1,800
- Tier 7: $150,000+ → $2,000

### Key Metrics
- Calculator completion rate
- Lead-to-payment conversion
- Intake form completion time
- Document generation success rate
- Customer satisfaction score

## Remember
- This is for businesses USING AI, not building it
- Emphasize test-and-learn work, not one-time setup
- Keep federal-only to reduce complexity
- Make users feel their everyday AI work has value
- Always cite knowledge base documents when available