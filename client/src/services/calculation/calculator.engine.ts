/**
 * @file calculator.engine.ts
 * @description Core R&D tax credit calculation engine for innovation-forward SMBs
 * @author SMBTaxCredits.com Team
 * @date 2025-01-09
 * @knowledgeBase 
 * - system-architecture-explanation.md
 * - expense-calculation-rules.md
 * - form_6765_tech_specs.md
 * - additional-project-specs.md
 * 
 * This engine calculates federal R&D tax credits for businesses that experiment
 * with innovation tools, custom solutions, process optimization, and digital transformation.
 * It implements the Alternative Simplified Credit (ASC) method for simplicity.
 * 
 * EXAMPLES:
 * - Agency refined custom solutions: 20 hours at $75/hr = $1,500 QRE
 * - E-commerce optimized processes: 3 employees, 2 weeks = $12,000 QRE  
 * - Healthcare improved digital systems: contractor + testing = $8,000 QRE
 * 
 * BUSINESS RULES:
 * - Only wages directly related to experimentation qualify (not routine use)
 * - Contractor costs limited to 65% per IRS Section 41
 * - Cloud computing/software subscriptions count as supplies for R&D
 * - Must show iterative testing and improvement, not one-time setup
 */

export interface CalculationInput {
  // Business information
  businessType: string;
  totalEmployees: number;
  
  // Technical staff
  technicalEmployees: number;
  averageTechnicalSalary: number;
  rdAllocationPercentage?: number; // % of time on R&D
  
  // Other expenses
  contractorCosts: number;
  suppliesCosts: number;
  softwareCosts: number;
  cloudCosts: number;
  
  // Prior year data (for ASC calculation)
  priorYearQREs?: number[];
  isFirstTimeFiler?: boolean;
}

export interface QREBreakdown {
  wages: number;
  contractors: number;
  supplies: number;
  cloudAndAI: number;
  total: number;
  byCategory: {
    [key: string]: {
      amount: number;
      percentage: number;
      description: string;
    };
  };
}

export interface PricingTier {
  name: string;
  creditRange: {
    min: number;
    max: number;
  };
  price: number;
  description: string;
}

export interface CalculationResult {
  qreBreakdown: QREBreakdown;
  federalCredit: number;
  creditRate: number;
  pricingTier: PricingTier;
  roi: {
    creditAmount: number;
    serviceCost: number;
    netBenefit: number;
    roiMultiple: number;
    breakEvenDays: number;
    firstYearReturn: number;
  };
  totalBenefit: number;
  timestamp: string;
  assumptions: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class CalculatorEngine {
  // ASC Method Constants (simplified for SMBs)
  private static readonly ASC_RATE = 0.14;
  private static readonly ASC_RATE_NO_PRIOR = 0.06;
  private static readonly ASC_BASE_PERCENTAGE = 0.50;
  private static readonly CONTRACTOR_LIMIT = 0.65;
  
  // Pricing tier thresholds aligned with pricing strategy
  private static readonly PRICING_TIERS = {
    TIER_1: { max: 10000, price: 500, description: 'Starter - Credits up to $10,000' },
    TIER_2: { max: 20000, price: 750, description: 'Growth - Credits up to $20,000' },
    TIER_3: { max: 30000, price: 1000, description: 'Professional - Credits up to $30,000' },
    TIER_4: { max: 40000, price: 1250, description: 'Advanced - Credits up to $40,000' },
    TIER_5: { max: 50000, price: 1500, description: 'Premium - Credits up to $50,000' },
    TIER_6: { max: 60000, price: 1750, description: 'Enterprise - Credits up to $60,000' },
    ENTERPRISE: { max: Infinity, price: 2500, description: 'Custom - Large credits' }
  };

  /**
   * Main calculation entry point
   * Processes inputs from businesses testing innovation and digital transformation
   * @param input User-provided data about their innovation activities
   * @returns Complete calculation with federal credit and pricing
   */
  public static calculate(input: CalculationInput): CalculationResult {
    // Step 1: Validate all inputs
    const validation = this.validateInputs(input);
    if (!validation.isValid) {
      throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
    }

    // Step 2: Calculate Qualified Research Expenses (QREs)
    const qreBreakdown = this.calculateQREs(input);
    
    // Step 3: Apply ASC method to get federal credit
    const federalCredit = this.calculateASC(qreBreakdown, input);
    
    // Step 4: Determine service pricing based on credit amount
    const pricingTier = this.determinePricingTier(federalCredit);
    
    // Step 5: Calculate ROI and prepare results
    const roi = this.calculateROI(federalCredit, pricingTier.price);
    
    return {
      qreBreakdown,
      federalCredit,
      creditRate: qreBreakdown.total > 0 ? federalCredit / qreBreakdown.total : 0,
      pricingTier,
      roi,
      totalBenefit: federalCredit, // Federal only for now
      timestamp: new Date().toISOString(),
      assumptions: this.getAssumptions(input)
    };
  }

  /**
   * Calculate Qualified Research Expenses by category
   * Focuses on innovation activities like process optimization, digital transformation
   */
  private static calculateQREs(input: CalculationInput): QREBreakdown {
    // Wage QREs - Time spent on experimentation
    const wageQRE = this.calculateWageQRE(input);
    
    // Contractor QREs - External help for innovation projects (65% limit)
    const contractorQRE = this.calculateContractorQRE(input);
    
    // Supply QREs - Cloud, software subscriptions, testing tools
    const supplyQRE = this.calculateSupplyQRE(input);
    
    // Total QREs
    const total = wageQRE + contractorQRE + supplyQRE;
    
    // Build detailed breakdown
    return {
      wages: Math.round(wageQRE),
      contractors: Math.round(contractorQRE),
      supplies: Math.round(supplyQRE),
      cloudAndAI: Math.round(input.cloudCosts || 0), // Subset of supplies
      total: Math.round(total),
      byCategory: {
        wages: { 
          amount: wageQRE, 
          percentage: total > 0 ? wageQRE / total : 0,
          description: 'Employee time on innovation experiments'
        },
        contractors: { 
          amount: contractorQRE, 
          percentage: total > 0 ? contractorQRE / total : 0,
          description: 'External consultants (65% eligible)'
        },
        supplies: { 
          amount: supplyQRE, 
          percentage: total > 0 ? supplyQRE / total : 0,
          description: 'Software, cloud, testing costs'
        }
      }
    };
  }

  /**
   * Calculate wage-based QREs
   * Example: 2 employees spent 50% time optimizing processes
   */
  private static calculateWageQRE(input: CalculationInput): number {
    const { 
      technicalEmployees = 0, 
      averageTechnicalSalary = 0,
      rdAllocationPercentage = 100 
    } = input;

    // Only count wages for time spent experimenting
    // Not routine operations, but testing and improving
    const effectiveAllocation = Math.min(100, Math.max(0, rdAllocationPercentage));
    const annualWages = technicalEmployees * averageTechnicalSalary;
    
    return annualWages * (effectiveAllocation / 100);
  }

  /**
   * Calculate contractor QREs with 65% limitation
   * Example: Hired expert to build custom solutions, only 65% counts
   */
  private static calculateContractorQRE(input: CalculationInput): number {
    const contractorCosts = input.contractorCosts || 0;
    
    // IRS limits contractor expenses to 65% of amount paid
    return contractorCosts * this.CONTRACTOR_LIMIT;
  }

  /**
   * Calculate supply QREs including cloud and software subscriptions
   * Example: Development tools, cloud infrastructure, testing platforms
   */
  private static calculateSupplyQRE(input: CalculationInput): number {
    const { 
      suppliesCosts = 0, 
      cloudCosts = 0, 
      softwareCosts = 0,
      businessType 
    } = input;

    let totalSupplies = suppliesCosts;
    
    // Cloud and software subscriptions qualify for innovation businesses
    if (this.isInnovationEligibleBusiness(businessType)) {
      totalSupplies += cloudCosts;
      totalSupplies += softwareCosts; // 100% if used for R&D (no reduction needed)
    }
    
    return totalSupplies;
  }

  /**
   * Alternative Simplified Credit calculation
   * Simpler method preferred by SMBs - 14% of excess QREs
   */
  private static calculateASC(qre: QREBreakdown, input: CalculationInput): number {
    const currentYearQRE = qre.total;
    
    // Check if this is their first year claiming
    if (input.isFirstTimeFiler || !input.priorYearQREs || input.priorYearQREs.length === 0) {
      // First-time claimants get 6% of all QREs
      return Math.round(currentYearQRE * this.ASC_RATE_NO_PRIOR);
    }
    
    // Calculate 3-year average of prior QREs
    const priorAverage = this.calculatePriorAverage(input.priorYearQREs);
    
    // Base amount is 50% of prior average
    const baseAmount = priorAverage * this.ASC_BASE_PERCENTAGE;
    
    // Credit is 14% of QREs exceeding base
    const excess = Math.max(0, currentYearQRE - baseAmount);
    
    return Math.round(excess * this.ASC_RATE);
  }

  /**
   * Calculate average of up to 3 prior years
   */
  private static calculatePriorAverage(priorYears: number[]): number {
    if (!priorYears || priorYears.length === 0) return 0;
    
    // Take most recent 3 years
    const recentYears = priorYears.slice(-3);
    const sum = recentYears.reduce((total, year) => total + year, 0);
    
    return sum / recentYears.length;
  }

  /**
   * Determine pricing tier based on estimated credit
   * Aligns with flat-fee pricing strategy
   */
  private static determinePricingTier(creditAmount: number): PricingTier {
    // Find the appropriate tier
    const entries = Object.entries(this.PRICING_TIERS);
    
    for (const [key, tier] of entries) {
      if (creditAmount <= tier.max) {
        const prevTier = this.getPreviousTierMax(key);
        return {
          name: key,
          creditRange: { 
            min: prevTier,
            max: tier.max === Infinity ? 60000 : tier.max
          },
          price: tier.price,
          description: tier.description
        };
      }
    }
    
    // Default to enterprise tier
    return {
      name: 'ENTERPRISE',
      creditRange: { min: 60000, max: Infinity },
      price: this.PRICING_TIERS.ENTERPRISE.price,
      description: this.PRICING_TIERS.ENTERPRISE.description
    };
  }

  /**
   * Get the max value of the previous tier
   */
  private static getPreviousTierMax(currentTier: string): number {
    const tiers = Object.keys(this.PRICING_TIERS);
    const index = tiers.indexOf(currentTier);
    
    if (index <= 0) return 0;
    
    const prevTierKey = tiers[index - 1];
    return this.PRICING_TIERS[prevTierKey as keyof typeof this.PRICING_TIERS].max;
  }

  /**
   * Input validation with business rules
   * Ensures data makes sense for innovation context
   */
  private static validateInputs(input: CalculationInput): ValidationResult {
    const errors: string[] = [];

    // Basic data validation
    if (input.technicalEmployees < 0) {
      errors.push('Technical employees cannot be negative');
    }

    if (input.technicalEmployees > input.totalEmployees) {
      errors.push('Technical employees cannot exceed total employees');
    }

    if (input.averageTechnicalSalary < 20000) {
      errors.push('Average salary seems too low');
    }

    if (input.averageTechnicalSalary > 500000) {
      errors.push('Average salary seems unusually high');
    }

    // Allocation percentage validation
    const allocation = input.rdAllocationPercentage ?? 100;
    if (allocation < 0 || allocation > 100) {
      errors.push('R&D allocation must be between 0-100%');
    }

    // Ensure at least some qualifying expenses
    const hasExpenses = 
      (input.technicalEmployees > 0 && input.averageTechnicalSalary > 0) ||
      input.contractorCosts > 0 ||
      input.suppliesCosts > 0 ||
      input.cloudCosts > 0;

    if (!hasExpenses) {
      errors.push('Must have qualifying expenses to calculate credit');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate ROI metrics for marketing display
   * Shows value proposition of the service
   */
  private static calculateROI(creditAmount: number, serviceCost: number): any {
    const netBenefit = creditAmount - serviceCost;
    const roiMultiple = creditAmount / serviceCost;
    
    return {
      creditAmount,
      serviceCost,
      netBenefit,
      roiMultiple: Math.round(roiMultiple * 10) / 10,
      breakEvenDays: Math.round(365 / roiMultiple),
      firstYearReturn: netBenefit
    };
  }

  /**
   * Business types that commonly experiment with innovation
   */
  private static isInnovationEligibleBusiness(type: string): boolean {
    const innovationEligibleTypes = [
      'professional_services', 'ecommerce', 'healthcare',
      'manufacturing', 'creative_agency', 'saas', 
      'software', 'agency', 'consulting', 'services'
    ];
    
    return innovationEligibleTypes.includes(type);
  }

  /**
   * Generate assumptions for transparency
   */
  private static getAssumptions(input: CalculationInput): string[] {
    const assumptions: string[] = [];
    
    if (input.isFirstTimeFiler || !input.priorYearQREs?.length) {
      assumptions.push('First-time filer rate of 6% applied');
    } else {
      assumptions.push('ASC method with 14% rate applied');
      assumptions.push(`Based on ${input.priorYearQREs.length} years of prior R&D`);
    }
    
    if (input.contractorCosts > 0) {
      assumptions.push('Contractor costs limited to 65% per IRS rules');
    }
    
    if (input.cloudCosts > 0 || input.softwareCosts > 0) {
      assumptions.push('80% of software/cloud costs allocated to R&D');
    }
    
    const allocation = input.rdAllocationPercentage ?? 100;
    if (allocation < 100) {
      assumptions.push(`${allocation}% of technical salaries allocated to R&D`);
    }
    
    assumptions.push('Federal credit only (state credits available separately)');
    
    return assumptions;
  }
}