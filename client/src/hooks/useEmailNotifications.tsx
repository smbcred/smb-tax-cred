import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface EmailNotificationRequest {
  recipientEmail: string;
  recipientName: string;
  templateType: 'document_ready' | 'calculation_complete' | 'compliance_memo_ready' | 'download_ready' | 'welcome' | 'payment_confirmation';
  templateData?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: string;
  trackingEnabled?: boolean;
  unsubscribeEnabled?: boolean;
}

interface EmailNotificationResponse {
  notificationId: string;
  messageId?: string;
  status: 'queued' | 'sent' | 'failed';
  error?: string;
}

interface EmailDeliveryStatus {
  notificationId: string;
  messageId?: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'unsubscribed';
  recipientEmail: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  failedAt?: string;
  errorMessage?: string;
  bounceType?: 'soft' | 'hard' | 'block' | 'spam';
  userAgent?: string;
  ipAddress?: string;
}

interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  recentActivity: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
}

export function useEmailNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Send email notification
  const sendNotification = useMutation({
    mutationFn: async (request: EmailNotificationRequest): Promise<EmailNotificationResponse> => {
      const response = await fetch('/api/email/send', {
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
          message: error.error || 'Failed to send email notification',
          details: error.details,
        };
      }

      const data = await response.json();
      return data.notification;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Email Sent',
        description: `Notification sent to ${variables.recipientEmail}`,
      });
      
      // Invalidate email stats
      queryClient.invalidateQueries({ queryKey: ['/api/email/stats'] });
    },
    onError: (error: any) => {
      const title = 'Email Failed';
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

  // Get email delivery status
  const useDeliveryStatus = (notificationId: string | null) => {
    return useQuery({
      queryKey: ['/api/email/status', notificationId],
      queryFn: async (): Promise<EmailDeliveryStatus> => {
        if (!notificationId) return null as any;
        
        const response = await fetch(`/api/email/status/${notificationId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get email status');
        }

        const data = await response.json();
        return data.status;
      },
      enabled: !!notificationId,
      refetchInterval: (data) => {
        // Stop polling if email is delivered, failed, or bounced
        if (!data || ['delivered', 'opened', 'clicked', 'failed', 'bounced', 'unsubscribed'].includes(data.status)) {
          return false;
        }
        return 5000; // Poll every 5 seconds
      },
    });
  };

  // Get email statistics
  const useEmailStats = (days: number = 30) => {
    return useQuery({
      queryKey: ['/api/email/stats', days],
      queryFn: async (): Promise<EmailStats> => {
        const response = await fetch(`/api/email/stats?days=${days}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get email statistics');
        }

        const data = await response.json();
        return data.stats;
      },
    });
  };

  // Unsubscribe from emails
  const unsubscribe = useMutation({
    mutationFn: async ({ email, reason }: { email: string; reason?: string }): Promise<void> => {
      const response = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unsubscribe');
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Unsubscribed',
        description: `${variables.email} has been unsubscribed from notifications`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Unsubscribe Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Utility functions
  const getStatusColor = (status: EmailDeliveryStatus['status']): string => {
    switch (status) {
      case 'queued': return 'text-yellow-600 dark:text-yellow-400';
      case 'sent': return 'text-blue-600 dark:text-blue-400';
      case 'delivered': return 'text-green-600 dark:text-green-400';
      case 'opened': return 'text-emerald-600 dark:text-emerald-400';
      case 'clicked': return 'text-purple-600 dark:text-purple-400';
      case 'bounced': return 'text-orange-600 dark:text-orange-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      case 'unsubscribed': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: EmailDeliveryStatus['status']): string => {
    switch (status) {
      case 'queued': return '⏳';
      case 'sent': return '📤';
      case 'delivered': return '✅';
      case 'opened': return '👀';
      case 'clicked': return '🖱️';
      case 'bounced': return '⚠️';
      case 'failed': return '❌';
      case 'unsubscribed': return '🚫';
      default: return '❓';
    }
  };

  const getStatusDescription = (status: EmailDeliveryStatus['status']): string => {
    switch (status) {
      case 'queued': return 'Email queued for delivery';
      case 'sent': return 'Email sent successfully';
      case 'delivered': return 'Email delivered to inbox';
      case 'opened': return 'Email opened by recipient';
      case 'clicked': return 'Links clicked in email';
      case 'bounced': return 'Email bounced back';
      case 'failed': return 'Email delivery failed';
      case 'unsubscribed': return 'Recipient unsubscribed';
      default: return 'Unknown status';
    }
  };

  const formatDeliveryTime = (timestamp?: string): string => {
    if (!timestamp) return 'Not available';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const calculateDeliveryRate = (stats: EmailStats): number => {
    return stats.totalSent > 0 ? Math.round((stats.totalDelivered / stats.totalSent) * 100) : 0;
  };

  const calculateOpenRate = (stats: EmailStats): number => {
    return stats.totalDelivered > 0 ? Math.round((stats.totalOpened / stats.totalDelivered) * 100) : 0;
  };

  const calculateClickRate = (stats: EmailStats): number => {
    return stats.totalOpened > 0 ? Math.round((stats.totalClicked / stats.totalOpened) * 100) : 0;
  };

  const getBounceTypeDescription = (bounceType?: 'soft' | 'hard' | 'block' | 'spam'): string => {
    switch (bounceType) {
      case 'soft': return 'Temporary delivery issue';
      case 'hard': return 'Permanent delivery failure';
      case 'block': return 'Blocked by recipient server';
      case 'spam': return 'Marked as spam';
      default: return 'Unknown bounce type';
    }
  };

  const shouldRetryEmail = (status: EmailDeliveryStatus): boolean => {
    return ['failed'].includes(status.status) || 
           (status.status === 'bounced' && status.bounceType === 'soft');
  };

  const isEmailSuccessful = (status: EmailDeliveryStatus): boolean => {
    return ['delivered', 'opened', 'clicked'].includes(status.status);
  };

  // Template-specific helpers
  const sendDocumentReadyNotification = (data: {
    recipientEmail: string;
    recipientName: string;
    companyName: string;
    documentCount: number;
    downloadUrl: string;
  }) => {
    return sendNotification.mutate({
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      templateType: 'document_ready',
      templateData: {
        companyName: data.companyName,
        documentCount: data.documentCount,
        downloadUrl: data.downloadUrl,
      },
      priority: 'high',
    });
  };

  const sendCalculationCompleteNotification = (data: {
    recipientEmail: string;
    recipientName: string;
    companyName: string;
    estimatedCredit: string;
    viewUrl: string;
  }) => {
    return sendNotification.mutate({
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      templateType: 'calculation_complete',
      templateData: {
        companyName: data.companyName,
        estimatedCredit: data.estimatedCredit,
        viewUrl: data.viewUrl,
      },
      priority: 'high',
    });
  };

  const sendWelcomeNotification = (data: {
    recipientEmail: string;
    recipientName: string;
  }) => {
    return sendNotification.mutate({
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      templateType: 'welcome',
      templateData: {},
      priority: 'normal',
    });
  };

  const sendPaymentConfirmationNotification = (data: {
    recipientEmail: string;
    recipientName: string;
    companyName: string;
    amount: string;
    transactionId: string;
    statusUrl: string;
  }) => {
    return sendNotification.mutate({
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      templateType: 'payment_confirmation',
      templateData: {
        companyName: data.companyName,
        amount: data.amount,
        transactionId: data.transactionId,
        statusUrl: data.statusUrl,
      },
      priority: 'high',
    });
  };

  return {
    // Actions
    sendNotification: sendNotification.mutate,
    unsubscribe: unsubscribe.mutate,

    // Template helpers
    sendDocumentReadyNotification,
    sendCalculationCompleteNotification,
    sendWelcomeNotification,
    sendPaymentConfirmationNotification,

    // State
    isSending: sendNotification.isPending,
    isUnsubscribing: unsubscribe.isPending,

    // Hooks
    useDeliveryStatus,
    useEmailStats,

    // Utility functions
    getStatusColor,
    getStatusIcon,
    getStatusDescription,
    formatDeliveryTime,
    calculateDeliveryRate,
    calculateOpenRate,
    calculateClickRate,
    getBounceTypeDescription,
    shouldRetryEmail,
    isEmailSuccessful,

    // Error information
    sendError: sendNotification.error as any,
    unsubscribeError: unsubscribe.error as any,
  };
}