/**
 * Client-side law regime utilities
 * Helps with conditional rendering and feature detection
 */

import type { LawRegime } from '../hooks/useLawRegime';

/**
 * Get law regime from environment
 */
export function getCurrentLawRegime(): LawRegime {
  const regime = import.meta.env.VITE_LAW_REGIME as LawRegime;
  return regime && ['current', 'legacy', 'proposed'].includes(regime) ? regime : 'current';
}

/**
 * Check if a specific law regime feature is enabled
 */
export function isFeatureEnabled(feature: string): boolean {
  const regime = getCurrentLawRegime();
  
  const featureMatrix: Record<LawRegime, Record<string, boolean>> = {
    current: {
      section174Capitalization: true,
      payrollTaxOffset: true,
      enhancedCredits: true,
      startupBenefits: true,
    },
    legacy: {
      section174Capitalization: false,
      payrollTaxOffset: false,
      enhancedCredits: false,
      startupBenefits: false,
    },
    proposed: {
      section174Capitalization: false,
      payrollTaxOffset: true,
      enhancedCredits: true,
      startupBenefits: true,
    },
  };
  
  return featureMatrix[regime]?.[feature] ?? false;
}

/**
 * Get regime-specific copy text for common UI elements
 */
export function getRegimeText(key: string): string {
  const regime = getCurrentLawRegime();
  
  const copyMatrix: Record<LawRegime, Record<string, string>> = {
    current: {
      disclaimer: 'Based on current IRS Section 41 and Section 174 regulations (2022-2025)',
      creditDescription: 'Federal R&D Tax Credit (6-14% of qualified expenses)',
      section174Warning: 'R&D expenses must be capitalized and amortized under Section 174',
      calculatorTitle: 'R&D Tax Credit Calculator',
      benefitsHeader: 'Potential Tax Benefits',
    },
    legacy: {
      disclaimer: 'Based on pre-2022 tax law (historical reference only)',
      creditDescription: 'Federal R&D Tax Credit (6-14% of qualified expenses)',
      section174Warning: 'This calculation reflects historical tax law and may not apply to current filings',
      calculatorTitle: 'R&D Tax Credit Calculator (Legacy)',
      benefitsHeader: 'Historical Tax Benefits',
    },
    proposed: {
      disclaimer: 'Based on proposed legislation (not yet enacted)',
      creditDescription: 'Enhanced Federal R&D Tax Credit (proposed rates)',
      section174Warning: 'These benefits are based on proposed legislation and are not guaranteed',
      calculatorTitle: 'R&D Tax Credit Calculator (Proposed)',
      benefitsHeader: 'Potential Enhanced Benefits',
    },
  };
  
  return copyMatrix[regime]?.[key] ?? '';
}

/**
 * Get CSS classes for regime-specific styling
 */
export function getRegimeStyles(element: string): string {
  const regime = getCurrentLawRegime();
  
  const styleMatrix: Record<LawRegime, Record<string, string>> = {
    current: {
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
      header: 'text-blue-900 dark:text-blue-100',
    },
    legacy: {
      badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
      header: 'text-gray-900 dark:text-gray-100',
    },
    proposed: {
      badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
      header: 'text-green-900 dark:text-green-100',
    },
  };
  
  return styleMatrix[regime]?.[element] ?? '';
}