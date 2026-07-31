/**
 * The route's platform ceiling must cover every capability timeout it declares.
 *
 * These two numbers live in different files and mean the same thing, which is
 * exactly the pair that drifts. Raising a capability timeout past `maxDuration`
 * produces the worst possible failure mode: short calls keep working, so the
 * self-test passes and everything looks connected, while the first genuinely long
 * request dies as a raw gateway timeout instead of the sanitised error the route
 * takes such care to build.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CAPABILITY_ROUTES } from '../provider';

/** Read the literal out of the route rather than importing it — the route pulls in
 *  Supabase and auth, none of which this needs, and the export is what deploys. */
function declaredMaxDuration(): number {
    const src = readFileSync(join(process.cwd(), 'src/app/api/ai/route.ts'), 'utf8');
    const match = src.match(/export const maxDuration\s*=\s*(\d+)/);
    if (!match) throw new Error('/api/ai does not export maxDuration');
    return Number(match[1]);
}

describe('capability timeouts vs the platform ceiling', () => {
    it('declares a maxDuration at all', () => {
        // Its absence is silent: the platform default is ~10-15s and nothing warns.
        expect(declaredMaxDuration()).toBeGreaterThan(0);
    });

    it('covers the longest capability timeout', () => {
        const ceilingMs = declaredMaxDuration() * 1000;
        const longest = Math.max(...Object.values(CAPABILITY_ROUTES).map((r) => r.timeoutMs));
        expect(longest).toBeLessThanOrEqual(ceilingMs);
    });

    it.each(Object.entries(CAPABILITY_ROUTES))(
        '%s fits inside the ceiling',
        (_capability, route) => {
            expect(route.timeoutMs).toBeLessThanOrEqual(declaredMaxDuration() * 1000);
        }
    );

    it('keeps every timeout positive and bounded — nothing may run forever', () => {
        for (const [capability, route] of Object.entries(CAPABILITY_ROUTES)) {
            expect(route.timeoutMs, capability).toBeGreaterThan(0);
        }
    });
});
