# Deprecated Components

## Calculator Components

### InteractiveCalculator.tsx
- **Deprecated:** January 2025
- **Reason:** Replaced with new 3-step calculator flow
- **Replacement:** Use `/calculator` route with `CreditCalculator` component
- **Location:** `client/src/components/calculator/CreditCalculator.tsx`
- **Migration:** Replace embedded calculator with Link to `/calculator`

### Usage Pattern Change:
```tsx
// OLD (deprecated)
import { InteractiveCalculator } from '@/components/calculator/InteractiveCalculator';
<InteractiveCalculator />

// NEW
import { Link } from 'wouter';
<Link to="/calculator">
  <button>Calculate Your Credit</button>
</Link>
```