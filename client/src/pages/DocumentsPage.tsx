import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Document {
  id: string;
  documentName: string;
  documentType: string;
  taxYear: number;
  fileSizeBytes: number | null;
  createdAt: string;
  lastAccessedAt: string | null;
  downloadCount: number | null;
}

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
}

interface DocumentOptions {
  includeNarrative?: boolean;
  includeComplianceMemo?: boolean;
  includePDF?: boolean;
}

interface DocumentGenerationRequest {
  companyContext: CompanyContext;
  projectContext: ProjectContext;
  expenseContext: ExpenseContext;
  documentOptions: DocumentOptions;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export default function DocumentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatingDocType, setGeneratingDocType] = useState<string | null>(null);

  // Fetch user's documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    enabled: true,
  });

  // Document generation error state
  const [generationError, setGenerationError] = useState<{
    message: string;
    isRetryable: boolean;
    requestId?: string;
  } | null>(null);

  // Generate document mutation with friendly error handling
  const generateDocMutation = useMutation({
    mutationFn: async (request: DocumentGenerationRequest) => {
      try {
        setGenerationError(null);
        const response = await fetch('/api/documents/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(request),
        });

        const data = await response.json();

        if (!response.ok) {
          // Check if it's a transient error (503) that should show friendly message
          if (response.status === 503) {
            throw {
              message: "We couldn't generate your documents right now. Please try again in a few minutes.",
              isRetryable: true,
              requestId: data.requestId,
            };
          }
          
          // Other errors get more specific messaging
          throw {
            message: data.error || 'Document generation failed',
            isRetryable: response.status >= 500, // Server errors are retryable
          };
        }

        return data;
      } catch (error: any) {
        // Network errors or unexpected issues
        if (!error.message) {
          throw {
            message: "We couldn't generate your documents right now. Please try again in a few minutes.",
            isRetryable: true,
          };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Document Generation Started",
        description: `Your ${generatingDocType?.replace('_', ' ')} is being generated.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setGeneratingDocType(null);
      setGenerationError(null);
    },
    onError: (error: any) => {
      setGenerationError(error);
      setGeneratingDocType(null);
    },
  });

  // Download document URL mutation
  const downloadMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/docs/${documentId}/url`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get download URL');
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      // Open download URL in new window
      window.open(data.url, '_blank');
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to generate download link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateDocument = (docType: 'form_6765' | 'technical_narrative' | 'compliance_memo') => {
    setGeneratingDocType(docType);
    setGenerationError(null);
    
    // For now, use sample data - this would come from the user's actual intake form
    const sampleRequest = {
      companyContext: {
        companyName: 'Sample Company Inc.',
        taxYear: 2024,
        industry: 'technology',
        businessType: 'corporation' as const,
      },
      projectContext: {
        projectName: 'AI Innovation Project',
        projectDescription: 'Developing machine learning models for business optimization',
        rdActivities: [
          {
            activity: 'AI Model Development',
            description: 'Developing machine learning models for business optimization',
            timeSpent: 520,
            category: 'experimentation' as const,
          },
        ],
        technicalChallenges: ['Model accuracy optimization', 'Data preprocessing'],
        uncertainties: ['Feature selection methodology', 'Performance tuning'],
        innovations: ['Custom neural architecture', 'Automated feature engineering'],
        businessPurpose: 'Enhance operational efficiency through AI automation',
      },
      expenseContext: {
        totalExpenses: 340000,
        wageExpenses: 250000,
        contractorExpenses: 75000,
        supplyExpenses: 15000,
      },
      documentOptions: {
        includeNarrative: docType === 'technical_narrative',
        includeComplianceMemo: docType === 'compliance_memo',
        includePDF: docType === 'form_6765',
      },
      priority: 'normal' as const,
    };

    generateDocMutation.mutate(sampleRequest);
  };

  const handleRetryGeneration = () => {
    if (generatingDocType) {
      handleGenerateDocument(generatingDocType as any);
    }
  };

  const handleDownload = (documentId: string) => {
    downloadMutation.mutate(documentId);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      'form_6765': 'Form 6765 - R&D Credit',
      'technical_narrative': 'Technical Narrative',
      'compliance_memo': 'Compliance Memo',
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading documents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">R&D Tax Credit Documents</h1>
          <p className="text-muted-foreground mt-2">
            Generate and manage your IRS-compliant R&D tax credit documentation
          </p>
        </div>
      </div>

      {/* Document Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate New Documents
          </CardTitle>
          <CardDescription>
            Create IRS-compliant documentation for your R&D tax credit claim
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Friendly error display */}
          {generationError && (
            <div className="mt-4 mb-6 border border-amber-300 bg-amber-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800 mb-3">
                    {generationError.message}
                  </p>
                  {generationError.requestId && (
                    <p className="text-xs text-amber-600 mb-3">
                      Request ID: {generationError.requestId}
                    </p>
                  )}
                  {generationError.isRetryable && (
                    <Button
                      onClick={handleRetryGeneration}
                      variant="outline"
                      size="sm"
                      disabled={generateDocMutation.isPending}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      {generateDocMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-dashed">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Form 6765</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Official IRS form for claiming the research and development tax credit
                </p>
                <Button
                  onClick={() => handleGenerateDocument('form_6765')}
                  disabled={generateDocMutation.isPending}
                  className="w-full"
                >
                  {generatingDocType === 'form_6765' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Form'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Technical Narrative</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed technical documentation of your R&D activities and innovations
                </p>
                <Button
                  onClick={() => handleGenerateDocument('technical_narrative')}
                  disabled={generateDocMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  {generatingDocType === 'technical_narrative' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Narrative'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Compliance Memo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Legal compliance documentation supporting your R&D tax credit position
                </p>
                <Button
                  onClick={() => handleGenerateDocument('compliance_memo')}
                  disabled={generateDocMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  {generatingDocType === 'compliance_memo' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Memo'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Existing Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>
            Previously generated R&D tax credit documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!documents || !Array.isArray(documents) || documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No documents yet</h3>
              <p className="text-muted-foreground">
                Generate your first R&D tax credit document using the options above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(documents) && documents.map((doc: Document) => (
                <Card key={doc.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{doc.documentName}</h3>
                          <Badge variant="secondary">
                            {getDocumentTypeLabel(doc.documentType)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Created {formatDate(doc.createdAt)}
                          </span>
                          <span>{formatFileSize(doc.fileSizeBytes)}</span>
                          {doc.downloadCount && doc.downloadCount > 0 && (
                            <span>{doc.downloadCount} downloads</span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownload(doc.id)}
                        disabled={downloadMutation.isPending}
                        size="sm"
                        className="ml-4"
                      >
                        {downloadMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}