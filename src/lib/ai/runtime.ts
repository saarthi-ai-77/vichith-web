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
import { SarvamAdapter } from './adapters/sarvam';

let registered = false;

/** Idempotent. Next.js may evaluate a module more than once across route bundles. */
export function initAIRuntime() {
    if (!registered) {
        // V1 IS SARVAM-ONLY.
        //
        // The Gemini adapter still exists on disk and is deliberately NOT
        // registered. Keeping the file costs nothing and makes V2's multimodal
        // work a re-registration plus a routing entry; deleting it would mean
        // rewriting an adapter that already works, for no gain.
        //
        // Not registering is the honest form of "we do not use this": an
        // unregistered adapter cannot be reached by accident, whereas a registered
        // one with no routes pointing at it is one careless edit away from being
        // live again without anyone deciding it should be.
        aiRouter.register(new SarvamAdapter());
        registered = true;
    }
    return aiRouter;
}

export { aiRouter };
export * from './provider';
