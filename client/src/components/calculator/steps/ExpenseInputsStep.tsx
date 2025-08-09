/**
 * @file ExpenseInputsStep.tsx
 * @description Step 3: Innovation expense inputs for calculation
 */

import { useState, useEffect } from 'react';
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
  };
  onUpdate: (updates: any) => void;
  businessType: string | null;
}

export const ExpenseInputsStep: React.FC<ExpenseInputsStepProps> = ({
  expenses,
  onUpdate,
  businessType
}) => {
  const [localExpenses, setLocalExpenses] = useState(expenses);

  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate(localExpenses);
    }, 500);
    return () => clearTimeout(timer);
  }, [localExpenses]);

  const handleChange = (field: string, value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, '') || '0');
    setLocalExpenses(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  // Quick estimate display - FIXED calculation
  const rdAllocation = (localExpenses.rdAllocationPercentage ?? 100) / 100;
  const wageQRE = localExpenses.technicalEmployees * localExpenses.averageTechnicalSalary * rdAllocation;
  const contractorQRE = localExpenses.contractorCosts * 0.65; // Only contractors limited to 65%
  const suppliesQRE = localExpenses.softwareCosts + localExpenses.cloudCosts;
  const totalQRE = wageQRE + contractorQRE + suppliesQRE;
  const estimatedCredit = Math.round(totalQRE * 0.14);

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
                value={localExpenses.totalEmployees || ''}
                onChange={(e) => handleChange('totalEmployees', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employees Working on AI Projects
              </label>
              <input
                type="number"
                value={localExpenses.technicalEmployees || ''}
                onChange={(e) => handleChange('technicalEmployees', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Staff developing AI tools, prompts, or automations
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
                value={localExpenses.averageTechnicalSalary ? localExpenses.averageTechnicalSalary.toLocaleString() : ''}
                onChange={(e) => handleChange('averageTechnicalSalary', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 95,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                % Time on R&D Activities
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={localExpenses.rdAllocationPercentage ?? 100}
                  onChange={(e) => handleChange('rdAllocationPercentage', e.target.value)}
                  min="0"
                  max="100"
                  className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="100"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Percentage of time spent on experimentation & testing
              </p>
            </div>
            </div>
          </div>
        </div>

        {/* AI-Related Expenses */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">AI Tool & Service Expenses</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Consultants/Contractors (annual)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="text"
                  value={localExpenses.contractorCosts ? localExpenses.contractorCosts.toLocaleString() : ''}
                  onChange={(e) => handleChange('contractorCosts', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 50,000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  External AI developers, prompt engineers, consultants
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Software & APIs (ChatGPT, Claude, etc.)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="text"
                  value={localExpenses.softwareCosts ? localExpenses.softwareCosts.toLocaleString() : ''}
                  onChange={(e) => handleChange('softwareCosts', e.target.value)}
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
                Cloud & Infrastructure for AI
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="text"
                  value={localExpenses.cloudCosts ? localExpenses.cloudCosts.toLocaleString() : ''}
                  onChange={(e) => handleChange('cloudCosts', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 15,000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  AWS, Azure, GCP for AI workloads, vector databases
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Estimate */}
        {localExpenses.technicalEmployees > 0 && localExpenses.averageTechnicalSalary > 0 && (
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