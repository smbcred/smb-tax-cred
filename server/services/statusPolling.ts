import { storage } from '../storage';

export interface PollingConfig {
  intervalMs: number;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

export interface WorkflowStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  progress?: number;
  message?: string;
  estimatedCompletion?: Date;
  lastUpdated: Date;
}

export interface MakeStatusResponse {
  executionId: string;
  scenarioId: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  progress?: number;
  message?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedDuration?: number;
  logs?: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }>;
}

export class StatusPollingService {
  private config: PollingConfig;
  private activePolls = new Map<string, NodeJS.Timeout>();
  private pollingCallbacks = new Map<string, (status: WorkflowStatus) => void>();

  constructor(config: PollingConfig) {
    this.config = config;
  }

  async startPolling(
    triggerId: string, 
    callback?: (status: WorkflowStatus) => void
  ): Promise<void> {
    // Stop existing polling for this trigger
    this.stopPolling(triggerId);

    // Get initial workflow trigger
    const trigger = await storage.getWorkflowTrigger(triggerId);
    if (!trigger) {
      throw new Error(`Workflow trigger not found: ${triggerId}`);
    }

    if (callback) {
      this.pollingCallbacks.set(triggerId, callback);
    }

    // Start polling if workflow is in progress
    if (['pending', 'triggered'].includes(trigger.status)) {
      await this.pollStatus(triggerId);
    }
  }

  async stopPolling(triggerId: string): Promise<void> {
    const interval = this.activePolls.get(triggerId);
    if (interval) {
      clearTimeout(interval);
      this.activePolls.delete(triggerId);
    }
    this.pollingCallbacks.delete(triggerId);
  }

  stopAllPolling(): void {
    for (const triggerId of this.activePolls.keys()) {
      this.stopPolling(triggerId);
    }
  }

  private async pollStatus(triggerId: string): Promise<void> {
    try {
      const trigger = await storage.getWorkflowTrigger(triggerId);
      if (!trigger) {
        this.stopPolling(triggerId);
        return;
      }

      // Check if workflow is still in progress
      if (!['pending', 'triggered'].includes(trigger.status)) {
        this.stopPolling(triggerId);
        await this.notifyStatusChange(triggerId, {
          id: triggerId,
          status: trigger.status as any,
          message: trigger.lastError || 'Workflow completed',
          lastUpdated: trigger.updatedAt || new Date(),
        });
        return;
      }

      // Poll Make.com if we have execution info
      if (trigger.makeExecutionId && trigger.makeScenarioId) {
        const makeStatus = await this.checkMakeStatus(
          trigger.makeExecutionId,
          trigger.makeScenarioId
        );
        
        if (makeStatus) {
          await this.updateWorkflowFromMakeStatus(triggerId, makeStatus);
        }
      }

      // Check for timeout
      if (trigger.timeoutAt && new Date() > trigger.timeoutAt) {
        await storage.updateWorkflowTrigger(triggerId, { 
          status: 'timeout', 
          completedAt: new Date() 
        });
        this.stopPolling(triggerId);
        await this.notifyStatusChange(triggerId, {
          id: triggerId,
          status: 'timeout',
          message: 'Workflow timed out',
          lastUpdated: new Date(),
        });
        return;
      }

      // Schedule next poll
      const interval = setTimeout(() => {
        this.pollStatus(triggerId);
      }, this.config.intervalMs);
      
      this.activePolls.set(triggerId, interval);

    } catch (error: any) {
      console.error(`Status polling error for trigger ${triggerId}:`, error);
      
      // Continue polling on error, but with exponential backoff
      const interval = setTimeout(() => {
        this.pollStatus(triggerId);
      }, this.config.retryDelayMs);
      
      this.activePolls.set(triggerId, interval);
    }
  }

  private async checkMakeStatus(
    executionId: string,
    scenarioId: string
  ): Promise<MakeStatusResponse | null> {
    try {
      // In a real implementation, this would call Make.com's API
      // For now, we'll simulate status checking
      const mockResponse: MakeStatusResponse = {
        executionId,
        scenarioId,
        status: 'running',
        progress: Math.floor(Math.random() * 100),
        message: 'Document generation in progress',
        startedAt: new Date().toISOString(),
      };

      // Simulate random completion
      if (Math.random() > 0.8) {
        mockResponse.status = 'success';
        mockResponse.progress = 100;
        mockResponse.message = 'Document generation completed';
        mockResponse.completedAt = new Date().toISOString();
      }

      return mockResponse;
    } catch (error: any) {
      console.error('Make.com status check error:', error);
      return null;
    }
  }

  private async updateWorkflowFromMakeStatus(
    triggerId: string,
    makeStatus: MakeStatusResponse
  ): Promise<void> {
    const updates: any = {
      responseData: makeStatus,
    };

    let workflowStatus: WorkflowStatus['status'] = 'running';
    
    switch (makeStatus.status) {
      case 'success':
        updates.status = 'completed';
        updates.completedAt = new Date();
        workflowStatus = 'completed';
        break;
      case 'error':
        updates.status = 'failed';
        updates.lastError = makeStatus.message || 'Make.com execution failed';
        updates.completedAt = new Date();
        workflowStatus = 'failed';
        break;
      case 'running':
        workflowStatus = 'running';
        break;
      case 'pending':
        workflowStatus = 'pending';
        break;
    }

    await storage.updateWorkflowTrigger(triggerId, updates);

    // Notify callback of status change
    await this.notifyStatusChange(triggerId, {
      id: triggerId,
      status: workflowStatus,
      progress: makeStatus.progress,
      message: makeStatus.message,
      estimatedCompletion: makeStatus.estimatedDuration 
        ? new Date(Date.now() + makeStatus.estimatedDuration * 1000)
        : undefined,
      lastUpdated: new Date(),
    });
  }

  private async notifyStatusChange(
    triggerId: string,
    status: WorkflowStatus
  ): Promise<void> {
    const callback = this.pollingCallbacks.get(triggerId);
    if (callback) {
      try {
        callback(status);
      } catch (error) {
        console.error('Status change callback error:', error);
      }
    }

    // Log status change
    console.log('Workflow status update:', {
      triggerId,
      status: status.status,
      progress: status.progress,
      message: status.message,
    });
  }

  async getActivePolls(): Promise<string[]> {
    return Array.from(this.activePolls.keys());
  }

  async getCurrentStatus(triggerId: string): Promise<WorkflowStatus | null> {
    const trigger = await storage.getWorkflowTrigger(triggerId);
    if (!trigger) {
      return null;
    }

    const responseData = trigger.responseData as any;
    return {
      id: triggerId,
      status: trigger.status as WorkflowStatus['status'],
      progress: responseData?.progress,
      message: responseData?.message || trigger.lastError,
      lastUpdated: trigger.updatedAt || new Date(),
    };
  }
}

// Default configuration
export const defaultPollingConfig: PollingConfig = {
  intervalMs: 10000, // Poll every 10 seconds
  timeoutMs: 600000, // 10 minute timeout
  maxRetries: 3,
  retryDelayMs: 5000, // 5 second retry delay
};

// Singleton instance
let pollingService: StatusPollingService | null = null;

export function getPollingService(): StatusPollingService {
  if (!pollingService) {
    pollingService = new StatusPollingService(defaultPollingConfig);
  }
  return pollingService;
}

export function setPollingService(service: StatusPollingService): void {
  pollingService = service;
}

// Cleanup on process exit
process.on('SIGTERM', () => {
  if (pollingService) {
    pollingService.stopAllPolling();
  }
});

process.on('SIGINT', () => {
  if (pollingService) {
    pollingService.stopAllPolling();
  }
});