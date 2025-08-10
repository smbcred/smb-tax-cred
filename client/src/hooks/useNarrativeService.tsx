import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface CompanyContext {
  companyName: string;
  industry: string;
  employeeCount: number;
  yearFounded?: number;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship';
  taxYear: number;
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
  startDate: string;
  endDate: string;
  totalExpenses: number;
  wageExpenses: number;
  contractorExpenses: number;
  supplyExpenses: number;
  uncertainties: string[];
  technicalChallenges: string[];
  innovations: string[];
  businessPurpose: string;
  rdActivities: RdActivity[];
}

interface NarrativeOptions {
  length?: 'brief' | 'standard' | 'detailed';
  tone?: 'professional' | 'technical' | 'formal';
  focus?: 'compliance' | 'technical' | 'business';
  includeMetrics?: boolean;
  includeTimeline?: boolean;
  emphasizeInnovation?: boolean;
}

interface NarrativeRequest {
  templateId: string;
  companyContext: CompanyContext;
  projectContext: ProjectContext;
  options?: NarrativeOptions;
}

interface NarrativeTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  variables: string[];
  maxTokens: number;
  temperature: number;
  complianceLevel: 'high' | 'medium' | 'low';
}

interface GeneratedNarrative {
  content: string;
  wordCount: number;
  tokensUsed: number;
  complianceScore: number;
  templateUsed: string;
  variables: Record<string, any>;
  metadata: {
    generatedAt: string;
    version: string;
    model: string;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedTokens: number;
}

export function useNarrativeService() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Get all templates
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['/api/narratives/templates'],
    queryFn: async () => {
      const response = await fetch('/api/narratives/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  // Get specific template
  const { data: templateData, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['/api/narratives/templates', selectedTemplate],
    queryFn: async () => {
      if (!selectedTemplate) return null;
      const response = await fetch(`/api/narratives/templates/${selectedTemplate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch template');
      return response.json();
    },
    enabled: !!selectedTemplate,
  });

  // Generate narrative mutation
  const generateNarrative = useMutation({
    mutationFn: async (request: NarrativeRequest): Promise<{ narrative: GeneratedNarrative; tokenUsage: any }> => {
      const response = await fetch('/api/narratives/generate', {
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
          type: error.type || 'api_error',
          message: error.error || 'Failed to generate narrative',
          details: error.details,
          retryAfter: error.retryAfter,
        };
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Narrative Generated',
        description: `Generated ${data.narrative.wordCount} words with ${data.narrative.complianceScore}% compliance score.`,
      });
    },
    onError: (error: any) => {
      let title = 'Generation Failed';
      let description = error.message;

      if (error.details && Array.isArray(error.details)) {
        description = `Validation errors: ${error.details.map((e: any) => e.message).join(', ')}`;
      }

      switch (error.type) {
        case 'authentication':
          title = 'Authentication Error';
          description = 'Invalid API key. Please check your configuration.';
          break;
        case 'rate_limit':
          title = 'Rate Limited';
          description = `API rate limit exceeded. ${error.retryAfter ? `Try again in ${error.retryAfter} seconds.` : 'Please try again later.'}`;
          break;
        case 'invalid_request':
          title = 'Invalid Request';
          break;
      }

      toast({
        title,
        description,
        variant: 'destructive',
      });
    },
  });

  // Validate template mutation
  const validateTemplate = useMutation({
    mutationFn: async ({ templateId, variables }: { templateId: string; variables: Record<string, any> }): Promise<{ validation: ValidationResult }> => {
      const response = await fetch('/api/narratives/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ templateId, variables }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to validate template');
      }

      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: 'Validation Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Utility functions
  const getTemplatesByCompliance = (level: 'high' | 'medium' | 'low'): NarrativeTemplate[] => {
    if (!templatesData?.templates) return [];
    return templatesData.templates.filter((template: NarrativeTemplate) => 
      template.complianceLevel === level
    );
  };

  const formatComplianceScore = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Improvement';
  };

  const formatTokenEstimate = (tokens: number): string => {
    if (tokens < 1000) return `${tokens} tokens`;
    return `${(tokens / 1000).toFixed(1)}K tokens`;
  };

  const estimateCost = (tokens: number): number => {
    // Claude 3.5 Sonnet pricing - rough estimate
    // Input: $3 per million tokens, Output: $15 per million tokens
    // Average of input/output for estimation
    const avgPricePerToken = 9 / 1000000; // $9 per million tokens average
    return tokens * avgPricePerToken;
  };

  const formatCost = (cost: number): string => {
    if (cost < 0.01) {
      return `$${(cost * 1000).toFixed(2)}k`;
    }
    return `$${cost.toFixed(4)}`;
  };

  const createSampleRequest = (templateId: string): NarrativeRequest => {
    return {
      templateId,
      companyContext: {
        companyName: 'Sample Technology Inc.',
        industry: 'Software Development',
        employeeCount: 50,
        yearFounded: 2015,
        businessType: 'corporation',
        taxYear: 2024,
      },
      projectContext: {
        projectName: 'AI-Powered Analytics Platform',
        projectDescription: 'Development of machine learning algorithms for real-time data analytics and predictive modeling capabilities',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalExpenses: 250000,
        wageExpenses: 180000,
        contractorExpenses: 50000,
        supplyExpenses: 20000,
        uncertainties: [
          'Algorithm convergence in real-time processing environments',
          'Scalability challenges with large dataset processing',
          'Integration complexity with existing legacy systems'
        ],
        technicalChallenges: [
          'Developing novel machine learning architectures',
          'Optimizing performance for real-time data streams',
          'Creating adaptive algorithms for varying data patterns'
        ],
        innovations: [
          'Proprietary real-time ML inference engine',
          'Novel data preprocessing techniques',
          'Adaptive model selection algorithms'
        ],
        businessPurpose: 'To create competitive advantage through advanced analytics capabilities that provide real-time insights for business decision making',
        rdActivities: [
          {
            activity: 'Algorithm Research',
            description: 'Research and development of novel machine learning algorithms for real-time data processing',
            timeSpent: 800,
            category: 'development'
          },
          {
            activity: 'Performance Testing',
            description: 'Systematic testing of algorithm performance under various load conditions',
            timeSpent: 400,
            category: 'testing'
          }
        ],
      },
      options: {
        length: 'standard',
        tone: 'professional',
        focus: 'compliance',
        includeMetrics: true,
        includeTimeline: true,
        emphasizeInnovation: true,
      },
    };
  };

  return {
    // Actions
    generateNarrative: generateNarrative.mutate,
    validateTemplate: validateTemplate.mutate,
    setSelectedTemplate,

    // State
    isGenerating: generateNarrative.isPending,
    isValidating: validateTemplate.isPending,
    isLoadingTemplates,
    isLoadingTemplate,
    selectedTemplate,

    // Data
    templates: templatesData?.templates as NarrativeTemplate[] | undefined,
    currentTemplate: templateData?.template as NarrativeTemplate | undefined,
    lastNarrative: generateNarrative.data?.narrative as GeneratedNarrative | undefined,
    lastValidation: validateTemplate.data?.validation as ValidationResult | undefined,

    // Utility functions
    getTemplatesByCompliance,
    formatComplianceScore,
    formatTokenEstimate,
    estimateCost,
    formatCost,
    createSampleRequest,

    // Error information
    generationError: generateNarrative.error as any,
    validationError: validateTemplate.error as Error | null,
  };
}