import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
  expenseBreakdown?: Array<{
    category: string;
    amount: number;
    description: string;
  }>;
}

interface MemoOptions {
  includeRiskAssessment?: boolean;
  includeFourPartTest?: boolean;
  includeQREAnalysis?: boolean;
  includeRecommendations?: boolean;
  detailLevel?: 'summary' | 'standard' | 'comprehensive';
}

interface ComplianceMemoRequest {
  companyContext: CompanyContext;
  projectContext: ProjectContext;
  expenseContext: ExpenseContext;
  memoOptions: MemoOptions;
}

interface RiskFactor {
  factor: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: RiskFactor[];
  recommendations: string[];
  documentationGaps: string[];
}

interface TestSection {
  score: number;
  evidence: string[];
  gaps: string[];
  recommendations: string[];
}

interface FourPartTestAnalysis {
  technologicalInformation: TestSection;
  businessComponent: TestSection;
  uncertainty: TestSection;
  experimentation: TestSection;
  overallScore: number;
}

interface QREJustification {
  wageExpenses: {
    amount: number;
    justification: string;
    riskLevel: 'low' | 'medium' | 'high';
    supportingDocuments: string[];
  };
  contractorExpenses: {
    amount: number;
    justification: string;
    riskLevel: 'low' | 'medium' | 'high';
    supportingDocuments: string[];
    sixtyfivePercentLimit: boolean;
  };
  supplyExpenses: {
    amount: number;
    justification: string;
    riskLevel: 'low' | 'medium' | 'high';
    supportingDocuments: string[];
  };
  totalQRE: number;
  complianceNotes: string[];
}

interface ComplianceMemo {
  id: string;
  companyName: string;
  projectName: string;
  taxYear: number;
  generatedAt: string;
  memoContent: string;
  riskAssessment: RiskAssessment;
  fourPartTestAnalysis: FourPartTestAnalysis;
  qreJustification: QREJustification;
  overallCompliance: {
    score: number;
    level: 'low' | 'medium' | 'high';
    summary: string;
  };
  recommendations: string[];
  documentationRequirements: string[];
  disclaimers: string[];
}

interface ComplianceMemoPreview {
  overallCompliance: {
    score: number;
    level: 'low' | 'medium' | 'high';
    summary: string;
  };
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    riskFactorCount: number;
    highRiskFactors: number;
  };
  fourPartTestAnalysis: {
    overallScore: number;
    sectionScores: {
      technologicalInformation: number;
      businessComponent: number;
      uncertainty: number;
      experimentation: number;
    };
  };
  qreJustification: {
    totalQRE: number;
    contractorLimit: boolean;
    overallRisk: 'low' | 'medium' | 'high';
  };
  recommendationCount: number;
  documentationRequirementCount: number;
}

export function useComplianceMemo() {
  const { toast } = useToast();
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Generate full compliance memo
  const generateMemo = useMutation({
    mutationFn: async (request: ComplianceMemoRequest): Promise<{ memo: ComplianceMemo; generatedAt: string }> => {
      const response = await fetch('/api/compliance/memo/generate', {
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
          message: error.error || 'Failed to generate compliance memo',
          details: error.details,
        };
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Compliance Memo Generated',
        description: `Generated comprehensive compliance analysis with ${data.memo.overallCompliance.score}% compliance score.`,
      });
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

  // Generate preview of compliance memo
  const generatePreview = useMutation({
    mutationFn: async (request: ComplianceMemoRequest): Promise<{ preview: ComplianceMemoPreview; generatedAt: string }> => {
      const response = await fetch('/api/compliance/memo/preview', {
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
          message: error.error || 'Failed to generate compliance memo preview',
          details: error.details,
        };
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Preview Generated',
        description: `Compliance preview shows ${data.preview.overallCompliance.score}% score with ${data.preview.riskAssessment.overallRisk} risk level.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Preview Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Utility functions
  const formatComplianceLevel = (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'high': return 'High Compliance';
      case 'medium': return 'Moderate Compliance';
      case 'low': return 'Low Compliance';
      default: return 'Unknown';
    }
  };

  const formatRiskLevel = (risk: 'low' | 'medium' | 'high'): string => {
    switch (risk) {
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium Risk';
      case 'high': return 'High Risk';
      default: return 'Unknown';
    }
  };

  const getComplianceColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high'): string => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const calculateEstimatedCredit = (totalQRE: number): number => {
    // Rough estimation based on typical credit rates
    return Math.round(totalQRE * 0.1); // 10% average credit rate
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const createSampleRequest = (): ComplianceMemoRequest => {
    return {
      companyContext: {
        companyName: 'Sample Technology Inc.',
        taxYear: 2024,
        industry: 'Software Development',
        businessType: 'corporation',
      },
      projectContext: {
        projectName: 'AI-Powered Analytics Platform',
        projectDescription: 'Development of machine learning algorithms for real-time data analytics and predictive modeling capabilities with advanced uncertainty resolution',
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
      memoOptions: {
        includeRiskAssessment: true,
        includeFourPartTest: true,
        includeQREAnalysis: true,
        includeRecommendations: true,
        detailLevel: 'standard',
      },
    };
  };

  return {
    // Actions
    generateMemo: generateMemo.mutate,
    generatePreview: generatePreview.mutate,
    setIsPreviewMode,

    // State
    isGenerating: generateMemo.isPending,
    isGeneratingPreview: generatePreview.isPending,
    isPreviewMode,

    // Data
    lastMemo: generateMemo.data?.memo as ComplianceMemo | undefined,
    lastPreview: generatePreview.data?.preview as ComplianceMemoPreview | undefined,

    // Utility functions
    formatComplianceLevel,
    formatRiskLevel,
    getComplianceColor,
    getRiskColor,
    calculateEstimatedCredit,
    formatCurrency,
    createSampleRequest,

    // Error information
    memoError: generateMemo.error as any,
    previewError: generatePreview.error as any,
  };
}