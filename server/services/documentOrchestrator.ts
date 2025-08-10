import { z } from 'zod';
import { EventEmitter } from 'events';

// Document generation job schemas
export const documentJobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'timeout']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  createdAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  estimatedDuration: z.number().optional(),
  actualDuration: z.number().optional(),
  progress: z.object({
    currentStep: z.string(),
    completedSteps: z.array(z.string()),
    totalSteps: z.number(),
    percentage: z.number().min(0).max(100),
  }),
  services: z.object({
    narrative: z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
      result: z.any().optional(),
      error: z.string().optional(),
    }),
    complianceMemo: z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
      result: z.any().optional(),
      error: z.string().optional(),
    }),
    pdfGeneration: z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
      result: z.any().optional(),
      error: z.string().optional(),
    }),
  }),
  request: z.any(),
  result: z.any().optional(),
  errors: z.array(z.object({
    service: z.string(),
    error: z.string(),
    timestamp: z.string(),
    retryCount: z.number().default(0),
  })),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  timeoutMs: z.number().default(300000), // 5 minutes default
});

export const documentGenerationRequestSchema = z.object({
  companyContext: z.object({
    companyName: z.string().min(1, "Company name is required"),
    taxYear: z.number().min(2000).max(new Date().getFullYear() + 1),
    industry: z.string().min(1, "Industry is required"),
    businessType: z.enum(['corporation', 'llc', 'partnership', 'sole_proprietorship']),
  }),
  projectContext: z.object({
    projectName: z.string().min(1, "Project name is required"),
    projectDescription: z.string().min(50, "Project description must be at least 50 characters"),
    rdActivities: z.array(z.object({
      activity: z.string(),
      description: z.string(),
      timeSpent: z.number(),
      category: z.enum(['experimentation', 'testing', 'analysis', 'development', 'evaluation']),
    })),
    technicalChallenges: z.array(z.string().min(10, "Technical challenge must be at least 10 characters")),
    uncertainties: z.array(z.string().min(10, "Uncertainty must be at least 10 characters")),
    innovations: z.array(z.string().min(10, "Innovation must be at least 10 characters")),
    businessPurpose: z.string().min(20, "Business purpose must be at least 20 characters"),
  }),
  expenseContext: z.object({
    totalExpenses: z.number().min(0, "Total expenses must be non-negative"),
    wageExpenses: z.number().min(0, "Wage expenses must be non-negative"),
    contractorExpenses: z.number().min(0, "Contractor expenses must be non-negative"),
    supplyExpenses: z.number().min(0, "Supply expenses must be non-negative"),
  }),
  documentOptions: z.object({
    includeNarrative: z.boolean().default(true),
    includeComplianceMemo: z.boolean().default(true),
    includePDF: z.boolean().default(true),
    narrativeTemplate: z.string().default('technical_narrative'),
    narrativeOptions: z.object({
      length: z.enum(['brief', 'standard', 'detailed']).default('standard'),
      tone: z.enum(['professional', 'technical', 'formal']).default('professional'),
      focus: z.enum(['compliance', 'technical', 'business']).default('compliance'),
    }),
    memoOptions: z.object({
      includeRiskAssessment: z.boolean().default(true),
      includeFourPartTest: z.boolean().default(true),
      includeQREAnalysis: z.boolean().default(true),
      detailLevel: z.enum(['summary', 'standard', 'comprehensive']).default('standard'),
    }),
  }),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

export type DocumentJob = z.infer<typeof documentJobSchema>;
export type DocumentGenerationRequest = z.infer<typeof documentGenerationRequestSchema>;

export interface DocumentGenerationResult {
  narrative?: any;
  complianceMemo?: any;
  pdfUrl?: string;
  summary: {
    totalDocuments: number;
    generatedAt: string;
    processingTime: number;
    complianceScore?: number;
    estimatedCredit?: number;
  };
}

export class DocumentOrchestrator extends EventEmitter {
  private static readonly MAX_CONCURRENT_JOBS = 5;
  private static readonly DEFAULT_TIMEOUT_MS = 300000; // 5 minutes
  private static readonly RETRY_DELAYS = [1000, 3000, 5000]; // Progressive delays
  
  private jobQueue: Map<string, DocumentJob> = new Map();
  private activeJobs: Set<string> = new Set();
  private jobHistory: Map<string, DocumentJob> = new Map();

  constructor() {
    super();
    this.setupCleanupInterval();
  }

  async startDocumentGeneration(
    userId: string,
    request: DocumentGenerationRequest
  ): Promise<{ jobId: string; estimatedDuration: number }> {
    const jobId = this.generateJobId(userId, request.projectContext.projectName);
    
    // Estimate duration based on requested services
    const estimatedDuration = this.estimateJobDuration(request);
    
    const job: DocumentJob = {
      id: jobId,
      userId,
      status: 'pending',
      priority: request.priority,
      createdAt: new Date().toISOString(),
      estimatedDuration,
      progress: {
        currentStep: 'Queued for processing',
        completedSteps: [],
        totalSteps: this.calculateTotalSteps(request),
        percentage: 0,
      },
      services: {
        narrative: { status: 'pending' },
        complianceMemo: { status: 'pending' },
        pdfGeneration: { status: 'pending' },
      },
      request,
      errors: [],
      retryCount: 0,
      maxRetries: 3,
      timeoutMs: request.documentOptions.includePDF ? 600000 : 300000, // 10 min for PDF, 5 min without
    };

    this.jobQueue.set(jobId, job);
    
    console.log('Document generation job queued:', {
      jobId,
      userId,
      projectName: request.projectContext.projectName,
      priority: request.priority,
      estimatedDuration,
    });

    // Start processing if capacity allows
    this.processQueue();
    
    this.emit('jobQueued', { jobId, userId });
    
    return { jobId, estimatedDuration };
  }

  async getJobStatus(jobId: string): Promise<DocumentJob | null> {
    return this.jobQueue.get(jobId) || this.jobHistory.get(jobId) || null;
  }

  async cancelJob(jobId: string, userId: string): Promise<boolean> {
    const job = this.jobQueue.get(jobId);
    
    if (!job || job.userId !== userId) {
      return false;
    }

    if (job.status === 'completed') {
      return false; // Cannot cancel completed jobs
    }

    job.status = 'failed';
    job.completedAt = new Date().toISOString();
    job.errors.push({
      service: 'orchestrator',
      error: 'Job cancelled by user',
      timestamp: new Date().toISOString(),
      retryCount: 0,
    });

    this.activeJobs.delete(jobId);
    this.moveToHistory(jobId);
    
    console.log('Document generation job cancelled:', { jobId, userId });
    
    this.emit('jobCancelled', { jobId, userId });
    
    return true;
  }

  async retryJob(jobId: string, userId: string): Promise<boolean> {
    const job = this.jobQueue.get(jobId) || this.jobHistory.get(jobId);
    
    if (!job || job.userId !== userId || job.status !== 'failed') {
      return false;
    }

    if (job.retryCount >= job.maxRetries) {
      return false; // Max retries exceeded
    }

    // Reset job for retry
    job.status = 'pending';
    job.retryCount++;
    job.startedAt = undefined;
    job.completedAt = undefined;
    job.progress = {
      currentStep: 'Retry queued for processing',
      completedSteps: [],
      totalSteps: this.calculateTotalSteps(job.request),
      percentage: 0,
    };

    // Reset service statuses
    Object.keys(job.services).forEach(service => {
      (job.services as any)[service].status = 'pending';
      (job.services as any)[service].error = undefined;
    });

    // Move back to queue if in history
    if (this.jobHistory.has(jobId)) {
      this.jobHistory.delete(jobId);
      this.jobQueue.set(jobId, job);
    }

    console.log('Document generation job retry queued:', { jobId, userId, retryCount: job.retryCount });
    
    this.processQueue();
    this.emit('jobRetried', { jobId, userId, retryCount: job.retryCount });
    
    return true;
  }

  private async processQueue(): Promise<void> {
    if (this.activeJobs.size >= DocumentOrchestrator.MAX_CONCURRENT_JOBS) {
      return; // At capacity
    }

    // Get next job by priority
    const nextJob = this.getNextJob();
    if (!nextJob) {
      return; // No jobs in queue
    }

    this.activeJobs.add(nextJob.id);
    nextJob.status = 'in_progress';
    nextJob.startedAt = new Date().toISOString();

    console.log('Starting document generation job:', {
      jobId: nextJob.id,
      userId: nextJob.userId,
      priority: nextJob.priority,
    });

    try {
      await this.processJob(nextJob);
    } catch (error: any) {
      console.error('Document generation job failed:', {
        jobId: nextJob.id,
        error: error.message,
      });
      
      await this.handleJobError(nextJob, 'orchestrator', error.message);
    }

    // Process next job in queue
    setImmediate(() => this.processQueue());
  }

  private async processJob(job: DocumentJob): Promise<void> {
    const startTime = Date.now();
    let timeoutHandle: NodeJS.Timeout | null = null;

    try {
      // Set up timeout
      timeoutHandle = setTimeout(async () => {
        await this.handleJobTimeout(job);
      }, job.timeoutMs);

      const result: DocumentGenerationResult = {
        summary: {
          totalDocuments: 0,
          generatedAt: new Date().toISOString(),
          processingTime: 0,
        },
      };

      // Step 1: Generate narrative if requested
      if (job.request.documentOptions.includeNarrative) {
        await this.generateNarrative(job, result);
      }

      // Step 2: Generate compliance memo if requested
      if (job.request.documentOptions.includeComplianceMemo) {
        await this.generateComplianceMemo(job, result);
      }

      // Step 3: Generate PDF if requested
      if (job.request.documentOptions.includePDF) {
        await this.generatePDF(job, result);
      }

      // Complete job
      const endTime = Date.now();
      job.actualDuration = endTime - startTime;
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.result = result;
      job.progress = {
        currentStep: 'Document generation completed',
        completedSteps: ['narrative', 'complianceMemo', 'pdfGeneration'],
        totalSteps: job.progress.totalSteps,
        percentage: 100,
      };

      result.summary.processingTime = job.actualDuration;
      result.summary.totalDocuments = this.countGeneratedDocuments(result);

      // Extract compliance score if available
      if (result.complianceMemo?.overallCompliance?.score) {
        result.summary.complianceScore = result.complianceMemo.overallCompliance.score;
      }

      // Calculate estimated credit
      if (job.request.expenseContext.totalExpenses) {
        result.summary.estimatedCredit = Math.round(job.request.expenseContext.totalExpenses * 0.1);
      }

      console.log('Document generation job completed:', {
        jobId: job.id,
        userId: job.userId,
        processingTime: job.actualDuration,
        documentsGenerated: result.summary.totalDocuments,
      });

      this.emit('jobCompleted', { jobId: job.id, userId: job.userId, result });

    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      
      this.activeJobs.delete(job.id);
      this.moveToHistory(job.id);
    }
  }

  private async generateNarrative(job: DocumentJob, result: DocumentGenerationResult): Promise<void> {
    job.services.narrative.status = 'in_progress';
    job.progress.currentStep = 'Generating technical narrative';
    this.emit('jobProgress', { jobId: job.id, progress: job.progress });

    try {
      const { getNarrativePromptService } = await import('./narrativePrompts');
      const narrativeService = getNarrativePromptService();

      const narrativeRequest = {
        companyContext: job.request.companyContext,
        projectContext: job.request.projectContext,
        options: job.request.documentOptions.narrativeOptions,
      };

      // Generate narrative using template
      const narrative = narrativeService.generateNarrative(
        job.request.documentOptions.narrativeTemplate,
        narrativeRequest.companyContext,
        narrativeRequest.projectContext,
        narrativeRequest.options
      );

      job.services.narrative.status = 'completed';
      job.services.narrative.result = { content: narrative, templateUsed: job.request.documentOptions.narrativeTemplate };
      result.narrative = job.services.narrative.result;

      job.progress.completedSteps.push('narrative');
      job.progress.percentage = Math.round((job.progress.completedSteps.length / job.progress.totalSteps) * 100);
      
      console.log('Narrative generation completed for job:', job.id);

    } catch (error: any) {
      job.services.narrative.status = 'failed';
      job.services.narrative.error = error.message;
      
      await this.handleJobError(job, 'narrative', error.message);
      throw error;
    }
  }

  private async generateComplianceMemo(job: DocumentJob, result: DocumentGenerationResult): Promise<void> {
    job.services.complianceMemo.status = 'in_progress';
    job.progress.currentStep = 'Generating compliance memo';
    this.emit('jobProgress', { jobId: job.id, progress: job.progress });

    try {
      const { getComplianceMemoService } = await import('./complianceMemo');
      const complianceService = getComplianceMemoService();

      const memoRequest = {
        companyContext: job.request.companyContext,
        projectContext: job.request.projectContext,
        expenseContext: job.request.expenseContext,
        memoOptions: job.request.documentOptions.memoOptions,
      };

      const complianceMemo = complianceService.generateComplianceMemo(memoRequest);

      job.services.complianceMemo.status = 'completed';
      job.services.complianceMemo.result = complianceMemo;
      result.complianceMemo = complianceMemo;

      job.progress.completedSteps.push('complianceMemo');
      job.progress.percentage = Math.round((job.progress.completedSteps.length / job.progress.totalSteps) * 100);
      
      console.log('Compliance memo generation completed for job:', job.id);

    } catch (error: any) {
      job.services.complianceMemo.status = 'failed';
      job.services.complianceMemo.error = error.message;
      
      await this.handleJobError(job, 'complianceMemo', error.message);
      throw error;
    }
  }

  private async generatePDF(job: DocumentJob, result: DocumentGenerationResult): Promise<void> {
    job.services.pdfGeneration.status = 'in_progress';
    job.progress.currentStep = 'Generating PDF documents';
    this.emit('jobProgress', { jobId: job.id, progress: job.progress });

    try {
      const { getDocumintService } = await import('./documint');
      const documintService = getDocumintService();

      // Prepare Form 6765 data from job context
      const form6765Data = this.mapJobToForm6765Data(job, result);

      const pdfRequest = {
        templateId: 'form-6765-rd-credit',
        data: form6765Data,
        options: {
          format: 'pdf' as const,
          quality: 'high' as const,
          includeAttachments: true,
          watermark: false,
        },
      };

      const pdfResult = await documintService.generatePDF(pdfRequest);
      
      job.services.pdfGeneration.status = 'completed';
      job.services.pdfGeneration.result = pdfResult;
      result.pdfUrl = pdfResult.downloadUrl;

      job.progress.completedSteps.push('pdfGeneration');
      job.progress.percentage = Math.round((job.progress.completedSteps.length / job.progress.totalSteps) * 100);
      
      console.log('PDF generation completed for job:', {
        jobId: job.id,
        pdfId: pdfResult.id,
        status: pdfResult.status,
        downloadUrl: pdfResult.downloadUrl,
      });

    } catch (error: any) {
      job.services.pdfGeneration.status = 'failed';
      job.services.pdfGeneration.error = error.message;
      
      await this.handleJobError(job, 'pdfGeneration', error.message);
      throw error;
    }
  }

  private mapJobToForm6765Data(job: DocumentJob, result: DocumentGenerationResult): any {
    const request = job.request;
    
    // Calculate contractor expenses with 65% limit
    const contractorExpenses = Math.min(
      request.expenseContext.contractorExpenses,
      request.expenseContext.wageExpenses * 0.65
    );

    return {
      companyName: request.companyContext.companyName,
      taxYear: request.companyContext.taxYear,
      businessType: request.companyContext.businessType,
      currentYearExpenses: {
        wages: request.expenseContext.wageExpenses,
        contractors: contractorExpenses,
        supplies: request.expenseContext.supplyExpenses,
        total: request.expenseContext.totalExpenses,
      },
      rdActivities: request.projectContext.rdActivities.map((activity: any) => ({
        activity: activity.activity,
        description: activity.description,
        hours: activity.timeSpent || 0,
        wages: Math.round((activity.timeSpent || 0) * 50), // Estimate $50/hour
        category: activity.category,
      })),
      technicalChallenges: request.projectContext.technicalChallenges,
      uncertainties: request.projectContext.uncertainties,
      innovations: request.projectContext.innovations,
      businessPurpose: request.projectContext.businessPurpose,
      calculations: {
        totalQualifiedExpenses: request.expenseContext.totalExpenses,
        ascPercentage: 0.14, // Default 14% for most businesses
        baseAmount: request.expenseContext.totalExpenses * 0.5, // Simplified base calculation
        creditAmount: Math.round(request.expenseContext.totalExpenses * 0.1), // 10% credit estimate
        riskLevel: result.complianceMemo?.overallCompliance?.riskLevel || 'medium',
      },
      attachments: {
        narrativeContent: result.narrative?.content,
        complianceMemo: JSON.stringify(result.complianceMemo),
      },
    };
  }

  private async handleJobError(job: DocumentJob, service: string, error: string): Promise<void> {
    const errorEntry = {
      service,
      error,
      timestamp: new Date().toISOString(),
      retryCount: job.retryCount,
    };

    job.errors.push(errorEntry);

    console.error('Document generation service error:', {
      jobId: job.id,
      service,
      error,
      retryCount: job.retryCount,
    });

    // Determine if we should retry
    if (job.retryCount < job.maxRetries && this.isRetryableError(error)) {
      console.log('Scheduling retry for job:', {
        jobId: job.id,
        service,
        retryCount: job.retryCount + 1,
      });

      // Schedule retry with progressive delay
      const delay = DocumentOrchestrator.RETRY_DELAYS[job.retryCount] || 5000;
      setTimeout(() => {
        this.retryJob(job.id, job.userId);
      }, delay);

    } else {
      job.status = 'failed';
      job.completedAt = new Date().toISOString();
      
      this.emit('jobFailed', { 
        jobId: job.id, 
        userId: job.userId, 
        error: errorEntry,
        finalAttempt: true 
      });
    }
  }

  private async handleJobTimeout(job: DocumentJob): Promise<void> {
    console.warn('Document generation job timeout:', {
      jobId: job.id,
      userId: job.userId,
      timeoutMs: job.timeoutMs,
    });

    job.status = 'timeout';
    job.completedAt = new Date().toISOString();
    job.errors.push({
      service: 'orchestrator',
      error: `Job timeout after ${job.timeoutMs}ms`,
      timestamp: new Date().toISOString(),
      retryCount: job.retryCount,
    });

    this.activeJobs.delete(job.id);
    this.moveToHistory(job.id);
    
    this.emit('jobTimeout', { jobId: job.id, userId: job.userId });
  }

  private getNextJob(): DocumentJob | null {
    const pendingJobs = Array.from(this.jobQueue.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

    return pendingJobs[0] || null;
  }

  private generateJobId(userId: string, projectName: string): string {
    const timestamp = Date.now();
    const userHash = userId.slice(-6);
    const projectHash = projectName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    return `DOC-${userHash}-${projectHash}-${timestamp}`;
  }

  private estimateJobDuration(request: DocumentGenerationRequest): number {
    let duration = 0;
    
    if (request.documentOptions.includeNarrative) {
      duration += 30000; // 30 seconds for narrative
    }
    
    if (request.documentOptions.includeComplianceMemo) {
      duration += 45000; // 45 seconds for compliance memo
    }
    
    if (request.documentOptions.includePDF) {
      duration += 60000; // 60 seconds for PDF generation
    }

    return Math.max(duration, 30000); // Minimum 30 seconds
  }

  private calculateTotalSteps(request: DocumentGenerationRequest): number {
    let steps = 0;
    
    if (request.documentOptions.includeNarrative) steps++;
    if (request.documentOptions.includeComplianceMemo) steps++;
    if (request.documentOptions.includePDF) steps++;
    
    return Math.max(steps, 1);
  }

  private countGeneratedDocuments(result: DocumentGenerationResult): number {
    let count = 0;
    
    if (result.narrative) count++;
    if (result.complianceMemo) count++;
    if (result.pdfUrl) count++;
    
    return count;
  }

  private isRetryableError(error: string): boolean {
    const retryableErrors = [
      'timeout',
      'network',
      'connection',
      'rate limit',
      'service unavailable',
      'internal server error',
    ];

    return retryableErrors.some(retryable => 
      error.toLowerCase().includes(retryable)
    );
  }

  private moveToHistory(jobId: string): void {
    const job = this.jobQueue.get(jobId);
    if (job) {
      this.jobHistory.set(jobId, job);
      this.jobQueue.delete(jobId);
    }
  }

  private setupCleanupInterval(): void {
    // Clean up old jobs from history every hour
    setInterval(() => {
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      
      for (const [jobId, job] of Array.from(this.jobHistory.entries())) {
        const completedTime = new Date(job.completedAt || job.createdAt).getTime();
        if (completedTime < cutoffTime) {
          this.jobHistory.delete(jobId);
        }
      }
      
      console.log('Document orchestrator cleanup completed, history size:', this.jobHistory.size);
    }, 60 * 60 * 1000); // Run every hour
  }

  // Public methods for monitoring
  getQueueStats(): {
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    totalInHistory: number;
  } {
    const pending = Array.from(this.jobQueue.values()).filter(j => j.status === 'pending').length;
    const inProgress = this.activeJobs.size;
    const completed = Array.from(this.jobHistory.values()).filter(j => j.status === 'completed').length;
    const failed = Array.from(this.jobHistory.values()).filter(j => j.status === 'failed').length;
    
    return {
      pending,
      inProgress,
      completed,
      failed,
      totalInHistory: this.jobHistory.size,
    };
  }

  getUserJobs(userId: string): DocumentJob[] {
    const activeJobs = Array.from(this.jobQueue.values()).filter(j => j.userId === userId);
    const historyJobs = Array.from(this.jobHistory.values()).filter(j => j.userId === userId);
    
    return [...activeJobs, ...historyJobs].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

// Singleton instance
let documentOrchestrator: DocumentOrchestrator | null = null;

export function getDocumentOrchestrator(): DocumentOrchestrator {
  if (!documentOrchestrator) {
    documentOrchestrator = new DocumentOrchestrator();
  }
  return documentOrchestrator;
}