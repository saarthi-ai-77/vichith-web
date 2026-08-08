/**
 * src/lib/ai/__tests__/toolArguments.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * What may be repaired, and what must never be invented.
 *
 * Tool-call arguments arrive as fragments and some providers send them
 * cumulatively rather than as deltas, so concatenation can produce `{"a":1}{"a":1}`.
 * That is repairable and must be repaired. A string the model genuinely mangled
 * is NOT, and substituting `{}` for it makes a call that never happened look
 * like a call with no arguments — which surfaced as `Missing required argument`
 * and sent two people hunting for a schema bug that did not exist.
 *
 * The distinction between those two cases is the entire subject of this file.
 * It had no test, and the bug it let through was a no-argument tool being
 * discarded as corrupt: `{}{}` repairs to `{}`, and a guard that inferred
 * failure from the VALUE `{}` could not tell a successful repair from a
 * surrender.
 */

import { describe, it, expect } from 'vitest';
import { normalizeToolArguments } from '../stream';

describe('arguments that are already usable', () => {
    it('passes valid JSON through untouched', () => {
        const res = normalizeToolArguments('{"clipId":"abc","seconds":2}');
        expect(res).toEqual({ ok: true, args: '{"clipId":"abc","seconds":2}' });
    });

    it('treats nothing at all as a call with no arguments, not a failure', () => {
        // `timeline_get_summary` declares `properties: {}` and is called with
        // nothing. `JSON.parse('')` throws, so this must become `{}`.
        expect(normalizeToolArguments('')).toEqual({ ok: true, args: '{}' });
        expect(normalizeToolArguments('   ')).toEqual({ ok: true, args: '{}' });
    });

    it('accepts an explicit empty object', () => {
        expect(normalizeToolArguments('{}')).toEqual({ ok: true, args: '{}' });
    });
});

describe('arguments that are repairable', () => {
    it('takes the first value when a provider sent cumulative frames', () => {
        const res = normalizeToolArguments('{"a":1}{"a":1}{"a":1}');
        expect(res).toEqual({ ok: true, args: '{"a":1}' });
    });

    it('repairs a DOUBLED EMPTY object and reports success, not surrender', () => {
        // The regression this file exists for. A no-argument tool sent
        // cumulatively arrives like this; the repaired value is `{}`, which is
        // indistinguishable from the old give-up value unless the function says
        // which happened. It says.
        const res = normalizeToolArguments('{}{}');
        expect(res.ok).toBe(true);
        expect(res).toEqual({ ok: true, args: '{}' });
    });

    it('does not mistake a brace inside a string for structure', () => {
        const res = normalizeToolArguments('{"prompt":"a {curly} brace"}{"prompt":"a {curly} brace"}');
        expect(res).toEqual({ ok: true, args: '{"prompt":"a {curly} brace"}' });
    });

    it('handles an escaped quote inside a value', () => {
        const raw = '{"text":"say \\"hello\\" once"}';
        expect(normalizeToolArguments(raw)).toEqual({ ok: true, args: raw });
    });
});

describe('arguments that must NOT be invented', () => {
    it('reports failure rather than returning {} for a truncated object', () => {
        const res = normalizeToolArguments('{"creativeGoal": "Add a white background at tim');
        expect(res.ok).toBe(false);
    });

    it('reports failure for a value that was never opened with a quote', () => {
        const res = normalizeToolArguments('{"understanding": User wants a white background, "objective"');
        expect(res.ok).toBe(false);
    });

    it('keeps the raw text so the failure can be diagnosed from the log', () => {
        const raw = '{"a": broken';
        const res = normalizeToolArguments(raw);
        expect(res).toEqual({ ok: false, raw });
    });

    it('never reports ok with anything but parseable JSON', () => {
        const inputs = ['', '{}', '{}{}', '{"a":1}{"a":1}', '{"a": broken', 'not json at all', '{"a":'];
        for (const input of inputs) {
            const res = normalizeToolArguments(input);
            if (res.ok) expect(() => JSON.parse(res.args), `parsing repair of ${input}`).not.toThrow();
        }
    });
});
