import { NextResponse } from 'next/server';
import { listModelCatalog } from '@/lib/compute/registry';

/**
 * GET /api/v1/compute/models
 * 
 * Public/authenticated endpoint returning the catalog of available open-source AI video models,
 * their required VRAM, credit costs per minute, and supported regions.
 */
export async function GET() {
  const models = listModelCatalog();

  return NextResponse.json({
    status: 'success',
    count: models.length,
    models: models.map((m) => ({
      model_id: m.modelId,
      name: m.name,
      category: m.category,
      description: m.description,
      credits_per_minute: m.creditCostPerMinute,
      required_vram_gb: m.requiredVramGb,
      hot_swap_capable: m.supportsHotSwapCache,
      regions: m.preferredRegions,
      default_provider: m.defaultProvider,
    })),
    architecture_note: 
      'Hot-swap capable models share a unified GPU pool using LRU VRAM caching ' +
      'to prevent dedicating idle GPUs to individual models.',
  });
}
