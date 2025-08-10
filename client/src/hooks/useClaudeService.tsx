import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ClaudeRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, any>;
}

interface ClaudeResponse {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  model: string;
  finishReason: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

interface ClaudeError {
  type: 'authentication' | 'rate_limit' | 'invalid_request' | 'api_error' | 'network_error';
  message: string;
  code?: string;
  retryAfter?: number;
}

export function useClaudeService() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Generate text mutation
  const generateText = useMutation({
    mutationFn: async (request: ClaudeRequest): Promise<{ response: ClaudeResponse; tokenUsage: TokenUsage }> => {
      const response = await fetch('/api/claude/generate', {
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
          message: error.error || 'Failed to generate text',
          code: error.code,
          retryAfter: error.retryAfter,
        } as ClaudeError;
      }

      return response.json();
    },
    onError: (error: ClaudeError) => {
      let title = 'Generation Failed';
      let description = error.message;

      switch (error.type) {
        case 'authentication':
          title = 'Authentication Error';
          description = 'Invalid Claude API key. Please check your configuration.';
          break;
        case 'rate_limit':
          title = 'Rate Limited';
          description = `Claude API rate limit exceeded. ${error.retryAfter ? `Try again in ${error.retryAfter} seconds.` : 'Please try again later.'}`;
          break;
        case 'invalid_request':
          title = 'Invalid Request';
          break;
        case 'network_error':
          title = 'Network Error';
          description = 'Failed to connect to Claude API. Please check your internet connection.';
          break;
      }

      toast({
        title,
        description,
        variant: 'destructive',
      });
    },
  });

  // Validate connection mutation
  const validateConnection = useMutation({
    mutationFn: async (): Promise<{ isValid: boolean; tokenUsage: TokenUsage }> => {
      const response = await fetch('/api/claude/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to validate connection');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setIsConnected(data.isValid);
      if (data.isValid) {
        toast({
          title: 'Connection Validated',
          description: 'Claude API connection is working properly.',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: 'Claude API connection validation failed.',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      setIsConnected(false);
      toast({
        title: 'Validation Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get usage query
  const { data: usageData, refetch: refetchUsage } = useQuery({
    queryKey: ['/api/claude/usage'],
    queryFn: async () => {
      const response = await fetch('/api/claude/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch usage');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Utility functions
  const estimateTokens = (text: string): number => {
    // Simple estimation: roughly 4 characters per token for English text
    return Math.ceil(text.length / 4);
  };

  const calculateCost = (tokensUsed: { input: number; output: number }): number => {
    // Claude 3.5 Sonnet pricing
    // Input: $3 per million tokens
    // Output: $15 per million tokens
    const inputCost = (tokensUsed.input / 1000000) * 3;
    const outputCost = (tokensUsed.output / 1000000) * 15;
    return inputCost + outputCost;
  };

  const formatCost = (cost: number): string => {
    if (cost < 0.01) {
      return `$${(cost * 1000).toFixed(3)}k`;
    }
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (tokens: number): string => {
    if (tokens < 1000) {
      return tokens.toString();
    }
    if (tokens < 1000000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return `${(tokens / 1000000).toFixed(1)}M`;
  };

  return {
    // Actions
    generateText: generateText.mutate,
    validateConnection: validateConnection.mutate,
    refetchUsage,

    // State
    isGenerating: generateText.isPending,
    isValidating: validateConnection.isPending,
    isConnected,
    lastResponse: generateText.data?.response,
    lastError: generateText.error as ClaudeError | null,

    // Usage data
    usage: usageData?.usage as TokenUsage | undefined,
    estimatedCost: usageData?.estimatedCost as number | undefined,

    // Utility functions
    estimateTokens,
    calculateCost,
    formatCost,
    formatTokens,

    // Error information
    isRateLimited: generateText.error?.type === 'rate_limit',
    retryAfter: (generateText.error as ClaudeError)?.retryAfter,
    isAuthError: generateText.error?.type === 'authentication',
  };
}