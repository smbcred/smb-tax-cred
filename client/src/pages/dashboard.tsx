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
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import ProgressOverview from "@/components/dashboard/ProgressOverview";
import ActionItemsChecklist from "@/components/dashboard/ActionItemsChecklist";
import DocumentStatus from "@/components/dashboard/DocumentStatus";
import ProgressTracker from "@/components/dashboard/ProgressTracker";
import type { DashboardResponse } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  
  // Check for Stripe success parameter
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  // Show payment success message if coming from Stripe
  if (sessionId && !sessionStorage.getItem('stripe_success_shown')) {
    sessionStorage.setItem('stripe_success_shown', 'true');
    setTimeout(() => {
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg z-50';
      successMessage.innerHTML = '🎉 Payment successful! Welcome to your dashboard.';
      document.body.appendChild(successMessage);
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 6000);
    }, 500);
  }
  
  const { data: dashboardData, isLoading, error } = useQuery<DashboardResponse>({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
    refetchInterval: 30000, // Real-time updates every 30 seconds
    staleTime: 0, // Always consider data stale for real-time behavior
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
        <WelcomeCard estimatedCredit={summary.estimatedCredit} />

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <ProgressOverview 
              hasCompletedPayment={summary.hasCompletedPayment}
              hasIntakeFormInProgress={summary.hasIntakeFormInProgress}
              hasDocuments={summary.documentsGenerated > 0}
            />

            {/* Action Items */}
            <ActionItemsChecklist nextSteps={summary.nextSteps} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Document Status */}
            <DocumentStatus 
              documents={dashboardData.documents}
              documentsGenerated={summary.documentsGenerated}
            />
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mt-8">
          <ProgressTracker 
            sections={[
              {
                id: 'company-info',
                title: 'Company Information',
                description: 'Basic company details and business structure',
                status: 'completed',
                estimatedMinutes: 5,
                completedFields: 8,
                totalFields: 8,
                icon: 'fas fa-building'
              },
              {
                id: 'rd-activities',
                title: 'R&D Activities',
                description: 'Document your research and development activities',
                status: 'in_progress',
                estimatedMinutes: 15,
                completedFields: 6,
                totalFields: 12,
                icon: 'fas fa-flask'
              },
              {
                id: 'expenses',
                title: 'Expense Breakdown',
                description: 'Detailed breakdown of R&D related expenses',
                status: 'not_started',
                estimatedMinutes: 10,
                completedFields: 0,
                totalFields: 10,
                icon: 'fas fa-calculator'
              },
              {
                id: 'supporting-docs',
                title: 'Supporting Information',
                description: 'Additional documentation and evidence',
                status: 'not_started',
                estimatedMinutes: 8,
                completedFields: 0,
                totalFields: 6,
                icon: 'fas fa-file-upload'
              }
            ]}
            overallProgress={summary.progressStats.completionPercentage}
            currentSection={dashboardData.intakeForms[0]?.currentSection || "company-info"}
            isSaving={false}
            lastSavedAt={dashboardData.intakeForms[0] ? new Date(dashboardData.intakeForms[0].updatedAt) : new Date()}
            onSectionClick={(sectionId) => {
              // Navigate to intake form with section anchor
              window.location.href = `/intake-form#${sectionId}`;
            }}
            onContinue={() => {
              // Navigate to intake form
              window.location.href = '/intake-form';
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
