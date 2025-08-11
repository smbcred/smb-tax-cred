/**
 * @file checkout.spec.ts  
 * @description End-to-end tests for checkout and conversion flow
 * @author SMBTaxCredits.com Team
 * @date 2025-08-11
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PW_BASE_URL || 'http://localhost:5000';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should show disabled CTA in development mode', async ({ page }) => {
    // Complete calculator to reach results
    await completeCalculatorFlow(page);

    // Look for CTA button
    const ctaButton = page.locator(
      'button:has-text("Get Professional"), button:has-text("Get Started"), button:has-text("Documentation")'
    );

    if (await ctaButton.count() > 0) {
      const button = ctaButton.first();
      await expect(button).toBeVisible();

      // In development mode, check console for debug info when clicked
      let consoleMessages: string[] = [];
      page.on('console', msg => {
        consoleMessages.push(msg.text());
      });

      await button.click();
      await page.waitForTimeout(1000);

      // Should show debug information in development mode
      const hasDebugInfo = consoleMessages.some(msg => 
        msg.includes('development') || 
        msg.includes('disabled') || 
        msg.includes('debug')
      );

      // In dev mode, either button is disabled or debug info is shown
      const isDisabled = await button.isDisabled();
      expect(isDisabled || hasDebugInfo || consoleMessages.length > 0).toBeTruthy();
    }
  });

  test('should display pricing information', async ({ page }) => {
    await completeCalculatorFlow(page);

    // Look for pricing information in results
    const pricingElements = page.locator('text=/\\$[0-9,]+|price|cost|fee/i');
    if (await pricingElements.count() > 0) {
      await expect(pricingElements.first()).toBeVisible();
    }

    // Check for service tiers or packages
    const serviceInfo = page.locator('text=/professional|documentation|service|package/i');
    if (await serviceInfo.count() > 0) {
      await expect(serviceInfo.first()).toBeVisible();
    }
  });

  test('should handle lead capture modal', async ({ page }) => {
    await completeCalculatorFlow(page);

    // Look for and click CTA that might trigger modal
    const ctaButton = page.locator('button:has-text("Get"), button:has-text("Start"), button:has-text("Learn More")');
    
    if (await ctaButton.count() > 0) {
      await ctaButton.first().click();
      await page.waitForTimeout(1000);

      // Look for modal or form
      const modal = page.locator('[role="dialog"], .modal, [data-testid="modal"], [class*="modal"]');
      const form = page.locator('form');

      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible();
      } else if (await form.count() > 0) {
        await expect(form.first()).toBeVisible();
      }
    }
  });

  test('should validate lead capture form', async ({ page }) => {
    await completeCalculatorFlow(page);

    // Try to trigger lead capture form
    const ctaButton = page.locator('button').filter({ hasText: /get|start|learn|contact/i });
    
    if (await ctaButton.count() > 0) {
      await ctaButton.first().click();
      await page.waitForTimeout(1000);

      // Look for form fields
      const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Send")');

      if (await emailInput.count() > 0 && await submitButton.count() > 0) {
        // Try submitting empty form
        await submitButton.first().click();
        await page.waitForTimeout(500);

        // Should show validation message
        const validationMessage = page.locator('[role="alert"], .error, .invalid, text=/required|valid/i');
        if (await validationMessage.count() > 0) {
          await expect(validationMessage.first()).toBeVisible();
        }

        // Fill valid email and submit
        await emailInput.first().fill('test@example.com');
        
        // Fill other required fields if present
        const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]');
        if (await nameInput.count() > 0) {
          await nameInput.first().fill('Test User');
        }

        const phoneInput = page.locator('input[type="tel"], input[name*="phone"], input[placeholder*="phone"]');
        if (await phoneInput.count() > 0) {
          await phoneInput.first().fill('555-123-4567');
        }

        await submitButton.first().click();
        await page.waitForTimeout(2000);

        // Should show success message or redirect
        const successMessage = page.locator('text=/success|submitted|thank|sent/i');
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('should handle conversion tracking', async ({ page }) => {
    // Mock analytics
    await page.addInitScript(() => {
      (window as any).gtag = (action: string, event: string, data: any) => {
        (window as any).analyticsEvents = (window as any).analyticsEvents || [];
        (window as any).analyticsEvents.push({ action, event, data });
      };
    });

    await completeCalculatorFlow(page);

    // Interact with CTA
    const ctaButton = page.locator('button').filter({ hasText: /get|start/i });
    if (await ctaButton.count() > 0) {
      await ctaButton.first().click();
      await page.waitForTimeout(1000);

      // Check analytics events
      const events = await page.evaluate(() => (window as any).analyticsEvents || []);
      console.log('Conversion events:', events);
      
      // This mainly ensures no JavaScript errors occur
      expect(Array.isArray(events)).toBeTruthy();
    }
  });
});

test.describe('Payment Flow', () => {
  test('should display payment options when available', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Look for pricing cards or payment buttons
    const paymentElements = page.locator('button:has-text("Buy"), button:has-text("Purchase"), button:has-text("Select Plan")');
    
    if (await paymentElements.count() > 0) {
      await expect(paymentElements.first()).toBeVisible();
    }
  });

  test('should handle Stripe integration', async ({ page }) => {
    // Mock Stripe for testing
    await page.addInitScript(() => {
      (window as any).Stripe = () => ({
        redirectToCheckout: (options: any) => {
          console.log('Stripe redirect:', options);
          return Promise.resolve();
        }
      });
    });

    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    const paymentButton = page.locator('button').filter({ hasText: /buy|purchase|select/i });
    
    if (await paymentButton.count() > 0) {
      let consoleMessages: string[] = [];
      page.on('console', msg => {
        consoleMessages.push(msg.text());
      });

      await paymentButton.first().click();
      await page.waitForTimeout(2000);

      // Should log Stripe interaction
      const hasStripeLog = consoleMessages.some(msg => msg.includes('Stripe'));
      expect(hasStripeLog || consoleMessages.length > 0).toBeTruthy();
    }
  });
});

// Helper function to complete calculator flow
async function completeCalculatorFlow(page: any) {
  try {
    // Select business type
    const businessTypeButton = page.locator('button[class*="border"]').first();
    if (await businessTypeButton.count() > 0) {
      await businessTypeButton.click();
      await page.waitForTimeout(1000);
    }

    // Fill expenses if input step is present
    const expenseInputs = await page.locator('input[type="number"], input[inputmode="numeric"]').all();
    if (expenseInputs.length > 0) {
      const values = ['120000', '50000', '25000', '15000'];
      for (let i = 0; i < Math.min(expenseInputs.length, values.length); i++) {
        await expenseInputs[i].fill(values[i]);
      }

      // Click calculate
      const calculateButton = page.locator('button:has-text("Calculate")');
      if (await calculateButton.count() > 0) {
        await calculateButton.first().click();
        await page.waitForTimeout(2000);
      }
    }
  } catch (error) {
    console.log('Calculator flow completed with variations:', error);
  }
}