/**
 * @file dashboard.tsx
 * @description Main dashboard page for authenticated users
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React Query, Dashboard Components
 * @knowledgeBase User dashboard with progress tracking and next steps
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { dashboardService } from "@/services/api.service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProgressTracker from "@/components/dashboard/ProgressTracker";
import { DashboardData } from "@/types";
import { formatCurrency } from "@/services/calculator.service";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Failed to Load Dashboard</h3>
            <p className="text-slate-600">Please refresh the page or contact support if the problem persists.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary } = dashboardData;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back!
            </h1>
            <p className="text-slate-600 mt-2">
              Track your R&D tax credit progress and manage your documentation.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">Estimated Credit</div>
            <div className="text-3xl font-bold text-rd-secondary-500">
              {formatCurrency(summary.estimatedCredit)}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-rd-secondary-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-calculator text-rd-secondary-600"></i>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-slate-900">Calculator</div>
                  <div className="text-xs text-rd-secondary-600">Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  summary.hasCompletedPayment 
                    ? 'bg-rd-secondary-100' 
                    : 'bg-slate-100'
                }`}>
                  <i className={`fas fa-credit-card ${
                    summary.hasCompletedPayment 
                      ? 'text-rd-secondary-600' 
                      : 'text-slate-400'
                  }`}></i>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-slate-900">Payment</div>
                  <div className={`text-xs ${
                    summary.hasCompletedPayment 
                      ? 'text-rd-secondary-600' 
                      : 'text-slate-500'
                  }`}>
                    {summary.hasCompletedPayment ? 'Complete' : 'Pending'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  summary.hasIntakeFormInProgress 
                    ? 'bg-blue-100' 
                    : 'bg-slate-100'
                }`}>
                  <i className={`fas fa-edit ${
                    summary.hasIntakeFormInProgress 
                      ? 'text-rd-primary-600' 
                      : 'text-slate-400'
                  }`}></i>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-slate-900">Intake Form</div>
                  <div className={`text-xs ${
                    summary.hasIntakeFormInProgress 
                      ? 'text-rd-primary-600' 
                      : 'text-slate-500'
                  }`}>
                    {summary.hasIntakeFormInProgress ? 'In Progress' : 'Pending'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-file-alt text-slate-400"></i>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-slate-900">Documents</div>
                  <div className="text-xs text-slate-500">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker steps={summary.nextSteps} />

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-tasks text-rd-primary-500 mr-2"></i>
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.nextSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`progress-step ${
                    step.status === 'completed' ? 'progress-step-complete' :
                    step.status === 'current' ? 'progress-step-current' :
                    'progress-step-pending'
                  }`}
                >
                  <div className="flex items-center justify-between flex-1">
                    <div className="flex items-center">
                      <i className={`fas ${
                        step.status === 'completed' ? 'fa-check-circle text-rd-secondary-500' :
                        step.status === 'current' ? 'fa-clock text-rd-primary-500' :
                        'fa-circle text-slate-400'
                      } mr-3`}></i>
                      <div>
                        <span className="font-medium text-slate-900">{step.title}</span>
                        <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                    {step.status === 'current' && (
                      <div className="ml-4">
                        {step.action === 'payment' && (
                          <Link href="/checkout">
                            <Button size="sm" className="btn-primary">
                              Complete Payment
                            </Button>
                          </Link>
                        )}
                        {step.action === 'intake' && (
                          <Button 
                            size="sm" 
                            className="btn-primary"
                            onClick={() => {
                              // TODO: Navigate to intake form or open modal
                              console.log('Navigate to intake form');
                            }}
                          >
                            Continue Form
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.calculations.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-calculator text-4xl text-slate-300 mb-4"></i>
                  <p className="text-slate-600">No calculations yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.calculations.slice(0, 3).map((calc: any) => (
                    <div key={calc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">{calc.businessType}</div>
                        <div className="text-sm text-slate-600">
                          {new Date(calc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-rd-secondary-600">
                          {formatCurrency(parseFloat(calc.federalCredit))}
                        </div>
                        <div className="text-xs text-slate-500">Federal Credit</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Companies</span>
                  <span className="font-semibold">{dashboardData.companies.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Active Forms</span>
                  <span className="font-semibold">{dashboardData.intakeForms.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Payments Made</span>
                  <span className="font-semibold">
                    {dashboardData.payments.filter((p: any) => p.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-slate-900 font-medium">Account Status</span>
                  <span className="text-rd-secondary-600 font-semibold">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
