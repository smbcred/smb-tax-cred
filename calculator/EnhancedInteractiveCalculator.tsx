/**
 * @file EnhancedInteractiveCalculator.tsx
 * @description Enhanced 4-step R&D tax credit calculator with legislative benefits
 */

import { useState, useReducer, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

// Enhanced imports
import { BusinessTypeStep } from './steps/BusinessTypeStep';
import { QualifyingActivitiesStep } from './steps/QualifyingActivitiesStep';
import { EnhancedExpenseStep } from './steps/EnhancedExpenseStep';
import { EnhancedResultsStep } from './steps/EnhancedResultsStep';
import { ProgressIndicator } from './ProgressIndicator';
import { LeadCaptureModal } from '@/components/leadCapture/LeadCaptureModal';
import { EnhancedRDTaxCalculator, type EnhancedCalculationInput, type EnhancedCalculationResult } from '@/services/calculation/calculator.engine';

// Enhanced calculator state
interface EnhancedCalculatorState {
  currentStep: number;
  businessType: string | null;
  qualifyingActivities: string[];
  
  // Enhanced expense data
  expenseData: {
    // Company info
    industryCode: string;
    currentYearRevenue: number;
    yearOfFirstRevenue: number;
    hasIncomeTaxLiability: boolean;
    quarterlyPayrollTax: number;
    
    // R&D team
    technicalEmployees: number;
    averageTechnicalSalary: number;
    rdAllocationPercentage: number;
    
    // Expenses
    contractorCosts: number;
    suppliesCosts: number;
    softwareCosts: number;
    cloudCosts: number;
    
    // Prior years
    priorYearQREs: number[];
    isFirstTimeFiler: boolean;
    
    // Options
    section280CElection: 'full' | 'reduced';
    taxYear: number;
  };
  
  results: EnhancedCalculationResult | null;
  isValid: boolean;
}

// Enhanced initial state with legislative defaults
const initialState: EnhancedCalculatorState = {
  currentStep: 1,
  businessType: null,
  qualifyingActivities: [],
  
  expenseData: {
    industryCode: '541511', // Software development
    currentYearRevenue: 1200000, // Default $1.2M - QSB eligible
    yearOfFirstRevenue: new Date().getFullYear() - 2, // 2 years ago
    hasIncomeTaxLiability: false, // Startup default
    quarterlyPayrollTax: 15000, // $60k annual payroll
    
    technicalEmployees: 4,
    averageTechnicalSalary: 95000,
    rdAllocationPercentage: 65, // Realistic R&D allocation
    
    contractorCosts: 85000,
    suppliesCosts: 12000,
    softwareCosts: 25000,
    cloudCosts: 18000,
    
    priorYearQREs: [],
    isFirstTimeFiler: true,
    
    section280CElection: 'full',
    taxYear: new Date().getFullYear()
  },
  
  results: null,
  isValid: false
};

// Enhanced action types
type EnhancedAction = 
  | { type: 'SET_BUSINESS_TYPE'; payload: string }
  | { type: 'SET_ACTIVITIES'; payload: string[] }
  | { type: 'UPDATE_EXPENSE_DATA'; payload: Partial<EnhancedCalculatorState['expenseData']> }
  | { type: 'CALCULATE_RESULTS'; payload: EnhancedCalculationResult }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'RESET' };

// Enhanced reducer
function enhancedCalculatorReducer(state: EnhancedCalculatorState, action: EnhancedAction): EnhancedCalculatorState {
  switch (action.type) {
    case 'SET_BUSINESS_TYPE':
      return { 
        ...state, 
        businessType: action.payload,
        expenseData: {
          ...state.expenseData,
          // Update industry code based on business type
          industryCode: action.payload === 'Software' ? '541511' : 
                       action.payload === 'E-commerce' ? '454110' :
                       action.payload === 'Agency' ? '541613' : '541511'
        }
      };
    case 'SET_ACTIVITIES':
      return { ...state, qualifyingActivities: action.payload };
    case 'UPDATE_EXPENSE_DATA':
      return { 
        ...state, 
        expenseData: { ...state.expenseData, ...action.payload } 
      };
    case 'CALCULATE_RESULTS':
      return { ...state, results: action.payload };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 4) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    case 'RESET':
      return { ...initialState, currentStep: 1 };
    default:
      return state;
  }
}

export const EnhancedInteractiveCalculator: React.FC = () => {
  const [state, dispatch] = useReducer(enhancedCalculatorReducer, initialState);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [capturedLeadId, setCapturedLeadId] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

  // Enhanced calculation with legislative benefits
  const performEnhancedCalculation = useCallback(() => {
    if (state.expenseData.technicalEmployees > 0 && state.expenseData.averageTechnicalSalary > 0) {
      setIsCalculating(true);
      
      try {
        const calculationInput: EnhancedCalculationInput = {
          businessType: state.businessType || 'Software',
          industryCode: state.expenseData.industryCode,
          
          // QSB fields
          currentYearRevenue: state.expenseData.currentYearRevenue,
          yearOfFirstRevenue: state.expenseData.yearOfFirstRevenue,
          hasIncomeTaxLiability: state.expenseData.hasIncomeTaxLiability,
          quarterlyPayrollTax: state.expenseData.quarterlyPayrollTax,
          
          // R&D team
          technicalEmployees: state.expenseData.technicalEmployees,
          averageTechnicalSalary: state.expenseData.averageTechnicalSalary,
          rdAllocationPercentage: state.expenseData.rdAllocationPercentage,
          
          // Expenses
          contractorCosts: state.expenseData.contractorCosts,
          suppliesCosts: state.expenseData.suppliesCosts,
          softwareCosts: state.expenseData.softwareCosts,
          cloudCosts: state.expenseData.cloudCosts,
          
          // Prior years
          priorYearQREs: state.expenseData.priorYearQREs,
          isFirstTimeFiler: state.expenseData.isFirstTimeFiler,
          
          // Options
          section280CElection: state.expenseData.section280CElection,
          taxYear: state.expenseData.taxYear,
          
          // Activities
          qualifyingActivities: state.qualifyingActivities
        };

        const enhancedResult = EnhancedRDTaxCalculator.calculate(calculationInput);
        dispatch({ type: 'CALCULATE_RESULTS', payload: enhancedResult });

        // Auto-advance to results
        dispatch({ type: 'GO_TO_STEP', payload: 4 });
        
      } catch (error) {
        console.error('Enhanced calculation error:', error);
        setStepErrors({
          ...stepErrors,
          3: ['Calculation failed. Please verify your inputs.']
        });
      }
      
      setIsCalculating(false);
    }
  }, [state.expenseData, state.businessType, state.qualifyingActivities, stepErrors]);

  // Enhanced validation - removed stepErrors dependency to prevent infinite re-renders
  const validateCurrentStep = useCallback((): boolean => {
    const errors: string[] = [];

    switch (state.currentStep) {
      case 1:
        if (!state.businessType) {
          errors.push('Please select your business type');
        }
        break;
        
      case 2:
        if (state.qualifyingActivities.length === 0) {
          errors.push('Please select at least one qualifying activity');
        }
        break;
        
      case 3:
        if (state.expenseData.technicalEmployees === 0) {
          errors.push('Please enter number of technical employees');
        }
        if (state.expenseData.averageTechnicalSalary === 0) {
          errors.push('Please enter average technical salary');
        }
        if (state.expenseData.currentYearRevenue === 0) {
          errors.push('Please enter current year revenue');
        }
        if (!state.expenseData.yearOfFirstRevenue) {
          errors.push('Please enter year of first revenue');
        }
        break;
        
      case 4:
        // Results step - always valid
        break;
    }

    if (errors.length > 0) {
      setStepErrors(prev => ({ ...prev, [state.currentStep]: errors }));
    } else {
      setStepErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[state.currentStep];
        return newErrors;
      });
    }
    return errors.length === 0;
  }, [state.currentStep, state.businessType, state.qualifyingActivities, state.expenseData]);

  // Auto-calculation trigger - removed validateCurrentStep dependency
  useEffect(() => {
    if (state.currentStep === 3) {
      const timer = setTimeout(() => {
        if (state.expenseData.technicalEmployees > 0 && state.expenseData.averageTechnicalSalary > 0) {
          performEnhancedCalculation();
        }
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [state.expenseData, state.currentStep, performEnhancedCalculation]);

  // Step navigation handlers
  const handleNext = () => {
    if (validateCurrentStep()) {
      setVisitedSteps(prev => new Set([...prev, state.currentStep + 1]));
      
      if (state.currentStep === 3) {
        performEnhancedCalculation();
      } else {
        dispatch({ type: 'NEXT_STEP' });
      }
    }
  };

  const handlePrev = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const handleStepClick = (step: number) => {
    if (visitedSteps.has(step)) {
      dispatch({ type: 'GO_TO_STEP', payload: step });
    }
  };

  const handleStartOver = () => {
    dispatch({ type: 'RESET' });
    setVisitedSteps(new Set([1]));
    setStepErrors({});
  };

  const handleCaptureLeads = () => {
    setShowLeadCapture(true);
  };

  // Step titles for enhanced calculator
  const stepTitles = [
    'Business Type',
    'AI Activities', 
    'R&D Details',
    'Your Results'
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 max-w-4xl mx-auto">
      {/* Enhanced Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Enhanced R&D Tax Credit Calculator
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Discover your QSB benefits, legislative advantages, and payroll tax offset opportunities
        </p>
      </div>

      {/* Enhanced Progress Indicator */}
      <ProgressIndicator 
        currentStep={state.currentStep} 
        totalSteps={4}
        stepTitles={stepTitles}
        visitedSteps={Array.from(visitedSteps)}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      <div className="mt-6 sm:mt-8 min-h-[500px]">
        <AnimatePresence mode="wait">
          {state.currentStep === 1 && (
            <motion.div
              key="enhanced-step1"
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
              key="enhanced-step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QualifyingActivitiesStep
                selectedActivities={state.qualifyingActivities}
                businessType={state.businessType}
                onActivitiesChange={(activities: string[]) => dispatch({ type: 'SET_ACTIVITIES', payload: activities })}
              />
            </motion.div>
          )}

          {state.currentStep === 3 && (
            <motion.div
              key="enhanced-step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EnhancedExpenseStep
                data={state.expenseData}
                onChange={(data) => dispatch({ type: 'UPDATE_EXPENSE_DATA', payload: data })}
                onNext={handleNext}
                onBack={handlePrev}
                isValid={validateCurrentStep()}
              />
            </motion.div>
          )}

          {state.currentStep === 4 && state.results && (
            <motion.div
              key="enhanced-step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <EnhancedResultsStep
                results={state.results}
                onStartOver={handleStartOver}
                onCaptureLeads={handleCaptureLeads}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Navigation */}
      {state.currentStep < 4 && state.currentStep !== 3 && (
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          {state.currentStep > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNext}
            disabled={!validateCurrentStep() || isCalculating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isCalculating ? (
              'Calculating...'
            ) : state.currentStep === 3 ? (
              'Calculate Results'
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {stepErrors[state.currentStep] && stepErrors[state.currentStep].length > 0 && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Please fix the following issues:</span>
          </div>
          <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
            {stepErrors[state.currentStep].map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Lead Capture Modal */}
      {showLeadCapture && (
        <LeadCaptureModal
          isOpen={showLeadCapture}
          onClose={() => setShowLeadCapture(false)}
          onSuccess={(leadId) => {
            setCapturedLeadId(leadId);
            setEmailCaptured(true);
            setShowLeadCapture(false);
          }}
        />
      )}
    </div>
  );
};