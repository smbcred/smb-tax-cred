# UX & Flow Testing Audit — SMBTaxCredits.com

**Scope:** Calculator → Results → Checkout → Intake → Dashboard → Doc Generation.

## Part A — Heuristic Audit (Nielsen 10 applied)
1. **Visibility of status** — spinners, progress indicators (calc running, doc gen, email sent).  
2. **Match to real-world language** — SMB-friendly terms; avoid tax jargon.  
3. **User control & freedom** — Back/next, save & resume, cancel payment.  
4. **Consistency & standards** — Design tokens, button styles (`btn-primary`), form patterns.  
5. **Error prevention** — Disable impossible actions; inline validation before submit.  
6. **Recognition vs recall** — Pre-fill from prior answers; contextual tooltips.  
7. **Flexibility & efficiency** — Power shortcuts; “Use same totals as last year?”  
8. **Aesthetic & minimalist** — One primary CTA per view; trim helper text.  
9. **Help users with errors** — Clear messages + remediation steps.  
10. **Help & docs** — Inline “What’s this?” + link to FAQ.

**Pass criteria:** Each screen lists issues, severity (S0–S3), owner, fix-by date.

## Part B — Flow Acceptance Criteria
- Calculator fields validate and show confidence/§174 banner correctly.
- Results screen: price tier correct; “Continue” CTA enabled when valid.
- Checkout: Stripe test flow completes; order stored; email sent.
- Intake: autosave; progress; required docs flagged.
- Docs: successful generation; bundle available; email links work.
- Dashboard: shows statuses and download buttons.
