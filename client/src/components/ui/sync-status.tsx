import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SyncStatus {
  status: 'not_synced' | 'pending' | 'synced' | 'failed';
  recordId?: string | null;
  syncedAt?: string | null;
  error?: string | null;
}

interface SyncStatusIndicatorProps {
  syncStatus: SyncStatus;
  onRetrySync?: () => void;
  isLoading?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function SyncStatusIndicator({ 
  syncStatus, 
  onRetrySync, 
  isLoading = false,
  showDetails = false,
  className 
}: SyncStatusIndicatorProps) {
  const getStatusConfig = (status: SyncStatus['status']) => {
    switch (status) {
      case 'synced':
        return {
          icon: CheckCircle,
          label: 'Synced',
          variant: 'default' as const,
          color: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending',
          variant: 'secondary' as const,
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        };
      case 'failed':
        return {
          icon: XCircle,
          label: 'Failed',
          variant: 'destructive' as const,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Not Synced',
          variant: 'outline' as const,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        };
    }
  };

  const config = getStatusConfig(syncStatus.status);
  const Icon = config.icon;
  const LoadingIcon = RefreshCw;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant={config.variant}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1",
          config.bgColor
        )}
      >
        {isLoading ? (
          <LoadingIcon className="h-3 w-3 animate-spin" />
        ) : (
          <Icon className={cn("h-3 w-3", config.color)} />
        )}
        <span className="text-xs font-medium">{config.label}</span>
      </Badge>

      {syncStatus.status === 'failed' && onRetrySync && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetrySync}
          disabled={isLoading}
          className="h-7 px-2 text-xs"
        >
          <RefreshCw className={cn("h-3 w-3 mr-1", isLoading && "animate-spin")} />
          Retry
        </Button>
      )}

      {showDetails && (
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {syncStatus.recordId && (
            <span>Record: {syncStatus.recordId.slice(0, 8)}...</span>
          )}
          {syncStatus.syncedAt && (
            <span>
              Synced: {new Date(syncStatus.syncedAt).toLocaleString()}
            </span>
          )}
          {syncStatus.error && (
            <span className="text-red-600">
              Error: {syncStatus.error}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface SyncStatusCardProps {
  syncStatus: SyncStatus;
  onRetrySync?: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

export function SyncStatusCard({
  syncStatus,
  onRetrySync,
  isLoading = false,
  title = "Airtable Sync Status",
  description = "Customer record synchronization status",
  className
}: SyncStatusCardProps) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4 shadow-sm",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <SyncStatusIndicator
          syncStatus={syncStatus}
          onRetrySync={onRetrySync}
          isLoading={isLoading}
        />
      </div>
      
      {syncStatus.status === 'synced' && syncStatus.recordId && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Airtable Record ID:</span>
            <span className="font-mono">{syncStatus.recordId}</span>
          </div>
          {syncStatus.syncedAt && (
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">Last Synced:</span>
              <span>{new Date(syncStatus.syncedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {syncStatus.status === 'failed' && syncStatus.error && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-red-600">
            <strong>Error:</strong> {syncStatus.error}
          </div>
        </div>
      )}
    </div>
  );
}