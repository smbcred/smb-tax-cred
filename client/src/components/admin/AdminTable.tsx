import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { 
  useAdminLeads, 
  useAdminCustomers, 
  useAdminDocuments, 
  useAdminPayments, 
  useAdminWebhooks 
} from '@/hooks/useAdminQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Eye, ArrowUpDown } from 'lucide-react';

type AdminTab = 'leads' | 'customers' | 'documents' | 'payments' | 'webhooks';

interface AdminFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  source?: string;
}

interface AdminTableProps {
  tab: AdminTab;
  filters: AdminFilters;
  onItemSelect: (item: any) => void;
}

const columnHelper = createColumnHelper<any>();

export function AdminTable({ tab, filters, onItemSelect }: AdminTableProps) {
  const {
    data: leadsData,
    isLoading: leadsLoading,
    error: leadsError,
  } = useAdminLeads(tab === 'leads' ? filters : {});

  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
  } = useAdminCustomers(tab === 'customers' ? filters : {});

  const {
    data: documentsData,
    isLoading: documentsLoading,
    error: documentsError,
  } = useAdminDocuments(tab === 'documents' ? filters : {});

  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useAdminPayments(tab === 'payments' ? filters : {});

  const {
    data: webhooksData,
    isLoading: webhooksLoading,
    error: webhooksError,
  } = useAdminWebhooks(tab === 'webhooks' ? filters : {});

  const columns = useMemo(() => {
    switch (tab) {
      case 'leads':
        return [
          columnHelper.accessor('email', {
            header: ({ column }) => (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-auto p-0 font-semibold"
              >
                Email
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            ),
            cell: ({ row }) => (
              <div className="font-medium">{row.getValue('email')}</div>
            ),
          }),
          columnHelper.accessor('companyName', {
            header: 'Company',
            cell: ({ row }) => row.getValue('companyName') || '-',
          }),
          columnHelper.accessor('createdAt', {
            header: 'Captured',
            cell: ({ row }) => {
              const date = new Date(row.getValue('createdAt'));
              return formatDistanceToNow(date, { addSuffix: true });
            },
          }),
          columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onItemSelect(row.original)}
                className="gap-2"
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
            ),
          }),
        ];

      case 'customers':
        return [
          columnHelper.accessor('email', {
            header: ({ column }) => (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-auto p-0 font-semibold"
              >
                Email
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            ),
            cell: ({ row }) => (
              <div className="font-medium">{row.getValue('email')}</div>
            ),
          }),
          columnHelper.accessor('legalName', {
            header: 'Company',
            cell: ({ row }) => row.getValue('legalName') || '-',
          }),
          columnHelper.accessor('entityType', {
            header: 'Entity Type',
            cell: ({ row }) => {
              const type = row.getValue('entityType');
              return type ? (
                <Badge variant="secondary">{type}</Badge>
              ) : '-';
            },
          }),
          columnHelper.accessor('createdAt', {
            header: 'Joined',
            cell: ({ row }) => {
              const date = new Date(row.getValue('createdAt'));
              return formatDistanceToNow(date, { addSuffix: true });
            },
          }),
          columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onItemSelect(row.original)}
                className="gap-2"
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
            ),
          }),
        ];

      case 'documents':
        return [
          columnHelper.accessor('documentType', {
            header: 'Type',
            cell: ({ row }) => (
              <Badge variant="outline">{row.getValue('documentType')}</Badge>
            ),
          }),
          columnHelper.accessor('status', {
            header: 'Status',
            cell: ({ row }) => {
              const status = row.getValue('status');
              return (
                <Badge variant={status === 'ready' ? 'default' : 'secondary'}>
                  {status}
                </Badge>
              );
            },
          }),
          columnHelper.accessor('userEmail', {
            header: 'User',
            cell: ({ row }) => row.getValue('userEmail') || '-',
          }),
          columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: ({ row }) => {
              const date = new Date(row.getValue('createdAt'));
              return formatDistanceToNow(date, { addSuffix: true });
            },
          }),
          columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onItemSelect(row.original)}
                className="gap-2"
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
            ),
          }),
        ];

      case 'payments':
        return [
          columnHelper.accessor('amount', {
            header: 'Amount',
            cell: ({ row }) => {
              const amount = row.getValue('amount') as number;
              return `$${(amount / 100).toFixed(2)}`;
            },
          }),
          columnHelper.accessor('status', {
            header: 'Status',
            cell: ({ row }) => {
              const status = row.getValue('status');
              return (
                <Badge variant={status === 'succeeded' ? 'default' : 'secondary'}>
                  {status}
                </Badge>
              );
            },
          }),
          columnHelper.accessor('userEmail', {
            header: 'User',
            cell: ({ row }) => row.getValue('userEmail') || '-',
          }),
          columnHelper.accessor('createdAt', {
            header: 'Date',
            cell: ({ row }) => {
              const date = new Date(row.getValue('createdAt'));
              return formatDistanceToNow(date, { addSuffix: true });
            },
          }),
          columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onItemSelect(row.original)}
                className="gap-2"
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
            ),
          }),
        ];

      case 'webhooks':
        return [
          columnHelper.accessor('source', {
            header: 'Source',
            cell: ({ row }) => (
              <Badge variant="outline">{row.getValue('source')}</Badge>
            ),
          }),
          columnHelper.accessor('event', {
            header: 'Event',
            cell: ({ row }) => row.getValue('event') || '-',
          }),
          columnHelper.accessor('status', {
            header: 'Status',
            cell: ({ row }) => {
              const status = row.getValue('status');
              return (
                <Badge variant={status === 'success' ? 'default' : 'destructive'}>
                  {status}
                </Badge>
              );
            },
          }),
          columnHelper.accessor('createdAt', {
            header: 'Time',
            cell: ({ row }) => {
              const date = new Date(row.getValue('createdAt'));
              return formatDistanceToNow(date, { addSuffix: true });
            },
          }),
          columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onItemSelect(row.original)}
                className="gap-2"
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
            ),
          }),
        ];

      default:
        return [];
    }
  }, [tab, onItemSelect]);

  const getCurrentData = () => {
    switch (tab) {
      case 'leads':
        return { data: leadsData, isLoading: leadsLoading, error: leadsError };
      case 'customers':
        return { data: customersData, isLoading: customersLoading, error: customersError };
      case 'documents':
        return { data: documentsData, isLoading: documentsLoading, error: documentsError };
      case 'payments':
        return { data: paymentsData, isLoading: paymentsLoading, error: paymentsError };
      case 'webhooks':
        return { data: webhooksData, isLoading: webhooksLoading, error: webhooksError };
      default:
        return { data: undefined, isLoading: false, error: null };
    }
  };

  const { data, isLoading, error } = getCurrentData();

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading {tab}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center">
          <p className="text-destructive">Failed to load {tab}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center">
          <p className="text-muted-foreground">No {tab} found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border hover:bg-accent/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.pagination && (
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {data.pagination.offset + 1} to{' '}
              {Math.min(data.pagination.offset + data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} results
            </p>
            {data.pagination.hasMore && (
              <p>More results available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}