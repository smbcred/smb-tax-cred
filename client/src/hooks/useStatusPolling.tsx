import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  progress?: number;
  message?: string;
  estimatedCompletion?: Date;
  lastUpdated: Date;
}

interface WorkflowTrigger {
  id: string;
  status: string;
  workflowName: string;
  createdAt: string;
  triggeredAt?: string;
  completedAt?: string;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  makeExecutionId?: string;
  makeScenarioId?: string;
}

interface StatusPollingOptions {
  onStatusChange?: (status: WorkflowStatus) => void;
  onCompleted?: (status: WorkflowStatus) => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
  interval?: number;
}

export function useStatusPolling(triggerId: string, options: StatusPollingOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<WorkflowStatus | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusRef = useRef<string | null>(null);

  const {
    onStatusChange,
    onCompleted,
    onError,
    autoStart = false,
    interval = 10000, // 10 seconds
  } = options;

  // Query for current status
  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/workflows/status', triggerId],
    queryFn: async () => {
      const response = await fetch(`/api/workflows/status/${triggerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch workflow status');
      return response.json();
    },
    enabled: !!triggerId,
    refetchInterval: false, // We'll handle polling manually
  });

  // Start polling mutation
  const startPolling = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/workflows/polling/start/${triggerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start polling');
      }
      return response.json();
    },
    onSuccess: () => {
      setIsPolling(true);
      startClientPolling();
      toast({
        title: "Status Monitoring Started",
        description: "Now monitoring document generation progress.",
      });
    },
    onError: (error: Error) => {
      console.error('Start polling error:', error);
      onError?.(error.message);
      toast({
        title: "Monitoring Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Stop polling mutation
  const stopPolling = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/workflows/polling/stop/${triggerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to stop polling');
      }
      return response.json();
    },
    onSuccess: () => {
      setIsPolling(false);
      stopClientPolling();
      toast({
        title: "Status Monitoring Stopped",
        description: "No longer monitoring document generation progress.",
      });
    },
    onError: (error: Error) => {
      console.error('Stop polling error:', error);
      onError?.(error.message);
    },
  });

  // Client-side polling logic
  const startClientPolling = () => {
    if (intervalRef.current) return; // Already polling

    intervalRef.current = setInterval(async () => {
      try {
        const result = await refetchStatus();
        if (result.data?.success && result.data.status) {
          const newStatus: WorkflowStatus = result.data.status;
          setCurrentStatus(newStatus);

          // Check for status changes
          if (lastStatusRef.current !== newStatus.status) {
            lastStatusRef.current = newStatus.status;
            onStatusChange?.(newStatus);

            // Check for completion
            if (['completed', 'failed', 'timeout'].includes(newStatus.status)) {
              onCompleted?.(newStatus);
              stopClientPolling();
              setIsPolling(false);

              // Show completion notification
              if (newStatus.status === 'completed') {
                toast({
                  title: "Document Generation Complete",
                  description: "Your R&D tax credit documentation is ready.",
                });
              } else if (newStatus.status === 'failed') {
                toast({
                  title: "Generation Failed",
                  description: newStatus.message || "Document generation encountered an error.",
                  variant: "destructive",
                });
              } else if (newStatus.status === 'timeout') {
                toast({
                  title: "Generation Timeout",
                  description: "Document generation took too long and was stopped.",
                  variant: "destructive",
                });
              }
            }
          }
        }
      } catch (error: any) {
        console.error('Polling error:', error);
        onError?.(error.message);
      }
    }, interval);
  };

  const stopClientPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Auto-start polling if enabled
  useEffect(() => {
    if (autoStart && triggerId && statusData?.success) {
      const trigger: WorkflowTrigger = statusData.trigger;
      
      // Start polling if workflow is in progress
      if (['pending', 'triggered'].includes(trigger.status) && !isPolling) {
        startPolling.mutate();
      }
    }
  }, [autoStart, triggerId, statusData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopClientPolling();
    };
  }, []);

  // Manual start/stop functions
  const handleStartPolling = () => {
    if (!isPolling) {
      startPolling.mutate();
    }
  };

  const handleStopPolling = () => {
    if (isPolling) {
      stopPolling.mutate();
    }
  };

  return {
    // State
    isPolling,
    currentStatus: currentStatus || statusData?.status,
    trigger: statusData?.trigger as WorkflowTrigger | undefined,
    
    // Actions
    startPolling: handleStartPolling,
    stopPolling: handleStopPolling,
    refetchStatus,
    
    // Mutation states
    isStarting: startPolling.isPending,
    isStopping: stopPolling.isPending,
    
    // Progress calculation
    progress: currentStatus?.progress || 0,
    isInProgress: ['pending', 'running'].includes(currentStatus?.status || ''),
    isCompleted: ['completed', 'failed', 'timeout'].includes(currentStatus?.status || ''),
    
    // Status helpers
    statusMessage: currentStatus?.message || statusData?.trigger?.lastError,
    estimatedCompletion: currentStatus?.estimatedCompletion,
    lastUpdated: currentStatus?.lastUpdated || statusData?.trigger?.updatedAt,
  };
}