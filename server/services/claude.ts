import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

export interface ClaudeRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, any>;
}

export interface ClaudeResponse {
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

export interface ClaudeError {
  type: 'authentication' | 'rate_limit' | 'invalid_request' | 'api_error' | 'network_error';
  message: string;
  code?: string;
  retryAfter?: number;
}

export class ClaudeService {
  private client: Anthropic;
  private config: ClaudeConfig;
  private tokenUsage: { input: number; output: number } = { input: 0, output: 0 };

  constructor(config: ClaudeConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
      timeout: config.timeoutMs,
    });
  }

  async generateText(request: ClaudeRequest): Promise<ClaudeResponse> {
    const maxRetries = this.config.maxRetries;
    let lastError: ClaudeError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(request);
        return response;
      } catch (error: any) {
        lastError = this.parseError(error);
        
        // Don't retry on authentication or invalid request errors
        if (lastError.type === 'authentication' || lastError.type === 'invalid_request') {
          throw lastError;
        }

        // Don't retry on final attempt
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Calculate retry delay with exponential backoff
        const baseDelay = this.config.retryDelayMs;
        const delay = Math.min(baseDelay * Math.pow(2, attempt), 60000); // Max 60 seconds
        
        // Use retry-after header if available for rate limiting
        const retryDelay = lastError.retryAfter ? lastError.retryAfter * 1000 : delay;
        
        console.log(`Claude API attempt ${attempt + 1} failed, retrying in ${retryDelay}ms:`, lastError.message);
        await this.sleep(retryDelay);
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private async makeRequest(request: ClaudeRequest): Promise<ClaudeResponse> {
    const {
      prompt,
      systemPrompt = '',
      maxTokens = this.config.maxTokens,
      temperature = this.config.temperature,
    } = request;

    // Construct messages array
    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    const params: Anthropic.MessageCreateParams = {
      model: this.config.model,
      max_tokens: maxTokens,
      temperature,
      messages,
    };

    // Add system prompt if provided
    if (systemPrompt) {
      params.system = systemPrompt;
    }

    console.log('Sending request to Claude API:', {
      model: params.model,
      maxTokens: params.max_tokens,
      temperature: params.temperature,
      systemPromptLength: systemPrompt?.length || 0,
      promptLength: prompt.length,
    });

    const response = await this.client.messages.create(params);

    // Extract content from response
    const content = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('');

    // Track token usage
    const tokensUsed = {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
      total: response.usage.input_tokens + response.usage.output_tokens,
    };

    this.tokenUsage.input += tokensUsed.input;
    this.tokenUsage.output += tokensUsed.output;

    console.log('Claude API response received:', {
      contentLength: content.length,
      tokensUsed,
      finishReason: response.stop_reason,
      totalUsage: this.tokenUsage,
    });

    return {
      content,
      tokensUsed,
      model: response.model,
      finishReason: response.stop_reason || 'unknown',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  private parseError(error: any): ClaudeError {
    console.error('Claude API error:', error);

    // Handle Anthropic SDK errors
    if (error.name === 'AuthenticationError') {
      return {
        type: 'authentication',
        message: 'Invalid Claude API key',
        code: error.code,
      };
    }

    if (error.name === 'RateLimitError') {
      return {
        type: 'rate_limit',
        message: 'Claude API rate limit exceeded',
        code: error.code,
        retryAfter: error.retryAfter,
      };
    }

    if (error.name === 'BadRequestError') {
      return {
        type: 'invalid_request',
        message: error.message || 'Invalid request to Claude API',
        code: error.code,
      };
    }

    if (error.name === 'APIError') {
      return {
        type: 'api_error',
        message: error.message || 'Claude API error',
        code: error.code,
      };
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return {
        type: 'network_error',
        message: 'Network error connecting to Claude API',
        code: error.code,
      };
    }

    // Generic error
    return {
      type: 'api_error',
      message: error.message || 'Unknown error from Claude API',
      code: error.code,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Utility methods
  getTokenUsage(): { input: number; output: number; total: number } {
    return {
      input: this.tokenUsage.input,
      output: this.tokenUsage.output,
      total: this.tokenUsage.input + this.tokenUsage.output,
    };
  }

  resetTokenUsage(): void {
    this.tokenUsage = { input: 0, output: 0 };
  }

  async validateConnection(): Promise<boolean> {
    try {
      const testRequest: ClaudeRequest = {
        prompt: 'Hello, this is a connection test. Please respond with "OK".',
        maxTokens: 10,
      };
      
      const response = await this.generateText(testRequest);
      return response.content.includes('OK');
    } catch (error) {
      console.error('Claude connection validation failed:', error);
      return false;
    }
  }

  async estimateTokens(text: string): Promise<number> {
    // Simple estimation: roughly 4 characters per token for English text
    // This is an approximation - the actual tokenization may vary
    return Math.ceil(text.length / 4);
  }

  calculateCost(tokensUsed: { input: number; output: number }): number {
    // Claude 3.5 Sonnet pricing (as of 2024)
    // Input: $3 per million tokens
    // Output: $15 per million tokens
    const inputCost = (tokensUsed.input / 1000000) * 3;
    const outputCost = (tokensUsed.output / 1000000) * 15;
    return inputCost + outputCost;
  }
}

// Default configuration
export const defaultClaudeConfig: ClaudeConfig = {
  apiKey: process.env.CLAUDE_API_KEY || '',
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 4000,
  temperature: 0.7,
  timeoutMs: 60000, // 60 seconds
  maxRetries: 3,
  retryDelayMs: 1000, // 1 second base delay
};

// Singleton instance
let claudeService: ClaudeService | null = null;

export function getClaudeService(config?: Partial<ClaudeConfig>): ClaudeService {
  if (!claudeService) {
    const finalConfig = { ...defaultClaudeConfig, ...config };
    
    if (!finalConfig.apiKey) {
      throw new Error('Claude API key not configured. Please set CLAUDE_API_KEY environment variable.');
    }
    
    claudeService = new ClaudeService(finalConfig);
  }
  return claudeService;
}

export function setClaudeService(service: ClaudeService): void {
  claudeService = service;
}

// Validation function
export function validateClaudeConfig(config: Partial<ClaudeConfig>): string[] {
  const errors: string[] = [];
  
  if (!config.apiKey) {
    errors.push('API key is required');
  }
  
  if (config.maxTokens && (config.maxTokens < 1 || config.maxTokens > 8192)) {
    errors.push('Max tokens must be between 1 and 8192');
  }
  
  if (config.temperature && (config.temperature < 0 || config.temperature > 1)) {
    errors.push('Temperature must be between 0 and 1');
  }
  
  if (config.timeoutMs && config.timeoutMs < 1000) {
    errors.push('Timeout must be at least 1000ms');
  }
  
  return errors;
}