import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const test = base.extend({
  axe: async ({ page }, use) => {
    const runAxe = async () => {
      const results = await new AxeBuilder({ page }).analyze();
      return results;
    };
    await use(runAxe);
  },
});