/**
 * Law regime feature flag hook
 * Provides access to current law regime and conditional rendering utilities
 */

import { useMemo } from 'react';
import type { ReactNode } from 'react';

export type LawRegime = 'current' | 'legacy' | 'proposed';

interface LawRegimeConfig {
  regime: LawRegime;
  features: {
    section174Capitalization: boolean;
    payrollTaxOffset: boolean;
    enhancedCredits: boolean;
    startupBenefits: boolean;
  };
  copy: {
    disclaimerText: string;
    warningMessages: string[];
    benefitDescriptions: Record<string, string>;
  };
}

const LAW_REGIME_CONFIGS: Record<LawRegime, LawRegimeConfig> = {
  current: {
    regime: 'current',
    features: {
      section174Capitalization: true,
      payrollTaxOffset: true,
      enhancedCredits: true,
      startupBenefits: true,
    },
    copy: {
      disclaimerText: 'Based on current IRS Section 41 and Section 174 regulations (2022-2025)',
      warningMessages: [
        'R&D expenses must be capitalized and amortized over 5 years (domestic) or 15 years (foreign) per Section 174',
        'Payroll tax offset limited to $500k for qualified small businesses',
      ],
      benefitDescriptions: {
        federalCredit: 'Federal R&D Tax Credit (6-14% of qualified expenses)',
        payrollTaxOffset: 'Payroll Tax Offset (up to $500k for startups)',
        section174Impact: 'Section 174 capitalization reduces immediate deduction benefits',
      },
    },
  },
  legacy: {
    regime: 'legacy',
    features: {
      section174Capitalization: false,
      payrollTaxOffset: false,
      enhancedCredits: false,
      startupBenefits: false,
    },
    copy: {
      disclaimerText: 'Based on pre-2022 tax law (historical reference only)',
      warningMessages: [
        'This calculation reflects historical tax law and may not apply to current filings',
        'Current law requires Section 174 capitalization - consult tax professional',
      ],
      benefitDescriptions: {
        federalCredit: 'Federal R&D Tax Credit (6-14% of qualified expenses)',
        immediateDeduction: 'Immediate expense deduction (pre-2022 law)',
      },
    },
  },
  proposed: {
    regime: 'proposed',
    features: {
      section174Capitalization: false,
      payrollTaxOffset: true,
      enhancedCredits: true,
      startupBenefits: true,
    },
    copy: {
      disclaimerText: 'Based on proposed legislation (not yet enacted)',
      warningMessages: [
        'These benefits are based on proposed legislation and are not guaranteed',
        'Current Section 174 rules still apply until new legislation is enacted',
        'Consult tax professional before making decisions based on proposed changes',
      ],
      benefitDescriptions: {
        federalCredit: 'Enhanced Federal R&D Tax Credit (proposed rates)',
        payrollTaxOffset: 'Expanded Payroll Tax Offset (proposed)',
        immediateDeduction: 'Restored immediate expense deduction (proposed)',
      },
    },
  },
};

/**
 * Hook for accessing current law regime configuration
 */
export function useLawRegime(): LawRegimeConfig {
  const regime = useMemo(() => {
    const envRegime = import.meta.env.VITE_LAW_REGIME as LawRegime;
    return envRegime && envRegime in LAW_REGIME_CONFIGS ? envRegime : 'current';
  }, []);

  return LAW_REGIME_CONFIGS[regime];
}

/**
 * Conditional component wrapper based on law regime features
 */
interface ConditionalProps {
  feature: keyof LawRegimeConfig['features'];
  children: ReactNode;
  fallback?: ReactNode;
}

export function ConditionalLawFeature({ feature, children, fallback = null }: ConditionalProps) {
  const { features } = useLawRegime();
  return features[feature] ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook for getting regime-specific copy text
 */
export function useLawRegimeCopy() {
  const { copy } = useLawRegime();
  return copy;
}