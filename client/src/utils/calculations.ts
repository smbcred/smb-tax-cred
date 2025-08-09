/**
 * @file calculations.ts
 * @description R&D tax credit calculation utilities
 * @knowledgeBase system-architecture-explanation.md
 */

export interface ExpenseInputs {
  totalEmployees: number;
  technicalEmployees: number;
  averageTechnicalSalary: number;
  contractorCosts: number;
  softwareCosts: number;
  cloudCosts: number;
}

export interface CalculationResult {
  totalQRE: number;
  federalCredit: number;
  stateCredit: number;
  totalBenefit: number;
  breakdown: {
    wages: number;
    contractors: number;
    supplies: number;
    cloud: number;
  };
}

/**
 * Calculate R&D tax credit using simplified ASC method
 * Federal credit = 14% of QREs for regular credit
 * Alternative simplified credit (ASC) = 14% × (QREs − 50% × average gross receipts)
 * We use 14% as a simplified rate for demonstration
 */
export function calculateRDCredit(expenses: ExpenseInputs): CalculationResult {
  // Calculate wage QREs (65% of technical employee wages for simplified calc)
  const technicalWages = expenses.technicalEmployees * expenses.averageTechnicalSalary;
  const qualifiedWages = technicalWages * 0.65; // Assume 65% of time on qualified activities
  
  // Contractor costs (65% qualified)
  const qualifiedContractors = expenses.contractorCosts * 0.65;
  
  // Supplies and cloud costs (100% qualified if used for R&D)
  const qualifiedSupplies = expenses.softwareCosts;
  const qualifiedCloud = expenses.cloudCosts;
  
  // Total QRE
  const totalQRE = qualifiedWages + qualifiedContractors + qualifiedSupplies + qualifiedCloud;
  
  // Federal credit calculation (simplified ASC at 14%)
  const federalCredit = Math.round(totalQRE * 0.14);
  
  // State credit (varies by state, using 5% as example)
  const stateCredit = Math.round(totalQRE * 0.05);
  
  return {
    totalQRE: Math.round(totalQRE),
    federalCredit,
    stateCredit,
    totalBenefit: federalCredit + stateCredit,
    breakdown: {
      wages: Math.round(qualifiedWages),
      contractors: Math.round(qualifiedContractors),
      supplies: Math.round(qualifiedSupplies),
      cloud: Math.round(qualifiedCloud)
    }
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}