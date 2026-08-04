/**
 * Vichith Cloud Platform - Compute & GPU Provider Abstraction Layer
 * 
 * Provides a vendor-agnostic interface for submitting, monitoring, and routing
 * AI video processing jobs across any GPU cloud provider (e.g., E2E Networks, RunPod,
 * AWS ECS GPU, or Local Studio GPU workers for $0 development).
 */

export type ComputeRegion = 'in-maa' | 'in-del' | 'us-east' | 'eu-west' | 'global' | 'local-dev';

export type GpuProviderId = 'e2e_networks' | 'runpod' | 'aws_ecs' | 'local_studio' | 'mock';

export type ModelCategory = 
  | 'video_generation'
  | 'frame_interpolation'
  | 'audio_denoise'
  | 'background_removal'
  | 'super_resolution'
  | 'vvcs_proxy_render'
  | 'color_grading_ai';

export interface ModelCatalogEntry {
  readonly modelId: string;
  readonly name: string;
  readonly category: ModelCategory;
  readonly description: string;
  readonly creditCostPerMinute: number;
  readonly requiredVramGb: number;
  readonly supportsHotSwapCache: boolean; // True if model weights can be LRU cached on shared GPU worker
  readonly preferredRegions: ComputeRegion[];
  readonly defaultProvider: GpuProviderId;
}

export interface ComputeJobRequest {
  readonly jobId: string;
  readonly userId: string;
  readonly modelId: string;
  readonly inputSignedUrl?: string;
  readonly outputSignedUrl?: string;
  readonly parameters: Record<string, any>;
  readonly priority: 'low' | 'normal' | 'high';
  readonly regionHint?: ComputeRegion;
  readonly maxTimeoutSeconds?: number;
}

export interface ComputeJobSubmission {
  readonly jobId: string;
  readonly providerId: GpuProviderId;
  readonly providerJobId: string;
  readonly status: 'queued' | 'running' | 'failed' | 'completed';
  readonly estimatedWaitSeconds: number;
  readonly assignedWorkerPool: string;
  readonly timestamp: number;
}

export interface ComputeJobStatus {
  readonly jobId: string;
  readonly providerId: GpuProviderId;
  readonly providerJobId: string;
  readonly status: 'queued' | 'running' | 'failed' | 'completed' | 'cancelled';
  readonly progressPercentage: number;
  readonly error?: string;
  readonly resultUrl?: string;
  readonly computeTimeSeconds?: number;
  readonly completedAt?: number;
}

/**
 * Common Adapter Interface that every GPU provider (E2E Networks, RunPod, Local)
 * must implement to connect to the Vichith Control Plane.
 */
export interface IGpuProviderAdapter {
  readonly providerId: GpuProviderId;
  readonly supportedRegions: ComputeRegion[];

  /**
   * Submit a new AI video job to the provider queue or serverless endpoint.
   */
  submitJob(request: ComputeJobRequest): Promise<ComputeJobSubmission>;

  /**
   * Query real-time status of a running or queued job.
   */
  getJobStatus(jobId: string, providerJobId: string): Promise<ComputeJobStatus>;

  /**
   * Cancel an in-progress or queued job.
   */
  cancelJob(jobId: string, providerJobId: string): Promise<boolean>;

  /**
   * Validate and parse an incoming completion webhook from the GPU provider.
   */
  handleWebhook(payload: any, signature?: string): Promise<ComputeJobStatus>;
}
