/**
 * Password hashing — S-7.
 *
 * WHAT WAS WRONG
 * `hashPassword` was `sha256(password)`. Unsalted, unstretched, one round. That is
 * not a weak password hash, it is not a password hash at all: SHA-256 is built to
 * be fast, and the whole job of a password KDF is to be slow. Every identical
 * password produces an identical digest, so one rainbow table breaks every account
 * at once, and a modern GPU tries billions of candidates per second against it.
 *
 * S-9 turned that from a latent weakness into an active one — those hashes were
 * readable by anyone with the public anon key.
 *
 * WHY THIS SHIPS BEFORE THE SUPABASE AUTH MIGRATION
 * `AUTH_UNIFICATION_PLAN.md` §4 correctly says existing SHA-256 hashes cannot be
 * converted to bcrypt: the plaintext is gone. True, and it is about *existing*
 * rows. It says nothing about the accounts created between now and that migration,
 * and today every new signup still gets SHA-256. The debt is growing while we wait
 * for a decision about how to pay it off.
 *
 * So this fixes the flow, not the history. New passwords are salted and stretched.
 * Existing hashes keep verifying, and are upgraded in place the next time their
 * owner signs in successfully.
 *
 * WHY scrypt AND NOT bcrypt OR argon2
 * Both are better-known, and both are native modules — a compiled dependency in a
 * Vercel build, for a project whose build currently has none. `crypto.scrypt` is in
 * the Node standard library, is a memory-hard KDF designed for exactly this, and is
 * the recommendation OWASP gives when Argon2 is unavailable. Zero new dependencies
 * for a security fix is worth more here than the marginal difference between three
 * adequate KDFs.
 *
 * ON "UPGRADE ON LOGIN", WHICH LOOKS LIKE A REJECTED OPTION AND IS NOT
 * §4 rejected "capture the plaintext at next login and create the Supabase user
 * then", because it means handling plaintext specifically to feed a second system.
 * That rejection stands. This is a different thing: the login flow already has the
 * password in memory in order to verify it, and rehashing it into our own column
 * adds no new handling, no new system and no new storage. It is the standard
 * upgrade-in-place, and it is compatible with the chosen migration — legacy
 * sessions still ride to expiry.
 */
import crypto from 'crypto';

/**
 * Cost parameters. N=2^15 with r=8 costs ~32 MB and ~100 ms per hash on typical
 * serverless hardware — slow enough to make offline cracking expensive, fast enough
 * that a login does not feel like one. Encoded into every hash, so raising them
 * later does not invalidate anything already stored.
 */
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 32;
const SALT_LEN = 16;

/** Node's default maxmem is 32 MB, which N=2^15,r=8 sits exactly at. Give it room. */
const MAX_MEM = 64 * 1024 * 1024;

const PREFIX = 'scrypt';

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(
            password.normalize('NFKC'),
            salt,
            KEY_LEN,
            { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: MAX_MEM },
            (err, derived) => (err ? reject(err) : resolve(derived))
        );
    });
}

/**
 * Hash a new password.
 *
 * Format: `scrypt$N$r$p$<salt base64>$<hash base64>`. Self-describing on purpose —
 * the parameters travel with the hash, so a future cost increase is a change to the
 * constants above and nothing else.
 */
export async function hashPasswordSecure(password: string): Promise<string> {
    const salt = crypto.randomBytes(SALT_LEN);
    const derived = await scryptAsync(password, salt);
    return [
        PREFIX,
        SCRYPT_N,
        SCRYPT_R,
        SCRYPT_P,
        salt.toString('base64'),
        derived.toString('base64'),
    ].join('$');
}

/** A legacy hash is exactly 64 lowercase hex characters — a bare SHA-256 digest. */
export function isLegacyHash(stored: string): boolean {
    return /^[0-9a-f]{64}$/.test(stored);
}

/** Constant-time compare of two strings, safe when the lengths differ. */
function timingSafeEqualStr(a: string, b: string): boolean {
    const ab = Buffer.from(a, 'utf8');
    const bb = Buffer.from(b, 'utf8');
    // timingSafeEqual throws on a length mismatch, and the throw itself leaks the
    // comparison result. Hash both to a fixed width first, so every path costs the
    // same regardless of input length.
    const ah = crypto.createHash('sha256').update(ab).digest();
    const bh = crypto.createHash('sha256').update(bb).digest();
    return crypto.timingSafeEqual(ah, bh);
}

export interface VerifyResult {
    ok: boolean;
    /** True when the password was correct but the stored hash is the legacy format. */
    needsUpgrade: boolean;
}

/**
 * Verify a password against either hash format.
 *
 * Never throws on a malformed stored hash — a corrupt row must read as "wrong
 * password", not as a 500 that tells an attacker the row exists and is unusual.
 */
export async function verifyPassword(password: string, stored: string | null | undefined): Promise<VerifyResult> {
    if (!stored) return { ok: false, needsUpgrade: false };

    if (isLegacyHash(stored)) {
        const legacy = crypto.createHash('sha256').update(password).digest('hex');
        // Constant-time even here. The old code used `!==`, which returns as soon as
        // two characters differ; over a network that signal is mostly noise, but it
        // costs nothing to not emit it.
        return { ok: timingSafeEqualStr(legacy, stored), needsUpgrade: true };
    }

    const parts = stored.split('$');
    if (parts.length !== 6 || parts[0] !== PREFIX) return { ok: false, needsUpgrade: false };

    const [, nStr, rStr, pStr, saltB64, hashB64] = parts;
    const N = Number(nStr), r = Number(rStr), p = Number(pStr);
    if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
        return { ok: false, needsUpgrade: false };
    }

    try {
        const salt = Buffer.from(saltB64, 'base64');
        const expected = Buffer.from(hashB64, 'base64');

        // Reject degenerate lengths BEFORE deriving anything.
        //
        // `Buffer.from('!!!', 'base64')` is empty, not an error. Deriving a
        // zero-length key from it and comparing gives `timingSafeEqual(<>, <>)`,
        // which is **true** — so a row whose hash failed to decode would
        // authenticate every password. A corrupt row must be unusable, never
        // universally valid. (Found by the malformed-input test, which is exactly
        // why that test enumerates junk rather than asserting the happy path.)
        if (expected.length < KEY_LEN || salt.length < SALT_LEN) {
            return { ok: false, needsUpgrade: false };
        }

        const derived = await new Promise<Buffer>((resolve, reject) => {
            crypto.scrypt(
                password.normalize('NFKC'),
                salt,
                expected.length,
                { N, r, p, maxmem: MAX_MEM },
                (err, out) => (err ? reject(err) : resolve(out))
            );
        });
        return { ok: crypto.timingSafeEqual(derived, expected), needsUpgrade: false };
    } catch {
        return { ok: false, needsUpgrade: false };
    }
}
