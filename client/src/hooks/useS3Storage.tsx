import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface S3UploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: 'narrative' | 'compliance_memo' | 'pdf_form' | 'supporting_document' | 'calculation';
  calculationId?: string;
  jobId?: string;
}

interface S3UploadResponse {
  uploadUrl: string;
  key: string;
  downloadUrl: string;
  expiresAt: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    documentType: string;
  };
}

interface S3FileMetadata {
  key: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  userId: string;
  calculationId?: string;
  jobId?: string;
  uploadedAt: string;
  lastModified: string;
  downloadUrl?: string;
  expiresAt?: string;
}

interface S3StorageStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  sizeByType: Record<string, number>;
}

interface S3BatchUploadRequest {
  calculationId: string;
  documents: Array<{
    fileName: string;
    fileType: string;
    documentType: S3UploadRequest['documentType'];
    fileData: string; // base64 encoded
  }>;
}

export function useS3Storage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload single file
  const uploadFile = useMutation({
    mutationFn: async ({ file, documentType, calculationId, jobId }: {
      file: File;
      documentType: S3UploadRequest['documentType'];
      calculationId?: string;
      jobId?: string;
    }): Promise<S3UploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      if (calculationId) {
        formData.append('calculationId', calculationId);
      }
      
      if (jobId) {
        formData.append('jobId', jobId);
      }

      const response = await fetch('/api/s3/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw {
          message: error.error || 'Failed to upload file',
          details: error.details,
        };
      }

      const data = await response.json();
      return data.upload;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'File Uploaded',
        description: `${variables.file.name} uploaded successfully to S3 storage`,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/s3/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/s3/stats'] });
    },
    onError: (error: any) => {
      const title = 'Upload Failed';
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

  // Upload batch files
  const uploadBatchFiles = useMutation({
    mutationFn: async (request: S3BatchUploadRequest): Promise<S3UploadResponse[]> => {
      const response = await fetch('/api/s3/batch-upload', {
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
          message: error.error || 'Failed to upload batch files',
          details: error.details,
        };
      }

      const data = await response.json();
      return data.uploads;
    },
    onSuccess: (data) => {
      const completed = data.filter(upload => upload.uploadUrl !== '').length;
      const failed = data.filter(upload => upload.uploadUrl === '').length;
      
      toast({
        title: 'Batch Upload Completed',
        description: `${completed} files uploaded successfully, ${failed} failed`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/s3/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/s3/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Batch Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // List user files
  const useUserFiles = (documentType?: string) => {
    return useQuery({
      queryKey: ['/api/s3/files', documentType],
      queryFn: async (): Promise<S3FileMetadata[]> => {
        const params = new URLSearchParams();
        if (documentType) {
          params.append('documentType', documentType);
        }
        
        const response = await fetch(`/api/s3/files?${params}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to list files');
        }

        const data = await response.json();
        return data.files;
      },
    });
  };

  // Get file metadata
  const useFileMetadata = (key: string | null) => {
    return useQuery({
      queryKey: ['/api/s3/file', key],
      queryFn: async (): Promise<S3FileMetadata> => {
        if (!key) return null as any;
        
        const response = await fetch(`/api/s3/file/${encodeURIComponent(key)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get file metadata');
        }

        const data = await response.json();
        return data.file;
      },
      enabled: !!key,
    });
  };

  // Generate download URL
  const generateDownloadUrl = useMutation({
    mutationFn: async ({ key, expiresIn = 3600 }: {
      key: string;
      expiresIn?: number;
    }): Promise<{ downloadUrl: string; expiresAt: string; metadata: S3FileMetadata }> => {
      const response = await fetch(`/api/s3/download/${encodeURIComponent(key)}?expiresIn=${expiresIn}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate download URL');
      }

      const data = await response.json();
      return {
        downloadUrl: data.downloadUrl,
        expiresAt: data.expiresAt,
        metadata: data.metadata,
      };
    },
    onSuccess: (data) => {
      toast({
        title: 'Download URL Generated',
        description: `Download link created for ${data.metadata.fileName}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete file
  const deleteFile = useMutation({
    mutationFn: async (key: string): Promise<void> => {
      const response = await fetch(`/api/s3/file/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete file');
      }
    },
    onSuccess: () => {
      toast({
        title: 'File Deleted',
        description: 'File removed from S3 storage successfully',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/s3/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/s3/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get storage statistics
  const useStorageStats = () => {
    return useQuery({
      queryKey: ['/api/s3/stats'],
      queryFn: async (): Promise<S3StorageStats> => {
        const response = await fetch('/api/s3/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get storage stats');
        }

        const data = await response.json();
        return data.stats;
      },
    });
  };

  // Cleanup expired files (admin only)
  const cleanupExpiredFiles = useMutation({
    mutationFn: async (daysOld: number = 30): Promise<number> => {
      const response = await fetch('/api/s3/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ daysOld }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cleanup expired files');
      }

      const data = await response.json();
      return data.deletedCount;
    },
    onSuccess: (deletedCount) => {
      toast({
        title: 'Cleanup Completed',
        description: `${deletedCount} expired files removed from storage`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/s3/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/s3/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cleanup Failed',
        description: error.message,
        variant: 'destructive',
      });
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

  const getDocumentTypeColor = (documentType: string): string => {
    switch (documentType) {
      case 'narrative': return 'text-blue-600 dark:text-blue-400';
      case 'compliance_memo': return 'text-green-600 dark:text-green-400';
      case 'pdf_form': return 'text-purple-600 dark:text-purple-400';
      case 'supporting_document': return 'text-orange-600 dark:text-orange-400';
      case 'calculation': return 'text-cyan-600 dark:text-cyan-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getDocumentTypeIcon = (documentType: string): string => {
    switch (documentType) {
      case 'narrative': return '📄';
      case 'compliance_memo': return '📝';
      case 'pdf_form': return '📋';
      case 'supporting_document': return '📎';
      case 'calculation': return '🧮';
      default: return '📁';
    }
  };

  const isFileExpired = (expiresAt?: string): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getTimeUntilExpiration = (expiresAt?: string): string => {
    if (!expiresAt) return 'No expiration';
    
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

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just base64 data
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const validateFileType = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];
    
    return allowedTypes.includes(file.type);
  };

  const validateFileSize = (file: File, maxSize: number = 50 * 1024 * 1024): boolean => {
    return file.size <= maxSize;
  };

  return {
    // Actions
    uploadFile: uploadFile.mutate,
    uploadBatchFiles: uploadBatchFiles.mutate,
    generateDownloadUrl: generateDownloadUrl.mutate,
    deleteFile: deleteFile.mutate,
    cleanupExpiredFiles: cleanupExpiredFiles.mutate,

    // State
    isUploading: uploadFile.isPending,
    isBatchUploading: uploadBatchFiles.isPending,
    isGeneratingUrl: generateDownloadUrl.isPending,
    isDeleting: deleteFile.isPending,
    isCleaning: cleanupExpiredFiles.isPending,

    // Hooks
    useUserFiles,
    useFileMetadata,
    useStorageStats,

    // Utility functions
    formatFileSize,
    getDocumentTypeColor,
    getDocumentTypeIcon,
    isFileExpired,
    getTimeUntilExpiration,
    convertFileToBase64,
    validateFileType,
    validateFileSize,

    // Error information
    uploadError: uploadFile.error as any,
    batchUploadError: uploadBatchFiles.error as any,
    downloadError: generateDownloadUrl.error as any,
    deleteError: deleteFile.error as any,
    cleanupError: cleanupExpiredFiles.error as any,
  };
}