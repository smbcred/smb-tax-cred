import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { errorReporting } from '@/lib/errorReporting';

// Error statistics interface
interface ErrorStats {
  totalErrors: number;
  errorsBySeverity: Record<string, number>;
  errorsByCategory: Record<string, number>;
  resolvedCount: number;
  unresolvedCount: number;
  averageResolutionTime: number;
}

// Error log interface
interface ErrorLog {
  id: string;
  message: string;
  severity: string;
  category: string;
  resolved: boolean;
  occurrenceCount: number;
  firstOccurrence: string;
  lastOccurrence: string;
  context: {
    userId?: string;
    endpoint?: string;
    timestamp: string;
  };
}

export function useErrorHandler() {
  const queryClient = useQueryClient();

  // Report error mutation
  const reportError = useMutation({
    mutationFn: async (params: {
      error: Error;
      context?: Record<string, any>;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      category?: string;
    }) => {
      const { error, context = {}, severity, category } = params;
      
      return errorReporting.reportError(error, {
        ...context,
        severity,
        category,
      });
    },
    onSuccess: (errorId) => {
      if (errorId) {
        if (import.meta.env.DEV) console.debug('Error reported successfully:', errorId);
      }
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.debug('Failed to report error:', error);
      toast({
        title: 'Error Reporting Failed',
        description: 'We couldn\'t report this error automatically. Please contact support if the issue persists.',
        variant: 'destructive',
      });
    },
  });

  // Get error statistics
  const { data: errorStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/errors/stats'],
    queryFn: async (): Promise<{ stats: ErrorStats; period: string }> => {
      const response = await fetch('/api/errors/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch error statistics');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get recent errors
  const { data: recentErrors, isLoading: isLoadingErrors } = useQuery({
    queryKey: ['/api/errors/recent'],
    queryFn: async (): Promise<{ errors: ErrorLog[] }> => {
      const response = await fetch('/api/errors/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent errors');
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Resolve error mutation
  const resolveError = useMutation({
    mutationFn: async (params: { errorId: string; resolution: string }) => {
      const response = await fetch(`/api/errors/${params.errorId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ resolution: params.resolution }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to resolve error');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch error data
      queryClient.invalidateQueries({ queryKey: ['/api/errors'] });
      
      toast({
        title: 'Error Resolved',
        description: 'The error has been marked as resolved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Resolution Failed',
        description: 'Failed to mark error as resolved. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Utility functions for common error reporting scenarios
  const reportApiError = (error: Error, endpoint: string, method: string) => {
    return reportError.mutateAsync({
      error,
      context: { endpoint, method },
      category: 'api',
      severity: 'medium',
    });
  };

  const reportFormError = (error: Error, formName: string, fieldName?: string) => {
    return reportError.mutateAsync({
      error,
      context: { formName, fieldName },
      category: 'form',
      severity: 'low',
    });
  };

  const reportPaymentError = (error: Error, paymentMethod?: string) => {
    return reportError.mutateAsync({
      error,
      context: { paymentMethod },
      category: 'payment',
      severity: 'critical',
    });
  };

  const reportAuthError = (error: Error, action: string) => {
    return reportError.mutateAsync({
      error,
      context: { action },
      category: 'authentication',
      severity: 'high',
    });
  };

  // Handle errors with user-friendly notifications
  const handleError = (error: Error, context?: {
    showToast?: boolean;
    toastTitle?: string;
    toastDescription?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
  }) => {
    const {
      showToast = true,
      toastTitle = 'Something went wrong',
      toastDescription,
      severity = 'medium',
      category = 'unknown'
    } = context || {};

    // Report the error
    reportError.mutate({
      error,
      severity,
      category,
    });

    // Show user notification if requested
    if (showToast) {
      toast({
        title: toastTitle,
        description: toastDescription || error.message || 'An unexpected error occurred. Please try again.',
        variant: severity === 'critical' || severity === 'high' ? 'destructive' : 'default',
      });
    }
  };

  // Create an error boundary trigger
  const triggerErrorBoundary = (error: Error) => {
    // This will trigger the nearest error boundary
    throw error;
  };

  // Format error for display
  const formatError = (error: ErrorLog) => {
    const timeAgo = new Date(error.lastOccurrence).toLocaleString();
    return {
      ...error,
      formattedTime: timeAgo,
      severityColor: getSeverityColor(error.severity),
      categoryIcon: getCategoryIcon(error.category),
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'authentication':
        return '🔐';
      case 'payment':
        return '💳';
      case 'validation':
        return '⚠️';
      case 'api':
      case 'integration':
        return '🔌';
      case 'database':
        return '🗄️';
      case 'email':
        return '📧';
      case 'document':
        return '📄';
      case 'form':
        return '📝';
      default:
        return '❌';
    }
  };

  return {
    // Error reporting
    reportError: reportError.mutate,
    reportErrorAsync: reportError.mutateAsync,
    reportApiError,
    reportFormError,
    reportPaymentError,
    reportAuthError,
    handleError,
    triggerErrorBoundary,
    
    // Error data
    errorStats: errorStats?.stats,
    statsPeriod: errorStats?.period,
    recentErrors: recentErrors?.errors || [],
    
    // Loading states
    isReporting: reportError.isPending,
    isLoadingStats,
    isLoadingErrors,
    isResolving: resolveError.isPending,
    
    // Error resolution
    resolveError: resolveError.mutate,
    resolveErrorAsync: resolveError.mutateAsync,
    
    // Utility functions
    formatError,
    getSeverityColor,
    getCategoryIcon,
    
    // Refresh functions
    refreshStats: () => queryClient.invalidateQueries({ queryKey: ['/api/errors/stats'] }),
    refreshErrors: () => queryClient.invalidateQueries({ queryKey: ['/api/errors/recent'] }),
  };
}