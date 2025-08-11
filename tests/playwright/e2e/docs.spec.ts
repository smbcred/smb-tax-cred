import { test, expect } from '@playwright/test';

test('Document generation happy path', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: /generate documents/i }).click();
  await expect(page.getByText(/your documents are ready/i)).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('link', { name: /download bundle/i })).toBeVisible();
});