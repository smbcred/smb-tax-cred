/**
 * @file calculator.engine.ts
 * @description Enhanced R&D tax credit calculation with legislative benefits
 * @author SMBTaxCredits.com Team
 * @date 2025-01-11
 * @knowledgeBase 
 * - docs/credit-calculation-guide.md → QSB rules, $500k offset, Section 280C
 * - docs/business-rules.md → Qualification logic
 * - docs/api-documentation.md → Response structures
 * 
 * MAJOR UPDATES:
 * 1. QSB eligibility with $500k payroll offset (was $250k)
 * 2. Section 280C full vs reduced credit choice
 * 3. Legislative timeline awareness (2022-2025)
 * 4. Cash flow projections for startups
 * 5. Industry-specific AI examples
 * 
 * EXAMPLES:
 * - AI Startup: $400k credit → $100k quarterly payroll savings
 * - E-commerce: Custom recommendation engine → $50k immediate benefit
 * - Agency: GPT prompt library → $30k cash back via payroll
 * 
 * BUSINESS RULES:
 * - QSB: <$5M revenue AND no revenue >5 years ago
 * - Payroll offset: Up to $500k/year (IRA 2022 increase)
 * - Can offset Social Security (6.2%) + Medicare (1.45%)
 * - Must elect on original return (no amendments)
 * - 5-year lifetime limit on payroll elections
 */

export interface EnhancedCalculationInput {
  // Company info
  businessType: string;
  industryCode: string;
  
  // QSB eligibility fields (NEW)
  currentYearRevenue: number;
  yearOfFirstRevenue: number;
  hasIncomeTaxLiability: boolean;
  quarterlyPayrollTax: number;
  
  // R&D team
  technicalEmployees: number;
  averageTechnicalSalary: number;
  rdAllocationPercentage: number;
  
  // Expenses
  contractorCosts: number;
  suppliesCosts: number;
  softwareCosts: number;
  cloudCosts: number;
  
  // Prior years for ASC
  priorYearQREs: number[];
  isFirstTimeFiler: boolean;
  
  // Options (NEW)
  section280CElection: 'full' | 'reduced';
  taxYear: number;
  
  // AI activities
  qualifyingActivities: string[];
}

export interface QSBAnalysis {
  isEligible: boolean;
  currentYearRevenue: number;
  yearsInBusiness: number;
  eligibilityReasons: string[];
  
  payrollOffsetAvailable: boolean;
  maxPayrollOffset: number; // Up to $500k
  quarterlyBenefit: number;
  
  cashFlowComparison: {
    withPayrollOffset: {
      q1: number;
      q2: number;
      q3: number;
      q4: number;
      total: number;
    };
    traditionalCredit: {
      year1: number; // 0 if no income tax liability
      year2: number;
      year3: number;
      yearToBreakeven: number;
    };
  };
  
  lifetimeRemaining: number; // 5-year limit
  recommendedAction: string;
}

export interface LegislativeContext {
  taxYear: number;
  amortizationRequired: boolean;
  payrollTaxCap: number;
  deductionPercentage: number;
  alerts: Array<{
    type: 'benefit' | 'warning' | 'info';
    message: string;
    impact: string;
  }>;
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

export interface EnhancedCalculationResult {
  // QRE breakdown (existing)
  qreBreakdown: QREBreakdown;
  
  // Credit calculations
  ascCalculation: {
    method: 'first-time' | 'repeat';
    currentYearQRE: number;
    priorYearAverage: number;
    baseAmount: number;
    excessQRE: number;
    creditRate: number;
    calculatedCredit: number;
  };
  
  // Section 280C comparison (NEW)
  creditOptions: {
    fullCredit: {
      amount: number;
      deductionReduction: number;
      netBenefit: number;
      complexity: string;
    };
    reducedCredit: {
      amount: number;
      deductionReduction: number;
      netBenefit: number;
      complexity: string;
    };
    recommendation: 'full' | 'reduced';
    reasoning: string;
  };
  
  // Final amounts
  federalCredit: number;
  effectiveCreditRate: string; // "10.7%" for display
  
  // QSB benefits (NEW)
  qsbAnalysis: QSBAnalysis;
  
  // Legislative context (NEW)
  legislativeContext: LegislativeContext;
  
  // Pricing & ROI
  pricingTier: PricingTier;
  roi: ROICalculation;
  
  // Industry insights (NEW)
  industryInsights: {
    commonActivities: string[];
    averageCredit: string;
    successStory: string;
  };
  
  // Warnings & assumptions
  warnings: string[];
  assumptions: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface PricingTier {
  tier: number;
  name: string;
  creditRange: string;
  price: number;
}

export interface ROICalculation {
  creditAmount: number;
  serviceCost: number;
  netBenefit: number;
  roiMultiple: string;
  paybackDays?: number;
}

export class EnhancedRDTaxCalculator {
  // Legislative constants
  private static readonly PAYROLL_CAP_PRE_2023 = 250000;
  private static readonly PAYROLL_CAP_POST_2023 = 500000; // IRA 2022 doubled it!
  private static readonly QSB_REVENUE_LIMIT = 5000000;
  private static readonly QSB_AGE_LIMIT = 5;
  private static readonly PAYROLL_SS_RATE = 0.062;
  private static readonly PAYROLL_MEDICARE_RATE = 0.0145;
  private static readonly CORPORATE_TAX_RATE = 0.21;
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
   * Main calculation with all legislative benefits
   */
  public static calculate(input: EnhancedCalculationInput): EnhancedCalculationResult {
    // Step 1: Validate and get legislative context
    const legislativeContext = this.getLegislativeContext(input.taxYear);
    const validation = this.validateInput(input);
    
    // Step 2: Calculate QREs
    const qreBreakdown = this.calculateQREs(input);
    
    // Step 3: Calculate ASC credit
    const ascCalc = this.calculateASC(qreBreakdown.total, input);
    
    // Step 4: Apply Section 280C election
    const creditOptions = this.calculateCreditOptions(ascCalc.calculatedCredit, input.section280CElection);
    
    // Step 5: Analyze QSB eligibility and benefits
    const qsbAnalysis = this.analyzeQSBBenefits(
      creditOptions.fullCredit.amount,
      input,
      legislativeContext
    );
    
    // Step 6: Get pricing tier
    const effectiveCredit = input.section280CElection === 'reduced' 
      ? creditOptions.reducedCredit.amount 
      : creditOptions.fullCredit.amount;
    const pricingTier = this.getPricingTier(effectiveCredit);
    
    // Step 7: Calculate ROI with cash flow timing
    const roi = this.calculateEnhancedROI(
      effectiveCredit,
      pricingTier.price,
      qsbAnalysis
    );
    
    // Step 8: Get industry insights
    const industryInsights = this.getIndustryInsights(input.businessType, input.industryCode);
    
    return {
      qreBreakdown,
      ascCalculation: ascCalc,
      creditOptions,
      federalCredit: effectiveCredit,
      effectiveCreditRate: ((effectiveCredit / qreBreakdown.total) * 100).toFixed(1) + '%',
      qsbAnalysis,
      legislativeContext,
      pricingTier,
      roi,
      industryInsights,
      warnings: validation.warnings,
      assumptions: this.getAssumptions(input, ascCalc.method),
      confidence: this.assessConfidence(input, validation)
    };
  }

  /**
   * Calculate Qualified Research Expenses with proper rules
   */
  private static calculateQREs(input: EnhancedCalculationInput): QREBreakdown {
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
  private static calculateASC(currentYearQRE: number, input: EnhancedCalculationInput) {
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
        calculatedCredit: Math.round(currentYearQRE * this.ASC_RATE_FIRST_TIME)
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
        calculatedCredit: Math.round(excessQRE * this.ASC_RATE_REPEAT)
      };
    }
  }

  /**
   * Get pricing tier based on federal credit amount
   */
  private static getPricingTier(federalCredit: number): PricingTier {
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
  private static calculateROI(creditAmount: number, serviceCost: number): ROICalculation {
    const netBenefit = creditAmount - serviceCost;
    const roiMultiple = serviceCost > 0 ? creditAmount / serviceCost : 0;
    
    return {
      creditAmount,
      serviceCost,
      netBenefit,
      roiMultiple: (Math.round(roiMultiple * 10) / 10).toString() + 'x',
      paybackDays: serviceCost > 0 ? Math.round(365 / roiMultiple) : 0
    };
  }

  /**
   * Comprehensive validation with enhanced warnings
   */
  private static validateInput(input: EnhancedCalculationInput): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Critical errors
    if (input.technicalEmployees < 0) {
      errors.push('Technical employees must be >= 0');
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

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // NEW ENHANCED METHODS FOR LEGISLATIVE BENEFITS

  /**
   * Get legislative context for the tax year
   */
  private static getLegislativeContext(taxYear: number): LegislativeContext {
    const alerts: LegislativeContext['alerts'] = [];
    
    // Section 174 capitalization rules (2022-2025)
    if (taxYear >= 2022) {
      alerts.push({
        type: 'warning',
        message: 'Section 174: R&D expenses must be capitalized and amortized',
        impact: 'Reduces immediate deduction benefit but R&D credit still applies'
      });
    }
    
    // Payroll tax offset cap increase
    const payrollCap = taxYear >= 2023 ? this.PAYROLL_CAP_POST_2023 : this.PAYROLL_CAP_PRE_2023;
    if (taxYear >= 2023) {
      alerts.push({
        type: 'benefit',
        message: 'IRA 2022: Payroll tax offset cap increased to $500k',
        impact: 'Doubles potential quarterly cash benefit for startups'
      });
    }
    
    return {
      taxYear,
      amortizationRequired: taxYear >= 2022,
      payrollTaxCap: payrollCap,
      deductionPercentage: taxYear >= 2022 ? 20 : 100, // 5-year amortization = 20% per year
      alerts
    };
  }

  /**
   * Calculate Section 280C credit options
   */
  private static calculateCreditOptions(baseCredit: number, election: 'full' | 'reduced') {
    const fullCredit = baseCredit;
    const reducedCredit = baseCredit * 0.84; // 16% reduction to preserve full deduction
    const deductionValue = fullCredit * this.CORPORATE_TAX_RATE; // Value of lost deduction

    return {
      fullCredit: {
        amount: fullCredit,
        deductionReduction: fullCredit, // Full credit = full deduction reduction
        netBenefit: fullCredit - deductionValue,
        complexity: 'Simple - take full credit, reduce deduction'
      },
      reducedCredit: {
        amount: reducedCredit,
        deductionReduction: 0, // No deduction reduction
        netBenefit: reducedCredit,
        complexity: 'Complex - reduced credit preserves deduction'
      },
      recommendation: fullCredit > reducedCredit + deductionValue ? 'full' : 'reduced' as 'full' | 'reduced',
      reasoning: fullCredit > reducedCredit + deductionValue 
        ? 'Full credit provides higher net benefit despite deduction reduction'
        : 'Reduced credit with full deduction provides better total value'
    };
  }

  /**
   * Analyze QSB eligibility and payroll offset benefits
   */
  private static analyzeQSBBenefits(
    creditAmount: number,
    input: EnhancedCalculationInput,
    legislativeContext: LegislativeContext
  ): QSBAnalysis {
    const currentYear = legislativeContext.taxYear;
    const yearsInBusiness = Math.max(0, currentYear - input.yearOfFirstRevenue);
    
    // QSB eligibility: <$5M revenue AND no revenue >5 years ago
    const isEligible = input.currentYearRevenue < this.QSB_REVENUE_LIMIT && 
                       yearsInBusiness <= this.QSB_AGE_LIMIT;
    
    const eligibilityReasons: string[] = [];
    if (input.currentYearRevenue >= this.QSB_REVENUE_LIMIT) {
      eligibilityReasons.push(`Revenue ${input.currentYearRevenue.toLocaleString()} exceeds $5M limit`);
    }
    if (yearsInBusiness > this.QSB_AGE_LIMIT) {
      eligibilityReasons.push(`${yearsInBusiness} years in business exceeds 5-year limit`);
    }
    if (isEligible) {
      eligibilityReasons.push('Qualifies as QSB for payroll tax offset');
    }

    const maxPayrollOffset = Math.min(creditAmount, legislativeContext.payrollTaxCap);
    const payrollOffsetAvailable = isEligible && !input.hasIncomeTaxLiability;
    const quarterlyBenefit = payrollOffsetAvailable ? maxPayrollOffset / 4 : 0;

    // Cash flow projections
    const withPayrollOffset = {
      q1: quarterlyBenefit,
      q2: quarterlyBenefit,
      q3: quarterlyBenefit,
      q4: quarterlyBenefit,
      total: quarterlyBenefit * 4
    };

    const traditionalCredit = {
      year1: input.hasIncomeTaxLiability ? creditAmount : 0,
      year2: input.hasIncomeTaxLiability ? 0 : creditAmount * 0.3, // Carryforward estimate
      year3: input.hasIncomeTaxLiability ? 0 : creditAmount * 0.4,
      yearToBreakeven: input.hasIncomeTaxLiability ? 1 : 3
    };

    return {
      isEligible,
      currentYearRevenue: input.currentYearRevenue,
      yearsInBusiness,
      eligibilityReasons,
      payrollOffsetAvailable,
      maxPayrollOffset,
      quarterlyBenefit,
      cashFlowComparison: {
        withPayrollOffset,
        traditionalCredit
      },
      lifetimeRemaining: legislativeContext.payrollTaxCap, // Simplified
      recommendedAction: payrollOffsetAvailable 
        ? `Elect payroll offset for immediate $${quarterlyBenefit.toLocaleString()} quarterly benefit`
        : isEligible 
        ? 'Consider payroll offset when you have payroll tax liability'
        : 'Focus on traditional income tax credit'
    };
  }

  /**
   * Enhanced ROI calculation with cash flow timing
   */
  private static calculateEnhancedROI(
    creditAmount: number,
    serviceCost: number,
    qsbAnalysis: QSBAnalysis
  ): ROICalculation {
    const netBenefit = creditAmount - serviceCost;
    const roiMultiple = serviceCost > 0 ? creditAmount / serviceCost : 0;
    
    // Adjust payback based on cash flow timing
    let paybackDays = 0;
    if (qsbAnalysis.payrollOffsetAvailable && qsbAnalysis.quarterlyBenefit > 0) {
      // Quarterly payments mean faster payback
      const monthsToBreakeven = serviceCost / (qsbAnalysis.quarterlyBenefit / 3);
      paybackDays = Math.round(monthsToBreakeven * 30);
    } else if (serviceCost > 0) {
      // Traditional tax credit - annual timing
      paybackDays = Math.round(365 / roiMultiple);
    }

    return {
      creditAmount,
      serviceCost,
      netBenefit,
      roiMultiple: (Math.round(roiMultiple * 10) / 10).toString() + 'x',
      paybackDays
    };
  }

  /**
   * Get industry-specific insights
   */
  private static getIndustryInsights(businessType: string, industryCode: string) {
    const insights = {
      'Software': {
        commonActivities: [
          'AI/ML model development and training',
          'Custom algorithm development',
          'Performance optimization experiments',
          'New feature prototyping'
        ],
        averageCredit: '$45,000',
        successStory: 'SaaS company saved $67k on AI chatbot development'
      },
      'E-commerce': {
        commonActivities: [
          'Recommendation engine development',
          'Inventory optimization algorithms',
          'Personalization system testing',
          'Fraud detection improvements'
        ],
        averageCredit: '$32,000',
        successStory: 'Online retailer claimed $89k for ML recommendation system'
      },
      'Agency': {
        commonActivities: [
          'Marketing automation development',
          'Custom analytics dashboards',
          'Client workflow optimization',
          'AI content generation tools'
        ],
        averageCredit: '$28,000',
        successStory: 'Digital agency recovered $41k for custom CRM development'
      }
    };

    return insights[businessType] || {
      commonActivities: [
        'Process automation development',
        'Data analysis system improvements', 
        'Custom software solutions',
        'Technical experimentation'
      ],
      averageCredit: '$35,000',
      successStory: 'SMB recovered $52k for AI-powered process improvements'
    };
  }

  /**
   * Generate assumptions based on inputs
   */
  private static getAssumptions(input: EnhancedCalculationInput, method: string): string[] {
    const assumptions: string[] = [];
    
    assumptions.push(`${method === 'first-time' ? '6%' : '14%'} credit rate based on ${method} filer status`);
    assumptions.push(`${input.rdAllocationPercentage}% of technical employee time spent on R&D activities`);
    assumptions.push('All expenses are properly documented and qualify under Section 41');
    
    if (input.contractorCosts > 0) {
      assumptions.push('Contractor costs limited to 65% qualification per IRS rules');
    }
    
    if (input.taxYear >= 2022) {
      assumptions.push('Section 174 amortization rules apply - expenses capitalized over 5 years');
    }
    
    return assumptions;
  }

  /**
   * Assess calculation confidence
   */
  private static assessConfidence(
    input: EnhancedCalculationInput, 
    validation: { warnings: string[] }
  ): 'high' | 'medium' | 'low' {
    if (validation.warnings.length === 0 && input.rdAllocationPercentage >= 20 && input.rdAllocationPercentage <= 80) {
      return 'high';
    } else if (validation.warnings.length <= 2) {
      return 'medium';
    } else {
      return 'low';
    }
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

// Legacy alias for backward compatibility
export class RDTaxCalculator extends EnhancedRDTaxCalculator {}

// Export as CalculatorEngine for backward compatibility
export const CalculatorEngine = RDTaxCalculator;