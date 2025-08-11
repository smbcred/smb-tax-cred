import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';

type AdminTab = 'leads' | 'customers' | 'documents' | 'payments' | 'webhooks';

interface AdminFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  source?: string;
}

interface FilterBarProps {
  activeTab: AdminTab;
  filters: AdminFilters;
  onFiltersChange: (filters: AdminFilters) => void;
}

export function FilterBar({ activeTab, filters, onFiltersChange }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<AdminFilters>(filters);

  const handleSearchChange = (search: string) => {
    const newFilters = { ...localFilters, search: search || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateFromChange = (dateFrom: string) => {
    const newFilters = { ...localFilters, dateFrom: dateFrom || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateToChange = (dateTo: string) => {
    const newFilters = { ...localFilters, dateTo: dateTo || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStatusChange = (status: string) => {
    const newFilters = { ...localFilters, status: status === 'all' ? undefined : status };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSourceChange = (source: string) => {
    const newFilters = { ...localFilters, source: source === 'all' ? undefined : source };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value !== undefined);

  const showSearch = ['leads', 'customers'].includes(activeTab);
  const showDateFilters = activeTab === 'leads';
  const showStatusFilter = activeTab === 'documents';
  const showSourceFilter = activeTab === 'webhooks';

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4" />
          Filters
        </div>

        {/* Search */}
        {showSearch && (
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={localFilters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Date Filters */}
        {showDateFilters && (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor="date-from" className="text-xs text-muted-foreground">
                From
              </label>
              <Input
                id="date-from"
                type="date"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="w-36"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="date-to" className="text-xs text-muted-foreground">
                To
              </label>
              <Input
                id="date-to"
                type="date"
                value={localFilters.dateTo || ''}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="w-36"
              />
            </div>
          </>
        )}

        {/* Status Filter for Documents */}
        {showStatusFilter && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Status</label>
            <Select
              value={localFilters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Source Filter for Webhooks */}
        {showSourceFilter && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Source</label>
            <Select
              value={localFilters.source || 'all'}
              onValueChange={handleSourceChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="make">Make</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}