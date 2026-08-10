/**
 * src/lib/auth/identity.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * STEP 1 of the auth unification (S-4): accept BOTH token systems.
 *
 * This is deliberately the first step, and it is the one whose absence broke the
 * previous attempt. Dual-accept makes every later step independently reversible:
 * the desktop and the website can change on different days, in either order, and a
 * mistake in one does not sign anybody out.
 *
 * ORDER: Supabase first, legacy second.
 *   • Supabase is where we are going, so new sessions take the fast path.
 *   • Legacy is still LIVE today — the sign-in button issues website JWTs — so it
 *     must keep working until telemetry shows nobody is using it.
 *
 * Removal is Step 6, gated on `issuer` telemetry reading zero legacy for a
 * sustained period. Not on a date.
 *
 * See Documentation/13_Architecture/AUTH_UNIFICATION_PLAN.md.
 */

import { verifyAccessToken } from './tokens';
import { getSupabaseClient } from '../supabase';

export type TokenIssuer = 'supabase' | 'legacy';

export interface Identity {
    /** Canonical user id. For Supabase this is `auth.users.id`. */
    readonly userId: string;
    readonly email: string;
    /** Which system verified this token. Recorded in telemetry to gate Step 6. */
    readonly issuer: TokenIssuer;
}

/** Extract a Bearer token, or null. */
export function bearerToken(request: Request): string | null {
    const header = request.headers.get('authorization');
    if (!header?.startsWith('Bearer ')) return null;
    const token = header.substring(7).trim();
    return token.length > 0 ? token : null;
}

/**
 * Verify a Supabase access token.
 *
 * Delegated to Supabase rather than verified locally on purpose: a local signature
 * check cannot see REVOCATION. A signed-out or disabled user would keep passing a
 * local check until their token expired, which defeats the main reason for moving
 * to Supabase in the first place.
 */
async function verifySupabase(token: string): Promise<Identity | null> {
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data?.user?.email) return null;
        
        return { 
            userId: data.user.id, 
            email: data.user.email, 
            issuer: 'supabase' 
        };
    } catch {
        // A Supabase outage must not take the legacy path down with it.
        return null;
    }
}

// Module-level cache for legacy ID -> auth_user_id mappings.
// Positive mappings (auth_user_id found) are cached indefinitely.
// Negative mappings (null) are cached for 5 minutes.
const legacyMappingCache = new Map<string, { id: string | null, expiresAt: number }>();

/** Verify the legacy website-minted HS256 JWT. */
async function verifyLegacy(token: string): Promise<Identity | null> {
    const payload = verifyAccessToken(token);
    if (!payload?.sub) return null;
    
    const legacyId = payload.sub;
    const email = payload.email ?? '';
    
    // Check cache
    const cached = legacyMappingCache.get(legacyId);
    if (cached && Date.now() < cached.expiresAt) {
        return {
            userId: cached.id || legacyId,
            email,
            issuer: 'legacy'
        };
    }
    
    // Cache miss or expired null: look up in database
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('users')
        .select('auth_user_id')
        .eq('id', legacyId)
        .single();
        
    if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found. Any other error means DB failure.
        // FAIL CLOSED on DB error to avoid fragmenting billing data.
        throw new Error('Database error during identity resolution.');
    }
    
    const authUserId = data?.auth_user_id || null;
    
    if (authUserId) {
        // Cache indefinitely (e.g. 10 years)
        legacyMappingCache.set(legacyId, { id: authUserId, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365 * 10 });
    } else {
        // Cache null for 5 minutes
        legacyMappingCache.set(legacyId, { id: null, expiresAt: Date.now() + 1000 * 60 * 5 });
    }
    
    return {
        userId: authUserId || legacyId,
        email,
        issuer: 'legacy'
    };
}

/**
 * Authenticate a request against EITHER identity system.
 *
 * Returns null when neither accepts the token — callers must not distinguish
 * "wrong issuer" from "invalid token" in their response, since that would tell an
 * attacker which system to attack.
 */
export async function authenticate(request: Request): Promise<Identity | null> {
    const token = bearerToken(request);
    if (!token) return null;

    // A Supabase JWT is always three dot-separated segments; so is ours, so shape
    // cannot disambiguate. Try Supabase first because that is the destination, and
    // fall back rather than branching on a guess.
    return (await verifySupabase(token)) ?? (await verifyLegacy(token));
}
