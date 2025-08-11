import { EventEmitter } from 'events';
import { LoggingService } from './logger';
import { retryService } from './retryService';
import {
  JobDefinition,
  JobResult,
  JobStatus,
  JobPriority,
  IntegrationType,
  QueueStats,
  jobDefinitionSchema,
  jobResultSchema,
} from '../../shared/types/integrations';

interface QueuedJob extends JobDefinition {
  status: JobStatus;
  attempts: number;
  startedAt?: string;
  completedAt?: string;
  lastError?: {
    message: string;
    stack?: string;
    code?: string;
    retryable: boolean;
  };
  nextRetryAt?: string;
  result?: any;
}

interface JobProcessor {
  (job: JobDefinition): Promise<any>;
}

export class QueueService extends EventEmitter {
  private logger: LoggingService;
  private jobs: Map<string, QueuedJob> = new Map();
  private processors: Map<string, JobProcessor> = new Map();
  private isProcessing: boolean = false;
  private processingInterval?: NodeJS.Timeout;
  private readonly PROCESSING_INTERVAL = 5000; // 5 seconds
  private readonly MAX_CONCURRENT_JOBS = 5;
  private activeJobs: Set<string> = new Set();

  constructor() {
    super();
    this.logger = new LoggingService();
    this.startProcessing();
  }

  /**
   * Add a job to the queue
   */
  async addJob(jobDefinition: JobDefinition): Promise<void> {
    try {
      // Validate job definition
      const validatedJob = jobDefinitionSchema.parse(jobDefinition);
      
      const queuedJob: QueuedJob = {
        ...validatedJob,
        status: JobStatus.PENDING,
        attempts: 0,
      };

      this.jobs.set(queuedJob.id, queuedJob);

      this.logger.info('Job added to queue', {
        jobId: queuedJob.id,
        type: queuedJob.type,
        priority: queuedJob.priority,
        integration: queuedJob.integration,
        category: 'queue',
      });

      this.emit('job_added', queuedJob);
    } catch (error) {
      this.logger.error('Failed to add job to queue', {
        jobId: jobDefinition.id,
        error: error instanceof Error ? error.message : String(error),
        category: 'queue',
      });
      throw error;
    }
  }

  /**
   * Register a job processor
   */
  registerProcessor(jobType: string, processor: JobProcessor): void {
    this.processors.set(jobType, processor);
    
    this.logger.info('Job processor registered', {
      jobType,
      category: 'queue',
    });
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): QueuedJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: JobStatus): QueuedJob[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  /**
   * Get jobs by integration type
   */
  getJobsByIntegration(integration: IntegrationType): QueuedJob[] {
    return Array.from(this.jobs.values()).filter(job => job.integration === integration);
  }

  /**
   * Update job status
   */
  updateJobStatus(jobId: string, status: JobStatus, metadata?: Record<string, any>): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      this.logger.warn('Attempted to update non-existent job', {
        jobId,
        status,
        category: 'queue',
      });
      return;
    }

    const oldStatus = job.status;
    job.status = status;

    if (metadata) {
      job.metadata = { ...job.metadata, ...metadata };
    }

    this.logger.info('Job status updated', {
      jobId,
      oldStatus,
      newStatus: status,
      category: 'queue',
    });

    this.emit('job_status_updated', {
      jobId,
      oldStatus,
      newStatus: status,
      job,
    });
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string, reason?: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.status === JobStatus.PROCESSING) {
      // Try to cancel retry operation if active
      retryService.cancelRetry(jobId);
      this.activeJobs.delete(jobId);
    }

    job.status = JobStatus.CANCELLED;
    job.completedAt = new Date().toISOString();
    
    if (reason) {
      job.metadata = { ...job.metadata, cancellationReason: reason };
    }

    this.logger.info('Job cancelled', {
      jobId,
      reason,
      category: 'queue',
    });

    this.emit('job_cancelled', { jobId, reason, job });
    return true;
  }

  /**
   * Retry a failed job
   */
  retryJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || (job.status !== JobStatus.FAILED && job.status !== JobStatus.MANUAL_INTERVENTION)) {
      return false;
    }

    job.status = JobStatus.PENDING;
    job.nextRetryAt = undefined;
    job.lastError = undefined;

    this.logger.info('Job scheduled for retry', {
      jobId,
      category: 'queue',
    });

    this.emit('job_retry_scheduled', { jobId, job });
    return true;
  }

  /**
   * Mark job for manual intervention
   */
  markForManualIntervention(jobId: string, reason: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    job.status = JobStatus.MANUAL_INTERVENTION;
    job.metadata = {
      ...job.metadata,
      manualInterventionReason: reason,
      manualInterventionRequestedAt: new Date().toISOString(),
    };

    this.logger.warn('Job marked for manual intervention', {
      jobId,
      reason,
      category: 'queue',
    });

    this.emit('job_manual_intervention', { jobId, reason, job });
    return true;
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): QueueStats {
    const jobs = Array.from(this.jobs.values());
    const completedJobs = jobs.filter(job => job.status === JobStatus.COMPLETED);
    
    // Calculate average processing time for completed jobs
    const processingTimes = completedJobs
      .filter(job => job.startedAt && job.completedAt)
      .map(job => {
        const started = new Date(job.startedAt!).getTime();
        const completed = new Date(job.completedAt!).getTime();
        return completed - started;
      });

    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    // Calculate throughput (jobs per minute in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCompletedJobs = completedJobs.filter(job => 
      job.completedAt && new Date(job.completedAt) > oneHourAgo
    );
    const throughput = recentCompletedJobs.length; // jobs in last hour

    return {
      totalJobs: jobs.length,
      pendingJobs: jobs.filter(job => job.status === JobStatus.PENDING).length,
      processingJobs: jobs.filter(job => job.status === JobStatus.PROCESSING).length,
      completedJobs: completedJobs.length,
      failedJobs: jobs.filter(job => job.status === JobStatus.FAILED).length,
      retryingJobs: jobs.filter(job => job.status === JobStatus.RETRYING).length,
      manualInterventionJobs: jobs.filter(job => job.status === JobStatus.MANUAL_INTERVENTION).length,
      averageProcessingTime,
      throughput,
    };
  }

  /**
   * Clean up old jobs
   */
  cleanupOldJobs(maxAge: number = 24 * 60 * 60 * 1000): number { // Default 24 hours
    const cutoff = new Date(Date.now() - maxAge);
    let cleaned = 0;

    for (const [jobId, job] of this.jobs) {
      const jobDate = new Date(job.createdAt);
      
      if (jobDate < cutoff && (
        job.status === JobStatus.COMPLETED ||
        job.status === JobStatus.CANCELLED ||
        (job.status === JobStatus.FAILED && job.attempts >= job.retryConfig.maxAttempts)
      )) {
        this.jobs.delete(jobId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.info('Cleaned up old jobs', {
        cleanedCount: cleaned,
        maxAge,
        category: 'queue',
      });
    }

    return cleaned;
  }

  /**
   * Start queue processing
   */
  private startProcessing(): void {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.PROCESSING_INTERVAL);

    this.logger.info('Queue processing started', {
      interval: this.PROCESSING_INTERVAL,
      category: 'queue',
    });
  }

  /**
   * Stop queue processing
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }
    this.isProcessing = false;

    this.logger.info('Queue processing stopped', {
      category: 'queue',
    });
  }

  /**
   * Process queued jobs
   */
  private async processQueue(): Promise<void> {
    if (this.activeJobs.size >= this.MAX_CONCURRENT_JOBS) {
      return; // At capacity
    }

    // Get pending jobs sorted by priority and creation time
    const pendingJobs = this.getJobsByStatus(JobStatus.PENDING)
      .filter(job => {
        // Check if job is scheduled for future execution
        if (job.scheduledFor) {
          const scheduledTime = new Date(job.scheduledFor);
          return scheduledTime <= new Date();
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityOrder = {
          [JobPriority.CRITICAL]: 4,
          [JobPriority.HIGH]: 3,
          [JobPriority.NORMAL]: 2,
          [JobPriority.LOW]: 1,
        };
        
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) {
          return priorityDiff;
        }
        
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

    // Process jobs up to capacity
    const jobsToProcess = pendingJobs.slice(0, this.MAX_CONCURRENT_JOBS - this.activeJobs.size);
    
    for (const job of jobsToProcess) {
      this.processJob(job);
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: QueuedJob): Promise<void> {
    const processor = this.processors.get(job.type);
    if (!processor) {
      this.logger.error('No processor found for job type', {
        jobId: job.id,
        jobType: job.type,
        category: 'queue',
      });
      
      job.status = JobStatus.FAILED;
      job.lastError = {
        message: `No processor found for job type: ${job.type}`,
        retryable: false,
      };
      return;
    }

    this.activeJobs.add(job.id);
    job.status = JobStatus.PROCESSING;
    job.startedAt = new Date().toISOString();

    this.logger.info('Processing job', {
      jobId: job.id,
      type: job.type,
      attempts: job.attempts,
      category: 'queue',
    });

    this.emit('job_processing', job);

    try {
      // Execute job with retry logic
      const result = await retryService.executeWithRetry(
        job.id,
        () => processor(job),
        job.retryConfig,
        {
          jobType: job.type,
          integration: job.integration,
          priority: job.priority,
        }
      );

      if (result.success) {
        job.status = JobStatus.COMPLETED;
        job.result = result.result;
        job.completedAt = new Date().toISOString();
        job.attempts = result.attempts;

        this.logger.info('Job completed successfully', {
          jobId: job.id,
          attempts: result.attempts,
          totalTime: result.totalTime,
          category: 'queue',
        });

        this.emit('job_completed', {
          jobId: job.id,
          result: result.result,
          job,
        });
      } else {
        job.status = JobStatus.FAILED;
        job.attempts = result.attempts;
        job.completedAt = new Date().toISOString();
        
        if (result.error) {
          job.lastError = {
            message: result.error.message,
            stack: result.error.stack,
            retryable: false, // Already exhausted retries
          };
        }

        this.logger.error('Job failed after all retries', {
          jobId: job.id,
          attempts: result.attempts,
          error: result.error?.message,
          category: 'queue',
        });

        this.emit('job_failed', {
          jobId: job.id,
          error: result.error,
          job,
        });

        // Check if manual intervention is needed
        if (job.priority === JobPriority.CRITICAL || job.priority === JobPriority.HIGH) {
          this.markForManualIntervention(job.id, 'High priority job failed after all retries');
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      job.status = JobStatus.FAILED;
      job.completedAt = new Date().toISOString();
      job.lastError = {
        message: err.message,
        stack: err.stack,
        retryable: false,
      };

      this.logger.error('Job processing error', {
        jobId: job.id,
        error: err.message,
        stack: err.stack,
        category: 'queue',
      });

      this.emit('job_failed', {
        jobId: job.id,
        error: err,
        job,
      });
    } finally {
      this.activeJobs.delete(job.id);
    }
  }
}

// Create singleton instance
export const queueService = new QueueService();