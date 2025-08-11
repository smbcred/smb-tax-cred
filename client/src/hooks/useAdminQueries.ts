import { useQuery } from '@tanstack/react-query';

interface AdminFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  source?: string;
  limit?: number;
  offset?: number;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const buildQueryParams = (filters: AdminFilters): string => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return params.toString();
};

export function useAdminLeads(filters: AdminFilters = {}) {
  const queryParams = buildQueryParams({ limit: 20, offset: 0, ...filters });
  
  return useQuery({
    queryKey: ['admin', 'leads', filters],
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      const response = await fetch(`/api/admin/leads?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      return response.json();
    },
  });
}

export function useAdminCustomers(filters: AdminFilters = {}) {
  const queryParams = buildQueryParams({ limit: 20, offset: 0, ...filters });
  
  return useQuery({
    queryKey: ['admin', 'customers', filters],
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      const response = await fetch(`/api/admin/customers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      return response.json();
    },
  });
}

export function useAdminDocuments(filters: AdminFilters = {}) {
  const queryParams = buildQueryParams({ limit: 20, offset: 0, ...filters });
  
  return useQuery({
    queryKey: ['admin', 'documents', filters],
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      const response = await fetch(`/api/admin/documents?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      return response.json();
    },
  });
}

export function useAdminPayments(filters: AdminFilters = {}) {
  const queryParams = buildQueryParams({ limit: 20, offset: 0, ...filters });
  
  return useQuery({
    queryKey: ['admin', 'payments', filters],
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      const response = await fetch(`/api/admin/payments?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      return response.json();
    },
  });
}

export function useAdminWebhooks(filters: AdminFilters = {}) {
  const queryParams = buildQueryParams({ limit: 20, offset: 0, ...filters });
  
  return useQuery({
    queryKey: ['admin', 'webhooks', filters],
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      const response = await fetch(`/api/admin/webhooks?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch webhooks');
      }
      
      return response.json();
    },
  });
}