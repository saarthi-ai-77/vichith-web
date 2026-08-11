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

/**
 * An AI/LLM model as declared for the Model Router (Phase 2).
 *
 * Declared in the SAME canonical registry file as the GPU catalog — the Router
 * SELECTS from these entries; the adapters EXECUTE. This is not a second registry;
 * it is the missing half of the one that already exists.
 *
 * The router must be able to tell apart, per model:
 *   available  — this build ships the model at all (`status`)
 *   configured — the provider's credentials are present (`requiredEnv`)
 *   enabled    — an operator switch; a model can be disabled without deleting it
 *   entitled   — the caller's plan may use it (`minPlan`)
 *   healthy    — the provider is not currently failing (runtime tracker)
 * A model must clear ALL FIVE before it may ever be presented as usable.
 */
export interface LlmModelCatalogEntry {
  /** Wire model id sent to the provider. Also the canonical key. */
  readonly modelId: string;
  /** Human label for the selector UI. */
  readonly name: string;
  /** Which AI provider adapter executes this model. */
  readonly provider: 'sarvam' | 'openrouter' | 'gemini';
  /** The capabilities this model can actually serve. */
  readonly capabilities: readonly string[];
  /** Entitlement floor. `free` models serve every signed-in plan. */
  readonly minPlan: 'free' | 'basic' | 'pro';
  /**
   * Operator switch. A model can be present in the registry yet disabled for
   * deployment reasons (credential limit, cost alarm, live-catalog uncertainty).
   * A disabled model is NEVER presented as usable.
   */
  readonly enabled: boolean;
  /**
   * Availability in this build. `available` = shipped and offered; `coming_soon`
   * and `retired` entries exist so the roadmap is in the same place the data is,
   * but they are never selectable.
   */
  readonly status: 'available' | 'coming_soon' | 'retired';
  /** The env var whose presence makes the provider "configured". */
  readonly requiredEnv: string;
  /**
   * Hard output ceiling for one turn. A real routing constraint, not a
   * preference: Sarvam's starter tier rejects max_tokens above 4096, so a model
   * that cannot hold the requested output length must never be chosen for it.
   */
  readonly maxOutputTokens: number;
  /**
   * Normalized credits for one call. Used ONLY to order the same work from
   * cheapest to dearest so a cheap operation never selects an expensive model.
   * The amount actually reserved/charged stays the effort metric (`effortFor`),
   * because the wallet and ledger are effort-denominated.
   */
  readonly creditCost: number;
  readonly supportsTools: boolean;
  readonly supportsStreaming: boolean;
  readonly supportsJsonMode: boolean;
  /** Rendered by the selector wherever this model is offered. */
  readonly attribution: string | null;
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
