/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const test = base.extend({
  makeAxeBuilder: async ({ page }, use) => {
    const createAxeBuilder = () => new AxeBuilder({ page });
    await use(createAxeBuilder);
  },
});