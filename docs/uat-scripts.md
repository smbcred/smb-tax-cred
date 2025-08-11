# UAT Scripts (Copy into your tracker)

## Scenario A — New user, single year
1. Open Landing → Click "Estimate your credit".
2. Calculator: enter wages 200k, contractors 80k, supplies 10k → Continue.
3. Results: verify credit and price tier; click "Continue to checkout".
4. Checkout: pay with Stripe test card 4242 4242 4242 4242 (any future date, CVC 123). Expect success page.
5. Dashboard: see "Company Info" step 1/5.
6. Intake: complete minimal required fields; Save; Resume; Submit.
7. Docs: receive email; open dashboard; download bundle; confirm filenames.

## Scenario B — Prior QRE history
Same as A but add prior QREs and verify ASC 14% path.

## Scenario C — Failure handling
Disconnect Documint; attempt doc gen; expect user-friendly error and retry affordance.
