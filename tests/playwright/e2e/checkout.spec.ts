import { test, expect } from '@playwright/test';

test.describe('Checkout (Stripe test mode)', () => {
  test('completes payment with test card', async ({ page }) => {
    await page.goto('/results');
    await page.getByRole('button', { name: /continue to checkout/i }).click();

    // Assuming Stripe Elements hosted fields
    const frame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await frame.getByPlaceholder('Card number').fill('4242424242424242');
    await frame.getByPlaceholder('MM / YY').fill('12 / 34');
    await frame.getByPlaceholder('CVC').fill('123');
    await page.getByRole('button', { name: /pay/i }).click();

    await expect(page.getByText(/payment successful|thank you/i)).toBeVisible();
  });
});