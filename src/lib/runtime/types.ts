/**
 * Vichith Cloud Platform - AI Runtime & Capability Execution Layer
 * 
 * Defines the stable Capability abstraction (WHAT) and separates it from dynamic
 * AI Models and Deterministic Tools (HOW).
 */

export type CapabilityId = 
  | 'cap:video_denoise_audio'
  | 'cap:video_background_removal'
  | 'cap:video_frame_interpolate_60fps'
  | 'cap:video_super_resolution_4k'
  | 'cap:video_generate_broll'
  | 'cap:color_grade_cinematic'
  | 'cap:speech_to_subtitles'
  | 'cap:timeline_proxy_mux';

export type DeterministicToolId = 
  | 'ffmpeg'
  | 'imagemagick'
  | 'comfyui'
  | 'rust_edit_cmd';

export type ExecutionStrategy = 
  | 'single_shot_model'
  | 'multi_stage_pipeline'
  | 'deterministic_tool_only';

export interface CapabilitySpecification {
  readonly capabilityId: CapabilityId;
  readonly displayName: string;
  readonly description: string;
  readonly category: 'audio' | 'video' | 'color' | 'generation' | 'timing' | 'compute';
  readonly version: string;
  readonly requiredTools: DeterministicToolId[];
  readonly executionStrategy: ExecutionStrategy;
  readonly preferredModelId?: string;
  readonly fallbackModelIds: string[];
}

export interface ModelCatalogEntry {
  readonly modelId: string;
  readonly name: string;
  readonly providerFamily: string;
  readonly version: string;
  readonly supportedCapabilityIds: CapabilityId[];
  readonly requiredVramGb: number;
  readonly quantization: 'fp16' | 'int8' | 'bf16' | 'fp8';
  readonly maxContextTokensOrFrames: number;
  readonly creditCostPerMinute: number;
  readonly preferredProviders: ('e2e_networks' | 'runpod' | 'local_studio')[];
  readonly fallbackModelIds: string[];
  readonly isHotSwapCapable: boolean;
  readonly deprecationStatus: 'active' | 'deprecated' | 'sunset';
}

export interface ExecutionTaskNode {
  readonly nodeId: string;
  readonly capabilityId: CapabilityId;
  readonly resolvedModelId?: string;
  readonly resolvedTool?: DeterministicToolId;
  readonly dependencies: string[]; // Parent nodeIds
  readonly parameters: Record<string, any>;
  readonly status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  readonly outputArtifactHash?: string;
}

export interface ExecutionGraph {
  readonly graphId: string;
  readonly requestId: string;
  readonly createdAt: number;
  readonly nodes: Record<string, ExecutionTaskNode>;
  readonly rootNodes: string[];
  readonly terminalNodes: string[];
  readonly executionMode: 'cloud' | 'local' | 'hybrid';
}

export interface IVichithAiRuntime {
  compileGraph(
    requestId: string,
    capabilities: { id: CapabilityId; params: Record<string, any>; dependsOn?: string[] }[],
    policyMode?: 'auto' | 'local' | 'cloud'
  ): Promise<ExecutionGraph>;

  resolveModelForCapability(capabilityId: CapabilityId, availableVramGb?: number): string | undefined;
}
