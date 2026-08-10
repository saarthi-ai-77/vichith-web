import { ModelCatalogEntry, LlmModelCatalogEntry } from './types';

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

/**
 * LLM model catalog — the OTHER half of the SAME canonical registry.
 *
 * The Model Router (`lib/ai/modelRouter.ts`) selects a provider + model from
 * here for a capability + entitlement + cost. Nothing declares a provider's
 * model list anywhere else. If the router needs a field, this file is where it
 * goes. (The registry ratchet test will fail if a second model catalog appears.)
 *
 * Availability is deliberately NOT in `status`. That field is static product
 * intent (shipped / coming soon / retired). Whether the model is actually
 * *usable today* is a runtime verdict the router derives from:
 *   status === 'available' && enabled && credential present && plan entitled
 *   && provider healthy  — see `modelRouter.ts`.
 */
export const VICHITH_LLM_CATALOG: Record<string, LlmModelCatalogEntry> = {
  /** Sarvam-105B — the free-tier chat/reasoning path. */
  'sarvam-105b': {
    modelId: 'sarvam-105b',
    name: 'Sarvam-105B',
    provider: 'sarvam',
    // The reasoning + language set Sarvam actually serves over its OpenAI-
    // compatible chat endpoint. NOT speech/OCR: those are unit-metered, model-
    // fixed endpoints served through the adapter, and are not user-selectable.
    capabilities: ['plan.edit', 'plan.research', 'understand.text'],
    minPlan: 'free',
    enabled: true,
    status: 'available',
    // Server-side only. `configured` is resolved at request time, never stored.
    requiredEnv: 'SARVAM_API_KEY',
    // The starter tier's hard ceiling — a routing constraint, not a preference.
    maxOutputTokens: 4096,
    // Cheapest lane so a cheap operation never reaches a deaarer model.
    creditCost: 1,
    supportsTools: true,
    supportsStreaming: true,
    supportsJsonMode: true,
    attribution: 'Powered by Sarvam',
  },

  /** OpenRouter cost-optimized chat — the paid tier's economy lane. */
  'openrouter/mini-chat': {
    modelId: 'openrouter/mini-chat',
    name: 'OpenRouter Mini',
    provider: 'openrouter',
    capabilities: ['plan.edit', 'plan.research', 'understand.text'],
    minPlan: 'paid',
    enabled: true,
    status: 'available',
    requiredEnv: 'OPENROUTER_API_KEY',
    // No stdout cap from the gateway tier comparable to Sarvam's 4096 starter
    // limit; the adapter still enforces a sane default ceiling per call.
    maxOutputTokens: 16_384,
    creditCost: 2,
    supportsTools: true,
    supportsStreaming: true,
    supportsJsonMode: true,
    attribution: 'Powered by OpenRouter',
  },

  /** OpenRouter high-quality reasoning — paid tier, dearest, last resort. */
  'openrouter/reasoning-pro': {
    modelId: 'openrouter/reasoning-pro',
    name: 'OpenRouter Reasoning Pro',
    provider: 'openrouter',
    capabilities: ['plan.edit', 'plan.research', 'understand.text'],
    minPlan: 'paid',
    enabled: true,
    status: 'available',
    requiredEnv: 'OPENROUTER_API_KEY',
    maxOutputTokens: 16_384,
    creditCost: 4,
    supportsTools: true,
    supportsStreaming: true,
    supportsJsonMode: true,
    attribution: 'Powered by OpenRouter',
  },

  /** Reference entry proving the roadmap stays in the SAME registry. */
  'sarvam-105b-plus': {
    modelId: 'sarvam-105b-plus',
    name: 'Sarvam-105B Plus',
    provider: 'sarvam',
    capabilities: ['plan.edit', 'plan.research', 'understand.text'],
    minPlan: 'paid',
    enabled: false,          // not switched on yet — must never be presented
    status: 'coming_soon',   // product intent, not usable today
    requiredEnv: 'SARVAM_API_KEY',
    maxOutputTokens: 4096,
    creditCost: 3,
    supportsTools: true,
    supportsStreaming: true,
    supportsJsonMode: true,
    attribution: 'Powered by Sarvam',
  },
};

/** Get an LLM model entry by id, or undefined. */
export function getLlmModelCatalogEntry(modelId: string): LlmModelCatalogEntry | undefined {
  return VICHITH_LLM_CATALOG[modelId];
}

/** All LLM model entries as a clean array. */
export function listLlmModelCatalog(): LlmModelCatalogEntry[] {
  return Object.values(VICHITH_LLM_CATALOG);
}
