# SMBTaxCredits.com - Complete Development Guide

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Development Workflow](#development-workflow)
3. [State Management](#state-management)
4. [Form Handling](#form-handling)
5. [Error Handling](#error-handling)
6. [Testing Strategy](#testing-strategy)
7. [Performance Optimization](#performance-optimization)
8. [Security Best Practices](#security-best-practices)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)

## Environment Setup

### Required Environment Variables
Create a `.env` file in both `client/` and `server/` folders:

#### Client (.env)
```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:3000

# Stripe Public Key
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DARK_MODE=true
```

#### Server (.env)
```bash
# Application
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/smbtaxcredits

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=24h

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Airtable
AIRTABLE_API_KEY=key...
AIRTABLE_BASE_ID=app...
AIRTABLE_TABLE_NAME=Leads

# Make.com
MAKE_WEBHOOK_URL=https://hook.make.com/...
MAKE_API_KEY=...

# Claude API
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-sonnet-20240229

# Documint
DOCUMINT_API_KEY=...
DOCUMINT_TEMPLATE_ID=...

# SendGrid
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@smbtaxcredits.com
SENDGRID_WELCOME_TEMPLATE_ID=d-...
SENDGRID_DOCUMENT_READY_TEMPLATE_ID=d-...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=smbtaxcredits-documents
AWS_REGION=us-east-1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Local Development Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd smbtaxcredits-platform

# 2. Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# 3. Set up database
createdb smbtaxcredits
cd server && npm run migrate

# 4. Start development servers
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

## Development Workflow

### Git Branch Strategy
```bash
main          # Production-ready code
├── develop   # Integration branch
├── feature/* # New features
├── fix/*     # Bug fixes
└── hotfix/*  # Emergency fixes
```

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)

# Types: feat, fix, docs, style, refactor, test, chore
# Example: feat(calculator): add multi-year support
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes following code standards
3. Write/update tests
4. Update documentation
5. Create PR with description
6. Address code review feedback
7. Merge after approval

## State Management

### Client-Side State Architecture
```typescript
// Global State (Zustand)
client/src/stores/
├── authStore.ts       # User authentication
├── calculatorStore.ts # Calculator state
├── intakeStore.ts     # Form progress
└── uiStore.ts         # UI state (modals, loading)

// Example Store
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CalculatorStore {
  results: CalculationResult | null;
  setResults: (results: CalculationResult) => void;
  clearResults: () => void;
}

export const useCalculatorStore = create<CalculatorStore>()(
  devtools(
    persist(
      (set) => ({
        results: null,
        setResults: (results) => set({ results }),
        clearResults: () => set({ results: null }),
      }),
      { name: 'calculator-storage' }
    )
  )
);
```

### Server State (React Query)
```typescript
// API Hooks
client/src/hooks/api/
├── useCalculation.ts
├── useIntakeForm.ts
├── useDocuments.ts
└── useAuth.ts

// Example Hook
import { useQuery, useMutation } from '@tanstack/react-query';
import { calculatorService } from '@/services/calculator.service';

export const useCalculation = () => {
  const calculate = useMutation({
    mutationFn: calculatorService.estimate,
    onSuccess: (data) => {
      // Handle success
    },
    onError: (error) => {
      // Handle error
    },
  });

  return { calculate };
};
```

## Form Handling

### React Hook Form Setup
```typescript
// Form Schema (Zod)
import { z } from 'zod';

export const companyInfoSchema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  ein: z.string().regex(/^\d{2}-\d{7}$/, 'Invalid EIN format'),
  entityType: z.enum(['c-corp', 's-corp', 'llc', 'partnership']),
  yearFounded: z.number().min(1900).max(new Date().getFullYear()),
});

// Form Component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const CompanyInfoForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companyInfoSchema),
  });

  const onSubmit = async (data) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('companyName')}
        className={errors.companyName ? 'form-input border-error' : 'form-input'}
      />
      {errors.companyName && (
        <span className="form-error">{errors.companyName.message}</span>
      )}
    </form>
  );
};
```

### Multi-Step Form Pattern
```typescript
// Progress tracking
const formSections = [
  { id: 'company', title: 'Company Info', component: CompanyInfoForm },
  { id: 'activities', title: 'R&D Activities', component: ActivitiesForm },
  { id: 'expenses', title: 'Expenses', component: ExpensesForm },
  { id: 'review', title: 'Review', component: ReviewForm },
];

// Auto-save functionality
const useAutoSave = (data, sectionId) => {
  const debouncedData = useDebounce(data, 3000);
  
  useEffect(() => {
    if (debouncedData) {
      saveToLocalStorage(sectionId, debouncedData);
      saveToServer(sectionId, debouncedData);
    }
  }, [debouncedData]);
};
```

## Error Handling

### Global Error Boundary
```typescript
// client/src/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// Centralized error handler
export const handleApiError = (error: any): ErrorResponse => {
  if (error.response) {
    // Server responded with error
    return {
      message: error.response.data.message || 'Server error',
      code: error.response.status,
      details: error.response.data.details,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
    };
  } else {
    // Request setup error
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }
};
```

### User-Friendly Error Messages
```typescript
const errorMessages = {
  VALIDATION_ERROR: 'Please check your input and try again',
  AUTHENTICATION_REQUIRED: 'Please log in to continue',
  PAYMENT_FAILED: 'Payment could not be processed. Please try another card.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment.',
  INTAKE_INCOMPLETE: 'Please complete all required sections',
};
```

## Testing Strategy

### Unit Testing (Vitest)
```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { CalculatorButton } from './CalculatorButton';

describe('CalculatorButton', () => {
  it('shows loading state during calculation', async () => {
    render(<CalculatorButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// API integration test
describe('Calculator API', () => {
  it('returns correct calculation for agency', async () => {
    const mockData = {
      businessType: 'agency',
      qualifyingActivities: ['custom_gpt', 'prompt_engineering'],
      wages: { w2Wages: 500000, rdAllocation: 0.4 },
    };

    const result = await calculatorService.estimate(mockData);
    
    expect(result.federalCredit).toBeGreaterThan(0);
    expect(result.pricingTier).toBeBetween(1, 7);
  });
});
```

### E2E Testing (Playwright)
```typescript
// Critical user flow test
test('complete purchase flow', async ({ page }) => {
  // 1. Calculate credit
  await page.goto('/');
  await page.click('text=Calculate My Credit');
  await fillCalculatorForm(page);
  
  // 2. Capture lead
  await page.fill('[name=email]', 'test@example.com');
  await page.click('text=See My Results');
  
  // 3. Complete payment
  await page.click('text=Get Started');
  await fillStripeForm(page);
  
  // Verify success
  await expect(page).toHaveURL('/dashboard');
});
```

## Performance Optimization

### Frontend Optimization
```typescript
// Code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Image optimization
import { LazyLoadImage } from 'react-lazy-load-image-component';

// Memoization
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => 
    processData(data), [data]
  );
  return <div>{processedData}</div>;
});

// Virtual scrolling for long lists
import { FixedSizeList } from 'react-window';
```

### API Optimization
```typescript
// Response caching
app.get('/api/calculator/factors', 
  cache('5 minutes'),
  (req, res) => {
    // Return calculation factors
  }
);

// Database query optimization
const getCompanyWithDetails = async (id) => {
  return db.company.findUnique({
    where: { id },
    include: {
      calculations: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      intakeForms: {
        where: { status: 'completed' },
      },
    },
  });
};
```

## Security Best Practices

### Input Validation
```typescript
// Server-side validation
import { body, validationResult } from 'express-validator';

router.post('/api/calculator/estimate',
  [
    body('businessType').isIn(['agency', 'ecommerce', 'saas']),
    body('wages.w2Wages').isNumeric().isInt({ min: 0, max: 10000000 }),
    body('qualifyingActivities').isArray({ min: 1, max: 10 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

### Authentication Middleware
```typescript
export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await getUserById(decoded.userId);
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
```

### Data Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user input
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [] 
  });
};

// SQL injection prevention (using parameterized queries)
const getCompany = async (ein: string) => {
  return db.query(
    'SELECT * FROM companies WHERE ein = $1',
    [ein]
  );
};
```

## Deployment Guide

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates ready
- [ ] Error tracking configured
- [ ] Analytics implemented
- [ ] Rate limiting configured
- [ ] Backup strategy in place

### Production Build
```bash
# Frontend build
cd client
npm run build
# Output in client/dist/

# Backend build
cd server
npm run build
# Output in server/dist/
```

### Deployment Configuration
```yaml
# Example PM2 config
module.exports = {
  apps: [{
    name: 'smbtaxcredits-api',
    script: './server/dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
  }]
};
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check PostgreSQL is running
pg_ctl status

# Verify connection string
psql $DATABASE_URL

# Check migrations
npm run migrate:status
```

#### 2. Build Failures
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check for type errors
npm run type-check

# Verify import paths
npm run lint
```

#### 3. API Integration Issues
```javascript
// Enable debug mode
localStorage.setItem('DEBUG', 'api:*');

// Check network tab
// Verify CORS headers
// Check API response format
```

#### 4. Stripe Webhook Failures
```bash
# Test webhook locally
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Verify webhook secret
# Check event types
# Review Stripe logs
```

### Debug Mode
```typescript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode enabled');
  
  // Log all API requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
  
  // Log all database queries
  db.$on('query', (e) => {
    console.log('Query:', e.query);
  });
}
```

### Performance Monitoring
```typescript
// Client-side metrics
const reportWebVitals = (metric) => {
  console.log(metric);
  // Send to analytics
};

// Server-side monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

## Additional Resources

### Internal Documentation
- `/docs/project-specs.md` - Technical specifications
- `/docs/api-documentation.md` - API reference
- `/docs/business-rules.md` - Business logic
- `/docs/design-system.md` - UI/UX guidelines
- `/docs/ai-examples.md` - AI use case library

### External Resources
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe API Reference](https://stripe.com/docs/api)

### Support Channels
- GitHub Issues - Bug reports and feature requests
- Slack #dev channel - Development discussions
- Email: dev@smbtaxcredits.com - Technical support