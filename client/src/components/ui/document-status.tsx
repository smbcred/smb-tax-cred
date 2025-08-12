import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export interface DocumentInfo {
  id: string;
  documentType: string;
  documentName: string;
  status: 'pending' | 'processing' | 'available' | 'failed' | 'expired';
  s3Url?: string;
  accessExpiresAt?: string;
  downloadCount?: number;
  lastAccessedAt?: string;
  createdAt: string;
  updatedAt: string;
  generationError?: string;
}

interface DocumentStatusProps {
  document: DocumentInfo;
  onDownload?: (document: DocumentInfo) => void;
  onRetry?: (document: DocumentInfo) => void;
  className?: string;
}

export function DocumentStatus({ 
  document, 
  onDownload, 
  onRetry, 
  className 
}: DocumentStatusProps) {
  const getStatusConfig = (status: DocumentInfo['status']) => {
    switch (status) {
      case 'available':
        return {
          icon: CheckCircle,
          label: 'Available',
          variant: 'default' as const,
          color: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        };
      case 'processing':
        return {
          icon: RefreshCw,
          label: 'Processing',
          variant: 'secondary' as const,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
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
      case 'expired':
        return {
          icon: AlertTriangle,
          label: 'Expired',
          variant: 'outline' as const,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        };
      default:
        return {
          icon: FileText,
          label: 'Unknown',
          variant: 'outline' as const,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        };
    }
  };

  const config = getStatusConfig(document.status);
  const Icon = config.icon;
  const isExpired = document.accessExpiresAt && new Date() > new Date(document.accessExpiresAt);
  const canDownload = document.status === 'available' && document.s3Url && !isExpired;
  const canRetry = document.status === 'failed' && onRetry;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{document.documentName}</CardTitle>
            <p className="text-xs text-muted-foreground capitalize">
              {document.documentType.replace(/_/g, ' ')}
            </p>
          </div>
          <Badge 
            variant={config.variant}
            className={cn("flex items-center gap-1.5", config.bgColor)}
          >
            <Icon className={cn("h-3 w-3", config.color, document.status === 'processing' && "animate-spin")} />
            <span className="text-xs font-medium">{config.label}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Download and Action Buttons */}
        <div className="flex gap-2">
          {canDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload?.(document)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          
          {canRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry?.(document)}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>

        {/* Document Details */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}</span>
          </div>
          
          {document.downloadCount !== undefined && document.downloadCount > 0 && (
            <div className="flex justify-between">
              <span>Downloads:</span>
              <span>{document.downloadCount}</span>
            </div>
          )}
          
          {document.accessExpiresAt && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Expires:
              </span>
              <span className={cn(isExpired && "text-red-600")}>
                {formatDistanceToNow(new Date(document.accessExpiresAt), { addSuffix: true })}
              </span>
            </div>
          )}
          
          {document.lastAccessedAt && (
            <div className="flex justify-between">
              <span>Last accessed:</span>
              <span>{formatDistanceToNow(new Date(document.lastAccessedAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {document.status === 'failed' && document.generationError && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-red-600">
              <strong>Error:</strong> {document.generationError}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DocumentListProps {
  documents: DocumentInfo[];
  onDownload?: (document: DocumentInfo) => void;
  onRetry?: (document: DocumentInfo) => void;
  isLoading?: boolean;
  className?: string;
}

export function DocumentList({ 
  documents, 
  onDownload, 
  onRetry, 
  isLoading = false,
  className 
}: DocumentListProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No documents available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {documents.map((document) => (
        <DocumentStatus
          key={document.id}
          document={document}
          onDownload={onDownload}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}

interface DocumentProgressProps {
  documents: DocumentInfo[];
  className?: string;
}

export function DocumentProgress({ documents, className }: DocumentProgressProps) {
  const totalDocuments = documents.length;
  const completedDocuments = documents.filter(doc => doc.status === 'available').length;
  const progressPercentage = totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0;

  const statusCounts = documents.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Document Generation Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{completedDocuments} of {totalDocuments} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex justify-between">
              <span className="capitalize">{status.replace(/_/g, ' ')}:</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}