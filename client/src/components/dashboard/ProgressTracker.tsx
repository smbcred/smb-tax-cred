/**
 * @file ProgressTracker.tsx
 * @description Progress tracking component for R&D tax credit process
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Types
 * @knowledgeBase Visual progress tracker with step indicators and status
 */

import { NextStep } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProgressTrackerProps {
  steps: NextStep[];
}

const PROCESS_STEPS = [
  {
    id: "calculator",
    title: "Complete Calculator",
    description: "Estimate your R&D tax credit",
    icon: "fas fa-calculator",
  },
  {
    id: "payment",
    title: "Payment",
    description: "Secure your documentation package",
    icon: "fas fa-credit-card",
  },
  {
    id: "intake",
    title: "Intake Form",
    description: "Provide detailed business information", 
    icon: "fas fa-edit",
  },
  {
    id: "documents",
    title: "Document Generation",
    description: "IRS-compliant forms and narratives",
    icon: "fas fa-file-alt",
  },
  {
    id: "delivery",
    title: "Delivery",
    description: "Download your complete package",
    icon: "fas fa-download",
  },
];

export default function ProgressTracker({ steps }: ProgressTrackerProps) {
  const getStepStatus = (stepId: string) => {
    const nextStep = steps.find(step => step.id === stepId || step.action === stepId);
    if (nextStep) {
      return nextStep.status;
    }
    
    // Default logic based on step progression
    const stepIndex = PROCESS_STEPS.findIndex(step => step.id === stepId);
    const hasCalculator = true; // Assume calculator is always completed to reach dashboard
    const hasPayment = steps.some(s => s.id === 'payment' && s.status === 'completed');
    const hasIntake = steps.some(s => s.id === 'intake' && s.status === 'completed');
    
    if (stepId === 'calculator') return 'completed';
    if (stepId === 'payment') return hasPayment ? 'completed' : (stepIndex === 1 ? 'current' : 'pending');
    if (stepId === 'intake') return hasIntake ? 'completed' : (hasPayment ? 'current' : 'pending');
    if (stepId === 'documents') return hasIntake ? 'current' : 'pending';
    if (stepId === 'delivery') return 'pending';
    
    return 'pending';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-route text-rd-primary-500 mr-2"></i>
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {PROCESS_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const isLast = index === PROCESS_STEPS.length - 1;
            
            return (
              <div key={step.id} className="relative">
                <div className="flex items-center">
                  {/* Step Icon */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    ${status === 'completed' 
                      ? 'bg-rd-secondary-500 text-white' 
                      : status === 'current' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-200 text-slate-500'
                    }
                  `}>
                    {status === 'completed' ? (
                      <i className="fas fa-check"></i>
                    ) : (
                      <i className={step.icon}></i>
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${
                          status === 'completed' ? 'text-rd-secondary-600' :
                          status === 'current' ? 'text-rd-primary-600' :
                          'text-slate-500'
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-slate-600">{step.description}</p>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="flex items-center space-x-2">
                        {status === 'completed' && (
                          <span className="text-xs bg-rd-secondary-100 text-rd-secondary-700 px-2 py-1 rounded-full">
                            Complete
                          </span>
                        )}
                        {status === 'current' && (
                          <span className="text-xs bg-blue-100 text-rd-primary-700 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Connector Line */}
                {!isLast && (
                  <div className={`
                    absolute left-5 top-10 w-0.5 h-8 -ml-px
                    ${status === 'completed' ? 'bg-rd-secondary-300' : 'bg-slate-200'}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Progress</span>
            <span className="text-sm text-slate-600">
              {PROCESS_STEPS.filter(step => getStepStatus(step.id) === 'completed').length} of {PROCESS_STEPS.length} steps
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="progress-bar h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${(PROCESS_STEPS.filter(step => getStepStatus(step.id) === 'completed').length / PROCESS_STEPS.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Completion Estimate */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-clock text-blue-500 mr-2"></i>
            <div>
              <div className="text-sm font-medium text-blue-900">Estimated Completion</div>
              <div className="text-xs text-blue-700">
                Complete remaining steps to finish your R&D tax credit documentation
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
