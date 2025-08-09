/**
 * @file InteractiveCalculator.tsx
 * @description 4-step R&D tax credit calculator with real-time calculations
 * @knowledgeBase system-architecture-explanation.md - Calculator Component
 */

import { useState, useReducer, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessTypeStep } from './steps/BusinessTypeStep';
import { QualifyingActivitiesStep } from './steps/QualifyingActivitiesStep';
import { ExpenseInputsStep } from './steps/ExpenseInputsStep';
import { ResultsDisplayStep } from './steps/ResultsDisplayStep';
import { CalculatorProgress } from './CalculatorProgress';
import { CalculatorEngine } from '@/services/calculation/calculator.engine';

// Calculator state interface
interface CalculatorState {
  currentStep: number;
  businessType: string | null;
  qualifyingActivities: string[];
  expenses: {
    totalEmployees: number;
    technicalEmployees: number;
    averageTechnicalSalary: number;
    contractorCosts: number;
    softwareCosts: number;
    cloudCosts: number;
  };
  results: {
    totalQRE: number;
    federalCredit: number;
    stateCredit: number;
    totalBenefit: number;
    pricingTier: number;
    tierInfo: any;
    roi: number;
    breakdown?: {
      wages: number;
      contractors: number;
      supplies: number;
      cloud: number;
    };
  } | null;
  isValid: boolean;
}

// Initial state
const initialState: CalculatorState = {
  currentStep: 1,
  businessType: null,
  qualifyingActivities: [],
  expenses: {
    totalEmployees: 0,
    technicalEmployees: 0,
    averageTechnicalSalary: 0,
    contractorCosts: 0,
    softwareCosts: 0,
    cloudCosts: 0
  },
  results: null,
  isValid: false
};

// Action types
type Action = 
  | { type: 'SET_BUSINESS_TYPE'; payload: string }
  | { type: 'SET_ACTIVITIES'; payload: string[] }
  | { type: 'UPDATE_EXPENSES'; payload: any }
  | { type: 'CALCULATE_RESULTS'; payload: any }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'RESET' };

// Reducer for state management
function calculatorReducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'SET_BUSINESS_TYPE':
      return { ...state, businessType: action.payload };
    case 'SET_ACTIVITIES':
      return { ...state, qualifyingActivities: action.payload };
    case 'UPDATE_EXPENSES':
      return { 
        ...state, 
        expenses: { ...state.expenses, ...action.payload } 
      };
    case 'CALCULATE_RESULTS':
      return { ...state, results: action.payload };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(4, state.currentStep + 1) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const InteractiveCalculator: React.FC = () => {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Real-time calculation effect
  const performCalculation = useCallback(() => {
    if (state.expenses.technicalEmployees > 0 && state.expenses.averageTechnicalSalary > 0) {
      setIsCalculating(true);
      
      try {
        // Use the new ASC method calculator
        const calculationResult = CalculatorEngine.calculate({
          businessType: state.businessType || 'professional_services',
          totalEmployees: state.expenses.totalEmployees,
          technicalEmployees: state.expenses.technicalEmployees,
          averageTechnicalSalary: state.expenses.averageTechnicalSalary,
          rdAllocationPercentage: 100, // Default to 100% for now
          contractorCosts: state.expenses.contractorCosts,
          suppliesCosts: 0,
          softwareCosts: state.expenses.softwareCosts,
          cloudCosts: state.expenses.cloudCosts,
          isFirstTimeFiler: true // Default to first-time filer for better initial estimates
        });
        
        const results = {
          totalQRE: calculationResult.qreBreakdown.total,
          federalCredit: calculationResult.federalCredit,
          stateCredit: 0, // No state credits for now
          totalBenefit: calculationResult.federalCredit,
          pricingTier: calculationResult.pricingTier.price,
          tierInfo: calculationResult.pricingTier,
          roi: calculationResult.roi.roiMultiple,
          breakdown: {
            wages: calculationResult.qreBreakdown.wages,
            contractors: calculationResult.qreBreakdown.contractors,
            supplies: calculationResult.qreBreakdown.supplies,
            cloud: calculationResult.qreBreakdown.cloudAndAI
          }
        };
        
        dispatch({ type: 'CALCULATE_RESULTS', payload: results });
      } catch (error) {
        console.error('Calculation error:', error);
      }
      
      setIsCalculating(false);
    }
  }, [state.expenses, state.businessType]);

  // Navigation handlers
  const handleNext = () => {
    if (state.currentStep === 3) {
      // Calculate before showing results
      performCalculation();
    }
    if (state.currentStep === 4 && !showLeadCapture) {
      setShowLeadCapture(true);
    } else {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handlePrev = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  // Validation for navigation
  const canProceed = () => {
    switch (state.currentStep) {
      case 1: return state.businessType !== null;
      case 2: return state.qualifyingActivities.length > 0;
      case 3: return state.expenses.technicalEmployees > 0 && state.expenses.averageTechnicalSalary > 0;
      default: return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          Calculate Your R&D Tax Credit
        </h2>
        <p className="text-gray-600 text-center mt-2 text-sm sm:text-base">
          See your potential federal credit in under 2 minutes
        </p>
      </div>

      {/* Progress Indicator */}
      <CalculatorProgress 
        currentStep={state.currentStep} 
        totalSteps={4}
      />

      {/* Step Content */}
      <div className="mt-6 sm:mt-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          {state.currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BusinessTypeStep
                selectedType={state.businessType}
                onSelect={(type) => dispatch({ type: 'SET_BUSINESS_TYPE', payload: type })}
              />
            </motion.div>
          )}

          {state.currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QualifyingActivitiesStep
                selectedActivities={state.qualifyingActivities}
                onUpdate={(activities) => dispatch({ type: 'SET_ACTIVITIES', payload: activities })}
                businessType={state.businessType}
              />
            </motion.div>
          )}

          {state.currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ExpenseInputsStep
                expenses={state.expenses}
                onUpdate={(updates) => {
                  dispatch({ type: 'UPDATE_EXPENSES', payload: updates });
                }}
                businessType={state.businessType}
              />
            </motion.div>
          )}

          {state.currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResultsDisplayStep
                results={state.results}
                isBlurred={!emailCaptured}
                onCTAClick={() => setShowLeadCapture(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 sm:mt-8">
        <button
          onClick={handlePrev}
          disabled={state.currentStep === 1}
          className={`
            px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all
            ${state.currentStep === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`
            px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-all
            ${canProceed()
              ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {state.currentStep === 4 ? 'See Full Results' : 'Next'}
        </button>
      </div>

      {/* Lead Capture Modal */}
      {showLeadCapture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 sm:p-8 rounded-lg max-w-md w-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-4">See Your Full Results</h3>
            <p className="text-gray-600 mb-6">
              Enter your email to unlock your complete R&D credit estimate and pricing.
            </p>
            <form 
              className="space-y-4" 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const email = formData.get('email') as string;
                if (email) {
                  // Store email for later use (you can send to backend here)
                  console.log('Email captured:', email);
                  setEmailCaptured(true);
                  setShowLeadCapture(false);
                  // Optionally show a success message or send to backend
                }
              }}
            >
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button 
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                Get My Results
              </button>
            </form>
            <button
              onClick={() => setShowLeadCapture(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};