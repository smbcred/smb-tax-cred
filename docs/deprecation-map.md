# Deprecation Map

## Keep List - Files that appeared unused but are actually imported

### Data Content Files (ACTIVE - Keep)
- `client/src/data/benefitsContent.ts` - Used in landing.tsx
- `client/src/data/complianceContent.ts` - Used in landing.tsx  
- `client/src/data/faqContent.ts` - Used in landing.tsx
- `client/src/data/heroContent.ts` - Used in landing.tsx
- `client/src/data/pricingContent.ts` - Used in landing.tsx
- `client/src/data/processContent.ts` - Used in landing.tsx

### Successfully Archived Files

#### Test Files (DEPRECATED)
- `deprecated/client/src/lib/__tests__/pricing.test.js` - Placeholder test with no implementation

#### Unused Hooks (DEPRECATED)  
- `deprecated/client/src/hooks/use-mobile.tsx` - Mobile detection hook not used in codebase

#### Calculator Components (DEPRECATED)
- `deprecated/calculator/InteractiveCalculator.tsx` - Replaced with new 3-step calculator flow

## Build Configuration
- `tsconfig.json` updated to exclude `deprecated/**` from compilation
- `deprecated/index.ts` throws error to prevent accidental imports