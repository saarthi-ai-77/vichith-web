/**
 * src/lib/ai/__tests__/sarvamRequest.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The two request parameters that must never go unset again.
 *
 * Sarvam's `max_tokens` defaults to 2048 and `reasoning_effort` to medium, and
 * Sarvam CHANGED both defaults in April 2026 with the note "set them explicitly
 * to lock in previous behavior". We set neither, so one turn's reasoning, its
 * narration prose and its tool-call arguments all shared a 2048-token ceiling
 * that moved underneath us between one working run and the next.
 *
 * The failure never looked like a limit. The response ended `finish_reason:
 * 'length'` and the tool-call argument string simply stopped, arriving as
 * unparseable JSON — so it was chased twice as a malformed-schema problem and
 * once as a streaming bug before anyone read the request body.
 *
 * These tests fail the moment either parameter is left to the provider again.
 */

import { describe, it, expect } from 'vitest';
import { SarvamAdapter } from '../adapters/sarvam';
import type { AIRequest } from '../provider';

/** `buildCall` is private by design — nothing but the adapter should build a
 *  request body. The test reaches past that because the body IS the subject. */
const bodyFor = (payload: Record<string, unknown>): Record<string, unknown> => {
    const request: AIRequest = { capability: 'plan.edit', requestId: 'req-test', payload };
    const call = (new SarvamAdapter() as any).buildCall(request);
    expect(call.error, `buildCall rejected the payload: ${call.error}`).toBeUndefined();
    return call.body as Record<string, unknown>;
};

describe('the Sarvam chat request never relies on a provider default', () => {
    it('sends an explicit max_tokens with room for narration AND tool arguments', () => {
        const body = bodyFor({ prompt: 'Add a white background and a text clip' });
        // The provider default (2048) is what cut tool calls in half; the starter
        // tier's cap for sarvam-105b is 4096 and it rejects anything higher with a
        // 400. Both bounds are real, and the value has to sit between them.
        expect(body.max_tokens as number).toBeGreaterThan(2048);
        expect(body.max_tokens as number).toBeLessThanOrEqual(4096);
    });

    it('sends an explicit reasoning_effort so a release note cannot change it', () => {
        const body = bodyFor({ prompt: 'Add a white background and a text clip' });
        expect(body.reasoning_effort).toBe('medium');
    });

    it('still lets a caller override both', () => {
        const body = bodyFor({
            prompt: 'Something short',
            maxOutputTokens: 512,
            reasoningEffort: 'low',
        });
        expect(body.max_tokens).toBe(512);
        expect(body.reasoning_effort).toBe('low');
    });

    it('sends tool_choice alongside tools, so structured calling is actually offered', () => {
        const body = bodyFor({
            prompt: 'Add a text clip',
            tools: [{ type: 'function', function: { name: 'add_text_clip', parameters: {} } }],
        });
        expect(body.tool_choice).toBe('auto');
        expect(body.max_tokens as number).toBeLessThanOrEqual(4096);
    });
});
