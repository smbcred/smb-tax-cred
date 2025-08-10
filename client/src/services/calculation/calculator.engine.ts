/**
 * @file calculator.engine.ts
 * @description COMPLETE FIX: R&D tax credit calculation engine
 * @author SMBTaxCredits.com Team
 * @date 2025-01-09
 * @knowledgeBase 
 * - form_6765_tech_specs.md (ASC calculation rules)
 * - pricing_strategy_rd_platform.md (pricing tiers)
 * - Federal R&D Tax Credit Rules (calculation methods)
 * 
 * FIXED ISSUES:
 * 1. Proper ASC calculation (6% first-time, 14% repeat)
 * 2. Correct wage calculation without 65% reduction
 * 3. Federal-only focus (no state credits)
 * 4. Aligned pricing tiers
 * 5. Prior year QRE handling
 * 6. R&D allocation percentage for wages
 */

export interface CalculationInput {
  // Business information
  businessType: string;
  totalEmployees: number;
  
  // Technical staff
  technicalEmployees: number;
  averageTechnicalSalary: number;
  rdAllocationPercentage: number; // REQUIRED: % of time on R&D (0-100)
  
  // Other expenses
  contractorCosts: number;
  suppliesCosts: number;
  softwareCosts: number;
  cloudCosts: number;
  
  // Prior year data for ASC calculation
  priorYearQREs?: number[]; // Up to 3 years
  isFirstTimeFiler: boolean;
  
  // Activities
  qualifyingActivities?: string[];
}

export interface QREBreakdown {
  wages: number;
  contractors: number;
  supplies: number;
  cloudAndSoftware: number;
  total: number;
  details: {
    wageCalculation: string;
    contractorCalculation: string;
    supplyCalculation: string;
  };
}

export interface CalculationResult {
  qreBreakdown: QREBreakdown;
  ascCalculation: {
    method: 'first-time' | 'repeat';
    currentYearQRE: number;
    priorYearAverage: number;
    baseAmount: number;
    excessQRE: number;
    creditRate: number;
  };
  federalCredit: number;
  stateCredit: number; // Always 0 for federal-only
  totalBenefit: number;
  pricingTier: {
    tier: number;
    name: string;
    creditRange: string;
    price: number;
  };
  roi: {
    creditAmount: number;
    serviceCost: number;
    netBenefit: number;
    roiMultiple: number;
    paybackDays?: number;
  };
  warnings: string[];
  assumptions: string[];
}

export class RDTaxCalculator {
  // ASC Method Constants from IRS rules
  private static readonly ASC_RATE_REPEAT = 0.14;  // 14% for repeat filers
  private static readonly ASC_RATE_FIRST_TIME = 0.06; // 6% for first-time
  private static readonly ASC_BASE_REDUCTION = 0.50; // 50% of prior average
  private static readonly CONTRACTOR_LIMIT = 0.65; // 65% qualification limit
  
  // Pricing tiers per instructions.md requirements
  private static readonly PRICING_TIERS = [
    { tier: 1, min: 0, max: 5000, price: 500, name: 'Starter' },
    { tier: 2, min: 5000, max: 10000, price: 700, name: 'Growth' },
    { tier: 3, min: 10000, max: 20000, price: 900, name: 'Professional' },
    { tier: 4, min: 20000, max: 40000, price: 1200, name: 'Scale' },
    { tier: 5, min: 40000, max: 75000, price: 1500, name: 'Advanced' },
    { tier: 6, min: 75000, max: 150000, price: 1800, name: 'Premium' },
    { tier: 7, min: 150000, max: Infinity, price: 2000, name: 'Enterprise' }
  ];

  /**
   * Main calculation method - processes all inputs and returns complete results
   */
  public static calculate(input: CalculationInput): CalculationResult {
    const warnings: string[] = [];
    
    // Validate inputs
    const validation = this.validateInputs(input);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join('; ')}`);
    }
    warnings.push(...validation.warnings);
    
    // Calculate QREs
    const qreBreakdown = this.calculateQREs(input);
    
    // Apply ASC calculation method
    const ascCalc = this.calculateASC(qreBreakdown.total, input);
    const federalCredit = ascCalc.federalCredit;
    
    // Determine pricing tier
    const pricingTier = this.getPricingTier(federalCredit);
    
    // Calculate ROI
    const roi = this.calculateROI(federalCredit, pricingTier.price);
    
    return {
      qreBreakdown,
      ascCalculation: ascCalc,
      federalCredit,
      stateCredit: 0, // Federal-only platform
      totalBenefit: federalCredit,
      pricingTier,
      roi,
      warnings,
      assumptions: this.getAssumptions(input, ascCalc.method)
    };
  }

  /**
   * Calculate Qualified Research Expenses with proper rules
   */
  private static calculateQREs(input: CalculationInput): QREBreakdown {
    // Wages: Full salary × R&D allocation % (NO 65% reduction)
    const annualWages = input.technicalEmployees * input.averageTechnicalSalary;
    const qualifiedWages = Math.round(annualWages * (input.rdAllocationPercentage / 100));
    
    // Contractors: Limited to 65% per IRS Section 41
    const qualifiedContractors = Math.round(input.contractorCosts * this.CONTRACTOR_LIMIT);
    
    // Supplies: 100% if used for R&D
    const qualifiedSupplies = Math.round(input.suppliesCosts);
    
    // Cloud & Software: 100% if used for R&D activities
    const qualifiedCloudSoftware = Math.round(input.cloudCosts + input.softwareCosts);
    
    const total = qualifiedWages + qualifiedContractors + qualifiedSupplies + qualifiedCloudSoftware;
    
    return {
      wages: qualifiedWages,
      contractors: qualifiedContractors,
      supplies: qualifiedSupplies,
      cloudAndSoftware: qualifiedCloudSoftware,
      total,
      details: {
        wageCalculation: `${input.technicalEmployees} employees × $${input.averageTechnicalSalary.toLocaleString()} × ${input.rdAllocationPercentage}% R&D time`,
        contractorCalculation: `$${input.contractorCosts.toLocaleString()} × 65% IRS limit`,
        supplyCalculation: `$${input.suppliesCosts.toLocaleString()} supplies + $${(input.cloudCosts + input.softwareCosts).toLocaleString()} cloud/software`
      }
    };
  }

  /**
   * Proper ASC calculation following IRS rules
   */
  private static calculateASC(currentYearQRE: number, input: CalculationInput): any {
    // Check if first-time filer or no prior QREs
    const hasPriorQREs = input.priorYearQREs && input.priorYearQREs.length > 0 && 
                         input.priorYearQREs.some(qre => qre > 0);
    
    if (input.isFirstTimeFiler || !hasPriorQREs) {
      // First-time filer: 6% of current year QREs
      return {
        method: 'first-time',
        currentYearQRE,
        priorYearAverage: 0,
        baseAmount: 0,
        excessQRE: currentYearQRE,
        creditRate: this.ASC_RATE_FIRST_TIME,
        federalCredit: Math.round(currentYearQRE * this.ASC_RATE_FIRST_TIME)
      };
    } else {
      // Repeat filer: 14% of excess over 50% of 3-year average
      const validPriorYears = input.priorYearQREs!.slice(-3); // Last 3 years
      const priorYearAverage = validPriorYears.reduce((a, b) => a + b, 0) / validPriorYears.length;
      const baseAmount = priorYearAverage * this.ASC_BASE_REDUCTION;
      const excessQRE = Math.max(0, currentYearQRE - baseAmount);
      
      return {
        method: 'repeat',
        currentYearQRE,
        priorYearAverage: Math.round(priorYearAverage),
        baseAmount: Math.round(baseAmount),
        excessQRE: Math.round(excessQRE),
        creditRate: this.ASC_RATE_REPEAT,
        federalCredit: Math.round(excessQRE * this.ASC_RATE_REPEAT)
      };
    }
  }

  /**
   * Get pricing tier based on federal credit amount
   */
  private static getPricingTier(federalCredit: number): CalculationResult['pricingTier'] {
    const tier = this.PRICING_TIERS.find(t => federalCredit >= t.min && federalCredit < t.max) 
                 || this.PRICING_TIERS[this.PRICING_TIERS.length - 1];
    
    return {
      tier: tier.tier,
      name: tier.name,
      creditRange: `$${tier.min.toLocaleString()} - ${tier.max === Infinity ? '∞' : '$' + tier.max.toLocaleString()}`,
      price: tier.price
    };
  }

  /**
   * Calculate comprehensive ROI metrics
   */
  private static calculateROI(creditAmount: number, serviceCost: number): CalculationResult['roi'] {
    const netBenefit = creditAmount - serviceCost;
    const roiMultiple = serviceCost > 0 ? creditAmount / serviceCost : 0;
    
    return {
      creditAmount,
      serviceCost,
      netBenefit,
      roiMultiple: Math.round(roiMultiple * 10) / 10,
      paybackDays: serviceCost > 0 ? Math.round(365 / roiMultiple) : 0
    };
  }

  /**
   * Comprehensive validation with enhanced warnings
   */
  private static validateInputs(input: CalculationInput): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Critical errors
    if (input.technicalEmployees > input.totalEmployees) {
      errors.push('Technical employees cannot exceed total employees');
    }
    
    if (input.rdAllocationPercentage < 0 || input.rdAllocationPercentage > 100) {
      errors.push('R&D allocation must be between 0-100%');
    }
    
    // Must have some qualifying expenses
    const hasWages = input.technicalEmployees > 0 && input.averageTechnicalSalary > 0;
    const hasOtherExpenses = input.contractorCosts > 0 || input.suppliesCosts > 0 || 
                            input.cloudCosts > 0 || input.softwareCosts > 0;
    
    if (!hasWages && !hasOtherExpenses) {
      errors.push('Must have qualifying R&D expenses');
    }
    
    // Warnings for unusual patterns
    if (input.rdAllocationPercentage > 80) {
      warnings.push('Over 80% R&D allocation is unusual - ensure accurate time tracking');
    }
    
    if (input.rdAllocationPercentage < 20 && input.technicalEmployees > 0) {
      warnings.push('Low R&D allocation - ensure all experimentation time is included');
    }
    
    if (input.averageTechnicalSalary > 0 && input.averageTechnicalSalary < 40000) {
      warnings.push('Salary seems low for technical employees');
    }
    
    if (input.averageTechnicalSalary > 200000) {
      warnings.push('High average salary - ensure this reflects actual wages');
    }
    
    if (input.contractorCosts > (input.technicalEmployees * input.averageTechnicalSalary)) {
      warnings.push('High contractor costs - ensure proper documentation');
    }
    
    // AI-specific validations
    if (input.qualifyingActivities?.includes('custom_gpts') && input.cloudCosts === 0) {
      warnings.push('Custom GPT development typically involves cloud/API costs');
    }
    
    if (!input.qualifyingActivities || input.qualifyingActivities.length === 0) {
      warnings.push('No activities selected - this may affect documentation quality');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate assumptions for transparency
   */
  private static getAssumptions(input: CalculationInput, method: string): string[] {
    const assumptions = [
      'Federal R&D tax credit only (no state credits)',
      'Using Alternative Simplified Credit (ASC) method',
      'Contractor costs limited to 65% per IRS Section 41',
      'All activities performed in the United States'
    ];
    
    if (method === 'first-time') {
      assumptions.push('First-time filer rate of 6% applied');
    } else {
      assumptions.push('14% credit rate on QREs exceeding 50% of prior 3-year average');
    }
    
    if (input.cloudCosts > 0 || input.softwareCosts > 0) {
      assumptions.push('Cloud and software costs included as qualifying supplies');
    }
    
    return assumptions;
  }
}

// Export helper functions for UI
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value}%`;
}

// Export as CalculatorEngine for backward compatibility
export const CalculatorEngine = RDTaxCalculator;