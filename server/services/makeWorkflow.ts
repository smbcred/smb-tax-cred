import { WorkflowTriggerPayload } from "@shared/schema";

export interface MakeWorkflowResponse {
  success: boolean;
  executionId?: string;
  scenarioId?: string;
  message?: string;
  error?: string;
}

export interface WorkflowConfig {
  url: string;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

export class MakeWorkflowService {
  private config: WorkflowConfig;

  constructor(config: WorkflowConfig) {
    this.config = config;
  }

  async triggerDocumentGeneration(payload: WorkflowTriggerPayload): Promise<MakeWorkflowResponse> {
    try {
      const requestBody = {
        ...payload,
        timestamp: new Date().toISOString(),
        source: 'smbtaxcredits',
        version: '1.0',
      };

      console.log('Triggering Make.com workflow:', {
        url: this.config.url,
        formId: payload.intakeFormId,
        airtableRecordId: payload.airtableRecordId,
        timestamp: requestBody.timestamp,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      try {
        const response = await fetch(this.config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SMBTaxCredits/1.0',
            'X-Request-ID': this.generateRequestId(),
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          return {
            success: false,
            error: `HTTP ${response.status}: ${errorText}`,
          };
        }

        const responseData = await response.json();
        
        return {
          success: true,
          executionId: responseData.executionId || responseData.execution_id,
          scenarioId: responseData.scenarioId || responseData.scenario_id,
          message: responseData.message || 'Workflow triggered successfully',
        };

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          return {
            success: false,
            error: `Request timeout after ${this.config.timeoutMs}ms`,
          };
        }
        
        return {
          success: false,
          error: `Network error: ${fetchError.message}`,
        };
      }

    } catch (error: any) {
      console.error('Make.com workflow trigger error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  async retryTrigger(
    payload: WorkflowTriggerPayload, 
    attempt: number
  ): Promise<MakeWorkflowResponse> {
    const delay = this.calculateRetryDelay(attempt);
    
    console.log(`Retrying Make.com workflow trigger (attempt ${attempt}) after ${delay}ms delay`);
    
    await this.sleep(delay);
    return this.triggerDocumentGeneration(payload);
  }

  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return Math.min(this.config.retryDelayMs * Math.pow(2, attempt - 1), 30000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `smb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health check for Make.com webhook URL
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(this.config.url, {
        method: 'OPTIONS',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 405; // 405 Method Not Allowed is acceptable
    } catch {
      return false;
    }
  }
}

// Default configuration
export const defaultWorkflowConfig: WorkflowConfig = {
  url: process.env.MAKE_WEBHOOK_URL || 'https://hook.integromat.com/placeholder',
  timeoutMs: 30000, // 30 seconds
  maxRetries: 3,
  retryDelayMs: 1000, // 1 second base delay
};

// Singleton instance
let workflowService: MakeWorkflowService | null = null;

export function getWorkflowService(): MakeWorkflowService {
  if (!workflowService) {
    workflowService = new MakeWorkflowService(defaultWorkflowConfig);
  }
  return workflowService;
}

export function setWorkflowService(service: MakeWorkflowService): void {
  workflowService = service;
}