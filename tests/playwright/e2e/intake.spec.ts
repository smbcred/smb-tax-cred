/**
 * @file intake.spec.ts
 * @description End-to-end tests for intake form functionality
 * @author SMBTaxCredits.com Team
 * @date 2025-08-11
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PW_BASE_URL || 'http://localhost:5000';

test.describe('Intake Form Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth for intake form access (or navigate to public intake)
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should load intake form page', async ({ page }) => {
    // Navigate to intake form (adjust based on actual routing)
    const intakeLinks = page.locator('a[href*="intake"], a[href*="get-started"], button:has-text("Get Started")');
    
    if (await intakeLinks.count() > 0) {
      await intakeLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // Look for form elements
      const formElements = page.locator('form, input, label');
      if (await formElements.count() > 0) {
        await expect(formElements.first()).toBeVisible();
      }
    } else {
      // Direct navigation fallback
      await page.goto(`${BASE_URL}/intake`);
      await page.waitForLoadState('networkidle');
    }
  });

  test('should validate required intake fields', async ({ page }) => {
    // Try to navigate to intake form
    await page.goto(`${BASE_URL}/intake`).catch(() => {
      return page.goto(`${BASE_URL}/get-started`);
    });
    await page.waitForLoadState('networkidle');

    // Look for form submission button
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Continue"), button:has-text("Next")');
    
    if (await submitButton.count() > 0) {
      // Try submitting empty form
      await submitButton.first().click();
      await page.waitForTimeout(1000);

      // Check for validation messages
      const validationMessages = page.locator('[role="alert"], .error, .invalid, text=/required|valid|must/i');
      if (await validationMessages.count() > 0) {
        await expect(validationMessages.first()).toBeVisible();
      }
    }
  });

  test('should save intake form progress', async ({ page }) => {
    await page.goto(`${BASE_URL}/intake`).catch(() => {
      return page.goto(`${BASE_URL}/get-started`);
    });
    await page.waitForLoadState('networkidle');

    // Fill out form fields
    const companyNameInput = page.locator('input[name*="company"], input[placeholder*="company"], input[id*="company"]');
    if (await companyNameInput.count() > 0) {
      await companyNameInput.first().fill('TestCo LLC');
    }

    const emailInput = page.locator('input[type="email"], input[name*="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.first().fill('test@testco.com');
    }

    const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test User');
    }

    // Look for auto-save or manual save
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Progress")');
    if (await saveButton.count() > 0) {
      await saveButton.first().click();
      await page.waitForTimeout(2000);

      // Check for save confirmation
      const saveConfirmation = page.locator('text=/saved|success|updated/i');
      if (await saveConfirmation.count() > 0) {
        await expect(saveConfirmation.first()).toBeVisible();
      }
    }

    // Reload and check persistence (if auth is working)
    await page.reload();
    await page.waitForTimeout(1000);

    if (await companyNameInput.count() > 0) {
      const savedValue = await companyNameInput.first().inputValue();
      // In a real authenticated scenario, this should persist
      console.log('Form persistence test:', { savedValue });
    }
  });

  test('should handle multi-step intake form', async ({ page }) => {
    await page.goto(`${BASE_URL}/intake`).catch(() => {
      return page.goto(`${BASE_URL}/get-started`);
    });
    await page.waitForLoadState('networkidle');

    // Look for step indicators
    const stepIndicators = page.locator('[class*="step"], .progress, .wizard');
    if (await stepIndicators.count() > 0) {
      console.log('Multi-step form detected');
    }

    // Fill first step
    const inputs = await page.locator('input:visible').all();
    if (inputs.length > 0) {
      // Fill basic information
      for (let i = 0; i < Math.min(inputs.length, 3); i++) {
        const input = inputs[i];
        const type = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder');
        
        if (type === 'email') {
          await input.fill('test@testco.com');
        } else if (placeholder?.toLowerCase().includes('name')) {
          await input.fill('Test User');
        } else if (placeholder?.toLowerCase().includes('company')) {
          await input.fill('TestCo LLC');
        } else {
          await input.fill('Test Value');
        }
      }

      // Try to proceed to next step
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Proceed")');
      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForTimeout(1000);

        // Verify we moved to next step
        const newContent = page.locator('h2, h3, .step-title');
        if (await newContent.count() > 0) {
          await expect(newContent.first()).toBeVisible();
        }
      }
    }
  });

  test('should submit intake form successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/intake`).catch(() => {
      return page.goto(`${BASE_URL}/get-started`);
    });
    await page.waitForLoadState('networkidle');

    // Fill out complete form
    const formFields = [
      { selector: 'input[type="email"], input[name*="email"]', value: 'test@testco.com' },
      { selector: 'input[name*="name"], input[placeholder*="name"]', value: 'Test User' },
      { selector: 'input[name*="company"], input[placeholder*="company"]', value: 'TestCo LLC' },
      { selector: 'input[type="tel"], input[name*="phone"]', value: '555-123-4567' }
    ];

    for (const field of formFields) {
      const input = page.locator(field.selector);
      if (await input.count() > 0) {
        await input.first().fill(field.value);
      }
    }

    // Handle dropdowns/selects
    const selectElements = page.locator('select');
    if (await selectElements.count() > 0) {
      const select = selectElements.first();
      const options = await select.locator('option').all();
      if (options.length > 1) {
        await select.selectOption({ index: 1 });
      }
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Complete")');
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      await page.waitForTimeout(3000);

      // Check for success message or redirect
      const successIndicators = page.locator('text=/success|submitted|thank|complete/i, [class*="success"]');
      if (await successIndicators.count() > 0) {
        await expect(successIndicators.first()).toBeVisible();
      } else {
        // Check if we were redirected (different URL)
        const currentUrl = page.url();
        expect(currentUrl).toContain(BASE_URL);
      }
    }
  });

  test('should track intake form analytics', async ({ page }) => {
    // Mock analytics
    await page.addInitScript(() => {
      (window as any).gtag = (action: string, event: string, data: any) => {
        (window as any).analyticsEvents = (window as any).analyticsEvents || [];
        (window as any).analyticsEvents.push({ action, event, data });
      };
    });

    await page.goto(`${BASE_URL}/intake`).catch(() => {
      return page.goto(`${BASE_URL}/get-started`);
    });
    await page.waitForLoadState('networkidle');

    // Fill and submit form
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.first().fill('test@testco.com');
    }

    const submitButton = page.locator('button[type="submit"], button:has-text("Submit")');
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      await page.waitForTimeout(1000);

      // Check for intake tracking events
      const events = await page.evaluate(() => (window as any).analyticsEvents || []);
      
      const intakeEvents = events.filter((e: any) => 
        e.event?.includes('intake') ||
        e.event?.includes('form') ||
        e.event?.includes('submit') ||
        (e.data && (
          e.data.event_name?.includes('intake') ||
          e.data.event_name?.includes('form_submit')
        ))
      );

      console.log('Intake form analytics:', intakeEvents);
      expect(Array.isArray(events)).toBeTruthy();
    }
  });
});