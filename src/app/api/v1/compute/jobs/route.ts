import { NextRequest, NextResponse } from 'next/server';
import { getGpuAdapter } from '@/lib/compute/adapter-factory';
import { getModelCatalogEntry } from '@/lib/compute/registry';
import { ComputeJobRequest, ComputeRegion, GpuProviderId } from '@/lib/compute/types';

/**
 * POST /api/v1/compute/jobs
 * 
 * Submits an AI video processing job to the appropriate GPU provider (E2E Networks,
 * RunPod, or Local Studio worker).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model_id, params = {}, priority = 'normal', region_hint = 'global' } = body;

    if (!model_id) {
      return NextResponse.json(
        { error: 'missing_model_id', message: 'model_id is required.' },
        { status: 400 }
      );
    }

    const model = getModelCatalogEntry(model_id);
    if (!model) {
      return NextResponse.json(
        { error: 'invalid_model_id', message: `Model '${model_id}' is not in the Vichith model catalog.` },
        { status: 404 }
      );
    }

    // Resolve provider adapter (routes in-maa to E2E Networks, global to RunPod, dev to LocalStudio)
    const adapter = getGpuAdapter(undefined, region_hint as ComputeRegion);

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const requestPayload: ComputeJobRequest = {
      jobId,
      userId: 'anonymous-or-auth-user',
      modelId: model.modelId,
      parameters: params,
      priority,
      regionHint: region_hint as ComputeRegion,
    };

    const submission = await adapter.submitJob(requestPayload);

    return NextResponse.json(
      {
        status: 'accepted',
        job_id: submission.jobId,
        provider_id: submission.providerId,
        provider_job_id: submission.providerJobId,
        queue_status: submission.status,
        estimated_wait_seconds: submission.estimatedWaitSeconds,
        worker_pool: submission.assignedWorkerPool,
        model: {
          id: model.modelId,
          name: model.name,
          credit_cost_per_min: model.creditCostPerMinute,
        },
      },
      { status: 202 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'job_submission_failed', message: error?.message || 'Failed to submit compute job.' },
      { status: 500 }
    );
  }
}
