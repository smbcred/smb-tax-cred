# SMBTaxCredits.com Compliance Fixes Task List

## Priority 1: Critical Compliance Issues

### Task 1: Fix Pricing Tiers ✅ COMPLETED
**Location:** `/client/src/services/calculation/calculator.engine.ts`
**Current Issue:** Wrong pricing tiers - only 4 tiers instead of required 7
**Required Fix:**
```
Tier 1: $0-$4,999 → $500
Tier 2: $5,000-$9,999 → $700
Tier 3: $10,000-$19,999 → $900
Tier 4: $20,000-$39,999 → $1,200
Tier 5: $40,000-$74,999 → $1,500
Tier 6: $75,000-$149,999 → $1,800
Tier 7: $150,000+ → $2,000
```
**Files to Update:**
- `/client/src/services/calculation/calculator.engine.ts` - PRICING_TIERS constant
- `/client/src/data/pricingContent.ts` - Update tiers display

### Task 2: Add Section 174 Warning
**Location:** Calculator results, dashboard, landing page
**Required Warning:** "Important: For tax years 2022-2025, R&D expenses must be capitalized and amortized over 5 years (domestic) or 15 years (foreign) instead of immediate expensing. This significantly impacts cash flow."
**Files to Update:**
- `/client/src/components/calculator/ResultsDisplay.tsx` - Add warning box
- `/client/src/components/calculator/InteractiveCalculator.tsx` - Add to help text
- `/client/src/pages/landing.tsx` - Add to FAQ or calculator section

### Task 3: Add Required Disclaimer
**Required Text:** "This tool provides estimates based on current federal tax law. Actual credits depend on your specific circumstances and IRS examination. Consult a tax professional before claiming credits."
**Files to Update:**
- `/client/src/components/calculator/InteractiveCalculator.tsx` - Footer
- `/client/src/components/calculator/ResultsDisplay.tsx` - Results section
- `/client/src/pages/landing.tsx` - Footer area
- `/client/src/components/layout/Footer.tsx` - Global footer
- `/client/src/components/leadCapture/LeadCaptureModal.tsx` - Below form

### Task 4: Update Language to "May Qualify"
**Issue:** Using definitive language instead of conditional
**Files to Update:**
- `/client/src/components/calculator/ResultsDisplay.tsx` - Change "qualifies" to "may qualify"
- `/client/src/components/leadCapture/LeadCaptureModal.tsx` - Update messaging
- `/client/src/components/marketing/HeroSection.tsx` - Update CTAs
- All calculator step components - Review language

### Task 5: Fix Lead Capture Modal Messaging
**Issue:** Says "analysis" instead of "documentation"
**Current:** "Get your complete R&D tax credit analysis"
**Should Be:** "Get your R&D tax credit documentation package"
**Files to Update:**
- `/client/src/components/leadCapture/LeadCaptureModal.tsx`

### Task 6: Remove Gradients, Use Design Tokens
**Issue:** Using gradient backgrounds instead of solid colors
**Files to Update:**
- `/client/src/components/leadCapture/LeadCaptureModal.tsx` - Remove gradient-to-br
- Use `bg-primary` (#2E5AAC) instead of gradients
- Check all components for gradient usage

### Task 7: Add Four-Part Test Visibility
**Required:** Display the four-part test prominently
1. Technological in Nature
2. Elimination of Uncertainty
3. Process of Experimentation
4. Business Component
**Files to Update:**
- `/client/src/components/calculator/steps/QualifyingActivitiesStep.tsx` - Add test display
- `/client/src/pages/landing.tsx` - Add to benefits or process section

### Task 8: Add QRE Exclusions List
**Required:** Clear list of what's NOT included
**Exclusions:**
- Land or buildings
- General admin costs
- Marketing expenses
- Foreign research
- Funded research
**Files to Update:**
- `/client/src/components/calculator/steps/ExpenseInputsStep.tsx` - Add exclusions note
- `/client/src/pages/landing.tsx` - Add to FAQ

### Task 9: Update Calculator Header Copy
**Current:** "Calculate Your R&D Tax Credit"
**Should Be:** "Calculate Your Potential Innovation Tax Credit"
**Files to Update:**
- `/client/src/components/calculator/InteractiveCalculator.tsx`

### Task 10: Add Startup Payroll Offset Info
**Required:** Mention $500,000 startup payroll offset benefit
**Files to Update:**
- `/client/src/pages/landing.tsx` - Add to benefits
- `/client/src/components/calculator/ResultsDisplay.tsx` - Add for qualifying startups

## Priority 2: Brand Positioning

### Task 11: Update Positioning Statements
**Required:** "For businesses USING AI tools, not building them"
**Files to Update:**
- `/client/src/components/marketing/HeroSection.tsx`
- `/client/src/pages/landing.tsx`
- `/client/src/data/heroContent.ts`

### Task 12: Add "Smart Friend" Voice
**Required:** Position as "The Smart Friend Who Knows Taxes"
**Files to Update:**
- Review all copy for approachable but knowledgeable tone
- Remove overly technical language

## Priority 3: Data Updates

### Task 13: Update Pricing Display Data
**Files to Update:**
- `/client/src/data/pricingContent.ts` - Match new 7-tier structure

### Task 14: Add Contractor 65% Limit Warning
**Required:** Clear warning about contractor cost limitation
**Files to Update:**
- `/client/src/components/calculator/steps/ExpenseInputsStep.tsx`

### Task 15: Update Marketing Copy
**Required Phrases:**
- "Calculate your potential credit"
- "Based on your AI experiments"
- "May qualify for federal credits"
- "Turn tests into tax savings"
**Files to Update:**
- `/client/src/data/heroContent.ts`
- `/client/src/data/benefitsContent.ts`

## Implementation Order:
1. Start with Task 1 (Pricing Tiers) - Critical calculation accuracy
2. Task 2 (Section 174 Warning) - Legal compliance
3. Task 3 (Required Disclaimer) - Legal compliance
4. Tasks 4-5 (Language updates) - Legal compliance
5. Tasks 6-10 (UI/UX fixes) - User experience
6. Tasks 11-15 (Brand/Copy) - Marketing alignment

## Testing Checklist After Each Fix:
- [ ] Calculator still functions correctly
- [ ] No console errors
- [ ] Visual appearance is correct
- [ ] Copy matches requirements
- [ ] Disclaimers are visible
- [ ] Calculations are accurate

## Notes:
- Always use "may qualify" language
- Never guarantee outcomes
- Emphasize documentation service, not tax advice
- Include Section 174 warning for 2022-2025
- Use approved design tokens only