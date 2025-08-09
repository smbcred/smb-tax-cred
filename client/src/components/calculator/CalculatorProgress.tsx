/**
 * @file CalculatorProgress.tsx
 * @description Visual progress indicator for calculator steps
 */

import { motion } from 'framer-motion';

interface ProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const CalculatorProgress: React.FC<ProgressProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  const steps = [
    'Business Type',
    'Activities',
    'Expenses',
    'Results'
  ];

  return (
    <div className="w-full px-4">
      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full" />
        <motion.div 
          className="absolute top-5 left-0 h-1 bg-green-600 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        
        {/* Step Indicators */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={step} className="flex flex-col items-center">
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 relative z-10 cursor-default
                    ${isActive 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : isCompleted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="font-semibold">{stepNumber}</span>
                  )}
                </motion.div>
                <span className={`
                  mt-2 text-xs sm:text-sm font-medium transition-colors duration-300
                  ${isActive 
                    ? 'text-green-600' 
                    : isCompleted 
                      ? 'text-gray-700' 
                      : 'text-gray-400'
                  }
                `}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};