/**
 * @file InteractiveCalculator.tsx
 * @description 4-step interactive R&D tax credit calculator
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Calculator Service, Calculator Steps
 * @knowledgeBase Multi-step calculator with business type, activities, expenses, and results
 */

import { useState } from "react";
import BusinessTypeStep from "./BusinessTypeStep";
import QualifyingActivities from "./QualifyingActivities";
import ExpenseInputs from "./ExpenseInputs";
import ResultsDisplay from "./ResultsDisplay";
import { CalculatorExpenses, CalculationResult } from "@/types";

interface InteractiveCalculatorProps {
  onResultsReady: (data: CalculationResult) => void;
}

export default function InteractiveCalculator({ onResultsReady }: InteractiveCalculatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessType, setBusinessType] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<CalculatorExpenses>({
    wages: 0,
    contractors: 0,
    supplies: 0,
    cloud: 0
  });
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return businessType !== "";
      case 2:
        return selectedActivities.length > 0;
      case 3:
        const totalExpenses = Object.values(expenses).reduce((sum, value) => sum + value, 0);
        return totalExpenses > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    setErrors([]);
    
    if (!canProceed()) {
      setErrors(["Please complete all required fields before proceeding"]);
      return;
    }

    if (currentStep === 3) {
      // Calculate results when moving to step 4
      try {
        const response = await fetch("/api/calculator/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expenses)
        });
        
        if (!response.ok) {
          throw new Error("Calculation failed");
        }
        
        const result = await response.json();
        setCalculationResult(result);
      } catch (error) {
        setErrors(["Failed to calculate results. Please try again."]);
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResultsReady = () => {
    if (calculationResult) {
      onResultsReady(calculationResult);
    }
  };

  return (
    <section id="calculator" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Calculate Your R&D Tax Credit
          </h2>
          <p className="text-lg text-slate-600">
            Follow our simple 4-step process to estimate your potential federal tax credits
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-rd-primary-500">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-slate-600">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="progress-bar transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
        )}

        {/* Calculator Steps Container */}
        <div className="bg-slate-50 rounded-xl p-8 shadow-sm border border-slate-200">
          
          {/* Step 1: Business Type */}
          {currentStep === 1 && (
            <BusinessTypeStep
              selectedType={businessType}
              onTypeSelect={setBusinessType}
            />
          )}

          {/* Step 2: Qualifying Activities */}
          {currentStep === 2 && (
            <QualifyingActivities
              selectedActivities={selectedActivities}
              onActivitiesChange={setSelectedActivities}
              businessType={businessType}
            />
          )}

          {/* Step 3: Expense Inputs */}
          {currentStep === 3 && (
            <ExpenseInputs
              expenses={expenses}
              onExpensesChange={setExpenses}
            />
          )}

          {/* Step 4: Results */}
          {currentStep === 4 && calculationResult && (
            <ResultsDisplay
              result={calculationResult}
              onGetFullReport={handleResultsReady}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={previousStep}
              className={`px-6 py-2 text-slate-600 hover:text-slate-900 transition-colors ${
                currentStep === 1 ? 'invisible' : ''
              }`}
            >
              <i className="fas fa-arrow-left mr-2"></i>Previous
            </button>
            
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === totalSteps ? 'View Results' : 'Next'}
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
