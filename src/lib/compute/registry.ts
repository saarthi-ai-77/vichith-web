import { ModelCatalogEntry } from './types';

/**
 * Vichith Open-Source AI Video Model Catalog
 * 
 * Defines all available open-source models in our AI suite, their credit costs,
 * required VRAM, and whether they can be dynamically LRU cached on shared GPU workers
 * to avoid dedicating 1 GPU per model.
 */
export const VICHITH_MODEL_CATALOG: Record<string, ModelCatalogEntry> = {
  'vch-ai-denoise-v1': {
    modelId: 'vch-ai-denoise-v1',
    name: 'Vichith DeepVoice Audio Denoise',
    category: 'audio_denoise',
    description: 'Removes background noise, wind, and room reverb using neural speech enhancement.',
    creditCostPerMinute: 15,
    requiredVramGb: 8,
    supportsHotSwapCache: true, // Lightweight model: can be hot-swapped into VRAM in ~1.2 seconds
    preferredRegions: ['in-maa', 'in-del', 'global'],
    defaultProvider: 'e2e_networks',
  },
  'vch-bg-remove-v2': {
    modelId: 'vch-bg-remove-v2',
    name: 'Vichith AlphaMatte Video Background Removal',
    category: 'background_removal',
    description: 'Real-time video matting and background replacement without green screen.',
    creditCostPerMinute: 25,
    requiredVramGb: 12,
    supportsHotSwapCache: true, // Can share 24GB VRAM pool with denoise and RIFE
    preferredRegions: ['in-maa', 'in-del', 'global'],
    defaultProvider: 'e2e_networks',
  },
  'vch-rife-fps-60': {
    modelId: 'vch-rife-fps-60',
    name: 'Vichith RIFE Optical Flow Interpolation (60 FPS)',
    category: 'frame_interpolation',
    description: 'Smooths 24fps/30fps footage into cinematic 60fps slow-motion using RIFE neural flow.',
    creditCostPerMinute: 30,
    requiredVramGb: 16,
    supportsHotSwapCache: true,
    preferredRegions: ['in-maa', 'global'],
    defaultProvider: 'e2e_networks',
  },
  'vch-upscale-4k': {
    modelId: 'vch-upscale-4k',
    name: 'Vichith RealESRGAN 4K Video Super-Resolution',
    category: 'super_resolution',
    description: 'Upscales 720p/1080p footage to crisp 4K UHD with texture synthesis.',
    creditCostPerMinute: 40,
    requiredVramGb: 20,
    supportsHotSwapCache: true,
    preferredRegions: ['global', 'in-maa'],
    defaultProvider: 'runpod',
  },
  'vch-genai-video-v1': {
    modelId: 'vch-genai-video-v1',
    name: 'Vichith Video Diffusion (Hunyuan / LTX-Video)',
    category: 'video_generation',
    description: 'Generates cinematic B-roll transitions and AI video clips from text or reference frames.',
    creditCostPerMinute: 80,
    requiredVramGb: 40,
    supportsHotSwapCache: false, // Heavy model: routed to Tier 2 Serverless Scale-to-Zero Pods
    preferredRegions: ['global', 'us-east'],
    defaultProvider: 'runpod',
  },
  'vch-vvcs-proxy': {
    modelId: 'vch-vvcs-proxy',
    name: 'Vichith Headless VVCS Review Proxy Renderer',
    category: 'vvcs_proxy_render',
    description: 'Renders timeline JSON commits into web-playable H.264 review proxies.',
    creditCostPerMinute: 10,
    requiredVramGb: 6,
    supportsHotSwapCache: true,
    preferredRegions: ['in-maa', 'in-del', 'global'],
    defaultProvider: 'e2e_networks',
  },
};

/**
 * Get a model entry by ID, or return undefined if not in catalog.
 */
export function getModelCatalogEntry(modelId: string): ModelCatalogEntry | undefined {
  return VICHITH_MODEL_CATALOG[modelId];
}

/**
 * Return all catalog entries as a clean array.
 */
export function listModelCatalog(): ModelCatalogEntry[] {
  return Object.values(VICHITH_MODEL_CATALOG);
}
