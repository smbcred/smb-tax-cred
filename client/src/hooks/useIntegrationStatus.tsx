import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  IntegrationType,
  IntegrationHealthCheck,
  QueueStats,
  ManualIntervention,
} from '../../shared/types/integrations';

// API functions
async function fetchIntegrationHealth(integration: IntegrationType): Promise<IntegrationHealthCheck> {
  const response = await fetch(`/api/integrations/${integration}/health`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch integration health');
  }
  
  return response.json();
}

async function fetchAllIntegrationHealth(): Promise<IntegrationHealthCheck[]> {
  const response = await fetch('/api/integrations/health', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch integration health');
  }
  
  return response.json();
}

async function fetchQueueStats(): Promise<QueueStats> {
  const response = await fetch('/api/integrations/queue/stats', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch queue stats');
  }
  
  return response.json();
}

async function fetchPendingInterventions(): Promise<ManualIntervention[]> {
  const response = await fetch('/api/integrations/interventions/pending', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch pending interventions');
  }
  
  return response.json();
}

async function triggerIntegrationRecovery(integration: IntegrationType): Promise<void> {
  const response = await fetch(`/api/integrations/${integration}/recover`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to trigger recovery');
  }
}

async function markIntegrationMaintenance(params: {
  integration: IntegrationType;
  reason: string;
}): Promise<void> {
  const response = await fetch(`/api/integrations/${params.integration}/maintenance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ reason: params.reason }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark integration for maintenance');
  }
}

async function resolveManualIntervention(params: {
  interventionId: string;
  action: 'retry' | 'skip' | 'cancel' | 'modify';
  notes?: string;
  modifiedPayload?: Record<string, any>;
}): Promise<void> {
  const response = await fetch(`/api/integrations/interventions/${params.interventionId}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      action: params.action,
      notes: params.notes,
      modifiedPayload: params.modifiedPayload,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to resolve intervention');
  }
}

export function useIntegrationStatus() {
  const queryClient = useQueryClient();

  // Fetch all integration health
  const { data: allIntegrationHealth = [], isLoading: isLoadingHealth } = useQuery({
    queryKey: ['/api/integrations/health'],
    queryFn: fetchAllIntegrationHealth,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch queue statistics
  const { data: queueStats, isLoading: isLoadingQueue } = useQuery({
    queryKey: ['/api/integrations/queue/stats'],
    queryFn: fetchQueueStats,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch pending interventions
  const { data: pendingInterventions = [], isLoading: isLoadingInterventions } = useQuery({
    queryKey: ['/api/integrations/interventions/pending'],
    queryFn: fetchPendingInterventions,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Trigger recovery mutation
  const triggerRecovery = useMutation({
    mutationFn: triggerIntegrationRecovery,
    onSuccess: (_, integration) => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/health'] });
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/${integration}/health`] });
      
      toast({
        title: 'Recovery Triggered',
        description: `Recovery process started for ${integration}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Recovery Failed',
        description: error instanceof Error ? error.message : 'Failed to trigger recovery',
        variant: 'destructive',
      });
    },
  });

  // Mark for maintenance mutation
  const markForMaintenance = useMutation({
    mutationFn: markIntegrationMaintenance,
    onSuccess: (_, { integration }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/health'] });
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/${integration}/health`] });
      
      toast({
        title: 'Maintenance Mode',
        description: `${integration} marked for maintenance`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Maintenance Failed',
        description: error instanceof Error ? error.message : 'Failed to mark for maintenance',
        variant: 'destructive',
      });
    },
  });

  // Resolve intervention mutation
  const resolveIntervention = useMutation({
    mutationFn: resolveManualIntervention,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/interventions/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/queue/stats'] });
      
      toast({
        title: 'Intervention Resolved',
        description: 'Manual intervention has been processed',
      });
    },
    onError: (error) => {
      toast({
        title: 'Resolution Failed',
        description: error instanceof Error ? error.message : 'Failed to resolve intervention',
        variant: 'destructive',
      });
    },
  });

  // Get specific integration health
  const getIntegrationHealth = (integration: IntegrationType): IntegrationHealthCheck | undefined => {
    return allIntegrationHealth.find(health => health.integration === integration);
  };

  // Get integrations by status
  const getIntegrationsByStatus = (status: string): IntegrationHealthCheck[] => {
    return allIntegrationHealth.filter(health => health.status === status);
  };

  // Check if any integration is unhealthy
  const hasUnhealthyIntegrations = (): boolean => {
    return allIntegrationHealth.some(health => 
      health.status === 'failed' || health.status === 'degraded'
    );
  };

  // Get critical integration count
  const getCriticalIntegrationCount = (): number => {
    return allIntegrationHealth.filter(health => health.status === 'failed').length;
  };

  // Get integration health with caching
  const useIntegrationHealth = (integration: IntegrationType) => {
    return useQuery({
      queryKey: [`/api/integrations/${integration}/health`],
      queryFn: () => fetchIntegrationHealth(integration),
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // Refetch every minute
    });
  };

  // Refresh all data
  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
  };

  // Format integration name for display
  const formatIntegrationName = (integration: IntegrationType): string => {
    return integration.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get status display properties
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          darkColor: 'dark:text-green-400',
          darkBgColor: 'dark:bg-green-900/20',
          icon: '✓',
        };
      case 'degraded':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          darkColor: 'dark:text-yellow-400',
          darkBgColor: 'dark:bg-yellow-900/20',
          icon: '⚠',
        };
      case 'failed':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          darkColor: 'dark:text-red-400',
          darkBgColor: 'dark:bg-red-900/20',
          icon: '✗',
        };
      case 'recovering':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          darkColor: 'dark:text-blue-400',
          darkBgColor: 'dark:bg-blue-900/20',
          icon: '↻',
        };
      case 'maintenance':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          darkColor: 'dark:text-orange-400',
          darkBgColor: 'dark:bg-orange-900/20',
          icon: '⚙',
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          darkColor: 'dark:text-gray-400',
          darkBgColor: 'dark:bg-gray-900/20',
          icon: '?',
        };
    }
  };

  return {
    // Data
    allIntegrationHealth,
    queueStats,
    pendingInterventions,
    
    // Loading states
    isLoading: isLoadingHealth || isLoadingQueue || isLoadingInterventions,
    isLoadingHealth,
    isLoadingQueue,
    isLoadingInterventions,
    
    // Mutations
    triggerRecovery,
    markForMaintenance,
    resolveIntervention,
    
    // Utility functions
    getIntegrationHealth,
    getIntegrationsByStatus,
    hasUnhealthyIntegrations,
    getCriticalIntegrationCount,
    formatIntegrationName,
    getStatusDisplay,
    refreshAll,
    
    // Hooks
    useIntegrationHealth,
  };
}