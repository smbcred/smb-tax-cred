import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending';
  icon: string;
}

interface ProgressOverviewProps {
  hasCompletedPayment: boolean;
  hasIntakeFormInProgress: boolean;
  hasDocuments: boolean;
}

export default function ProgressOverview({ 
  hasCompletedPayment, 
  hasIntakeFormInProgress, 
  hasDocuments 
}: ProgressOverviewProps) {
  const steps: ProgressStep[] = [
    {
      id: 'calculator',
      title: 'Calculator',
      status: 'completed',
      icon: 'fas fa-calculator'
    },
    {
      id: 'payment',
      title: 'Payment',
      status: hasCompletedPayment ? 'completed' : 'current',
      icon: 'fas fa-credit-card'
    },
    {
      id: 'intake',
      title: 'Intake Form',
      status: hasIntakeFormInProgress ? 'current' : hasCompletedPayment ? 'current' : 'pending',
      icon: 'fas fa-edit'
    },
    {
      id: 'documents',
      title: 'Documents',
      status: hasDocuments ? 'completed' : 'pending',
      icon: 'fas fa-file-alt'
    }
  ];

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-chart-line text-rd-primary-500 mr-2"></i>
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Overall Progress</span>
              <span>{completedSteps} of {steps.length} completed</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-slate-500 mt-1">
              {progressPercentage === 100 ? 'All steps completed!' : `${Math.round(progressPercentage)}% complete`}
            </p>
          </div>

          {/* Progress Steps Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  step.status === 'completed' 
                    ? 'bg-rd-secondary-100 text-rd-secondary-600' 
                    : step.status === 'current'
                    ? 'bg-rd-primary-100 text-rd-primary-600'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <i className={step.icon}></i>
                </div>
                <div className="text-xs font-medium text-slate-900">{step.title}</div>
                <div className={`text-xs capitalize ${
                  step.status === 'completed' 
                    ? 'text-rd-secondary-600' 
                    : step.status === 'current'
                    ? 'text-rd-primary-600'
                    : 'text-slate-500'
                }`}>
                  {step.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}