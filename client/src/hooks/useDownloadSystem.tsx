import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface DownloadRequest {
  fileKeys: string[];
  downloadType: 'single' | 'zip';
  expiresIn?: number; // seconds, default 3600 (1 hour)
  trackingEnabled?: boolean;
  compressionLevel?: number; // 0-9, default 6
}

interface DownloadResponse {
  downloadToken: string;
  downloadUrl: string;
  expiresAt: string;
  fileCount: number;
  estimatedSize: number;
  downloadType: 'single' | 'zip';
  trackingId: string;
}

interface DownloadTracking {
  trackingId: string;
  downloadToken: string;
  userId: string;
  fileKeys: string[];
  downloadType: 'single' | 'zip';
  fileCount: number;
  totalSize: number;
  downloadedSize: number;
  downloadedAt?: string;
  startedAt: string;
  completedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'pending' | 'started' | 'completed' | 'failed' | 'expired';
  errorMessage?: string;
}

interface DownloadStats {
  totalDownloads: number;
  totalSize: number;
  downloadsByType: Record<string, number>;
  downloadsByDay: Array<{
    date: string;
    count: number;
    size: number;
  }>;
  topFiles: Array<{
    fileKey: string;
    fileName: string;
    downloadCount: number;
    lastDownloaded: string;
  }>;
}

interface DownloadOptimization {
  optimizedSize: number;
  estimatedTime: number;
  compressionRatio: number;
}

export function useDownloadSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create download
  const createDownload = useMutation({
    mutationFn: async (request: DownloadRequest): Promise<DownloadResponse> => {
      const response = await fetch('/api/downloads/create', {
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
          message: error.error || 'Failed to create download',
          details: error.details,
        };
      }

      const data = await response.json();
      return data.download;
    },
    onSuccess: (data, variables) => {
      const fileText = variables.fileKeys.length === 1 ? 'file' : 'files';
      const typeText = variables.downloadType === 'zip' ? 'ZIP package' : 'download';
      
      toast({
        title: 'Download Ready',
        description: `${typeText} prepared for ${variables.fileKeys.length} ${fileText}`,
      });
      
      // Invalidate download stats
      queryClient.invalidateQueries({ queryKey: ['/api/downloads/stats'] });
    },
    onError: (error: any) => {
      let title = 'Download Failed';
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

  // Start browser download
  const startBrowserDownload = (downloadUrl: string, filename?: string) => {
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    if (filename) {
      link.download = filename;
    }
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download files (creates download and starts browser download)
  const downloadFiles = useMutation({
    mutationFn: async (request: DownloadRequest): Promise<DownloadResponse> => {
      // First create the download
      const downloadResponse = await createDownload.mutateAsync(request);
      
      // Then start the browser download
      const filename = request.downloadType === 'zip' 
        ? `smbtaxcredits-documents-${new Date().toISOString().split('T')[0]}.zip`
        : undefined;
        
      startBrowserDownload(downloadResponse.downloadUrl, filename);
      
      return downloadResponse;
    },
    onSuccess: (data, variables) => {
      const fileText = variables.fileKeys.length === 1 ? 'file' : 'files';
      
      toast({
        title: 'Download Started',
        description: `Download started for ${variables.fileKeys.length} ${fileText}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get download status
  const useDownloadStatus = (trackingId: string | null) => {
    return useQuery({
      queryKey: ['/api/downloads/status', trackingId],
      queryFn: async (): Promise<DownloadTracking> => {
        if (!trackingId) return null as any;
        
        const response = await fetch(`/api/downloads/status/${trackingId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get download status');
        }

        const data = await response.json();
        return data.tracking;
      },
      enabled: !!trackingId,
      refetchInterval: (data) => {
        // Stop polling if download is completed, failed, or expired
        if (!data || ['completed', 'failed', 'expired'].includes(data.status)) {
          return false;
        }
        return 3000; // Poll every 3 seconds
      },
    });
  };

  // Get download statistics
  const useDownloadStats = (days: number = 30) => {
    return useQuery({
      queryKey: ['/api/downloads/stats', days],
      queryFn: async (): Promise<DownloadStats> => {
        const response = await fetch(`/api/downloads/stats?days=${days}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get download statistics');
        }

        const data = await response.json();
        return data.stats;
      },
    });
  };

  // Delete download token
  const deleteDownload = useMutation({
    mutationFn: async (downloadToken: string): Promise<void> => {
      const response = await fetch(`/api/downloads/${downloadToken}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete download');
      }
    },
    onSuccess: () => {
      toast({
        title: 'Download Deleted',
        description: 'Download token has been removed',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/downloads/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Optimize download
  const optimizeDownload = useMutation({
    mutationFn: async ({ fileKeys, options }: {
      fileKeys: string[];
      options?: {
        maxBandwidth?: number;
        compressionLevel?: number;
        streamingEnabled?: boolean;
      };
    }): Promise<DownloadOptimization> => {
      const response = await fetch('/api/downloads/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fileKeys,
          ...options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to optimize download');
      }

      const data = await response.json();
      return data.optimization;
    },
  });

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${Math.round(remainingSeconds)}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getDownloadStatusColor = (status: DownloadTracking['status']): string => {
    switch (status) {
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'started': return 'text-blue-600 dark:text-blue-400';
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      case 'expired': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getDownloadStatusIcon = (status: DownloadTracking['status']): string => {
    switch (status) {
      case 'pending': return '⏳';
      case 'started': return '⬇️';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'expired': return '⏰';
      default: return '❓';
    }
  };

  const isDownloadExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) < new Date();
  };

  const getTimeUntilExpiration = (expiresAt: string): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const calculateDownloadProgress = (tracking: DownloadTracking): number => {
    if (tracking.totalSize === 0) return 0;
    return Math.round((tracking.downloadedSize / tracking.totalSize) * 100);
  };

  const estimateRemainingTime = (tracking: DownloadTracking, currentSpeed?: number): string => {
    if (!currentSpeed || tracking.downloadedSize === 0) {
      return 'Calculating...';
    }
    
    const remainingBytes = tracking.totalSize - tracking.downloadedSize;
    const remainingSeconds = remainingBytes / currentSpeed;
    
    return formatDuration(remainingSeconds);
  };

  const canRetryDownload = (tracking: DownloadTracking): boolean => {
    return ['failed', 'expired'].includes(tracking.status);
  };

  const shouldShowProgress = (tracking: DownloadTracking): boolean => {
    return ['started'].includes(tracking.status) && tracking.downloadedSize > 0;
  };

  // Batch download helpers
  const createZipDownload = (fileKeys: string[], options?: {
    expiresIn?: number;
    compressionLevel?: number;
  }) => {
    return downloadFiles.mutate({
      fileKeys,
      downloadType: 'zip',
      expiresIn: options?.expiresIn || 3600,
      compressionLevel: options?.compressionLevel || 6,
      trackingEnabled: true,
    });
  };

  const createSingleDownload = (fileKey: string, options?: {
    expiresIn?: number;
  }) => {
    return downloadFiles.mutate({
      fileKeys: [fileKey],
      downloadType: 'single',
      expiresIn: options?.expiresIn || 3600,
      trackingEnabled: true,
    });
  };

  return {
    // Actions
    createDownload: createDownload.mutate,
    downloadFiles: downloadFiles.mutate,
    deleteDownload: deleteDownload.mutate,
    optimizeDownload: optimizeDownload.mutate,
    startBrowserDownload,

    // Convenience methods
    createZipDownload,
    createSingleDownload,

    // State
    isCreatingDownload: createDownload.isPending,
    isDownloading: downloadFiles.isPending,
    isDeleting: deleteDownload.isPending,
    isOptimizing: optimizeDownload.isPending,

    // Hooks
    useDownloadStatus,
    useDownloadStats,

    // Utility functions
    formatFileSize,
    formatDuration,
    getDownloadStatusColor,
    getDownloadStatusIcon,
    isDownloadExpired,
    getTimeUntilExpiration,
    calculateDownloadProgress,
    estimateRemainingTime,
    canRetryDownload,
    shouldShowProgress,

    // Error information
    createError: createDownload.error as any,
    downloadError: downloadFiles.error as any,
    deleteError: deleteDownload.error as any,
    optimizeError: optimizeDownload.error as any,
  };
}