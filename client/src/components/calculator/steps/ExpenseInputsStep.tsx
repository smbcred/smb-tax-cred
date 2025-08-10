/**
 * @file ExpenseInputsStep.tsx
 * @description Step 3: Innovation expense inputs for calculation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/calculations';

interface ExpenseInputsStepProps {
  expenses: {
    totalEmployees: number;
    technicalEmployees: number;
    averageTechnicalSalary: number;
    rdAllocationPercentage?: number;
    contractorCosts: number;
    softwareCosts: number;
    cloudCosts: number;
    isFirstTimeFiler?: boolean;
    priorYearQREs?: number[];
  };
  onUpdate: (updates: any) => void;
  businessType: string | null;
}

export const ExpenseInputsStep: React.FC<ExpenseInputsStepProps> = ({
  expenses,
  onUpdate,
  businessType
}) => {
  // Use controlled inputs with form values that persist during typing
  const [formValues, setFormValues] = useState({
    totalEmployees: expenses.totalEmployees || '',
    technicalEmployees: expenses.technicalEmployees || '',
    averageTechnicalSalary: expenses.averageTechnicalSalary || '',
    contractorCosts: expenses.contractorCosts || '',
    softwareCosts: expenses.softwareCosts || '',
    cloudCosts: expenses.cloudCosts || ''
  });
  
  const [showPriorYears, setShowPriorYears] = useState(!expenses.isFirstTimeFiler);
  const [warnings, setWarnings] = useState<string[]>([]);
  const updateTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize form values from props only on mount
  useEffect(() => {
    setFormValues({
      totalEmployees: expenses.totalEmployees > 0 ? expenses.totalEmployees.toString() : '',
      technicalEmployees: expenses.technicalEmployees > 0 ? expenses.technicalEmployees.toString() : '',
      averageTechnicalSalary: expenses.averageTechnicalSalary > 0 ? expenses.averageTechnicalSalary.toLocaleString() : '',
      contractorCosts: expenses.contractorCosts > 0 ? expenses.contractorCosts.toLocaleString() : '',
      softwareCosts: expenses.softwareCosts > 0 ? expenses.softwareCosts.toLocaleString() : '',
      cloudCosts: expenses.cloudCosts > 0 ? expenses.cloudCosts.toLocaleString() : ''
    });
  }, []); // Only run on mount

  // Update showPriorYears when first-time filer status changes
  useEffect(() => {
    setShowPriorYears(!expenses.isFirstTimeFiler);
  }, [expenses.isFirstTimeFiler]);

  const validateExpenses = useCallback(() => {
    const newWarnings: string[] = [];
    
    if (expenses.rdAllocationPercentage && expenses.rdAllocationPercentage > 80) {
      newWarnings.push('Allocating over 80% to R&D may require additional documentation');
    }
    
    if (expenses.averageTechnicalSalary > 0 && expenses.averageTechnicalSalary < 30000) {
      newWarnings.push('Average salary seems low for technical employees');
    }
    
    if (expenses.averageTechnicalSalary > 300000) {
      newWarnings.push('Average salary is unusually high - ensure this reflects actual wages');
    }
    
    if (expenses.contractorCosts > (expenses.technicalEmployees * expenses.averageTechnicalSalary)) {
      newWarnings.push('Contractor costs exceed employee wages - ensure proper documentation');
    }
    
    setWarnings(newWarnings);
  }, [expenses]);

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(validateExpenses, 300);
    return () => clearTimeout(timer);
  }, [validateExpenses]);

  const handleInputChange = (field: string, value: string) => {
    // Update local form state immediately for UI responsiveness
    setFormValues(prev => ({ ...prev, [field]: value }));
    
    // Clear any existing timeout for this field
    if (updateTimeouts.current[field]) {
      clearTimeout(updateTimeouts.current[field]);
    }
    
    // Set up debounced update to parent
    updateTimeouts.current[field] = setTimeout(() => {
      const numValue = parseInt(value.replace(/[^0-9]/g, '') || '0');
      onUpdate({ [field]: numValue });
    }, 750); // Longer delay to prevent interference
  };

  const handleNonStringChange = (field: string, value: boolean | number) => {
    onUpdate({ [field]: value });
    if (field === 'isFirstTimeFiler' && typeof value === 'boolean') {
      setShowPriorYears(!value);
      if (value) {
        onUpdate({ priorYearQREs: [] });
      }
    }
  };

  const handlePriorYearChange = (yearIndex: number, value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, '') || '0');
    const priorYears = [...(expenses.priorYearQREs || [0, 0, 0])];
    priorYears[yearIndex] = numValue;
    onUpdate({ priorYearQREs: priorYears });
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(updateTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Quick estimate display - FIXED calculation
  const rdAllocation = (expenses.rdAllocationPercentage ?? 100) / 100;
  const wageQRE = expenses.technicalEmployees * expenses.averageTechnicalSalary * rdAllocation;
  const contractorQRE = expenses.contractorCosts * 0.65; // Only contractors limited to 65%
  const suppliesQRE = expenses.softwareCosts + expenses.cloudCosts;
  const totalQRE = wageQRE + contractorQRE + suppliesQRE;
  const creditRate = expenses.isFirstTimeFiler ? 0.06 : 0.14;
  const estimatedCredit = Math.round(totalQRE * creditRate);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Enter your innovation-related expenses
        </h3>
        <p className="text-gray-600">
          Include wages for employees working on innovation projects and technology costs
        </p>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            💵 Federal Credit Only - No state credit calculations included
          </p>
        </div>
        
        {/* QRE Exclusions - Critical Compliance */}
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ Important: Expenses NOT Eligible for R&D Credit</p>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• Land or buildings</li>
            <li>• General administrative costs</li>
            <li>• Marketing and advertising expenses</li>
            <li>• Foreign research (conducted outside U.S.)</li>
            <li>• Funded research (paid by others)</li>
            <li>• Contractor costs are limited to 65% of amount paid</li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        {/* Employee Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">Employee Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Employees
              </label>
              <input
                type="text"
                value={formValues.totalEmployees}
                onChange={(e) => handleInputChange('totalEmployees', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employees Working on Innovation Projects
              </label>
              <input
                type="text"
                value={formValues.technicalEmployees}
                onChange={(e) => handleInputChange('technicalEmployees', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Staff developing technology solutions, testing, or experimentation
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Salary of Innovation Employees
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="text"
                  value={formValues.averageTechnicalSalary}
                  onChange={(e) => handleInputChange('averageTechnicalSalary', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 95,000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                % Time on R&D Activities
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    value={expenses.rdAllocationPercentage ?? 100}
                    onChange={(e) => handleNonStringChange('rdAllocationPercentage', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    step="5"
                    className="flex-1"
                  />
                  <div className="relative w-20">
                    <input
                      type="number"
                      value={expenses.rdAllocationPercentage ?? 100}
                      onChange={(e) => handleNonStringChange('rdAllocationPercentage', parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full pr-6 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <span className="absolute right-2 top-1 text-gray-500">%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Percentage of time spent on experimentation & testing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prior Year QREs */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">Prior Year R&D Information</h4>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={expenses.isFirstTimeFiler ?? true}
                onChange={(e) => handleNonStringChange('isFirstTimeFiler', e.target.checked)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                First-time R&D tax credit filer (6% credit rate)
              </span>
            </label>
            
            {!expenses.isFirstTimeFiler && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-gray-600">
                  Enter your prior 3 years of Qualified Research Expenses (14% credit rate on excess)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((yearIndex) => (
                    <div key={yearIndex}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {new Date().getFullYear() - yearIndex - 1} QREs
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-gray-500 text-sm">$</span>
                        <input
                          type="text"
                          value={(expenses.priorYearQREs?.[yearIndex] || 0).toLocaleString()}
                          onChange={(e) => handlePriorYearChange(yearIndex, e.target.value)}
                          className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Innovation-Related Expenses */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">Innovation Tool & Service Expenses</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technical Consultants/Contractors (annual)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="text"
                  value={formValues.contractorCosts}
                  onChange={(e) => handleInputChange('contractorCosts', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 50,000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  External developers, engineers, technical consultants
                </p>
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    <strong>⚠️ IRS Limit:</strong> Only 65% of contractor costs qualify for R&D credit per IRC Section 41
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Software & APIs (Development tools, licenses, etc.)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="text"
                  value={formValues.softwareCosts}
                  onChange={(e) => handleInputChange('softwareCosts', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 25,000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  OpenAI, Anthropic, Cohere, Midjourney, other AI tools
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cloud & Infrastructure for Innovation
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="text"
                  value={formValues.cloudCosts}
                  onChange={(e) => handleInputChange('cloudCosts', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 15,000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  AWS, Azure, GCP for development, testing, production
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Warnings */}
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <h5 className="font-medium text-yellow-800 mb-2">⚠️ Please Note:</h5>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-700">
                  • {warning}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Live Estimate */}
        {expenses.technicalEmployees > 0 && expenses.averageTechnicalSalary > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-800">
                Estimated Federal R&D Credit:
              </span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(estimatedCredit)}
              </span>
            </div>
            <p className="text-xs text-green-700 mt-2">
              This is a preliminary estimate. Your actual credit will be calculated based on detailed analysis.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};