import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface CompanyContext {
  companyName: string;
  taxYear: number;
  industry: string;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship';
}

interface RdActivity {
  activity: string;
  description: string;
  timeSpent: number;
  category: 'experimentation' | 'testing' | 'analysis' | 'development' | 'evaluation';
}

interface ProjectContext {
  projectName: string;
  projectDescription: string;
  rdActivities: RdActivity[];
  technicalChallenges: string[];
  uncertainties: string[];
  innovations: string[];
  businessPurpose: string;
}

interface ExpenseContext {
  totalExpenses: number;
  wageExpenses: number;
  contractorExpenses: number;
  supplyExpenses: number;
}

interface DocumentOptions {
  includeNarrative?: boolean;
  includeComplianceMemo?: boolean;
  includePDF?: boolean;
  narrativeTemplate?: string;
  narrativeOptions?: {
    length?: 'brief' | 'standard' | 'detailed';
    tone?: 'professional' | 'technical' | 'formal';
    focus?: 'compliance' | 'technical' | 'business';
  };
  memoOptions?: {
    includeRiskAssessment?: boolean;
    includeFourPartTest?: boolean;
    includeQREAnalysis?: boolean;
    detailLevel?: 'summary' | 'standard' | 'comprehensive';
  };
}

interface DocumentGenerationRequest {
  companyContext: CompanyContext;
  projectContext: ProjectContext;
  expenseContext: ExpenseContext;
  documentOptions: DocumentOptions;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface DocumentJobProgress {
  currentStep: string;
  completedSteps: string[];
  totalSteps: number;
  percentage: number;
}

interface DocumentServiceStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

interface DocumentJob {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'timeout';
  progress: DocumentJobProgress;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  services: {
    narrative: DocumentServiceStatus;
    complianceMemo: DocumentServiceStatus;
    pdfGeneration: DocumentServiceStatus;
  };
  errors: Array<{
    service: string;
    error: string;
    timestamp: string;
    retryCount: number;
  }>;
  retryCount: number;
  result?: any;
}

interface UserJobSummary {
  id: string;
  status: string;
  priority: string;
  progress: DocumentJobProgress;
  createdAt: string;
  completedAt?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  companyName?: string;
  projectName?: string;
  documentsRequested: {
    narrative: boolean;
    complianceMemo: boolean;
    pdf: boolean;
  };
  hasErrors: boolean;
  retryCount: number;
}

interface QueueStats {
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  totalInHistory: number;
}

export function useDocumentOrchestrator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number>(2000);

  // Start document generation
  const startGeneration = useMutation({
    mutationFn: async (request: DocumentGenerationRequest): Promise<{ jobId: string; estimatedDuration: number }> => {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw {
          message: error.error || 'Failed to start document generation',
          details: error.details,
        };
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Document Generation Started',
        description: `Processing ${variables.projectContext.projectName} - estimated completion in ${Math.round(data.estimatedDuration / 1000)} seconds.`,
      });
      
      // Start polling for this job
      setPollingJobId(data.jobId);
      
      // Invalidate user jobs query to refresh list
      queryClient.invalidateQueries({ queryKey: ['/api/documents/jobs'] });
    },
    onError: (error: any) => {
      const title = 'Generation Failed';
      let description = error.message;

      if (error.details && Array.isArray(error.details)) {
        description = `Validation errors: ${error.details.map((e: any) => e.message).join(', ')}`;
      }

      toast({
        title,
        description,
        variant: 'destructive',
      });
    },
  });

  // Get job status with polling
  const { data: currentJob, refetch: refetchJob } = useQuery({
    queryKey: ['/api/documents/job', pollingJobId],
    queryFn: async (): Promise<DocumentJob> => {
      if (!pollingJobId) return null as any;
      
      const response = await fetch(`/api/documents/job/${pollingJobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get job status');
      }

      const data = await response.json();
      return data.job;
    },
    enabled: !!pollingJobId,
    refetchInterval: (data) => {
      // Stop polling if job is completed, failed, or timeout
      if (!data?.data || ['completed', 'failed', 'timeout'].includes(data.data.status)) {
        return false;
      }
      return pollingInterval;
    },
  });

  // Cancel job
  const cancelJob = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/documents/job/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel job');
      }

      return response.json();
    },
    onSuccess: (_, jobId) => {
      toast({
        title: 'Job Cancelled',
        description: 'Document generation has been cancelled.',
      });
      
      if (pollingJobId === jobId) {
        setPollingJobId(null);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/documents/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents/job', jobId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Retry job
  const retryJob = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/documents/job/${jobId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to retry job');
      }

      return response.json();
    },
    onSuccess: (_, jobId) => {
      toast({
        title: 'Job Retry Queued',
        description: 'Document generation has been queued for retry.',
      });
      
      setPollingJobId(jobId);
      
      queryClient.invalidateQueries({ queryKey: ['/api/documents/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents/job', jobId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Retry Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get user jobs
  const { data: userJobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['/api/documents/jobs'],
    queryFn: async (): Promise<UserJobSummary[]> => {
      const response = await fetch('/api/documents/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get user jobs');
      }

      const data = await response.json();
      return data.jobs;
    },
  });

  // Get queue stats
  const { data: queueStats } = useQuery({
    queryKey: ['/api/documents/queue/stats'],
    queryFn: async (): Promise<QueueStats> => {
      const response = await fetch('/api/documents/queue/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get queue stats');
      }

      const data = await response.json();
      return data.stats;
    },
    refetchInterval: 10000, // Update every 10 seconds
  });

  // Handle job completion
  useEffect(() => {
    if (currentJob && ['completed', 'failed', 'timeout'].includes(currentJob.status)) {
      if (currentJob.status === 'completed') {
        toast({
          title: 'Documents Generated Successfully',
          description: `Generated ${currentJob.result?.summary?.totalDocuments || 0} documents in ${Math.round((currentJob.actualDuration || 0) / 1000)} seconds.`,
        });
      } else if (currentJob.status === 'failed') {
        toast({
          title: 'Document Generation Failed',
          description: 'Please check the job details and try again.',
          variant: 'destructive',
        });
      } else if (currentJob.status === 'timeout') {
        toast({
          title: 'Document Generation Timeout',
          description: 'The generation process took too long and was stopped.',
          variant: 'destructive',
        });
      }
      
      // Stop polling
      setPollingJobId(null);
      
      // Refresh user jobs
      queryClient.invalidateQueries({ queryKey: ['/api/documents/jobs'] });
    }
  }, [currentJob?.status, currentJob?.actualDuration, currentJob?.result, toast, queryClient]);

  // Utility functions
  const formatDuration = (ms: number): string => {
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const formatStatus = (status: string): string => {
    switch (status) {
      case 'pending': return 'Queued';
      case 'in_progress': return 'Processing';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'timeout': return 'Timeout';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'in_progress': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'timeout': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'normal': return 'text-blue-600 dark:text-blue-400';
      case 'low': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const createSampleRequest = (): DocumentGenerationRequest => {
    return {
      companyContext: {
        companyName: 'Sample Technology Inc.',
        taxYear: 2024,
        industry: 'Software Development',
        businessType: 'corporation',
      },
      projectContext: {
        projectName: 'AI-Powered Analytics Platform',
        projectDescription: 'Development of machine learning algorithms for real-time data analytics and predictive modeling capabilities with advanced uncertainty resolution and automated decision-making features',
        rdActivities: [
          {
            activity: 'Algorithm Research',
            description: 'Research and development of novel machine learning algorithms for real-time data processing',
            timeSpent: 800,
            category: 'development',
          },
          {
            activity: 'Performance Testing',
            description: 'Systematic testing of algorithm performance under various load conditions',
            timeSpent: 400,
            category: 'testing',
          },
          {
            activity: 'Uncertainty Analysis',
            description: 'Analysis of model uncertainty and confidence intervals in predictions',
            timeSpent: 300,
            category: 'analysis',
          },
        ],
        technicalChallenges: [
          'Developing novel machine learning architectures for real-time processing',
          'Optimizing performance for large-scale data streams',
          'Creating adaptive algorithms for varying data patterns',
        ],
        uncertainties: [
          'Algorithm convergence in real-time processing environments',
          'Scalability challenges with large dataset processing',
          'Integration complexity with existing legacy systems',
        ],
        innovations: [
          'Proprietary real-time ML inference engine',
          'Novel data preprocessing techniques',
          'Adaptive model selection algorithms',
        ],
        businessPurpose: 'To create competitive advantage through advanced analytics capabilities that provide real-time insights for business decision making and operational optimization',
      },
      expenseContext: {
        totalExpenses: 250000,
        wageExpenses: 180000,
        contractorExpenses: 50000,
        supplyExpenses: 20000,
      },
      documentOptions: {
        includeNarrative: true,
        includeComplianceMemo: true,
        includePDF: true,
        narrativeTemplate: 'technical_narrative',
        narrativeOptions: {
          length: 'standard',
          tone: 'professional',
          focus: 'compliance',
        },
        memoOptions: {
          includeRiskAssessment: true,
          includeFourPartTest: true,
          includeQREAnalysis: true,
          detailLevel: 'standard',
        },
      },
      priority: 'normal',
    };
  };

  return {
    // Actions
    startGeneration: startGeneration.mutate,
    cancelJob: cancelJob.mutate,
    retryJob: retryJob.mutate,
    setPollingJobId,
    stopPolling: () => setPollingJobId(null),

    // State
    isStarting: startGeneration.isPending,
    isCancelling: cancelJob.isPending,
    isRetrying: retryJob.isPending,
    isLoadingJobs,

    // Data
    currentJob,
    userJobs: userJobs || [],
    queueStats,
    pollingJobId,

    // Utility functions
    formatDuration,
    formatStatus,
    getStatusColor,
    getPriorityColor,
    createSampleRequest,

    // Error information
    startError: startGeneration.error as any,
    cancelError: cancelJob.error as any,
    retryError: retryJob.error as any,
  };
}