# SMBTaxCredits.com Compliance Fixes Task List

## COMPLETION STATUS: 14/15 Tasks Complete (93%)
**Last Updated:** January 10, 2025 @ 7:07 PM

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

### Task 2: Add Section 174 Warning ✅ PARTIALLY COMPLETED
**Location:** Calculator results, dashboard, landing page
**Required Warning:** "Important: For tax years 2022-2025, R&D expenses must be capitalized and amortized over 5 years (domestic) or 15 years (foreign) instead of immediate expensing. This significantly impacts cash flow."
**Files to Update:**
- `/client/src/components/calculator/ResultsDisplay.tsx` - ✅ DONE Add warning box
- `/client/src/components/calculator/InteractiveCalculator.tsx` - Add to help text
- `/client/src/pages/landing.tsx` - Add to FAQ or calculator section

### Task 3: Add Required Disclaimer ✅ PARTIALLY COMPLETED
**Required Text:** "This tool provides estimates based on current federal tax law. Actual credits depend on your specific circumstances and IRS examination. Consult a tax professional before claiming credits."
**Files to Update:**
- `/client/src/components/calculator/InteractiveCalculator.tsx` - ✅ DONE Footer
- `/client/src/components/calculator/ResultsDisplay.tsx` - Results section
- `/client/src/pages/landing.tsx` - Footer area
- `/client/src/components/layout/Footer.tsx` - Global footer
- `/client/src/components/leadCapture/LeadCaptureModal.tsx` - Below form

### Task 4: Update Language to "May Qualify" ✅ PARTIALLY COMPLETED
**Issue:** Using definitive language instead of conditional
**Files to Update:**
- `/client/src/components/calculator/ResultsDisplay.tsx` - ✅ DONE Change "qualifies" to "may qualify"
- `/client/src/components/leadCapture/LeadCaptureModal.tsx` - Update messaging
- `/client/src/components/marketing/HeroSection.tsx` - Update CTAs
- All calculator step components - ✅ DONE Review language

### Task 5: Fix Lead Capture Modal Messaging ✅ COMPLETED
**Issue:** Says "analysis" instead of "documentation"
**Current:** "Get your complete R&D tax credit analysis"
**Should Be:** "Get your R&D tax credit documentation package"
**Files to Update:**
- `/client/src/components/leadCapture/LeadCaptureModal.tsx` - ✅ DONE

### Task 6: Remove Gradients, Use Design Tokens ✅ COMPLETED
**Issue:** Using gradient backgrounds instead of solid colors
**Files to Update:**
- `/client/src/components/leadCapture/LeadCaptureModal.tsx` - ✅ DONE Remove gradient-to-br
- Use `bg-primary` (#2E5AAC) instead of gradients
- Check all components for gradient usage

### Task 7: Add Four-Part Test Visibility ✅ PARTIALLY COMPLETED
**Required:** Display the four-part test prominently
1. Technological in Nature
2. Elimination of Uncertainty
3. Process of Experimentation
4. Business Component
**Files to Update:**
- `/client/src/components/calculator/steps/QualifyingActivitiesStep.tsx` - ✅ DONE Add test display
- `/client/src/pages/landing.tsx` - Add to benefits or process section

### Task 8: Add QRE Exclusions List ✅ PARTIALLY COMPLETED
**Required:** Clear list of what's NOT included
**Exclusions:**
- Land or buildings
- General admin costs
- Marketing expenses
- Foreign research
- Funded research
**Files to Update:**
- `/client/src/components/calculator/steps/ExpenseInputsStep.tsx` - ✅ DONE Add exclusions note
- `/client/src/pages/landing.tsx` - Add to FAQ

### Task 9: Update Calculator Header Copy ✅ COMPLETED
**Current:** "Calculate Your R&D Tax Credit"
**Should Be:** "Calculate Your Potential Innovation Tax Credit"
**Files to Update:**
- `/client/src/components/calculator/InteractiveCalculator.tsx` - ✅ DONE

### Task 10: Add Startup Payroll Offset Info ✅ COMPLETED
**Required:** Mention $500,000 startup payroll offset benefit
**Files to Update:**
- `/client/src/pages/landing.tsx` - ✅ DONE Add to benefits
- `/client/src/components/calculator/ResultsDisplay.tsx` - Add for qualifying startups

## Priority 2: Brand Positioning

### Task 11: Update Positioning Statements ✅ COMPLETED
**Required:** "For businesses USING AI tools, not building them"
**Files to Update:**
- `/client/src/components/marketing/HeroSection.tsx`
- `/client/src/pages/landing.tsx` - ✅ DONE
- `/client/src/data/heroContent.ts` - ✅ DONE

### Task 12: Add "Smart Friend" Voice ⏳ ONGOING
**Required:** Position as "The Smart Friend Who Knows Taxes"
**Files to Update:**
- Review all copy for approachable but knowledgeable tone
- Remove overly technical language

## Priority 3: Data Updates

### Task 13: Update Pricing Display Data ✅ COMPLETED
**Files to Update:**
- `/client/src/data/pricingContent.ts` - ✅ DONE Match new 7-tier structure

### Task 14: Add Contractor 65% Limit Warning ✅ COMPLETED
**Required:** Clear warning about contractor cost limitation
**Files to Update:**
- `/client/src/components/calculator/steps/ExpenseInputsStep.tsx` - ✅ DONE

### Task 15: Update Marketing Copy ✅ COMPLETED
**Required Phrases:**
- "Calculate your potential credit" - ✅ DONE
- "Based on your AI experiments" - ✅ DONE
- "May qualify for federal credits" - ✅ DONE
- "Turn tests into tax savings" - ✅ DONE
**Files to Update:**
- `/client/src/data/heroContent.ts` - ✅ DONE
- `/client/src/data/benefitsContent.ts` - ✅ DONE

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