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

/**
 * The exact payload from the production run, recovered whole once the log stopped
 * truncating itself. 689 characters, `finish_reason: tool_calls`, closing brace
 * present — complete, not cut off. Every key quoted, not one value quoted.
 */
const REAL_UNQUOTED_PAYLOAD =
    '{"understanding": User wants a 40-second motivational video that tells its story entirely with ' +
    'animated typography, no stock footage, using solid backgrounds, simple shapes, camera motion, ' +
    'timing, spacing and transitions. Background music must be generated with Studio., ' +
    '"objective": Create a 40-second motivational typography video using only text, graphics, ' +
    'generated music and camera motion., ' +
    '"domain": Motivational typography video for social media (YouTube Shorts/Instagram Reel)., ' +
    '"knowledge": Motivational videos need a strong hook, clear hierarchy, pacing that builds energy, ' +
    'and visual emphasis on key words. Use simple motion to highlight text and keep the focus on the message.}';

describe('prose values the model left unquoted', () => {
    it('recovers the real payload that killed a run', () => {
        const res = normalizeToolArguments(REAL_UNQUOTED_PAYLOAD);
        expect(res.ok).toBe(true);
        if (!res.ok) return;

        const parsed = JSON.parse(res.args);
        expect(Object.keys(parsed)).toEqual(['understanding', 'objective', 'domain', 'knowledge']);
        expect(parsed.understanding).toContain('40-second motivational video');
        // The value contains commas and a full stop; neither may truncate it.
        expect(parsed.understanding).toContain('Background music must be generated with Studio.');
        expect(parsed.domain).toBe('Motivational typography video for social media (YouTube Shorts/Instagram Reel).');
    });

    it('takes the text verbatim — nothing invented, nothing dropped', () => {
        // Only the missing delimiters are added; every other character of the
        // model's output is left where it was.
        const res = normalizeToolArguments('{"a": hello there, "b": second value}');
        expect(res).toEqual({ ok: true, args: '{"a": "hello there", "b": "second value"}' });
    });

    it('leaves values that are already valid JSON alone', () => {
        const res = normalizeToolArguments('{"a": bare text, "n": 42, "ok": true, "s": "quoted"}');
        expect(res.ok).toBe(true);
        if (!res.ok) return;
        const parsed = JSON.parse(res.args);
        expect(parsed).toEqual({ a: 'bare text', n: 42, ok: true, s: 'quoted' });
    });

    it('does not fire on well-formed JSON at all', () => {
        const good = '{"a":"already fine"}';
        expect(normalizeToolArguments(good)).toEqual({ ok: true, args: good });
    });

    it('still refuses a payload it cannot turn into real JSON', () => {
        // Genuinely truncated: no closing brace, so no boundary to trust.
        expect(normalizeToolArguments('{"creativeGoal": Add a white background at tim').ok).toBe(false);
    });
});
