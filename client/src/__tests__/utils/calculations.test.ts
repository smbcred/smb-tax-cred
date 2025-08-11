// Unit tests for calculation utilities
import { describe, it, expect } from 'vitest';
import { 
  calculateRDCredit, 
  formatCurrency, 
  validateBusinessData,
  calculateQualifiedExpenses 
} from '@/utils/calculations';

describe('Calculation Utilities', () => {
  describe('calculateRDCredit', () => {
    it('calculates R&D credit correctly for first-time filers', () => {
      const data = {
        businessType: 'consulting' as const,
        annualRevenue: 500000,
        employeeCount: 10,
        aiActivities: ['process-automation'] as const,
        timeSpent: 20,
        teamSize: 3,
        expenses: {
          salaries: 150000,
          contractors: 50000,
          software: 10000,
          training: 5000,
          equipment: 0
        },
        isFirstTime: true
      };

      const result = calculateRDCredit(data);
      
      expect(result.qualified.total).toBeGreaterThan(0);
      expect(result.credit.federal).toBeGreaterThan(0);
      expect(result.credit.ases).toBeGreaterThan(0);
      expect(result.savings.total).toBeGreaterThan(0);
    });

    it('applies contractor cost limitation correctly', () => {
      const data = {
        businessType: 'consulting' as const,
        annualRevenue: 500000,
        employeeCount: 10,
        aiActivities: ['process-automation'] as const,
        timeSpent: 20,
        teamSize: 3,
        expenses: {
          salaries: 100000,
          contractors: 200000, // High contractor costs
          software: 10000,
          training: 5000,
          equipment: 0
        },
        isFirstTime: true
      };

      const result = calculateRDCredit(data);
      
      // Contractor costs should be limited to 65% of total qualified expenses
      const maxContractorCosts = (result.qualified.salaries + result.qualified.contractors + 
                                 result.qualified.software + result.qualified.training) * 0.65;
      expect(result.qualified.contractors).toBeLessThanOrEqual(maxContractorCosts);
    });

    it('handles zero expenses correctly', () => {
      const data = {
        businessType: 'consulting' as const,
        annualRevenue: 500000,
        employeeCount: 10,
        aiActivities: ['process-automation'] as const,
        timeSpent: 20,
        teamSize: 3,
        expenses: {
          salaries: 0,
          contractors: 0,
          software: 0,
          training: 0,
          equipment: 0
        },
        isFirstTime: true
      };

      const result = calculateRDCredit(data);
      
      expect(result.qualified.total).toBe(0);
      expect(result.credit.federal).toBe(0);
      expect(result.credit.ases).toBe(0);
      expect(result.savings.total).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
      expect(formatCurrency(0)).toBe('$0');
    });

    it('handles negative numbers', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,235');
    });

    it('rounds to nearest dollar', () => {
      expect(formatCurrency(1234.49)).toBe('$1,234');
      expect(formatCurrency(1234.50)).toBe('$1,235');
    });
  });

  describe('validateBusinessData', () => {
    it('validates correct business data', () => {
      const validData = {
        businessType: 'consulting' as const,
        annualRevenue: 500000,
        employeeCount: 10,
        aiActivities: ['process-automation'] as const,
        timeSpent: 20,
        teamSize: 3,
        expenses: {
          salaries: 150000,
          contractors: 50000,
          software: 10000,
          training: 5000,
          equipment: 0
        },
        isFirstTime: true
      };

      expect(validateBusinessData(validData)).toBe(true);
    });

    it('rejects invalid business data', () => {
      const invalidData = {
        businessType: 'invalid' as any,
        annualRevenue: -1000,
        employeeCount: -5,
        aiActivities: [] as any,
        timeSpent: -10,
        teamSize: 0,
        expenses: {
          salaries: -1000,
          contractors: -500,
          software: -100,
          training: -50,
          equipment: -25
        },
        isFirstTime: true
      };

      expect(validateBusinessData(invalidData)).toBe(false);
    });
  });

  describe('calculateQualifiedExpenses', () => {
    it('calculates qualified expenses with proper allocation', () => {
      const expenses = {
        salaries: 200000,
        contractors: 100000,
        software: 20000,
        training: 10000,
        equipment: 5000
      };
      
      const timeSpent = 25; // 25% of time on R&D
      
      const qualified = calculateQualifiedExpenses(expenses, timeSpent);
      
      expect(qualified.salaries).toBe(expenses.salaries * 0.25);
      expect(qualified.software).toBe(expenses.software); // 100% qualified
      expect(qualified.training).toBe(expenses.training); // 100% qualified
      expect(qualified.equipment).toBe(0); // Not qualified for credit
    });

    it('handles 100% time allocation', () => {
      const expenses = {
        salaries: 100000,
        contractors: 50000,
        software: 10000,
        training: 5000,
        equipment: 2000
      };
      
      const qualified = calculateQualifiedExpenses(expenses, 100);
      
      expect(qualified.salaries).toBe(expenses.salaries);
      expect(qualified.contractors).toBe(expenses.contractors);
      expect(qualified.software).toBe(expenses.software);
      expect(qualified.training).toBe(expenses.training);
      expect(qualified.equipment).toBe(0);
    });
  });
});