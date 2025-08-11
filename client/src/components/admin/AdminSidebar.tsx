import { cn } from '@/lib/utils';
import { 
  Users, 
  Building2, 
  CreditCard, 
  FileText, 
  Webhook,
  UserCheck
} from 'lucide-react';

type AdminTab = 'leads' | 'customers' | 'documents' | 'payments' | 'webhooks';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const tabs = [
  { id: 'leads' as const, label: 'Leads', icon: UserCheck },
  { id: 'customers' as const, label: 'Customers', icon: Users },
  { id: 'payments' as const, label: 'Payments', icon: CreditCard },
  { id: 'documents' as const, label: 'Documents', icon: FileText },
  { id: 'webhooks' as const, label: 'Webhooks', icon: Webhook },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Admin Panel
          </h2>
        </div>

        <nav className="space-y-2" role="navigation" aria-label="Admin navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Admin access only
          </p>
        </div>
      </div>
    </aside>
  );
}