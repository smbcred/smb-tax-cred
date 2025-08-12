/**
 * @file ExpenseInputsStepNew.tsx
 * @description Simplified, working version of expense inputs
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AIExpenseOptimizer } from '../AIExpenseOptimizer';

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

export const ExpenseInputsStepNew: React.FC<ExpenseInputsStepProps> = ({
  expenses,
  onUpdate,
  businessType
}) => {
  // Keep all form values as strings while typing - NEVER coerce to numbers
  const [inputs, setInputs] = useState(() => ({
    totalEmployees: expenses.totalEmployees > 0 ? expenses.totalEmployees.toString() : '',
    technicalEmployees: expenses.technicalEmployees > 0 ? expenses.technicalEmployees.toString() : '',
    averageTechnicalSalary: expenses.averageTechnicalSalary > 0 ? expenses.averageTechnicalSalary.toString() : '',
    contractorCosts: expenses.contractorCosts > 0 ? expenses.contractorCosts.toString() : '',
    softwareCosts: expenses.softwareCosts > 0 ? expenses.softwareCosts.toString() : '',
    cloudCosts: expenses.cloudCosts > 0 ? expenses.cloudCosts.toString() : '',
    rdAllocationPercentage: (expenses.rdAllocationPercentage ?? 100).toString()
  }));

  const [showPriorYears, setShowPriorYears] = useState(!expenses.isFirstTimeFiler);

  // Handle text input changes - allow empty strings and partial typing
  const handleInputChange = (field: string, value: string) => {
    // Update local state immediately - allow ANY string value including ''
    setInputs(prev => ({ ...prev, [field]: value }));
    
    // Update parent with number value - only convert when not empty
    const numValue = value === '' ? 0 : parseInt(value.replace(/[^0-9]/g, '')) || 0;
    onUpdate({ [field]: numValue });
  };

  // Handle checkbox/number changes
  const handleDirectChange = (field: string, value: boolean | number) => {
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

  // Quick estimate calculation
  const rdAllocation = (expenses.rdAllocationPercentage ?? 100) / 100;
  const wageQRE = expenses.technicalEmployees * expenses.averageTechnicalSalary * rdAllocation;
  const contractorQRE = expenses.contractorCosts * 0.65;
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
                type="number"
                inputMode="decimal"
                value={inputs.totalEmployees}
                onChange={(e) => handleInputChange('totalEmployees', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black bg-white"
                placeholder="e.g., 25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employees Working on Innovation Projects
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={inputs.technicalEmployees}
                onChange={(e) => handleInputChange('technicalEmployees', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black bg-white"
                placeholder="e.g., 10"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Salary of Innovation Employees
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                inputMode="decimal"
                value={inputs.averageTechnicalSalary}
                onChange={(e) => handleInputChange('averageTechnicalSalary', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black bg-white"
                placeholder="e.g., 95,000"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              % Time on R&D Activities
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                value={inputs.rdAllocationPercentage}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputs(prev => ({ ...prev, rdAllocationPercentage: value }));
                  handleDirectChange('rdAllocationPercentage', parseInt(value));
                }}
                min="0"
                max="100"
                step="5"
                className="flex-1"
              />
              <div className="w-16 text-center font-medium">
                {inputs.rdAllocationPercentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Prior Year Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">Prior Year R&D Information</h4>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={expenses.isFirstTimeFiler ?? true}
              onChange={(e) => handleDirectChange('isFirstTimeFiler', e.target.checked)}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">
              First-time R&D tax credit filer (6% credit rate)
            </span>
          </label>
        </div>

        {/* Other Costs */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">Other Innovation Costs</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technical Consultants/Contractors
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={inputs.contractorCosts}
                  onChange={(e) => handleInputChange('contractorCosts', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black bg-white"
                  placeholder="e.g., 50,000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Software & APIs
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={inputs.softwareCosts}
                  onChange={(e) => handleInputChange('softwareCosts', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black bg-white"
                  placeholder="e.g., 25,000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cloud & Infrastructure
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={inputs.cloudCosts}
                  onChange={(e) => handleInputChange('cloudCosts', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black bg-white"
                  placeholder="e.g., 15,000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Expense Optimization Tooltip */}
        <AIExpenseOptimizer
          expenses={{
            totalEmployees: expenses.totalEmployees,
            technicalEmployees: expenses.technicalEmployees,
            averageTechnicalSalary: expenses.averageTechnicalSalary,
            contractorCosts: expenses.contractorCosts,
            softwareCosts: expenses.softwareCosts,
            cloudCosts: expenses.cloudCosts,
            rdAllocationPercentage: expenses.rdAllocationPercentage ?? 100
          }}
          businessType={businessType || 'technology'}
          onSuggestionApply={(suggestion) => {
            // Handle suggestion application
            switch (suggestion.type) {
              case 'allocation':
                if (suggestion.id === 'increase-rd-allocation') {
                  onUpdate({ rdAllocationPercentage: 85 });
                }
                break;
              case 'software':
                // You could open a modal or provide guidance
                console.log('Software suggestion:', suggestion);
                break;
              default:
                console.log('Applied suggestion:', suggestion);
            }
          }}
          className="mb-4"
        />

        {/* Live Estimate */}
        {expenses.technicalEmployees > 0 && expenses.averageTechnicalSalary > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
          >
            <h4 className="font-semibold text-green-900 mb-2">Quick Estimate</h4>
            <div className="text-2xl font-bold text-green-900">
              ${estimatedCredit.toLocaleString()} estimated federal credit
            </div>
            <p className="text-sm text-green-700 mt-1">
              Based on ${totalQRE.toLocaleString()} in qualifying expenses at {(creditRate * 100)}% rate
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};