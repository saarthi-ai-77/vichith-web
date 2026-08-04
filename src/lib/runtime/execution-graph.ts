import { 
  CapabilityId, 
  ExecutionGraph, 
  ExecutionTaskNode, 
  IVichithAiRuntime 
} from './types';
import { getCapabilitySpec } from './capability-registry';
import { getModelMetadata } from './model-registry';

/**
 * Vichith AI Runtime - Execution Graph (DAG) Compiler & Orchestrator
 * 
 * Takes a high-level Capability Task Plan from the Planner and compiles it into
 * an executable Directed Acyclic Graph (DAG) with resolved models, tools,
 * dependencies, and VRAM memory governance.
 */
export class VichithAiRuntime implements IVichithAiRuntime {
  /**
   * Resolves an abstract capability to the optimal model ID based on VRAM
   * availability and fallback policies.
   */
  resolveModelForCapability(capabilityId: CapabilityId, availableVramGb: number = 24): string | undefined {
    const spec = getCapabilitySpec(capabilityId);
    if (!spec) return undefined;

    // If deterministic tool only, no AI model is required
    if (spec.executionStrategy === 'deterministic_tool_only') {
      return undefined;
    }

    const preferredId = spec.preferredModelId;
    if (preferredId) {
      const model = getModelMetadata(preferredId);
      if (model && model.requiredVramGb <= availableVramGb) {
        return preferredId;
      }
    }

    // Try fallback models if preferred exceeds available VRAM
    for (const fallbackId of spec.fallbackModelIds) {
      const fallback = getModelMetadata(fallbackId);
      if (fallback && fallback.requiredVramGb <= availableVramGb) {
        return fallbackId;
      }
    }

    return preferredId; // Default to preferred even if tight; worker will evict LRU or failover
  }

  /**
   * Compiles abstract capabilities into an ExecutionGraph (DAG).
   */
  async compileGraph(
    requestId: string,
    capabilities: { id: CapabilityId; params: Record<string, any>; dependsOn?: string[] }[],
    policyMode: 'auto' | 'local' | 'cloud' = 'auto'
  ): Promise<ExecutionGraph> {
    const graphId = `graph_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nodes: Record<string, ExecutionTaskNode> = {};
    const rootNodes: string[] = [];
    const allDependents: Set<string> = new Set();

    capabilities.forEach((item, index) => {
      const nodeId = `node_${index + 1}_${item.id.replace('cap:', '')}`;
      const spec = getCapabilitySpec(item.id);
      const resolvedModelId = this.resolveModelForCapability(item.id);
      const resolvedTool = spec?.requiredTools?.[0];
      const dependencies = item.dependsOn || [];

      dependencies.forEach((dep) => allDependents.add(dep));

      if (dependencies.length === 0) {
        rootNodes.push(nodeId);
      }

      nodes[nodeId] = {
        nodeId,
        capabilityId: item.id,
        resolvedModelId,
        resolvedTool,
        dependencies,
        parameters: item.params,
        status: 'pending',
      };
    });

    // Identify terminal nodes (nodes that are not listed as dependencies by any other node)
    const terminalNodes = Object.keys(nodes).filter(
      (nodeId) => !allDependents.has(nodeId)
    );

    return {
      graphId,
      requestId,
      createdAt: Date.now(),
      nodes,
      rootNodes,
      terminalNodes,
      executionMode: policyMode === 'auto' ? 'cloud' : policyMode,
    };
  }
}
