import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { ProgressMonitor } from './progress-monitor';
import { Loader2, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowTrigger {
  id: string;
  intakeFormId: string;
  status: 'pending' | 'triggered' | 'completed' | 'failed' | 'timeout';
  workflowName: string;
  triggeredAt?: string;
  completedAt?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string;
  lastError?: string;
  makeExecutionId?: string;
  makeScenarioId?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowStatusProps {
  intakeFormId: string;
  canTrigger?: boolean;
  className?: string;
}

export function WorkflowStatus({ intakeFormId, canTrigger = false, className }: WorkflowStatusProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Query workflow triggers for this form
  const { data: triggers = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/workflows/triggers', intakeFormId],
    queryFn: async () => {
      const response = await fetch(`/api/workflows/triggers/${intakeFormId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch workflow triggers');
      const result = await response.json();
      return result.triggers;
    },
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds when enabled
  });

  // Trigger workflow mutation
  const triggerWorkflow = useMutation({
    mutationFn: async (priority: 'normal' | 'high' | 'urgent' = 'normal') => {
      const response = await fetch('/api/workflows/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ intakeFormId, priority }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to trigger workflow');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Workflow Triggered",
        description: `Document generation started successfully. Execution ID: ${data.executionId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows/triggers', intakeFormId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Workflow Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Retry workflow mutation
  const retryWorkflow = useMutation({
    mutationFn: async (triggerId: string) => {
      const response = await fetch(`/api/workflows/retry/${triggerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to retry workflow');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Workflow Retried",
        description: "Document generation has been restarted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows/triggers', intakeFormId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Retry Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get the latest trigger
  const latestTrigger = triggers[0];
  const hasActiveWorkflow = latestTrigger && ['pending', 'triggered'].includes(latestTrigger.status);

  // Stop auto-refresh when workflow is completed or failed
  useEffect(() => {
    if (latestTrigger && ['completed', 'failed', 'timeout'].includes(latestTrigger.status)) {
      setAutoRefresh(false);
    }
  }, [latestTrigger?.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'triggered':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'timeout':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'triggered':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'timeout':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusDescription = (trigger: WorkflowTrigger) => {
    switch (trigger.status) {
      case 'pending':
        return trigger.nextRetryAt 
          ? `Scheduled for retry at ${new Date(trigger.nextRetryAt).toLocaleTimeString()}`
          : 'Waiting to be triggered';
      case 'triggered':
        return trigger.makeExecutionId 
          ? `Running (Execution: ${trigger.makeExecutionId})`
          : 'Document generation in progress';
      case 'completed':
        return trigger.completedAt 
          ? `Completed at ${new Date(trigger.completedAt).toLocaleTimeString()}`
          : 'Document generation completed successfully';
      case 'failed':
        return trigger.lastError || 'Document generation failed';
      case 'timeout':
        return 'Document generation timed out';
      default:
        return 'Unknown status';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading workflow status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Document Generation</CardTitle>
            <CardDescription>
              Workflow status for intake form processing
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {canTrigger && !hasActiveWorkflow && (
              <Button
                onClick={() => triggerWorkflow.mutate('normal')}
                disabled={triggerWorkflow.isPending}
                size="sm"
              >
                {triggerWorkflow.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Start Generation'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {triggers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No document generation workflows have been started yet.</p>
            {canTrigger && (
              <p className="text-sm mt-2">
                Click "Start Generation" to begin processing your intake form.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {triggers.slice(0, 3).map((trigger: WorkflowTrigger) => (
              <div
                key={trigger.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(trigger.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(trigger.status)}>
                        {trigger.status.toUpperCase()}
                      </Badge>
                      {trigger.retryCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          (Retry {trigger.retryCount}/{trigger.maxRetries})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getStatusDescription(trigger)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(trigger.status === 'failed' || trigger.status === 'timeout') && 
                   trigger.retryCount < trigger.maxRetries && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => retryWorkflow.mutate(trigger.id)}
                      disabled={retryWorkflow.isPending}
                    >
                      {retryWorkflow.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Retry'
                      )}
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(trigger.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            
            {triggers.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                Showing latest 3 of {triggers.length} workflow runs
              </p>
            )}
          </div>
        )}

        {/* Progress Monitor for Latest Active Workflow */}
        {latestTrigger && hasActiveWorkflow && (
          <div className="mt-6">
            <ProgressMonitor 
              triggerId={latestTrigger.id}
              autoStart={true}
              showControls={true}
              onCompleted={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/workflows/triggers', intakeFormId] });
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}