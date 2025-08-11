/**
 * Shared Zod schemas for calculator requests/responses
 * Used by both client and server for type safety and validation
 */

import { z } from 'zod';

// Base calculator input schema
export const CalculatorInputSchema = z.object({
  businessType: z.enum([
    'technology',
    'manufacturing',
    'healthcare',
    'financial',
    'retail',
    'consulting',
    'other'
  ]),
  employees: z.number().int().min(1).max(10000),
  annualRevenue: z.number().min(0).max(1000000000),
  rdActivities: z.array(z.enum([
    'ai_implementation',
    'software_development',
    'process_automation',
    'data_analysis',
    'system_integration',
    'technical_research',
    'prototype_development'
  ])).min(1),
  wages: z.number().min(0),
  contractors: z.number().min(0),
  supplies: z.number().min(0),
  rdAllocation: z.number().min(0).max(100),
  isFirstTime: z.boolean(),
  companyAge: z.number().int().min(0).max(100),
  hasPayrollTax: z.boolean().optional(),
  payrollTaxAmount: z.number().min(0).optional()
});

// Calculator response schema
export const CalculatorResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    totalQualifiedExpenses: z.number(),
    federalCredit: z.number(),
    federalCreditRate: z.number(),
    payrollTaxOffset: z.number().optional(),
    totalBenefit: z.number(),
    breakdown: z.object({
      qualifiedWages: z.number(),
      qualifiedContractors: z.number(),
      qualifiedSupplies: z.number(),
      rdAllocationPercentage: z.number()
    }),
    projections: z.object({
      year1: z.number(),
      year2: z.number(),
      year3: z.number(),
      fiveYearTotal: z.number()
    }),
    recommendations: z.array(z.string()),
    warnings: z.array(z.string()).optional()
  }).optional(),
  error: z.string().optional()
});

// Form validation schemas
export const BusinessInfoSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  ein: z.string().regex(/^\d{2}-\d{7}$/, 'EIN must be in format XX-XXXXXXX'),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/)
  }),
  businessType: CalculatorInputSchema.shape.businessType,
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()),
  employees: z.number().int().min(1).max(10000),
  annualRevenue: z.number().min(0)
});

export const RDActivitiesSchema = z.object({
  activities: z.array(z.string()).min(1, 'At least one R&D activity is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  timeline: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  }),
  objectives: z.array(z.string()).min(1),
  challenges: z.array(z.string()).min(1),
  innovations: z.array(z.string()).min(1)
});

export const ExpenseBreakdownSchema = z.object({
  wages: z.object({
    amount: z.number().min(0),
    details: z.array(z.object({
      role: z.string(),
      hours: z.number().min(0),
      rate: z.number().min(0),
      rdPercentage: z.number().min(0).max(100)
    }))
  }),
  contractors: z.object({
    amount: z.number().min(0),
    details: z.array(z.object({
      vendor: z.string(),
      description: z.string(),
      amount: z.number().min(0),
      rdPercentage: z.number().min(0).max(100)
    }))
  }),
  supplies: z.object({
    amount: z.number().min(0),
    details: z.array(z.object({
      category: z.string(),
      description: z.string(),
      amount: z.number().min(0),
      rdPercentage: z.number().min(0).max(100)
    }))
  }),
  totalRdAllocation: z.number().min(0).max(100)
});

// Export types for use in both client and server
export type CalculatorInput = z.infer<typeof CalculatorInputSchema>;
export type CalculatorResponse = z.infer<typeof CalculatorResponseSchema>;
export type BusinessInfo = z.infer<typeof BusinessInfoSchema>;
export type RDActivities = z.infer<typeof RDActivitiesSchema>;
export type ExpenseBreakdown = z.infer<typeof ExpenseBreakdownSchema>;

// Legacy API compatibility (for gradual migration)
export const LegacyCalculatorSchema = z.object({
  businessType: z.string(),
  employees: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? parseInt(val, 10) : val
  ),
  rdSpending: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  )
});

export type LegacyCalculatorInput = z.infer<typeof LegacyCalculatorSchema>;