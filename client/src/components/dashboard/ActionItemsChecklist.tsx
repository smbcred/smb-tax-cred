import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ActionStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  action?: string;
}

interface ActionItemsChecklistProps {
  nextSteps: ActionStep[];
}

export default function ActionItemsChecklist({ nextSteps }: ActionItemsChecklistProps) {
  const currentStep = nextSteps.find(step => step.status === 'current');
  const pendingSteps = nextSteps.filter(step => step.status === 'pending');
  const completedSteps = nextSteps.filter(step => step.status === 'completed');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-tasks text-rd-primary-500 mr-2"></i>
          Action Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Action Item */}
          {currentStep && (
            <div className="border-l-4 border-rd-primary-500 bg-rd-primary-50 dark:bg-rd-primary-950 p-4 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fas fa-clock text-rd-primary-500 mr-3"></i>
                  <div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {currentStep.title}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {currentStep.description}
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  {currentStep.action === 'payment' && (
                    <Link href="/checkout">
                      <Button size="sm" className="bg-rd-primary-500 hover:bg-rd-primary-600">
                        Complete Payment
                      </Button>
                    </Link>
                  )}
                  {currentStep.action === 'intake' && (
                    <Button 
                      size="sm" 
                      className="bg-rd-primary-500 hover:bg-rd-primary-600"
                      onClick={() => {
                        // TODO: Navigate to intake form when implemented
                        console.log('Navigate to intake form');
                      }}
                    >
                      Continue Form
                    </Button>
                  )}
                  {currentStep.action === 'documents' && (
                    <Button 
                      size="sm" 
                      className="bg-rd-primary-500 hover:bg-rd-primary-600"
                      onClick={() => {
                        // TODO: Navigate to documents when implemented
                        console.log('Navigate to documents');
                      }}
                    >
                      View Documents
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Completed Items */}
          {completedSteps.map((step) => (
            <div key={step.id} className="flex items-center">
              <i className="fas fa-check-circle text-rd-secondary-500 mr-3"></i>
              <div className="flex-1">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {step.title}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            </div>
          ))}

          {/* Pending Items */}
          {pendingSteps.map((step) => (
            <div key={step.id} className="flex items-center opacity-60">
              <i className="fas fa-circle text-slate-400 mr-3"></i>
              <div className="flex-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {step.title}
                </span>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {nextSteps.length === 0 && (
            <div className="text-center py-8">
              <i className="fas fa-check-circle text-rd-secondary-500 text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                All Done!
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                You've completed all required action items.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}