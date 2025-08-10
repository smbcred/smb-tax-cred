import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { Loader2, Play, Square, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useStatusPolling } from '@/hooks/useStatusPolling';
import { useToast } from '@/hooks/use-toast';

interface ProgressMonitorProps {
  triggerId: string;
  autoStart?: boolean;
  showControls?: boolean;
  className?: string;
  onCompleted?: () => void;
}

export function ProgressMonitor({ 
  triggerId, 
  autoStart = true, 
  showControls = true,
  className,
  onCompleted 
}: ProgressMonitorProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<string[]>([]);

  const {
    isPolling,
    currentStatus,
    trigger,
    startPolling,
    stopPolling,
    refetchStatus,
    isStarting,
    isStopping,
    progress,
    isInProgress,
    isCompleted,
    statusMessage,
    estimatedCompletion,
    lastUpdated,
  } = useStatusPolling(triggerId, {
    autoStart,
    onStatusChange: (status) => {
      const notification = `Status changed to ${status.status.toUpperCase()}`;
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5 notifications
    },
    onCompleted: (status) => {
      onCompleted?.();
      const notification = status.status === 'completed' 
        ? 'Document generation completed successfully!'
        : `Document generation ${status.status}`;
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    },
    onError: (error) => {
      const notification = `Error: ${error}`;
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    },
  });

  const getStatusIcon = () => {
    if (isPolling && isInProgress) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    }
    
    switch (currentStatus?.status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'timeout':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = () => {
    switch (currentStatus?.status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'timeout':
        return 'secondary';
      case 'running':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusDescription = () => {
    if (!currentStatus && !trigger) {
      return 'Loading workflow information...';
    }

    const status = currentStatus?.status || trigger?.status;
    const message = statusMessage;

    switch (status) {
      case 'pending':
        return 'Waiting for document generation to begin';
      case 'running':
        return message || 'Document generation in progress';
      case 'completed':
        return 'Document generation completed successfully';
      case 'failed':
        return message || 'Document generation failed';
      case 'timeout':
        return 'Document generation timed out';
      case 'triggered':
        return 'Workflow has been triggered and is starting';
      default:
        return 'Unknown status';
    }
  };

  const formatEstimatedCompletion = () => {
    if (!estimatedCompletion) return null;
    
    const now = new Date();
    const completion = new Date(estimatedCompletion);
    const diffMs = completion.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Completing soon...';
    
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 1) return 'Less than 1 minute remaining';
    if (diffMins === 1) return '1 minute remaining';
    return `${diffMins} minutes remaining`;
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return null;
    
    const updated = new Date(lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return updated.toLocaleDateString();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">Document Generation Progress</CardTitle>
              <CardDescription>
                Real-time monitoring of workflow execution
              </CardDescription>
            </div>
          </div>
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchStatus()}
                disabled={isStarting || isStopping}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              {!isPolling ? (
                <Button
                  onClick={startPolling}
                  disabled={isStarting || isCompleted}
                  size="sm"
                >
                  {isStarting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Start Monitoring
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={stopPolling}
                  disabled={isStopping}
                  size="sm"
                >
                  {isStopping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  Stop
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge and Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor()}>
              {(currentStatus?.status || trigger?.status || 'unknown').toUpperCase()}
            </Badge>
            {isPolling && (
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                MONITORING
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {getStatusDescription()}
          </p>
        </div>

        {/* Progress Bar */}
        {isInProgress && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            {formatEstimatedCompletion() && (
              <p className="text-xs text-muted-foreground">
                {formatEstimatedCompletion()}
              </p>
            )}
          </div>
        )}

        {/* Workflow Information */}
        {trigger && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Workflow:</span>
              <p className="text-muted-foreground">{trigger.workflowName}</p>
            </div>
            <div>
              <span className="font-medium">Started:</span>
              <p className="text-muted-foreground">
                {trigger.triggeredAt 
                  ? new Date(trigger.triggeredAt).toLocaleString()
                  : 'Not started'
                }
              </p>
            </div>
            {trigger.makeExecutionId && (
              <div className="col-span-2">
                <span className="font-medium">Execution ID:</span>
                <p className="text-muted-foreground font-mono text-xs">
                  {trigger.makeExecutionId}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Recent Updates</span>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {notifications.map((notification, index) => (
                <p key={index} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  {notification}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {formatLastUpdated() && (
          <p className="text-xs text-muted-foreground text-right">
            Last updated: {formatLastUpdated()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}