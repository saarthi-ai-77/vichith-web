/**
 * src/lib/ai/runtime.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Runtime composition — the single place adapters are registered.
 *
 * Importing this module is what makes the router usable. Keeping registration
 * here (rather than in a route handler) means every entry point sees the same
 * runtime, and adding a provider touches exactly one line outside its own adapter.
 */

import { aiRouter } from './router';
import { GeminiAdapter } from './adapters/gemini';
import { SarvamAdapter } from './adapters/sarvam';

let registered = false;

/** Idempotent. Next.js may evaluate a module more than once across route bundles. */
export function initAIRuntime() {
    if (!registered) {
        aiRouter.register(new GeminiAdapter());
        aiRouter.register(new SarvamAdapter());
        registered = true;
    }
    return aiRouter;
}

export { aiRouter };
export * from './provider';
