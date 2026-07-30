/**
 * src/lib/env.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fail-closed access to server environment.
 *
 * Secrets never get a default. A missing API key must stop the request with a
 * clear error, not fall through to some placeholder that produces a confusing
 * downstream failure — or worse, a value committed to the repository.
 *
 * Read lazily at the call site, never at module load, so a missing variable
 * surfaces on the affected request instead of breaking the whole build.
 */

/** Read a required server-side secret. Throws if unset or blank. */
export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value || !value.trim()) {
        throw new Error(
            `Missing required environment variable ${name}. ` +
                `Set it in .env.local (development) or the deployment environment. See .env.example.`
        );
    }
    return value.trim();
}

/** Read an optional value with an explicit, non-secret default. */
export function optionalEnv(name: string, fallback = ''): string {
    const value = process.env[name];
    return value && value.trim() ? value.trim() : fallback;
}
