# Analytics QA

- `calc.started` fires on step 1; `calc.completed` on results.  
- `payment.succeeded` via Stripe webhook.  
- `intake.submitted`, `docs.generated`, `docs.downloaded` all emit with IDs.  
- No PII in event payloads (hash emails).