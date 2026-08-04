import { CapabilityId, CapabilitySpecification } from './types';

/**
 * Vichith Capability Registry
 * 
 * Defines the stable abstract AI capabilities exposed by Vichith Cloud.
 * Callers (Desktop app, Planner/Reasoning engine, SDK) specify ONLY CapabilityId.
 * The AI Runtime binds these to preferred or fallback models at execution time.
 */
export const VICHITH_CAPABILITY_REGISTRY: Record<CapabilityId, CapabilitySpecification> = {
  'cap:video_denoise_audio': {
    capabilityId: 'cap:video_denoise_audio',
    displayName: 'AI Speech Enhancement & Audio Denoise',
    description: 'Removes wind, background hum, and room reverb while preserving voice harmonics.',
    category: 'audio',
    version: '1.0.0',
    requiredTools: ['ffmpeg'],
    executionStrategy: 'single_shot_model',
    preferredModelId: 'vch-ai-denoise-v1',
    fallbackModelIds: ['vch-ai-denoise-lite'],
  },
  'cap:video_background_removal': {
    capabilityId: 'cap:video_background_removal',
    displayName: 'AI Video Background Removal & Matting',
    description: 'High-precision alpha matting without green screen.',
    category: 'video',
    version: '1.0.0',
    requiredTools: ['ffmpeg'],
    executionStrategy: 'single_shot_model',
    preferredModelId: 'vch-bg-remove-v2',
    fallbackModelIds: ['vch-bg-remove-lite'],
  },
  'cap:video_frame_interpolate_60fps': {
    capabilityId: 'cap:video_frame_interpolate_60fps',
    displayName: 'RIFE Optical Flow 60 FPS Interpolation',
    description: 'Smooths 24fps/30fps footage into cinematic 60fps slow-motion.',
    category: 'timing',
    version: '1.0.0',
    requiredTools: ['ffmpeg'],
    executionStrategy: 'single_shot_model',
    preferredModelId: 'vch-rife-fps-60',
    fallbackModelIds: ['vch-rife-lite-12gb'],
  },
  'cap:video_super_resolution_4k': {
    capabilityId: 'cap:video_super_resolution_4k',
    displayName: '4K RealESRGAN Video Super-Resolution',
    description: 'Upscales 1080p footage to 4K UHD with texture synthesis.',
    category: 'video',
    version: '1.0.0',
    requiredTools: ['ffmpeg'],
    executionStrategy: 'single_shot_model',
    preferredModelId: 'vch-upscale-4k',
    fallbackModelIds: ['vch-upscale-1080p'],
  },
  'cap:video_generate_broll': {
    capabilityId: 'cap:video_generate_broll',
    displayName: 'AI B-Roll & Cinematic Video Diffusion',
    description: 'Generates B-roll transitions and AI video clips from natural language.',
    category: 'generation',
    version: '1.0.0',
    requiredTools: ['comfyui', 'ffmpeg'],
    executionStrategy: 'multi_stage_pipeline',
    preferredModelId: 'vch-genai-video-v1',
    fallbackModelIds: [],
  },
  'cap:color_grade_cinematic': {
    capabilityId: 'cap:color_grade_cinematic',
    displayName: 'Cinematic 3D LUT Color Grading',
    description: 'Applies deterministic color grading and film emulation LUTs.',
    category: 'color',
    version: '1.0.0',
    requiredTools: ['ffmpeg'],
    executionStrategy: 'deterministic_tool_only',
    preferredModelId: undefined,
    fallbackModelIds: [],
  },
  'cap:speech_to_subtitles': {
    capabilityId: 'cap:speech_to_subtitles',
    displayName: 'AI Speech-to-Subtitles (Whisper FP16)',
    description: 'Transcribes dialogue with word-level ASS/SRT timestamp alignment.',
    category: 'audio',
    version: '1.0.0',
    requiredTools: ['ffmpeg'],
    executionStrategy: 'single_shot_model',
    preferredModelId: 'vch-whisper-large-v3',
    fallbackModelIds: ['vch-whisper-base'],
  },
  'cap:timeline_proxy_mux': {
    capabilityId: 'cap:timeline_proxy_mux',
    displayName: 'Headless Timeline Review Proxy Render',
    description: 'Renders timeline CRDT JSON commands into H.264 review proxies.',
    category: 'compute',
    version: '1.0.0',
    requiredTools: ['rust_edit_cmd', 'ffmpeg'],
    executionStrategy: 'deterministic_tool_only',
    preferredModelId: undefined,
    fallbackModelIds: [],
  },
};

export function getCapabilitySpec(id: CapabilityId): CapabilitySpecification | undefined {
  return VICHITH_CAPABILITY_REGISTRY[id];
}

export function listAllCapabilities(): CapabilitySpecification[] {
  return Object.values(VICHITH_CAPABILITY_REGISTRY);
}
