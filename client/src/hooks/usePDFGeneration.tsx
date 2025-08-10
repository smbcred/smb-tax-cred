import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Form6765Data {
  companyName: string;
  ein?: string;
  taxYear: number;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  currentYearExpenses: {
    wages: number;
    contractors: number;
    supplies: number;
    total: number;
  };
  priorYearData?: Array<{
    year: number;
    expenses: number;
  }>;
  rdActivities: Array<{
    activity: string;
    description: string;
    hours: number;
    wages: number;
    category: 'experimentation' | 'testing' | 'analysis' | 'development' | 'evaluation';
  }>;
  technicalChallenges: string[];
  uncertainties: string[];
  innovations: string[];
  businessPurpose: string;
  calculations: {
    totalQualifiedExpenses: number;
    averageGrossReceipts?: number;
    ascPercentage: number;
    baseAmount: number;
    creditAmount: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  attachments?: {
    narrativeContent?: string;
    complianceMemo?: string;
    supportingDocuments?: string[];
  };
}

interface PDFGenerationRequest {
  templateId: string;
  data: Form6765Data;
  options?: {
    format?: 'pdf' | 'docx';
    quality?: 'draft' | 'standard' | 'high';
    includeAttachments?: boolean;
    watermark?: boolean;
  };
}

interface PDFGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  previewUrl?: string;
  metadata?: {
    pages?: number;
    size?: number;
    format?: string;
    generatedAt?: string;
  };
  errors?: string[];
}

interface DocumintTemplate {
  id: string;
  name: string;
  description?: string;
  fields: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'array';
    required: boolean;
    description?: string;
  }>;
}

interface PDFQualityVerification {
  isValid: boolean;
  issues: string[];
  score: number;
}

export function usePDFGeneration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate single PDF
  const generatePDF = useMutation({
    mutationFn: async (request: PDFGenerationRequest): Promise<PDFGenerationResponse> => {
      const response = await fetch('/api/pdf/generate', {
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
          message: error.error || 'Failed to generate PDF',
          details: error.details,
        };
      }

      const data = await response.json();
      return data.pdf;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'PDF Generation Started',
        description: `Generating Form 6765 for ${variables.data.companyName}. PDF ID: ${data.id}`,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/pdf/status'] });
    },
    onError: (error: any) => {
      let title = 'PDF Generation Failed';
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

  // Generate batch PDFs
  const generateBatchPDFs = useMutation({
    mutationFn: async (requests: PDFGenerationRequest[]): Promise<PDFGenerationResponse[]> => {
      const response = await fetch('/api/pdf/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ requests }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw {
          message: error.error || 'Failed to generate batch PDFs',
          details: error.details,
        };
      }

      const data = await response.json();
      return data.results;
    },
    onSuccess: (data) => {
      const completed = data.filter(pdf => pdf.status === 'completed').length;
      const failed = data.filter(pdf => pdf.status === 'failed').length;
      
      toast({
        title: 'Batch PDF Generation Completed',
        description: `${completed} PDFs generated successfully, ${failed} failed.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Batch PDF Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Check PDF status
  const usePDFStatus = (pdfId: string | null) => {
    return useQuery({
      queryKey: ['/api/pdf/status', pdfId],
      queryFn: async (): Promise<PDFGenerationResponse> => {
        if (!pdfId) return null as any;
        
        const response = await fetch(`/api/pdf/status/${pdfId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to check PDF status');
        }

        const data = await response.json();
        return data.pdf;
      },
      enabled: !!pdfId,
      refetchInterval: (data) => {
        // Stop polling if PDF is completed or failed
        if (!data?.data || ['completed', 'failed'].includes(data.data.status)) {
          return false;
        }
        return 3000; // Poll every 3 seconds
      },
    });
  };

  // Get template information
  const useTemplate = (templateId: string) => {
    return useQuery({
      queryKey: ['/api/pdf/template', templateId],
      queryFn: async (): Promise<DocumintTemplate> => {
        const response = await fetch(`/api/pdf/template/${templateId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch template');
        }

        const data = await response.json();
        return data.template;
      },
    });
  };

  // Verify PDF quality
  const verifyPDFQuality = useMutation({
    mutationFn: async (pdfId: string): Promise<PDFQualityVerification> => {
      const response = await fetch(`/api/pdf/verify/${pdfId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify PDF quality');
      }

      const data = await response.json();
      return data.verification;
    },
    onSuccess: (data) => {
      if (data.isValid) {
        toast({
          title: 'PDF Quality Verified',
          description: `Quality score: ${data.score}/100. PDF meets all requirements.`,
        });
      } else {
        toast({
          title: 'PDF Quality Issues Found',
          description: `Quality score: ${data.score}/100. ${data.issues.length} issues detected.`,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'PDF Verification Failed',
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'processing': return 'text-blue-600 dark:text-blue-400';
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getQualityColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const createSampleForm6765Data = (): Form6765Data => {
    return {
      companyName: 'Sample Technology Inc.',
      ein: '12-3456789',
      taxYear: 2024,
      businessType: 'corporation',
      address: {
        street: '123 Innovation Drive',
        city: 'Tech City',
        state: 'CA',
        zipCode: '94000',
      },
      currentYearExpenses: {
        wages: 180000,
        contractors: 50000,
        supplies: 20000,
        total: 250000,
      },
      priorYearData: [
        { year: 2023, expenses: 200000 },
        { year: 2022, expenses: 150000 },
      ],
      rdActivities: [
        {
          activity: 'AI Algorithm Development',
          description: 'Development of novel machine learning algorithms for real-time data processing',
          hours: 800,
          wages: 40000,
          category: 'development',
        },
        {
          activity: 'Performance Testing',
          description: 'Systematic testing of algorithm performance under various load conditions',
          hours: 400,
          wages: 20000,
          category: 'testing',
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
      calculations: {
        totalQualifiedExpenses: 250000,
        averageGrossReceipts: 2000000,
        ascPercentage: 14,
        baseAmount: 125000,
        creditAmount: 25000,
        riskLevel: 'medium',
      },
      attachments: {
        narrativeContent: 'Technical narrative document content...',
        complianceMemo: 'Compliance memorandum content...',
        supportingDocuments: ['timesheet.pdf', 'invoices.pdf'],
      },
    };
  };

  return {
    // Actions
    generatePDF: generatePDF.mutate,
    generateBatchPDFs: generateBatchPDFs.mutate,
    verifyPDFQuality: verifyPDFQuality.mutate,

    // State
    isGenerating: generatePDF.isPending,
    isBatchGenerating: generateBatchPDFs.isPending,
    isVerifying: verifyPDFQuality.isPending,

    // Hooks
    usePDFStatus,
    useTemplate,

    // Utility functions
    formatFileSize,
    getStatusColor,
    getQualityColor,
    createSampleForm6765Data,

    // Error information
    generateError: generatePDF.error as any,
    batchError: generateBatchPDFs.error as any,
    verifyError: verifyPDFQuality.error as any,
  };
}