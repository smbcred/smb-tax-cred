import { test, expect } from '@playwright/test';

test('Intake save & resume', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('link', { name: /company info/i }).click();
  await page.getByLabel('Company Name').fill('TestCo LLC');
  await page.getByRole('button', { name: /save/i }).click();
  await page.reload();
  await expect(page.getByLabel('Company Name')).toHaveValue('TestCo LLC');
});