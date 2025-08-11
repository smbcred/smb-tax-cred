# Hotfix Triage — Calculator Layout & Checkout CTA

## Calculator "looks jacked up"
- **Check Tailwind setup**: Ensure global CSS imports in `client/src/main.tsx` and `index.css` include Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`).  
- **Design tokens**: Confirm CSS variables are loaded (ThemeProvider); verify `:root` token values.  
- **Container widths**: Enforce `max-w-screen-md lg:max-w-screen-lg mx-auto p-4`.  
- **Form grid**: Prefer `grid grid-cols-1 md:grid-cols-2 gap-6`.  
- **Conflicts**: Remove legacy `.card` CSS overrides that fight Tailwind (look for `!important`).

## CTA won't let me checkout
Typical causes:
1) Form invalid (Zod schema failing) → expose errors under each field.  
2) Async gating (Stripe not ready) → `stripe` or `elements` null.  
3) Price ID or amount missing → API returns 400.  
4) Double-submit lock stuck → `isSubmitting` never resets on error.

### Recommended button logic
```tsx
const ctaDisabled = !form.formState.isValid || isSubmitting || !stripeReady || !priceId;
<Button disabled={ctaDisabled} onClick={onSubmit}>
  {isSubmitting ? "Processing…" : "Continue to Checkout"}
</Button>
```

### Debug helper (dev only)
```tsx
useEffect(() => {
  if (import.meta.env.DEV) {
    console.debug("CTA state", {
      isValid: form.formState.isValid,
      isSubmitting,
      stripeReady,
      priceId,
      lastError
    });
  }
}, [form.formState.isValid, isSubmitting, stripeReady, priceId, lastError]);
```
