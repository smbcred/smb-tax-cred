/**
 * @file ExpenseInputs.tsx
 * @description Expense input step with real-time calculation preview
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Calculator Service
 * @knowledgeBase Step 3 - R&D expense inputs with validation and QRE calculation
 */

import { useState, useEffect } from "react";
import { CalculatorExpenses } from "@/types";
import { calculateRDTaxCredit, formatCurrency } from "@/services/calculator.service";

interface ExpenseInputsProps {
  expenses: CalculatorExpenses;
  onExpensesChange: (expenses: CalculatorExpenses) => void;
}

export default function ExpenseInputs({ expenses, onExpensesChange }: ExpenseInputsProps) {
  const [previewCalculation, setPreviewCalculation] = useState({
    totalQRE: 0,
    federalCredit: 0
  });

  // Real-time calculation preview
  useEffect(() => {
    const result = calculateRDTaxCredit(expenses);
    setPreviewCalculation({
      totalQRE: result.totalQRE,
      federalCredit: result.federalCredit
    });
  }, [expenses]);

  const handleExpenseChange = (field: keyof CalculatorExpenses, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newExpenses = { ...expenses, [field]: numValue };
    onExpensesChange(newExpenses);
  };

  const expenseFields = [
    {
      key: "wages" as keyof CalculatorExpenses,
      label: "Employee Wages & Benefits",
      tooltip: "Salaries and benefits for employees directly involved in R&D activities",
      placeholder: "150000"
    },
    {
      key: "contractors" as keyof CalculatorExpenses,
      label: "Contractor Costs",
      tooltip: "Payments to contractors for R&D work (65% qualifies per IRS guidelines)",
      placeholder: "50000"
    },
    {
      key: "supplies" as keyof CalculatorExpenses,
      label: "Supplies & Materials",
      tooltip: "Materials consumed in R&D activities",
      placeholder: "25000"
    },
    {
      key: "cloud" as keyof CalculatorExpenses,
      label: "Cloud & Software Services",
      tooltip: "Cloud computing and software tools used for R&D",
      placeholder: "15000"
    }
  ];

  return (
    <div className="calculator-step animate-fade-in">
      <h3 className="text-xl font-semibold text-slate-900 mb-6">
        Enter your R&D-related expenses
      </h3>
      <p className="text-slate-600 mb-6">
        Provide your annual expenses for qualifying research activities:
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {expenseFields.map((field) => (
          <div key={field.key}>
            <label className="form-label">
              {field.label}
              <i 
                className="fas fa-info-circle text-slate-400 ml-1 cursor-help" 
                title={field.tooltip}
              ></i>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                $
              </span>
              <input
                type="number"
                value={expenses[field.key] || ""}
                onChange={(e) => handleExpenseChange(field.key, e.target.value)}
                className="form-input pl-8"
                placeholder={field.placeholder}
                min="0"
                step="1000"
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Real-time calculation preview */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-rd-primary-200">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-rd-primary-700">Qualified Research Expenses:</span>
              <span className="font-semibold text-rd-primary-700 animate-count-up">
                {formatCurrency(previewCalculation.totalQRE)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-rd-primary-700">Estimated Federal Credit (14%):</span>
              <span className="font-semibold text-rd-primary-700 animate-count-up">
                {formatCurrency(previewCalculation.federalCredit)}
              </span>
            </div>
          </div>
        </div>

        {/* Helpful tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            <i className="fas fa-lightbulb mr-2"></i>
            Expense Tips
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Only include expenses directly related to R&D activities</li>
            <li>• Contractor costs are automatically reduced by 35% per IRS guidelines</li>
            <li>• Include cloud services used for development, testing, or research</li>
            <li>• Wages should include benefits for qualifying employees</li>
          </ul>
        </div>

        {previewCalculation.totalQRE > 0 && (
          <div className="bg-rd-secondary-50 border border-rd-secondary-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-rd-secondary-500 mr-2"></i>
              <span className="text-sm font-medium text-rd-secondary-700">
                Great! Your expenses qualify for an estimated{" "}
                <span className="font-bold">{formatCurrency(previewCalculation.federalCredit)}</span>{" "}
                federal R&D tax credit.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
