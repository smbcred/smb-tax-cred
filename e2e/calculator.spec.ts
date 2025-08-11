// End-to-end tests for calculator flow
import { test, expect } from '@playwright/test';

test.describe('R&D Tax Credit Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full calculator flow', async ({ page }) => {
    // Navigate to calculator
    await page.click('text=Calculate Your Credit');
    await expect(page).toHaveURL(/.*calculator/);

    // Step 1: Business Information
    await page.selectOption('[data-testid="business-type"]', 'consulting');
    await page.fill('[data-testid="annual-revenue"]', '500000');
    await page.fill('[data-testid="employee-count"]', '10');
    await page.click('[data-testid="next-step"]');

    // Step 2: AI Activities
    await page.check('[data-testid="activity-process-automation"]');
    await page.fill('[data-testid="time-spent"]', '25');
    await page.fill('[data-testid="team-size"]', '3');
    await page.click('[data-testid="next-step"]');

    // Step 3: Expense Input
    await page.fill('[data-testid="salaries"]', '150000');
    await page.fill('[data-testid="contractors"]', '50000');
    await page.fill('[data-testid="software"]', '10000');
    await page.fill('[data-testid="training"]', '5000');
    await page.click('[data-testid="calculate"]');

    // Step 4: Results
    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="federal-credit"]')).toContainText('$');
    await expect(page.locator('[data-testid="ases-credit"]')).toContainText('$');
    await expect(page.locator('[data-testid="total-savings"]')).toContainText('$');

    // Verify lead capture modal appears
    await page.click('[data-testid="get-documents"]');
    await expect(page.locator('[data-testid="lead-capture-modal"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('text=Calculate Your Credit');
    
    // Try to proceed without filling required fields
    await page.click('[data-testid="next-step"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="error-business-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-annual-revenue"]')).toBeVisible();
  });

  test('should handle invalid expense values', async ({ page }) => {
    await page.click('text=Calculate Your Credit');
    
    // Fill minimum required fields to get to expenses
    await page.selectOption('[data-testid="business-type"]', 'consulting');
    await page.fill('[data-testid="annual-revenue"]', '500000');
    await page.fill('[data-testid="employee-count"]', '10');
    await page.click('[data-testid="next-step"]');
    
    await page.check('[data-testid="activity-process-automation"]');
    await page.fill('[data-testid="time-spent"]', '25');
    await page.fill('[data-testid="team-size"]', '3');
    await page.click('[data-testid="next-step"]');
    
    // Enter invalid expense values
    await page.fill('[data-testid="salaries"]', '-1000');
    await page.click('[data-testid="calculate"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="error-salaries"]')).toBeVisible();
  });

  test('should track analytics events', async ({ page }) => {
    // Mock analytics tracking
    await page.addInitScript(() => {
      window.analyticsEvents = [];
      window.analytics = {
        track: (event, properties) => {
          window.analyticsEvents.push({ event, properties });
        }
      };
    });

    await page.click('text=Calculate Your Credit');
    
    // Verify page view tracking
    const events = await page.evaluate(() => window.analyticsEvents);
    expect(events.some(e => e.event === 'page_view')).toBeTruthy();
  });

  test('should be accessible', async ({ page }) => {
    await page.click('text=Calculate Your Credit');
    
    // Check for proper ARIA labels and roles
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    await expect(page.locator('[aria-describedby]')).toHaveCount(3); // Form fields with descriptions
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    await page.click('text=Calculate Your Credit');
    
    // Verify mobile-specific elements
    await expect(page.locator('[data-testid="mobile-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
    
    // Test touch interactions
    await page.tap('[data-testid="business-type"]');
    await expect(page.locator('[data-testid="business-type-options"]')).toBeVisible();
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.click('text=Calculate Your Credit');
    
    // Should show loading states
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });
});

test.describe('Lead Capture Flow', () => {
  test('should complete lead capture successfully', async ({ page }) => {
    // Complete calculator first
    await page.goto('/calculator');
    
    // Fill out calculator (abbreviated)
    await page.selectOption('[data-testid="business-type"]', 'consulting');
    await page.fill('[data-testid="annual-revenue"]', '500000');
    await page.fill('[data-testid="employee-count"]', '10');
    await page.click('[data-testid="next-step"]');
    
    await page.check('[data-testid="activity-process-automation"]');
    await page.fill('[data-testid="time-spent"]', '25');
    await page.fill('[data-testid="team-size"]', '3');
    await page.click('[data-testid="next-step"]');
    
    await page.fill('[data-testid="salaries"]', '150000');
    await page.click('[data-testid="calculate"]');
    
    // Open lead capture
    await page.click('[data-testid="get-documents"]');
    
    // Fill lead capture form
    await page.fill('[data-testid="lead-email"]', 'test@example.com');
    await page.fill('[data-testid="lead-firstName"]', 'John');
    await page.fill('[data-testid="lead-lastName"]', 'Doe');
    await page.fill('[data-testid="lead-company"]', 'Test Company');
    await page.fill('[data-testid="lead-phone"]', '555-0123');
    
    await page.click('[data-testid="submit-lead"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="lead-success"]')).toBeVisible();
    await expect(page.locator('text=Thank you')).toBeVisible();
  });

  test('should validate lead capture form', async ({ page }) => {
    await page.goto('/calculator');
    
    // Get to results quickly
    await page.evaluate(() => {
      // Mock completed calculator state
      window.localStorage.setItem('calculator-results', JSON.stringify({
        qualified: { total: 100000 },
        credit: { federal: 20000, ases: 1200 },
        savings: { total: 21200 }
      }));
    });
    
    await page.reload();
    await page.click('[data-testid="get-documents"]');
    
    // Submit without required fields
    await page.click('[data-testid="submit-lead"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-firstName"]')).toBeVisible();
  });
});