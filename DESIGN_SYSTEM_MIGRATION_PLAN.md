# Design System Migration Plan
## Step-by-Step Transition to New System

### Phase 1: Foundation (Color & Variables)
**Task 1: Consolidate Color Definitions** ✅ COMPLETED
- [x] Convert hex to HSL in new system
- [x] Remove duplicate color definitions in index.css
- [x] Map old R&D colors to new design tokens
- [x] Update all color utilities to use design tokens
- [x] Fix button, gradient, and component classes

**Task 2: Typography Migration** ✅ COMPLETED
- [x] Replace fixed font sizes with responsive clamp functions
- [x] Update heading styles to use new type scale (h1-h6)
- [x] Implement new line-height system
- [x] Add letter-spacing variants
- [x] Add text utilities (.text-display, .text-small, .text-micro)

### Phase 2: Layout & Spacing
**Task 3: Spacing Grid Implementation** ✅ COMPLETED
- [x] Replace arbitrary spacing with 4pt grid system
- [x] Update button, form, modal, card padding to use spacing tokens
- [x] Standardize component spacing across all utilities

**Task 4: Visual Effects** ✅ COMPLETED
- [x] Replace Tailwind shadows with design token shadows
- [x] Implement new border radius scale
- [x] Update transition timing to use design tokens

### Phase 3: Component Updates
**Task 5: Button Components**
- [ ] Migrate buttons to use new color tokens
- [ ] Update hover/focus states
- [ ] Implement consistent sizing

**Task 6: Form Elements**
- [ ] Update input styles with new tokens
- [ ] Standardize form spacing
- [ ] Update validation states

**Task 7: Card & Container Components**
- [ ] Update card shadows and borders
- [ ] Implement consistent padding
- [ ] Update hover effects

### Phase 4: Advanced Integration
**Task 8: Dark Mode Enhancement**
- [ ] Leverage ThemeProvider for dark mode
- [ ] Update dark mode color mappings
- [ ] Test all components in both modes

**Task 9: Interactive States**
- [ ] Standardize hover effects
- [ ] Update focus indicators
- [ ] Implement loading states

### Phase 5: Cleanup
**Task 10: Remove Legacy Code**
- [ ] Remove duplicate utilities
- [ ] Clean up old color classes
- [ ] Consolidate CSS files
- [ ] Update documentation

---

## Current Status: Starting Task 1 (Part 2)
Next: Remove duplicate color definitions in index.css