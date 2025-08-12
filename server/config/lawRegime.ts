/**
 * Server-side law regime configuration
 * Provides calculation logic variations based on current legal framework
 */

export type LawRegime = 'current' | 'legacy' | 'proposed';

interface CalculationConfig {
  section174Capitalization: boolean;
  payrollTaxOffsetEnabled: boolean;
  maxPayrollTaxOffset: number;
  federalCreditRates: {
    firstTime: number;
    repeat: number;
  };
  contractorLimitPercentage: number;
  enhancedStartupBenefits: boolean;
}

const LAW_REGIME_CALCULATIONS: Record<LawRegime, CalculationConfig> = {
  current: {
    section174Capitalization: true,
    payrollTaxOffsetEnabled: true,
    maxPayrollTaxOffset: 500000,
    federalCreditRates: {
      firstTime: 0.06, // 6%
      repeat: 0.14,    // 14%
    },
    contractorLimitPercentage: 65,
    enhancedStartupBenefits: true,
  },
  legacy: {
    section174Capitalization: false,
    payrollTaxOffsetEnabled: false,
    maxPayrollTaxOffset: 0,
    federalCreditRates: {
      firstTime: 0.06,
      repeat: 0.14,
    },
    contractorLimitPercentage: 65,
    enhancedStartupBenefits: false,
  },
  proposed: {
    section174Capitalization: false,
    payrollTaxOffsetEnabled: true,
    maxPayrollTaxOffset: 1000000, // Proposed increase
    federalCreditRates: {
      firstTime: 0.08,  // Proposed enhancement
      repeat: 0.16,     // Proposed enhancement
    },
    contractorLimitPercentage: 75, // Proposed increase
    enhancedStartupBenefits: true,
  },
};

/**
 * Get current law regime from environment
 */
export function getCurrentLawRegime(): LawRegime {
  const regime = process.env.LAW_REGIME as LawRegime;
  return regime && regime in LAW_REGIME_CALCULATIONS ? regime : 'current';
}

/**
 * Get calculation configuration for current law regime
 */
export function getLawRegimeConfig(): CalculationConfig {
  const regime = getCurrentLawRegime();
  return LAW_REGIME_CALCULATIONS[regime];
}

/**
 * Apply law regime specific adjustments to calculation results
 */
export function applyLawRegimeAdjustments(
  baseCalculation: any,
  regime: LawRegime = getCurrentLawRegime()
): any {
  const config = LAW_REGIME_CALCULATIONS[regime];
  
  const adjustedCalculation = { ...baseCalculation };

  // Apply Section 174 capitalization impact
  if (config.section174Capitalization) {
    adjustedCalculation.warnings = [
      ...(adjustedCalculation.warnings || []),
      'R&D expenses must be capitalized and amortized under Section 174 (2022-2025)',
    ];
    
    // Reduce immediate cash flow benefit due to capitalization
    adjustedCalculation.immediateCashImpact = adjustedCalculation.federalCredit;
  } else {
    adjustedCalculation.immediateCashImpact = 
      adjustedCalculation.federalCredit + adjustedCalculation.totalQualifiedExpenses;
  }

  // Apply payroll tax offset if enabled
  if (config.payrollTaxOffsetEnabled && adjustedCalculation.hasPayrollTax) {
    const eligibleOffset = Math.min(
      adjustedCalculation.federalCredit,
      config.maxPayrollTaxOffset,
      adjustedCalculation.payrollTaxAmount || 0
    );
    
    adjustedCalculation.payrollTaxOffset = eligibleOffset;
    adjustedCalculation.totalBenefit += eligibleOffset;
  }

  // Add regime-specific metadata
  adjustedCalculation.lawRegime = regime;
  adjustedCalculation.calculationDate = new Date().toISOString();
  
  return adjustedCalculation;
}