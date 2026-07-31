/**
 * Per-IP throttling — S-5 (remainder).
 *
 * The properties pinned here are the ones that decide whether the throttle helps
 * or hurts: it must fail OPEN (the public sign-up form must not go down because a
 * count query did), it must never store a raw IP, and the boundary must be exact —
 * an off-by-one either rejects a legitimate first request or silently grants an
 * extra one.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const h = vi.hoisted(() => {
    const state = { count: 0 as number | null, countError: null as any, throwOnClient: false };
    const inserted: any[] = [];
    return { state, inserted };
});

vi.mock('../supabase', () => ({
    getSupabaseClient: () => {
        if (h.state.throwOnClient) throw new Error('no service role key');
        return {
            from: () => ({
                select: () => ({
                    eq: () => ({
                        eq: () => ({
                            gte: () => Promise.resolve({ count: h.state.count, error: h.state.countError }),
                        }),
                    }),
                }),
                insert: (rows: any[]) => {
                    h.inserted.push(...rows);
                    return Promise.resolve({ error: null });
                },
            }),
            rpc: () => Promise.resolve({ error: null }),
        };
    },
}));

import { checkRateLimit, BUCKETS, rateLimitedResponse } from '../rateLimit';

const req = (ip?: string) =>
    new Request('https://vichith.in/api/waitlist', {
        method: 'POST',
        headers: ip ? { 'x-forwarded-for': ip } : {},
    });

beforeEach(() => {
    h.state.count = 0;
    h.state.countError = null;
    h.state.throwOnClient = false;
    h.inserted.length = 0;
});

describe('the budget boundary', () => {
    it('allows a request when the window is empty', async () => {
        const r = await checkRateLimit(req('1.2.3.4'), BUCKETS.waitlist);
        expect(r.allowed).toBe(true);
    });

    it('allows the last request inside the budget', async () => {
        // limit 3, two already recorded → this is the third and must be allowed.
        h.state.count = BUCKETS.waitlist.limit - 1;
        expect((await checkRateLimit(req('1.2.3.4'), BUCKETS.waitlist)).allowed).toBe(true);
    });

    it('rejects the one that exceeds it', async () => {
        h.state.count = BUCKETS.waitlist.limit;
        const r = await checkRateLimit(req('1.2.3.4'), BUCKETS.waitlist);
        expect(r.allowed).toBe(false);
        expect(r.retryAfterSeconds).toBe(BUCKETS.waitlist.windowSeconds);
    });

    it('does not record a request it rejected', async () => {
        // Otherwise a blocked caller extends their own lockout by retrying, which
        // turns a throttle into a permanent ban for anyone who presses the button
        // twice.
        h.state.count = BUCKETS.waitlist.limit;
        await checkRateLimit(req('1.2.3.4'), BUCKETS.waitlist);
        expect(h.inserted).toHaveLength(0);
    });

    it('records a request it allowed', async () => {
        await checkRateLimit(req('1.2.3.4'), BUCKETS.waitlist);
        expect(h.inserted).toHaveLength(1);
        expect(h.inserted[0].bucket).toBe('waitlist');
    });
});

describe('privacy', () => {
    it('never stores the raw IP', async () => {
        await checkRateLimit(req('203.0.113.42'), BUCKETS.waitlist);
        const stored = JSON.stringify(h.inserted[0]);
        expect(stored).not.toContain('203.0.113.42');
        expect(h.inserted[0].ip_hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('maps the same IP to the same hash and different IPs to different hashes', async () => {
        await checkRateLimit(req('1.1.1.1'), BUCKETS.waitlist);
        await checkRateLimit(req('1.1.1.1'), BUCKETS.waitlist);
        await checkRateLimit(req('2.2.2.2'), BUCKETS.waitlist);
        expect(h.inserted[0].ip_hash).toBe(h.inserted[1].ip_hash);
        expect(h.inserted[0].ip_hash).not.toBe(h.inserted[2].ip_hash);
    });
});

describe('failing open', () => {
    it('allows the request when the count query errors', async () => {
        // The public sign-up form must not go down because a count failed.
        h.state.countError = { message: 'connection reset' };
        expect((await checkRateLimit(req('1.2.3.4'), BUCKETS.waitlist)).allowed).toBe(true);
    });

    it('allows the request when the client cannot be constructed', async () => {
        h.state.throwOnClient = true;
        expect((await checkRateLimit(req('1.2.3.4'), BUCKETS.waitlist)).allowed).toBe(true);
    });

    it('allows callers with no forwarded-for header', async () => {
        // Otherwise one missing proxy header rate-limits every such caller as a
        // single shared identity.
        const r = await checkRateLimit(req(), BUCKETS.waitlist);
        expect(r.allowed).toBe(true);
        expect(h.inserted).toHaveLength(0);
    });

    it('reads only the first entry of a forwarded-for chain', async () => {
        // The rest are proxies; treating the whole chain as the identity would give
        // every client behind a different proxy path its own budget.
        await checkRateLimit(req('9.9.9.9, 10.0.0.1, 10.0.0.2'), BUCKETS.waitlist);
        const a = h.inserted[0].ip_hash;
        h.inserted.length = 0;
        await checkRateLimit(req('9.9.9.9'), BUCKETS.waitlist);
        expect(h.inserted[0].ip_hash).toBe(a);
    });
});

describe('buckets', () => {
    it('gives every endpoint its own budget', async () => {
        const names = Object.values(BUCKETS).map((b) => b.name);
        expect(new Set(names).size).toBe(names.length);
    });

    it('sets a positive limit and window on each', () => {
        for (const b of Object.values(BUCKETS)) {
            expect(b.limit).toBeGreaterThan(0);
            expect(b.windowSeconds).toBeGreaterThan(0);
            // Longer than a day would outlive the cleanup sweep's retention and be
            // silently unenforceable.
            expect(b.windowSeconds).toBeLessThan(86_400);
        }
    });

    it('answers a rejection with 429 and Retry-After', async () => {
        const r = rateLimitedResponse({ allowed: false, retryAfterSeconds: 3600 });
        expect(r.init.status).toBe(429);
        expect(r.init.headers['Retry-After']).toBe('3600');
    });
});
