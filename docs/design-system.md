# SMBTaxCredits.com - Design System Documentation

## Overview
This design system ensures visual consistency across the SMBTaxCredits.com platform. It implements the AI-forward brand identity with a focus on clarity, trust, and professional simplicity for SMB owners.

## Design Principles

### 1. Clarity First
- Use plain language (Grade 7-9 reading level)
- Minimize cognitive load with clear visual hierarchy
- One primary action per screen
- Generous white space

### 2. Trust Through Consistency
- Predictable interactions
- Professional but approachable
- Security and compliance emphasized visually
- IRS-ready documentation feel

### 3. Mobile-First Responsive
- Touch targets minimum 44px
- Readable typography at all sizes
- Optimized for quick mobile sessions
- Progressive enhancement for desktop

## Color System

### Core Palette
```css
--color-ink: #0B0C0E;        /* Primary text */
--color-graphite: #1C1E22;   /* Headers */
--color-slate: #3B3F45;      /* Secondary text */
--color-ash: #8A9099;        /* Muted text */
--color-cloud: #F5F7FA;      /* Backgrounds */
--color-paper: #FFFFFF;      /* Main background */
```

### Brand Colors
```css
--color-blue: #2E5AAC;       /* Primary CTAs */
--color-emerald: #1E8E5A;    /* Success states */
```

### Usage Guidelines
- **Blue**: Primary actions, links, focus states
- **Emerald**: Success messages, completed states, savings amounts
- **Ink/Slate**: Text hierarchy
- **Cloud**: Section backgrounds, hover states

### Accessibility
- All text meets WCAG AA contrast requirements
- Focus states use 2px offset ring
- Never rely on color alone for meaning

## Typography

### Font Stack
```css
font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
```

### Type Scale
| Token | Size | Line Height | Usage |
|-------|------|-------------|--------|
| Display | 56px | 1.2 | Hero headlines |
| H1 | 36px | 1.25 | Page titles |
| H2 | 28px | 1.3 | Section headers |
| H3 | 22px | 1.35 | Subsections |
| Body | 16px | 1.6 | Default text |
| Small | 14px | 1.5 | Helper text |
| Micro | 12px | 1.4 | Badges, labels |

### Font Weights
- **Bold (700)**: Headlines H1-H3
- **Semibold (600)**: H4, buttons, emphasis
- **Medium (500)**: Labels, navigation
- **Regular (400)**: Body text

## Spacing System

### Base Unit: 4px
```
4px   (--space-1)
8px   (--space-2)
12px  (--space-3)
16px  (--space-4)
24px  (--space-6)
32px  (--space-8)
48px  (--space-12)
64px  (--space-16)
```

### Application
- **Component padding**: 24px (desktop), 16px (mobile)
- **Section spacing**: 64px (desktop), 48px (mobile)
- **Form field spacing**: 16px between fields
- **Button padding**: 12px vertical, 24px horizontal

## Component Library

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">
  Calculate My R&D Credit
</button>
```
- Blue background, white text
- Used for main CTAs
- Hover: Darken 6%, subtle lift
- Focus: 2px blue ring

#### Secondary Button
```html
<button class="btn btn-secondary">
  Learn More
</button>
```
- White background, border
- Supporting actions
- Hover: Cloud background

#### Success Button
```html
<button class="btn btn-success">
  Complete & Save
</button>
```
- Emerald background
- Completion actions
- Used sparingly

### Form Elements

#### Text Input
```html
<div class="form-group">
  <label class="form-label">Company Name</label>
  <input type="text" class="form-input" placeholder="Enter your company name">
  <span class="form-help">As it appears on tax documents</span>
</div>
```
- 44px minimum height
- Hover state with cloud background
- Focus: Blue border with soft shadow
- Always include labels

#### Validation States
```html
<!-- Error State -->
<input class="form-input border-error">
<span class="form-error">Please enter a valid EIN</span>

<!-- Success State -->
<input class="form-input border-emerald">
<span class="text-emerald text-sm">✓ Valid format</span>
```

### Cards
```html
<div class="card">
  <h3 class="text-h3 mb-4">Your Estimated Credit</h3>
  <p class="text-display text-blue">$45,320</p>
  <p class="text-muted">Based on your AI experimentation</p>
</div>
```
- Subtle shadow on hover
- 1px border
- 24-32px padding

### Alerts
```html
<div class="alert alert-info">
  <strong>Did you know?</strong> 
  Prompt engineering qualifies as R&D experimentation.
</div>
```
- Left border for emphasis
- Icon + title + body pattern
- Four variants: info, success, warning, error

## Layout Patterns

### Container
```html
<div class="container">
  <!-- Max width: 1200px, responsive padding -->
</div>
```

### Grid System
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Responsive columns -->
</div>
```

### Section Spacing
```html
<section class="py-16 md:py-24">
  <div class="container">
    <!-- Section content -->
  </div>
</section>
```

## Animation Guidelines

### Transitions
- **Fast**: 150ms (hover states)
- **Base**: 200ms (most transitions)
- **Slow**: 300ms (modals, page transitions)

### Easing
```css
--ease-out: cubic-bezier(0.2, 0.6, 0.2, 1);
```

### Common Animations
- **Fade In**: Opacity + subtle upward movement
- **Scale**: Buttons on click (0.98 scale)
- **Slide**: Mobile menu, dropdowns

## Responsive Breakpoints

```css
sm: 640px   /* Tablet portrait */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Wide desktop */
```

### Mobile-First Approach
```css
/* Mobile default */
.text-h2 { font-size: 24px; }

/* Tablet and up */
@media (min-width: 768px) {
  .text-h2 { font-size: 28px; }
}
```

## Icon System

### Icon Library: Lucide React
- 1.5px stroke weight
- 20px default size
- Monochrome (use currentColor)

### Common Icons
- Calculator → Calculate
- CheckCircle → Success
- AlertCircle → Information
- FileText → Documents
- Download → Export/Download
- ChevronRight → Navigation

## Data Visualization

### Color Order
1. Brand Blue (#2E5AAC)
2. Emerald (#1E8E5A)
3. Slate (#3B3F45)
4. Purple (#9B59B6)
5. Amber (#B78103)

### Chart Guidelines
- 2px line width
- 12-16% opacity for area fills
- Always include axis labels
- Tooltips on hover

## Implementation

### CSS Architecture
1. **Global Styles** (`global-styles.css`)
   - CSS custom properties
   - Base reset
   - Typography
   - Utility classes

2. **Tailwind Config** (`tailwind.config.js`)
   - Extended theme
   - Custom components
   - Plugin configuration

3. **Theme Provider** (`ThemeProvider.tsx`)
   - React context for theme
   - Dark mode support
   - Responsive hooks

### Usage in Components

#### With Tailwind
```jsx
<button className="bg-blue text-paper px-6 py-3 rounded-md hover:bg-blue-600 transition-colors">
  Get Started
</button>
```

#### With CSS Classes
```jsx
<button className="btn btn-primary">
  Get Started
</button>
```

#### With Theme Hook
```jsx
const { theme, mode } = useTheme();
const colors = useThemeColors();

<div style={{ color: colors.text.primary }}>
  Content adapts to light/dark mode
</div>
```

## Best Practices

### Do's
- ✅ Use semantic color names (blue, emerald) not hex values
- ✅ Maintain consistent spacing using the 4px grid
- ✅ Test all interactions on mobile devices
- ✅ Include focus states for keyboard navigation
- ✅ Use loading states for async operations
- ✅ Provide clear error messages with next steps
- ✅ Keep forms simple with progressive disclosure

### Don'ts
- ❌ Create new colors outside the palette
- ❌ Use more than 2 font weights per component
- ❌ Center-align long paragraphs
- ❌ Use animations longer than 300ms
- ❌ Stack multiple modals or overlays
- ❌ Use color as the only indicator of state
- ❌ Create custom breakpoints

## Component Examples

### Calculator Result Card
```jsx
<div className="card bg-blue-50 border-blue-200">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-h3">Your Estimated Federal Credit</h3>
    <Badge variant="primary">2024 Tax Year</Badge>
  </div>
  
  <div className="text-center py-8">
    <p className="text-display text-blue mb-2">$45,320</p>
    <p className="text-muted">Based on qualifying AI experiments</p>
  </div>
  
  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
    <div>
      <p className="text-small text-muted">Service Fee</p>
      <p className="font-semibold">$1,200</p>
    </div>
    <div>
      <p className="text-small text-muted">Your Net Benefit</p>
      <p className="font-semibold text-emerald">$44,120</p>
    </div>
  </div>
  
  <button className="btn btn-primary w-full mt-6">
    Start Documentation →
  </button>
</div>
```

### Progress Indicator
```jsx
<div className="space-y-2">
  <div className="flex justify-between text-small">
    <span>Documentation Progress</span>
    <span className="text-muted">65% Complete</span>
  </div>
  <div className="h-2 bg-cloud rounded-full overflow-hidden">
    <div 
      className="h-full bg-blue rounded-full transition-all duration-500"
      style={{ width: '65%' }}
    />
  </div>
</div>
```

### Mobile Navigation
```jsx
<nav className="fixed inset-x-0 bottom-0 bg-paper border-t md:hidden">
  <div className="grid grid-cols-4 gap-1 p-2">
    <button className="flex flex-col items-center py-2 text-small">
      <Calculator className="w-5 h-5 mb-1" />
      <span>Calculate</span>
    </button>
    <button className="flex flex-col items-center py-2 text-small text-blue">
      <FileText className="w-5 h-5 mb-1" />
      <span>Documents</span>
    </button>
    {/* More navigation items */}
  </div>
</nav>
```

## AI-Specific UI Patterns

### Experiment Card
```jsx
<div className="card hover:shadow-md transition-shadow">
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <h4 className="font-semibold mb-1">Customer Service Chatbot</h4>
      <p className="text-small text-muted mb-3">
        Reduced support tickets by 40% through prompt optimization
      </p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="secondary">Prompt Engineering</Badge>
        <Badge variant="secondary">Custom GPT</Badge>
        <Badge variant="secondary">12 Iterations</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-small">
        <div>
          <span className="text-muted">Before:</span>
          <span className="ml-1">30% error rate</span>
        </div>
        <div>
          <span className="text-muted">After:</span>
          <span className="ml-1 text-emerald">5% error rate</span>
        </div>
      </div>
    </div>
    
    <button className="text-blue hover:text-blue-600">
      <Edit className="w-5 h-5" />
    </button>
  </div>
</div>
```

### Qualification Checklist
```jsx
<div className="space-y-3">
  <label className="flex items-start p-4 border rounded-lg hover:bg-cloud cursor-pointer">
    <input type="checkbox" className="mt-0.5 mr-3" />
    <div>
      <p className="font-medium">Iterative Testing</p>
      <p className="text-small text-muted">
        You tested multiple versions and tracked improvements
      </p>
    </div>
  </label>
  
  <label className="flex items-start p-4 border rounded-lg hover:bg-cloud cursor-pointer">
    <input type="checkbox" className="mt-0.5 mr-3" />
    <div>
      <p className="font-medium">Documentation</p>
      <p className="text-small text-muted">
        You kept records of changes and results
      </p>
    </div>
  </label>
</div>
```

## Dark Mode Considerations

### Color Mappings
```css
/* Light Mode → Dark Mode */
--color-ink → --color-cloud
--color-paper → --color-graphite
--color-cloud → --color-ink
--color-border → --color-slate
```

### Implementation
```jsx
// Automatic with Tailwind
<div className="bg-paper dark:bg-graphite text-ink dark:text-cloud">
  Content adapts automatically
</div>

// Using Theme Hook
const isDark = useIsDarkMode();
const bgColor = isDark ? theme.colors.graphite : theme.colors.paper;
```

## Performance Guidelines

### Image Optimization
- Use WebP with fallbacks
- Implement lazy loading
- Provide width/height to prevent layout shift
- Use responsive images with srcset

### CSS Performance
- Minimize custom CSS outside Tailwind
- Use CSS custom properties for dynamic values
- Avoid complex selectors
- Leverage Tailwind's JIT compiler

### Animation Performance
- Use transform and opacity for animations
- Avoid animating layout properties
- Use will-change sparingly
- Prefer CSS animations over JavaScript

## Accessibility Checklist

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Clear focus indicators (2px ring)
- [ ] Logical tab order
- [ ] Skip links for main content

### Screen Readers
- [ ] Semantic HTML structure
- [ ] Descriptive labels for forms
- [ ] Alt text for informational images
- [ ] ARIA labels where needed

### Visual Accessibility
- [ ] AA contrast ratios (4.5:1 normal, 3:1 large)
- [ ] Don't rely on color alone
- [ ] Sufficient touch targets (44px)
- [ ] Readable font sizes (16px minimum)

## Testing Your Implementation

### Visual Regression
1. Test all components in light/dark mode
2. Verify responsive breakpoints
3. Check hover/focus/active states
4. Validate loading and error states

### Cross-Browser
- Chrome/Edge (Chromium)
- Safari (WebKit)
- Firefox (Gecko)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Device Testing
- iPhone SE (small mobile)
- iPhone 14 (standard mobile)
- iPad (tablet)
- 13" laptop (small desktop)
- 27" display (large desktop)

## Resources

### Design Files
- Figma: [Link to design system]
- Icons: [Lucide React](https://lucide.dev)
- Fonts: [Inter on Google Fonts](https://fonts.google.com/specimen/Inter)

### Development Tools
- [Tailwind CSS](https://tailwindcss.com)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)

### Related Documentation
- `/docs/project-specs.md` - Technical specifications
- `/docs/business-rules.md` - Business logic
- `/docs/ai-examples.md` - AI use case examples

## Version History

### v1.0.0 (2024-01-15)
- Initial design system release
- Core color palette and typography
- Component library foundation
- Responsive grid system
- Dark mode support