import { 
  IGpuProviderAdapter, 
  ComputeJobRequest, 
  ComputeJobSubmission, 
  ComputeJobStatus, 
  GpuProviderId, 
  ComputeRegion 
} from '../types';
import { getModelCatalogEntry } from '../registry';

/**
 * Local Studio / Mock GPU Provider Adapter
 * 
 * Allows developing and testing end-to-end AI video jobs for $0/month.
 * Simulates model loading, VRAM hot-swapping, and timeline proxy rendering
 * locally without calling external GPU APIs.
 */
export class LocalStudioAdapter implements IGpuProviderAdapter {
  readonly providerId: GpuProviderId = 'local_studio';
  readonly supportedRegions: ComputeRegion[] = ['local-dev', 'in-maa', 'global'];

  private jobs: Map<string, ComputeJobStatus> = new Map();

  async submitJob(request: ComputeJobRequest): Promise<ComputeJobSubmission> {
    const model = getModelCatalogEntry(request.modelId);
    const providerJobId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const initialStatus: ComputeJobStatus = {
      jobId: request.jobId,
      providerId: this.providerId,
      providerJobId,
      status: 'queued',
      progressPercentage: 0,
    };

    this.jobs.set(providerJobId, initialStatus);

    // Simulate async GPU worker execution locally
    setTimeout(() => {
      this.simulateWorkerProgress(request.jobId, providerJobId, model?.supportsHotSwapCache ?? true);
    }, 500);

    return {
      jobId: request.jobId,
      providerId: this.providerId,
      providerJobId,
      status: 'queued',
      estimatedWaitSeconds: model?.supportsHotSwapCache ? 3 : 10,
      assignedWorkerPool: model?.supportsHotSwapCache 
        ? 'tier1-dynamic-hotswap-vram' 
        : 'tier2-serverless-pod',
      timestamp: Date.now(),
    };
  }

  async getJobStatus(jobId: string, providerJobId: string): Promise<ComputeJobStatus> {
    const existing = this.jobs.get(providerJobId);
    if (!existing) {
      return {
        jobId,
        providerId: this.providerId,
        providerJobId,
        status: 'failed',
        progressPercentage: 0,
        error: 'Job not found in local worker cache',
      };
    }
    return existing;
  }

  async cancelJob(jobId: string, providerJobId: string): Promise<boolean> {
    const existing = this.jobs.get(providerJobId);
    if (existing && existing.status !== 'completed') {
      this.jobs.set(providerJobId, {
        ...existing,
        status: 'cancelled',
        progressPercentage: 0,
      });
      return true;
    }
    return false;
  }

  async handleWebhook(payload: any): Promise<ComputeJobStatus> {
    // Local adapter processes updates directly in memory
    return {
      jobId: payload.jobId || 'unknown',
      providerId: this.providerId,
      providerJobId: payload.providerJobId || 'unknown',
      status: payload.status || 'completed',
      progressPercentage: payload.progressPercentage ?? 100,
      resultUrl: payload.resultUrl || 'https://vichith.in/demo-output.mp4',
    };
  }

  private simulateWorkerProgress(jobId: string, providerJobId: string, isHotSwap: boolean) {
    const job = this.jobs.get(providerJobId);
    if (!job || job.status === 'cancelled') return;

    // Transition to running
    this.jobs.set(providerJobId, {
      ...job,
      status: 'running',
      progressPercentage: 25,
    });

    setTimeout(() => {
      const current = this.jobs.get(providerJobId);
      if (!current || current.status === 'cancelled') return;

      this.jobs.set(providerJobId, {
        ...current,
        status: 'completed',
        progressPercentage: 100,
        resultUrl: `https://vichith.in/demo-outputs/${jobId}.mp4`,
        computeTimeSeconds: isHotSwap ? 4 : 15,
        completedAt: Date.now(),
      });
    }, isHotSwap ? 1500 : 4000);
  }
}
