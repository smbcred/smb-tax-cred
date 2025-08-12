import { EventEmitter } from 'events';
import { LoggingService } from './logger';
import {
  IntegrationType,
  IntegrationStatus,
  IntegrationHealthCheck,
  RecoveryConfig,
  StatusUpdate,
  ManualIntervention,
  DEFAULT_RECOVERY_CONFIGS,
  shouldEscalate,
} from '../../shared/types/integrations';

interface IntegrationMonitor {
  integration: IntegrationType;
  status: IntegrationStatus;
  config: RecoveryConfig;
  healthCheck: IntegrationHealthCheck;
  errorCount: number;
  lastError?: Error;
  lastHealthCheck: Date;
  healthCheckInterval?: NodeJS.Timeout;
  escalationTimeout?: NodeJS.Timeout;
}

interface HealthChecker {
  (): Promise<{ healthy: boolean; responseTime: number; error?: Error }>;
}

export class IntegrationRecoveryService extends EventEmitter {
  private logger: LoggingService;
  private monitors: Map<IntegrationType, IntegrationMonitor> = new Map();
  private healthCheckers: Map<IntegrationType, HealthChecker> = new Map();
  private manualInterventions: Map<string, ManualIntervention> = new Map();
  private statusHistory: StatusUpdate[] = [];
  private readonly MAX_STATUS_HISTORY = 1000;

  constructor() {
    super();
    this.logger = new LoggingService();
    this.initializeDefaultMonitors();
  }

  /**
   * Register a health checker for an integration
   */
  registerHealthChecker(integration: IntegrationType, checker: HealthChecker): void {
    this.healthCheckers.set(integration, checker);
    
    this.logger.info('Health checker registered', {
      integration,
      category: 'integration_recovery',
    });

    // Start monitoring if not already started
    this.startMonitoring(integration);
  }

  /**
   * Update integration configuration
   */
  updateConfig(integration: IntegrationType, config: Partial<RecoveryConfig>): void {
    const monitor = this.monitors.get(integration);
    if (!monitor) {
      this.logger.warn('Attempted to update config for unmonitored integration', {
        integration,
        category: 'integration_recovery',
      });
      return;
    }

    monitor.config = { ...monitor.config, ...config };
    
    this.logger.info('Integration config updated', {
      integration,
      config,
      category: 'integration_recovery',
    });

    // Restart monitoring with new config
    this.stopMonitoring(integration);
    this.startMonitoring(integration);
  }

  /**
   * Get integration status
   */
  getIntegrationStatus(integration: IntegrationType): IntegrationHealthCheck | undefined {
    const monitor = this.monitors.get(integration);
    return monitor?.healthCheck;
  }

  /**
   * Get all integration statuses
   */
  getAllIntegrationStatuses(): IntegrationHealthCheck[] {
    return Array.from(this.monitors.values()).map(monitor => monitor.healthCheck);
  }

  /**
   * Manually update integration status
   */
  updateIntegrationStatus(
    integration: IntegrationType,
    status: IntegrationStatus,
    message: string,
    metadata?: Record<string, any>
  ): void {
    const monitor = this.monitors.get(integration);
    if (!monitor) {
      this.logger.warn('Attempted to update status for unmonitored integration', {
        integration,
        status,
        category: 'integration_recovery',
      });
      return;
    }

    const oldStatus = monitor.status;
    monitor.status = status;
    monitor.healthCheck.status = status;
    monitor.healthCheck.lastChecked = new Date().toISOString();

    if (metadata) {
      monitor.healthCheck.metadata = { ...monitor.healthCheck.metadata, ...metadata };
    }

    const statusUpdate: StatusUpdate = {
      integration,
      status,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.addStatusUpdate(statusUpdate);

    this.logger.info('Integration status updated manually', {
      integration,
      oldStatus,
      newStatus: status,
      message,
      category: 'integration_recovery',
    });

    this.emit('status_updated', statusUpdate);

    // Handle status change logic
    this.handleStatusChange(monitor, oldStatus, status);
  }

  /**
   * Trigger manual intervention
   */
  triggerManualIntervention(
    integration: IntegrationType,
    reason: string,
    requestedBy: string,
    metadata?: Record<string, any>
  ): string {
    const interventionId = `intervention_${integration}_${Date.now()}`;
    
    const intervention: ManualIntervention = {
      jobId: interventionId,
      reason,
      action: 'retry', // Default action
      requestedBy,
      requestedAt: new Date().toISOString(),
      notes: `Manual intervention for ${integration}: ${reason}`,
    };

    this.manualInterventions.set(interventionId, intervention);

    // Update integration status
    this.updateIntegrationStatus(
      integration,
      IntegrationStatus.MAINTENANCE,
      `Manual intervention requested: ${reason}`,
      { interventionId, requestedBy, ...metadata }
    );

    this.logger.warn('Manual intervention triggered', {
      integration,
      interventionId,
      reason,
      requestedBy,
      category: 'integration_recovery',
    });

    this.emit('manual_intervention_triggered', {
      interventionId,
      integration,
      intervention,
    });

    return interventionId;
  }

  /**
   * Resolve manual intervention
   */
  resolveManualIntervention(
    interventionId: string,
    action: 'retry' | 'skip' | 'cancel' | 'modify',
    notes?: string,
    modifiedPayload?: Record<string, any>
  ): boolean {
    const intervention = this.manualInterventions.get(interventionId);
    if (!intervention) {
      return false;
    }

    intervention.action = action;
    intervention.notes = notes || intervention.notes;
    intervention.modifiedPayload = modifiedPayload;

    this.logger.info('Manual intervention resolved', {
      interventionId,
      action,
      notes,
      category: 'integration_recovery',
    });

    this.emit('manual_intervention_resolved', {
      interventionId,
      intervention,
      action,
    });

    // Clean up
    this.manualInterventions.delete(interventionId);
    return true;
  }

  /**
   * Get pending manual interventions
   */
  getPendingInterventions(): ManualIntervention[] {
    return Array.from(this.manualInterventions.values());
  }

  /**
   * Get status history
   */
  getStatusHistory(
    integration?: IntegrationType,
    limit: number = 100
  ): StatusUpdate[] {
    let history = this.statusHistory;
    
    if (integration) {
      history = history.filter(update => update.integration === integration);
    }

    return history
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Report integration failure
   */
  reportFailure(
    integration: IntegrationType,
    error: Error,
    context?: Record<string, any>
  ): void {
    const monitor = this.monitors.get(integration);
    if (!monitor) {
      this.logger.warn('Reported failure for unmonitored integration', {
        integration,
        error: error.message,
        category: 'integration_recovery',
      });
      return;
    }

    monitor.errorCount++;
    monitor.lastError = error;

    this.logger.error('Integration failure reported', {
      integration,
      error: error.message,
      errorCount: monitor.errorCount,
      context,
      category: 'integration_recovery',
    });

    // Update status to failed if not already
    if (monitor.status !== IntegrationStatus.FAILED) {
      this.updateIntegrationStatus(
        integration,
        IntegrationStatus.FAILED,
        `Integration failure: ${error.message}`,
        { errorCount: monitor.errorCount, context }
      );
    }

    // Check if escalation is needed
    if (shouldEscalate(monitor.errorCount, integration)) {
      this.escalateIssue(monitor, error);
    }
  }

  /**
   * Start recovery for an integration
   */
  async startRecovery(integration: IntegrationType): Promise<void> {
    const monitor = this.monitors.get(integration);
    if (!monitor) {
      throw new Error(`No monitor found for integration: ${integration}`);
    }

    if (monitor.status === IntegrationStatus.RECOVERING) {
      this.logger.warn('Recovery already in progress', {
        integration,
        category: 'integration_recovery',
      });
      return;
    }

    this.updateIntegrationStatus(
      integration,
      IntegrationStatus.RECOVERING,
      'Starting recovery process'
    );

    this.logger.info('Starting integration recovery', {
      integration,
      category: 'integration_recovery',
    });

    try {
      // Attempt health check
      const healthChecker = this.healthCheckers.get(integration);
      if (healthChecker) {
        const healthResult = await healthChecker();
        
        if (healthResult.healthy) {
          // Recovery successful
          monitor.errorCount = 0;
          monitor.lastError = undefined;
          
          this.updateIntegrationStatus(
            integration,
            IntegrationStatus.HEALTHY,
            'Recovery successful'
          );

          this.logger.info('Integration recovery successful', {
            integration,
            responseTime: healthResult.responseTime,
            category: 'integration_recovery',
          });
        } else {
          // Recovery failed
          this.updateIntegrationStatus(
            integration,
            IntegrationStatus.FAILED,
            `Recovery failed: ${healthResult.error?.message || 'Unknown error'}`
          );

          this.logger.error('Integration recovery failed', {
            integration,
            error: healthResult.error?.message,
            category: 'integration_recovery',
          });
        }
      } else {
        // No health checker available
        this.updateIntegrationStatus(
          integration,
          IntegrationStatus.DEGRADED,
          'No health checker available for recovery verification'
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      this.updateIntegrationStatus(
        integration,
        IntegrationStatus.FAILED,
        `Recovery error: ${err.message}`
      );

      this.logger.error('Integration recovery error', {
        integration,
        error: err.message,
        category: 'integration_recovery',
      });
    }
  }

  /**
   * Initialize default monitors for all integration types
   */
  private initializeDefaultMonitors(): void {
    for (const integration of Object.values(IntegrationType)) {
      const config = DEFAULT_RECOVERY_CONFIGS[integration];
      
      const monitor: IntegrationMonitor = {
        integration,
        status: IntegrationStatus.HEALTHY,
        config,
        healthCheck: {
          integration,
          status: IntegrationStatus.HEALTHY,
          lastChecked: new Date().toISOString(),
          responseTime: 0,
          errorCount: 0,
        },
        errorCount: 0,
        lastHealthCheck: new Date(),
      };

      this.monitors.set(integration, monitor);
    }

    this.logger.info('Default integration monitors initialized', {
      count: this.monitors.size,
      category: 'integration_recovery',
    });
  }

  /**
   * Start monitoring an integration
   */
  private startMonitoring(integration: IntegrationType): void {
    const monitor = this.monitors.get(integration);
    if (!monitor || !monitor.config.enabled) {
      return;
    }

    // Clear existing interval
    if (monitor.healthCheckInterval) {
      clearInterval(monitor.healthCheckInterval);
    }

    // Start health check interval
    monitor.healthCheckInterval = setInterval(() => {
      this.performHealthCheck(integration);
    }, monitor.config.healthCheckInterval * 1000);

    this.logger.info('Started monitoring integration', {
      integration,
      interval: monitor.config.healthCheckInterval,
      category: 'integration_recovery',
    });
  }

  /**
   * Stop monitoring an integration
   */
  private stopMonitoring(integration: IntegrationType): void {
    const monitor = this.monitors.get(integration);
    if (!monitor) {
      return;
    }

    if (monitor.healthCheckInterval) {
      clearInterval(monitor.healthCheckInterval);
      monitor.healthCheckInterval = undefined;
    }

    if (monitor.escalationTimeout) {
      clearTimeout(monitor.escalationTimeout);
      monitor.escalationTimeout = undefined;
    }

    this.logger.info('Stopped monitoring integration', {
      integration,
      category: 'integration_recovery',
    });
  }

  /**
   * Perform health check for an integration
   */
  private async performHealthCheck(integration: IntegrationType): Promise<void> {
    const monitor = this.monitors.get(integration);
    const healthChecker = this.healthCheckers.get(integration);
    
    if (!monitor || !healthChecker) {
      return;
    }

    monitor.lastHealthCheck = new Date();

    try {
      const startTime = Date.now();
      const result = await healthChecker();
      const responseTime = Date.now() - startTime;

      monitor.healthCheck.responseTime = responseTime;
      monitor.healthCheck.lastChecked = new Date().toISOString();

      if (result.healthy) {
        // Health check passed
        if (monitor.status !== IntegrationStatus.HEALTHY) {
          // Recovery from failure
          monitor.errorCount = 0;
          monitor.lastError = undefined;
          
          this.updateIntegrationStatus(
            integration,
            IntegrationStatus.HEALTHY,
            'Health check passed - integration recovered'
          );
        }
      } else {
        // Health check failed
        monitor.errorCount++;
        monitor.lastError = result.error;
        monitor.healthCheck.errorCount = monitor.errorCount;
        monitor.healthCheck.lastError = result.error?.message;

        const newStatus = monitor.errorCount === 1 
          ? IntegrationStatus.DEGRADED 
          : IntegrationStatus.FAILED;

        this.updateIntegrationStatus(
          integration,
          newStatus,
          `Health check failed: ${result.error?.message || 'Unknown error'}`
        );

        // Check if escalation is needed
        if (shouldEscalate(monitor.errorCount, integration)) {
          this.escalateIssue(monitor, result.error);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      monitor.errorCount++;
      monitor.lastError = err;
      monitor.healthCheck.errorCount = monitor.errorCount;
      monitor.healthCheck.lastError = err.message;

      this.updateIntegrationStatus(
        integration,
        IntegrationStatus.FAILED,
        `Health check error: ${err.message}`
      );

      this.logger.error('Health check error', {
        integration,
        error: err.message,
        category: 'integration_recovery',
      });
    }
  }

  /**
   * Handle status changes
   */
  private handleStatusChange(
    monitor: IntegrationMonitor,
    oldStatus: IntegrationStatus,
    newStatus: IntegrationStatus
  ): void {
    // Auto-recovery logic
    if (newStatus === IntegrationStatus.FAILED && monitor.config.autoRecoveryEnabled) {
      // Schedule auto-recovery attempt
      setTimeout(() => {
        this.startRecovery(monitor.integration);
      }, 30000); // 30 seconds delay
    }

    // Notification logic would go here
    // For now, we just emit events
  }

  /**
   * Escalate issue for manual intervention
   */
  private escalateIssue(monitor: IntegrationMonitor, error?: Error): void {
    if (monitor.escalationTimeout) {
      return; // Already escalated
    }

    monitor.escalationTimeout = setTimeout(() => {
      const reason = `Integration ${monitor.integration} has failed ${monitor.errorCount} times. Last error: ${error?.message || 'Unknown'}`;
      
      this.triggerManualIntervention(
        monitor.integration,
        reason,
        'system',
        {
          errorCount: monitor.errorCount,
          lastError: error?.message,
          autoEscalated: true,
        }
      );

      monitor.escalationTimeout = undefined;
    }, monitor.config.escalationDelay * 60 * 1000); // Convert minutes to milliseconds
  }

  /**
   * Add status update to history
   */
  private addStatusUpdate(update: StatusUpdate): void {
    this.statusHistory.push(update);
    
    // Keep history within limits
    if (this.statusHistory.length > this.MAX_STATUS_HISTORY) {
      this.statusHistory = this.statusHistory.slice(-this.MAX_STATUS_HISTORY);
    }
  }

  /**
   * Shutdown the service
   */
  shutdown(): void {
    for (const integration of this.monitors.keys()) {
      this.stopMonitoring(integration);
    }
    
    this.logger.info('Integration recovery service shutdown', {
      category: 'integration_recovery',
    });
  }
}

// Create singleton instance
export const integrationRecoveryService = new IntegrationRecoveryService();