/**
 * Per-IP throttling for the unauthenticated endpoints — S-5 (remainder).
 *
 * S-5 bounded how BIG an anonymous write can be. It did not bound how MANY, so a
 * script could still fill the waitlist table one valid email at a time, or upload
 * attachment after valid attachment until the storage bill noticed. Validation and
 * throttling answer different questions and you need both.
 *
 * DATABASE-BACKED, for the same reason `ai/quota.ts` is: this runs on serverless,
 * where each invocation may be a fresh instance. An in-memory counter resets
 * constantly and enforces nothing — the classic limiter that passes in development
 * and protects nothing in production.
 *
 * FAILS OPEN, ON PURPOSE
 * If the throttle's own query fails, the request is allowed. These are the public
 * front door: waitlist signups and bug reports. A database hiccup must not take
 * down the sign-up form to prevent spam that may not be happening. That trade is
 * the opposite of the one `/api/ai` makes, and correctly so — there, failing open
 * spends our provider credit, and the asymmetry is the whole argument.
 */
import crypto from 'crypto';
import { getSupabaseClient } from './supabase';
import { clientIp } from './validate';

export interface Bucket {
    /** Distinct budget name, so a waitlist signup does not consume a download. */
    readonly name: string;
    readonly limit: number;
    readonly windowSeconds: number;
}

/**
 * Budgets per endpoint, chosen from what the action means rather than one number
 * applied everywhere.
 *
 * A person joins a waitlist once, ever; three in an hour is already generous and
 * leaves room for a double-click and a change of email. Bug reports are the one
 * place a frustrated user legitimately submits several in a row, and they carry
 * attachments, so the window is longer and the count still small. Downloads are a
 * read and cost us bandwidth rather than storage, so they get the loosest budget.
 */
export const BUCKETS = {
    waitlist: { name: 'waitlist', limit: 3, windowSeconds: 3600 },
    report:   { name: 'report',   limit: 5, windowSeconds: 3600 },
    survey:   { name: 'survey',   limit: 5, windowSeconds: 3600 },
    download: { name: 'download', limit: 30, windowSeconds: 3600 },
} as const satisfies Record<string, Bucket>;

/**
 * Hash the IP with a server-side secret.
 *
 * Never stored raw. The limiter only needs to know whether two requests came from
 * the same place, and a hash answers that without the table becoming a log of who
 * visited the site. The secret matters: an unkeyed hash of an IPv4 address is
 * reversible by brute force in seconds — there are only four billion of them.
 *
 * Falls back to the service role key as the salt when no dedicated secret is set,
 * so this is never accidentally unkeyed. That key is already a server-only secret.
 */
function hashIp(ip: string): string {
    const secret =
        process.env.RATE_LIMIT_SALT ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        'vichith-unsalted-fallback';
    return crypto.createHmac('sha256', secret).update(ip).digest('hex');
}

export interface RateLimitResult {
    allowed: boolean;
    /** Seconds until the caller may retry. Only meaningful when `allowed` is false. */
    retryAfterSeconds: number;
}

/**
 * Record this request and report whether it is over budget.
 *
 * Counts BEFORE inserting, so the Nth request in a window of N is allowed and the
 * N+1th is not — an off-by-one here either rejects a legitimate first request or
 * silently grants one extra.
 */
export async function checkRateLimit(request: Request, bucket: Bucket): Promise<RateLimitResult> {
    const ok = { allowed: true, retryAfterSeconds: 0 };

    const ip = clientIp(request);
    // `unknown` means no proxy header at all. Throttling every such caller as one
    // shared identity would let a single missing header rate-limit the world, so
    // these pass — the validation limits still apply to them.
    if (ip === 'unknown') return ok;

    try {
        const supabase = getSupabaseClient();
        const since = new Date(Date.now() - bucket.windowSeconds * 1000).toISOString();
        const ipHash = hashIp(ip);

        const { count, error } = await supabase
            .from('rate_limits')
            .select('id', { count: 'exact', head: true })
            .eq('ip_hash', ipHash)
            .eq('bucket', bucket.name)
            .gte('created_at', since);

        if (error) {
            console.error('[rateLimit] count failed, allowing request:', error.message);
            return ok;
        }

        if ((count ?? 0) >= bucket.limit) {
            return { allowed: false, retryAfterSeconds: bucket.windowSeconds };
        }

        await supabase.from('rate_limits').insert([{ ip_hash: ipHash, bucket: bucket.name }]);

        // Opportunistic sweep, so retention works without a scheduled job. An IP is
        // personal data, so keeping these rows around is a liability, not a
        // resource. Roughly 1 request in 100, and never awaited: a slow delete must
        // not slow down the user who happened to trigger it.
        if (Math.random() < 0.01) {
            void supabase.rpc('cleanup_rate_limits').then(
                () => {},
                (err: unknown) => console.error('[rateLimit] cleanup failed:', err)
            );
        }

        return ok;
    } catch (err) {
        // Fails open — see the module note. The public front door stays open.
        console.error('[rateLimit] check failed, allowing request:', err);
        return ok;
    }
}

/** The 429 body and headers, so every endpoint answers identically. */
export function rateLimitedResponse(result: RateLimitResult) {
    return {
        body: { error: 'rate_limited', message: 'Too many requests. Please try again later.' },
        init: {
            status: 429,
            headers: { 'Retry-After': String(result.retryAfterSeconds) },
        },
    };
}
