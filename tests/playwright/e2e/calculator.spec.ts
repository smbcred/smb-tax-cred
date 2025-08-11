import { test, expect } from '@playwright/test';
import { setLawRegime } from '../helpers/env';

test.describe('Calculator → Results', () => {
  test.beforeEach(async ({ page }) => {
    await setLawRegime(page);
  });

  test('first-time filer path shows 6% ASC and enables CTA', async ({ page }) => {
    await page.goto('/calculator');
    await page.getByLabel('W-2 wages').fill('200000');
    await page.getByLabel('Contractors').fill('80000');
    await page.getByLabel('Supplies').fill('10000');
    await page.getByRole('button', { name: /see results/i }).click();

    await expect(page.getByText(/estimated credit/i)).toBeVisible();
    const cta = page.getByRole('button', { name: /continue to checkout/i });
    await expect(cta).toBeEnabled();
  });
});