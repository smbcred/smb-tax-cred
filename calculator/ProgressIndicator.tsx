/**
 * @file ProgressIndicator.tsx
 * @description Visual progress indicator for calculator flow
 */

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  visitedSteps?: Set<number>;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  onStepClick,
  visitedSteps = new Set()
}) => {
  const steps = [
    { number: 1, label: 'Business Type' },
    { number: 2, label: 'Activities' },
    { number: 3, label: 'Expenses' },
    { number: 4, label: 'Results' }
  ];

  return (
    <div className="flex items-center justify-between max-w-2xl mx-auto">
      {steps.map((step, index) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isVisited = visitedSteps.has(step.number);
        const isClickable = onStepClick && (isVisited || step.number === currentStep + 1);

        return (
          <div key={step.number} className="flex items-center flex-1">
            <button
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className={`relative flex flex-col items-center ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  transition: { type: 'spring', stiffness: 300 }
                }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </motion.div>
              
              <span className={`
                mt-2 text-xs font-medium
                ${isActive ? 'text-blue-600' : 'text-gray-600'}
              `}>
                {step.label}
              </span>
            </button>

            {index < steps.length - 1 && (
              <div className="flex-1 mx-2">
                <div className="h-1 bg-gray-200 rounded">
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-green-500 rounded"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};