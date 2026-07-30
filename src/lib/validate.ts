/**
 * src/lib/validate.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Input validation for UNAUTHENTICATED endpoints.
 *
 * SECURITY FINDING S-5. `/api/waitlist`, `/api/report`, `/api/survey` and
 * `/api/download` accepted anonymous input with no length, type or format checks
 * before it reached Postgres.
 *
 * SQL injection was never the risk — the Supabase client parameterises. The risks
 * are the quieter ones: unbounded strings written straight to the database
 * (storage cost, and a single request can be megabytes), junk in the waitlist, and
 * no ceiling on how much a script can write.
 *
 * The rule these helpers encode: **never persist a string you did not bound.**
 */

import { hasControlChars } from './controlChars';

/** Sensible caps. Anything longer is not a real submission. */
export const LIMITS = {
    email: 254,          // RFC 5321 maximum
    name: 120,
    shortText: 500,
    longText: 5_000,     // bug report bodies
    url: 2_048,
} as const;

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

/**
 * Require a string within a length bound.
 *
 * Truncation is deliberately NOT offered. Silently storing a shortened version of
 * what someone submitted is its own bug — a truncated bug report reads as a
 * complete one.
 */
export function requireText(
    raw: unknown,
    field: string,
    maxLength: number,
    { optional = false }: { optional?: boolean } = {}
): ValidationResult<string> {
    if (raw === undefined || raw === null || raw === '') {
        return optional ? { ok: true, value: '' } : { ok: false, error: `${field} is required` };
    }
    if (typeof raw !== 'string') {
        return { ok: false, error: `${field} must be text` };
    }
    const value = raw.trim();
    if (!optional && value.length === 0) {
        return { ok: false, error: `${field} is required` };
    }
    if (value.length > maxLength) {
        return { ok: false, error: `${field} must be ${maxLength} characters or fewer` };
    }
    // Control characters have no place in a submitted field and are a common way to
    // corrupt logs and CSV exports downstream.
    if (hasControlChars(value)) {
        return { ok: false, error: `${field} contains invalid characters` };
    }
    return { ok: true, value };
}

/**
 * Validate an email.
 *
 * Deliberately permissive on shape — over-strict email regexes reject valid
 * addresses and are a well-known way to lose real signups. Bounded length and a
 * single `@` with something either side is the check that actually matters.
 */
export function requireEmail(raw: unknown, field = 'email'): ValidationResult<string> {
    const text = requireText(raw, field, LIMITS.email);
    if (!text.ok) return text;
    const value = text.value.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { ok: false, error: `${field} is not a valid email address` };
    }
    return { ok: true, value };
}

/** Reject an oversized body before parsing costs anything. */
export function bodyTooLarge(request: Request, maxBytes = 64_000): boolean {
    const declared = Number(request.headers.get('content-length') ?? '0');
    return Number.isFinite(declared) && declared > maxBytes;
}

/**
 * Best-effort client identity for per-IP throttling.
 *
 * Behind Vercel the socket address is a proxy, so `x-forwarded-for`'s FIRST entry
 * is the client. Spoofable in general — which is why this is used only for
 * coarse anti-spam on anonymous endpoints, never for authorization.
 */
export function clientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0]!.trim();
    return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
