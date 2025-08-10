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
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import ProgressOverview from "@/components/dashboard/ProgressOverview";
import ActionItemsChecklist from "@/components/dashboard/ActionItemsChecklist";
import DocumentStatus from "@/components/dashboard/DocumentStatus";
import { DashboardData } from "@/types";

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
        <WelcomeCard estimatedCredit={summary.estimatedCredit} />

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <ProgressOverview 
              hasCompletedPayment={summary.hasCompletedPayment}
              hasIntakeFormInProgress={summary.hasIntakeFormInProgress}
              hasDocuments={false}
            />

            {/* Action Items */}
            <ActionItemsChecklist nextSteps={summary.nextSteps} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Document Status */}
            <DocumentStatus hasDocuments={false} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
