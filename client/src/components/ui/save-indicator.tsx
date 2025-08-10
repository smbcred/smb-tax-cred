import { CheckCircle, Clock, Save, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  lastSavedAt: string | null;
  hasUnsavedChanges: boolean;
  isOnline: boolean;
  className?: string;
}

export function SaveIndicator({
  status,
  lastSavedAt,
  hasUnsavedChanges,
  isOnline,
  className
}: SaveIndicatorProps) {
  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="w-3 h-3 text-slate-500" />;
    }

    switch (status) {
      case 'saving':
        return <Save className="w-3 h-3 animate-pulse text-blue-600" />;
      case 'saved':
        return <CheckCircle className="w-3 h-3 text-emerald-600" />;
      case 'error':
        return <AlertTriangle className="w-3 h-3 text-red-600" />;
      case 'offline':
        return <WifiOff className="w-3 h-3 text-amber-600" />;
      default:
        if (hasUnsavedChanges) {
          return <Clock className="w-3 h-3 text-amber-600" />;
        }
        return <CheckCircle className="w-3 h-3 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline - changes will sync when reconnected';
    }

    switch (status) {
      case 'saving':
        return 'Auto-saving...';
      case 'saved':
        return lastSavedAt 
          ? `Last saved: ${new Date(lastSavedAt).toLocaleTimeString()}`
          : 'Saved';
      case 'error':
        return 'Failed to save - will retry automatically';
      case 'offline':
        return 'Offline - changes will sync when reconnected';
      default:
        if (hasUnsavedChanges) {
          return 'Unsaved changes';
        }
        return lastSavedAt 
          ? `Last saved: ${new Date(lastSavedAt).toLocaleTimeString()}`
          : 'No changes';
    }
  };

  const getStatusColor = () => {
    if (!isOnline) {
      return 'text-slate-500';
    }

    switch (status) {
      case 'saving':
        return 'text-blue-600';
      case 'saved':
        return 'text-emerald-600';
      case 'error':
        return 'text-red-600';
      case 'offline':
        return 'text-amber-600';
      default:
        return hasUnsavedChanges ? 'text-amber-600' : 'text-slate-500';
    }
  };

  return (
    <div className={cn('flex items-center text-xs', getStatusColor(), className)}>
      {getStatusIcon()}
      <span className="ml-1">{getStatusText()}</span>
      {!isOnline && (
        <WifiOff className="w-3 h-3 ml-2 text-slate-400" />
      )}
    </div>
  );
}