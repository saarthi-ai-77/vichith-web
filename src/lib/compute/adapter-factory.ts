import { IGpuProviderAdapter, GpuProviderId, ComputeRegion } from './types';
import { LocalStudioAdapter } from './adapters/local-studio-adapter';

// Singleton cache of active adapters
const adapterCache: Map<GpuProviderId, IGpuProviderAdapter> = new Map();

/**
 * Returns the configured GPU provider adapter.
 * 
 * In development or when external API keys are not present, defaults to
 * `LocalStudioAdapter` ($0/mo). When in production, routes India jobs (`in-maa`)
 * to E2E Networks and Global jobs to RunPod.
 */
export function getGpuAdapter(
  preferredProvider?: GpuProviderId,
  regionHint?: ComputeRegion
): IGpuProviderAdapter {
  // If explicitly requesting a provider, resolve from cache or initialize
  const targetProvider: GpuProviderId = preferredProvider || resolveDefaultProvider(regionHint);

  if (adapterCache.has(targetProvider)) {
    return adapterCache.get(targetProvider)!;
  }

  let adapter: IGpuProviderAdapter;

  switch (targetProvider) {
    case 'local_studio':
    case 'mock':
    case 'e2e_networks': // Will bind to E2E Networks HTTP SDK once production API keys are provided
    case 'runpod':       // Will bind to RunPod SDK once production API keys are provided
    default:
      // Default to LocalStudioAdapter for zero-config development
      adapter = new LocalStudioAdapter();
      break;
  }

  adapterCache.set(targetProvider, adapter);
  return adapter;
}

/**
 * Select default provider based on region hint and available credentials.
 */
function resolveDefaultProvider(region?: ComputeRegion): GpuProviderId {
  // In development mode without production GPU keys, always use local studio
  const hasExternalGpuKeys = Boolean(
    process.env.RUNPOD_API_KEY || process.env.E2E_NETWORKS_API_KEY
  );

  if (!hasExternalGpuKeys) {
    return 'local_studio';
  }

  // Route Indian creator requests to E2E Networks for lowest latency
  if (region === 'in-maa' || region === 'in-del') {
    return process.env.E2E_NETWORKS_API_KEY ? 'e2e_networks' : 'runpod';
  }

  return 'runpod';
}
