# SMBTaxCredits.com - Code Standards & Best Practices

## TypeScript Standards

### Type Safety
```typescript
// ❌ Avoid 'any' type
const processData = (data: any) => { };

// ✅ Use specific types
interface UserData {
  id: string;
  email: string;
  company: CompanyInfo;
}
const processData = (data: UserData) => { };
```

### Interface Naming
```typescript
// ✅ Use 'I' prefix for interfaces (optional, be consistent)
interface IUser { }
interface ICompany { }

// ✅ Or descriptive names without prefix
interface UserProfile { }
interface CompanyDetails { }

// Types for API responses
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

### Enum Usage
```typescript
// ✅ Use const enums for better performance
const enum BusinessType {
  Agency = 'agency',
  Ecommerce = 'ecommerce',
  SaaS = 'saas',
}

// ✅ String enums for serialization
enum IntakeStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}
```

## React Component Standards

### Component Structure
```typescript
// ✅ Functional components with TypeScript
interface CalculatorProps {
  onComplete: (result: CalculationResult) => void;
  initialValues?: Partial<CalculatorInputs>;
}

export const Calculator: React.FC<CalculatorProps> = ({ 
  onComplete, 
  initialValues 
}) => {
  // 1. Hooks (order matters)
  const [state, setState] = useState();
  const { user } = useAuth();
  
  // 2. Derived state
  const isValid = useMemo(() => validateInputs(state), [state]);
  
  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, [dependency]);
  
  // 4. Handlers
  const handleSubmit = useCallback(() => {
    // Handler logic
  }, [dependency]);
  
  // 5. Render
  return <div>Component</div>;
};
```

### Component Naming
```typescript
// ✅ PascalCase for components
export const UserDashboard = () => { };

// ✅ Descriptive names
export const CreditCalculatorForm = () => { };
export const IntakeProgressBar = () => { };

// ❌ Avoid generic names
export const Form = () => { };
export const Modal = () => { };
```

### Props Interface
```typescript
// ✅ Separate props interface
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

// ✅ Default props with destructuring
export const Button: React.FC<ButtonProps> = ({
  variant,
  size = 'md',
  onClick,
  children,
  disabled = false,
}) => { };
```

## File Organization

### File Naming
```
components/
  Calculator/
    Calculator.tsx          # Main component
    Calculator.test.tsx     # Tests
    Calculator.module.css   # Styles (if not using Tailwind)
    index.ts               # Export
    types.ts               # Component-specific types
    utils.ts               # Helper functions
```

### Import Order
```typescript
// 1. External imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 2. Internal imports - absolute paths
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

// 3. Internal imports - relative paths
import { calculateCredit } from './utils';
import type { CalculatorProps } from './types';

// 4. Styles
import styles from './Calculator.module.css';
```

## API Design Standards

### RESTful Endpoints
```
GET    /api/users/:id          # Get single resource
GET    /api/users              # Get collection
POST   /api/users              # Create resource
PUT    /api/users/:id          # Update entire resource
PATCH  /api/users/:id          # Update partial resource
DELETE /api/users/:id          # Delete resource
```

### Response Format
```typescript
// Success response
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe"
  },
  "meta": {
    "timestamp": "2024-01-15T10:00:00Z"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid format"
    }
  }
}
```

### HTTP Status Codes
```typescript
// Success
200 OK                  // GET, PUT, PATCH
201 Created            // POST
204 No Content         // DELETE

// Client Errors
400 Bad Request        // Invalid syntax
401 Unauthorized       // No auth
403 Forbidden          // No permission
404 Not Found          // Resource not found
422 Unprocessable      // Validation error

// Server Errors
500 Internal Error     // Server fault
503 Service Unavailable // Maintenance
```

## State Management

### Store Organization
```typescript
// ✅ Single responsibility stores
// stores/authStore.ts
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// ✅ Derived state with selectors
const selectUserCompany = (state: AuthStore) => state.user?.company;
```

### Action Naming
```typescript
// ✅ Verb + Noun pattern
setUser(user);
updateProfile(data);
deleteDocument(id);
fetchCalculations();

// ❌ Avoid ambiguous names
handle(data);
process();
update();
```

## CSS/Styling Standards

### Tailwind Class Order
```jsx
// ✅ Consistent order: layout → spacing → typography → colors → effects
<div className="
  flex items-center justify-between
  p-4 mx-auto
  text-lg font-semibold
  bg-white text-gray-900
  rounded-lg shadow-md hover:shadow-lg
  transition-shadow duration-200
">
```

### Component-Specific Styles
```css
/* Use CSS Modules for complex components */
.calculator {
  /* Use CSS custom properties for dynamic values */
  --progress: 0%;
  
  /* Compose with utility classes */
  @apply rounded-lg border border-gray-200;
  
  /* Component-specific styles */
  background: linear-gradient(
    to right,
    theme('colors.blue.500') var(--progress),
    theme('colors.gray.100') var(--progress)
  );
}
```

## Testing Standards

### Test File Structure
```typescript
describe('Calculator', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  describe('when calculating federal credit', () => {
    it('should return correct amount for agency', () => {
      // Arrange
      const input = { businessType: 'agency', wages: 100000 };
      
      // Act
      const result = calculateCredit(input);
      
      // Assert
      expect(result.federalCredit).toBe(14000);
    });

    it('should handle edge cases', () => {
      // Test edge cases
    });
  });
});
```

### Test Naming
```typescript
// ✅ Descriptive test names
it('should display error message when email is invalid');
it('should calculate 14% credit for qualified wages');
it('should disable submit button during processing');

// ❌ Vague test names
it('works correctly');
it('handles errors');
```

## Error Handling

### Try-Catch Pattern
```typescript
// ✅ Specific error handling
try {
  const result = await api.calculateCredit(data);
  return { success: true, data: result };
} catch (error) {
  if (error instanceof ValidationError) {
    return { success: false, error: error.message };
  }
  if (error instanceof NetworkError) {
    return { success: false, error: 'Network connection failed' };
  }
  // Log unexpected errors
  console.error('Unexpected error:', error);
  return { success: false, error: 'An unexpected error occurred' };
}
```

### Error Boundaries
```typescript
// ✅ Component-specific error boundaries
<ErrorBoundary fallback={<CalculatorError />}>
  <Calculator />
</ErrorBoundary>
```

## Performance Guidelines

### Memoization
```typescript
// ✅ Memoize expensive calculations
const expensiveResult = useMemo(() => {
  return calculateComplexValue(data);
}, [data]);

// ✅ Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Lazy Loading
```typescript
// ✅ Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));

// ✅ Code split by route
const routes = [
  {
    path: '/dashboard',
    element: <Suspense fallback={<Loading />}><Dashboard /></Suspense>
  }
];
```

## Documentation Standards

### JSDoc Comments
```typescript
/**
 * Calculates the federal R&D tax credit based on qualified expenses
 * @param {CalculatorInputs} inputs - The calculation inputs
 * @param {TaxYear} taxYear - The tax year for calculation
 * @returns {CalculationResult} The calculated credit and breakdown
 * @throws {ValidationError} If inputs are invalid
 * @example
 * const result = calculateCredit({
 *   businessType: 'agency',
 *   wages: { w2Wages: 500000, rdAllocation: 0.4 }
 * }, 2024);
 */
export function calculateCredit(
  inputs: CalculatorInputs,
  taxYear: TaxYear
): CalculationResult {
  // Implementation
}
```

### Inline Comments
```typescript
// ✅ Explain why, not what
// Apply 65% limitation to contractor costs per IRS Section 41
const qualifiedContractors = contractors * 0.65;

// ❌ Redundant comments
// Set user to null
setUser(null);
```

## Git Commit Standards

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples
```bash
feat(calculator): add multi-year credit support

- Added year selection dropdown
- Updated calculation logic for 2022-2024 rules
- Added tests for each tax year

Closes #123

---

fix(auth): resolve token refresh race condition

Previously, multiple simultaneous requests could trigger multiple
refresh attempts. Now using a singleton promise to ensure only
one refresh happens at a time.

---

docs(api): update endpoint documentation

- Added response examples
- Clarified error codes
- Fixed typos in descriptions
```

### Type Prefixes
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons)
- `refactor`: Code change without feature/fix
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tools

## Code Review Checklist

Before submitting PR:
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] All TODOs addressed or ticketed
- [ ] Types properly defined (no `any`)
- [ ] Error cases handled
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] Accessibility checked
- [ ] Tests written/updated
- [ ] Documentation updated