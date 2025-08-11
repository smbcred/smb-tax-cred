/**
 * @file InteractiveCalculator.tsx
 * @description 4-step R&D tax credit calculator with real-time calculations
 * @knowledgeBase system-architecture-explanation.md - Calculator Component
 */

import { useState, useReducer, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  FileText,
  DollarSign,
  Clock,
  Shield,
  Award
} from 'lucide-react';

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters?: any) => void;
  }
}
import { BusinessTypeStep } from './steps/BusinessTypeStep';
import { QualifyingActivitiesStep } from './steps/QualifyingActivitiesStep';
import { ExpenseInputsStepNew as ExpenseInputsStep } from './steps/ExpenseInputsStepNew';
import { ResultsDisplayStep } from './steps/ResultsDisplayStep';
import { ProgressIndicator } from './ProgressIndicator';
import { LeadCaptureModal } from '@/components/leadCapture/LeadCaptureModal';
import { RDTaxCalculator, EnhancedRDTaxCalculator } from '@/services/calculation/calculator.engine';

// Calculator state interface
interface CalculatorState {
  currentStep: number;
  businessType: string | null;
  qualifyingActivities: string[];
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
    rdAllocationPercentage: 100,
    contractorCosts: 0,
    softwareCosts: 0,
    cloudCosts: 0,
    isFirstTimeFiler: true,
    priorYearQREs: []
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
  const [capturedLeadId, setCapturedLeadId] = useState<string | null>(null);
  const [showRevealAnimation, setShowRevealAnimation] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

  // Auto-hide success animation after 5 seconds
  useEffect(() => {
    if (showRevealAnimation) {
      const timer = setTimeout(() => setShowRevealAnimation(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showRevealAnimation]);

  // Real-time calculation effect
  const performCalculation = useCallback(() => {
    if (state.expenses.technicalEmployees > 0 && state.expenses.averageTechnicalSalary > 0) {
      setIsCalculating(true);
      
      try {
        // Use the enhanced calculator with QSB analysis and legislative benefits
        const calculationResult = EnhancedRDTaxCalculator.calculate({
          // Company info
          businessType: state.businessType || 'Software',
          industryCode: '541511', // Default software industry
          
          // QSB eligibility (use reasonable defaults)
          currentYearRevenue: 1200000, // Default $1.2M
          yearOfFirstRevenue: new Date().getFullYear() - 2, // 2 years ago
          hasIncomeTaxLiability: false, // Default to startup status
          quarterlyPayrollTax: 15000, // Default quarterly tax
          
          // R&D team
          technicalEmployees: state.expenses.technicalEmployees,
          averageTechnicalSalary: state.expenses.averageTechnicalSalary,
          rdAllocationPercentage: state.expenses.rdAllocationPercentage ?? 65, // Default 65%
          
          // Expenses
          contractorCosts: state.expenses.contractorCosts,
          suppliesCosts: 0,
          softwareCosts: state.expenses.softwareCosts,
          cloudCosts: state.expenses.cloudCosts,
          
          // Prior years
          priorYearQREs: state.expenses.priorYearQREs || [],
          isFirstTimeFiler: state.expenses.isFirstTimeFiler ?? true,
          
          // Options
          section280CElection: 'full' as const,
          taxYear: new Date().getFullYear(),
          
          // Activities (use defaults)
          qualifyingActivities: state.qualifyingActivities
        });
        
        // Enhanced results with QSB and legislative benefits
        const results = {
          // Basic results for backward compatibility
          totalQRE: calculationResult.qreBreakdown.total,
          federalCredit: calculationResult.federalCredit,
          stateCredit: 0, // No state credits for now
          totalBenefit: calculationResult.qsbAnalysis.payrollOffsetAvailable ? 
            calculationResult.qsbAnalysis.quarterlyBenefit * 4 : calculationResult.federalCredit,
          pricingTier: calculationResult.pricingTier.price,
          tierInfo: calculationResult.pricingTier,
          roi: parseFloat(calculationResult.roi.roiMultiple.replace('x', '')),
          breakdown: {
            wages: calculationResult.qreBreakdown.wages,
            contractors: calculationResult.qreBreakdown.contractors,
            supplies: calculationResult.qreBreakdown.supplies,
            cloud: calculationResult.qreBreakdown.cloudAndSoftware
          },
          
          // Enhanced features - NEW!
          qsbAnalysis: calculationResult.qsbAnalysis,
          legislativeContext: calculationResult.legislativeContext,
          industryInsights: calculationResult.industryInsights,
          payrollOffset: calculationResult.qsbAnalysis.payrollOffsetAvailable ? {
            quarterlyBenefit: calculationResult.qsbAnalysis.quarterlyBenefit,
            annualBenefit: calculationResult.qsbAnalysis.quarterlyBenefit * 4,
            maxLifetime: calculationResult.qsbAnalysis.maxPayrollOffset,
            remainingCapacity: calculationResult.qsbAnalysis.lifetimeRemaining
          } : null,
          enhancedFeatures: {
            hasQSBBenefits: calculationResult.qsbAnalysis.isEligible,
            hasPayrollOffset: calculationResult.qsbAnalysis.payrollOffsetAvailable,
            legislativeAlerts: calculationResult.legislativeContext.alerts.length > 0,
            confidence: calculationResult.confidence
          }
        };
        
        dispatch({ type: 'CALCULATE_RESULTS', payload: results });
      } catch (error) {
        console.error('Calculation error:', error);
      }
      
      setIsCalculating(false);
    }
  }, [state.expenses, state.businessType]);

  // Validation
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
          errors.push('Please select at least one innovation activity');
        }
        break;
        
      case 3:
        if (state.expenses.technicalEmployees === 0 && state.expenses.contractorCosts === 0) {
          errors.push('Please enter employee or contractor costs');
        }
        if (state.expenses.technicalEmployees > state.expenses.totalEmployees) {
          errors.push('Technical employees cannot exceed total employees');
        }
        break;
    }

    setStepErrors(prev => ({ ...prev, [state.currentStep]: errors }));
    return errors.length === 0;
  }, [state]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (state.currentStep === 3) {
      // Calculate before showing results
      performCalculation();
    }
    if (state.currentStep === 4 && !showLeadCapture) {
      setShowLeadCapture(true);
    } else if (validateCurrentStep()) {
      dispatch({ type: 'NEXT_STEP' });
      setVisitedSteps(prev => new Set(Array.from(prev).concat(state.currentStep + 1)));
    }
  }, [state.currentStep, showLeadCapture, validateCurrentStep, performCalculation]);

  const handlePrev = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const handleStepClick = useCallback((step: number) => {
    if (visitedSteps.has(step) || step === state.currentStep + 1) {
      dispatch({ type: 'GO_TO_STEP', payload: step });
      setVisitedSteps(prev => new Set(Array.from(prev).concat(step)));
    }
  }, [visitedSteps, state.currentStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && state.currentStep < 4 && canProceed()) {
        handleNext();
      } else if (e.key === 'Escape' && state.currentStep > 1) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.currentStep, handleNext, handlePrev]);

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
          Calculate Your Potential Innovation Tax Credit
        </h2>
        <p className="text-gray-600 text-center mt-2 text-sm sm:text-base">
          Based on your AI experiments. See what you may qualify for in under 2 minutes
        </p>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator 
        currentStep={state.currentStep} 
        totalSteps={4}
        onStepClick={handleStepClick}
        visitedSteps={visitedSteps}
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
              {!emailCaptured ? (
                // Show teaser view before email capture
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Your Results Are Ready!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Click below to see your exact federal tax credit amount
                  </p>
                  <button
                    onClick={() => setShowLeadCapture(true)}
                    className="btn-primary"
                  >
                    See My Full Results
                  </button>
                </div>
              ) : (
                // Show full results after email capture with enhanced CTAs
                <motion.div
                  initial={{ opacity: 0, scale: showRevealAnimation ? 0.95 : 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Success Message */}
                  {showRevealAnimation && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.2 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-green-800">
                        Perfect! Your results have been saved. Here's your complete analysis:
                      </p>
                    </motion.div>
                  )}
                  
                  {/* Full Results Display */}
                  <ResultsDisplayStep
                    results={state.results}
                    isBlurred={false}
                    onCTAClick={() => {}}
                  />
                  
                  {/* Enhanced CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Ready to Claim Your ${state.results?.federalCredit.toLocaleString()} Credit?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Choose how you'd like to proceed with your R&D tax credit documentation:
                    </p>
                    
                    <div className="grid sm:grid-cols-3 gap-4">
                      {/* Option 1: Get Started */}
                      <button
                        onClick={() => {
                          // Track CTA click
                          if (typeof window !== 'undefined' && window.gtag) {
                            window.gtag('event', 'cta_click', {
                              event_category: 'engagement',
                              event_label: 'get_documents',
                              lead_id: capturedLeadId
                            });
                          }
                          // Placeholder for navigation to next step
                          alert('Documentation process coming soon!');
                        }}
                        className="flex flex-col items-center p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all group"
                      >
                        <FileText className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-gray-900">Get Documents</span>
                        <span className="text-xs text-gray-500 mt-1">Start IRS-ready documentation</span>
                      </button>
                      
                      {/* Option 2: Download PDF */}
                      <button
                        onClick={() => {
                          // Track download
                          if (typeof window !== 'undefined' && window.gtag) {
                            window.gtag('event', 'download_pdf', {
                              event_category: 'engagement',
                              event_label: 'results_pdf',
                              lead_id: capturedLeadId
                            });
                          }
                          // Placeholder for PDF download
                          alert('PDF download coming soon!');
                        }}
                        className="flex flex-col items-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all group"
                      >
                        <DollarSign className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-gray-900">Download PDF</span>
                        <span className="text-xs text-gray-500 mt-1">Save your results</span>
                      </button>
                      
                      {/* Option 3: Schedule Call */}
                      <button
                        onClick={() => {
                          // Track consultation request
                          if (typeof window !== 'undefined' && window.gtag) {
                            window.gtag('event', 'schedule_consultation', {
                              event_category: 'engagement',
                              event_label: 'post_calculator',
                              lead_id: capturedLeadId
                            });
                          }
                          // Placeholder for scheduling
                          alert('Consultation scheduling coming soon!');
                        }}
                        className="flex flex-col items-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all group"
                      >
                        <Clock className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-gray-900">Schedule Call</span>
                        <span className="text-xs text-gray-500 mt-1">Talk to an expert</span>
                      </button>
                    </div>
                    
                    {/* Trust Badges */}
                    <div className="mt-6 pt-6 border-t border-blue-100 flex items-center justify-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>IRS Compliant</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        <span>Expert Reviewed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                        <span>Audit Support</span>
                      </div>
                    </div>
                  </motion.div>
                  

                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {/* Hide navigation on step 4 before email capture */}
      {!(state.currentStep === 4 && !emailCaptured) && (
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
            Next
          </button>
        </div>
      )}

      {/* Error display */}
      {stepErrors[state.currentStep] && stepErrors[state.currentStep].length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            {stepErrors[state.currentStep].map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Required Disclaimer - Compliance */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          <strong>Important Disclaimer:</strong> This tool provides estimates based on current federal tax law. 
          Actual credits depend on your specific circumstances and IRS examination. 
          Consult a tax professional before claiming credits. SMBTaxCredits.com provides documentation 
          services only and does not offer tax advice.
        </p>
      </div>
      
      {/* Help text footer */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>All calculations based on federal R&D tax credit rules (IRS Section 41)</p>
        <p className="mt-1">
          Questions? <button className="text-blue-600 hover:underline">Chat with us</button>
        </p>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        calculationResult={state.results}
        onSuccess={(leadId) => {
          console.log('Lead captured with ID:', leadId);
          setCapturedLeadId(leadId);
          setEmailCaptured(true);
          setShowRevealAnimation(true);
          setShowLeadCapture(false);
          
          // Track conversion event
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'lead_captured', {
              event_category: 'engagement',
              event_label: 'calculator_lead',
              value: state.results?.federalCredit || 0,
              lead_id: leadId
            });
          }
        }}
      />
    </div>
  );
};