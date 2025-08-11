import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTable } from '@/components/admin/AdminTable';
import { DetailDrawer } from '@/components/admin/DetailDrawer';
import { FilterBar } from '@/components/admin/FilterBar';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';

type AdminTab = 'leads' | 'customers' | 'documents' | 'payments' | 'webhooks';

interface AdminFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  source?: string;
}

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('leads');
  const [filters, setFilters] = useState<AdminFilters>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Admin-only access
  if (!user?.isAdmin) {
    return <Redirect to="/dashboard" replace />;
  }

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleFilterChange = (newFilters: AdminFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage system data and operations
              </p>
            </div>

            {/* Filters */}
            <FilterBar
              activeTab={activeTab}
              filters={filters}
              onFiltersChange={handleFilterChange}
            />

            {/* Table */}
            <AdminTable
              tab={activeTab}
              filters={filters}
              onItemSelect={handleItemSelect}
            />
          </div>
        </main>
      </div>

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={selectedItem}
        tab={activeTab}
      />
    </div>
  );
}