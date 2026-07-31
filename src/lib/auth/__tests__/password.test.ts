/**
 * Password hashing and verification — S-7.
 *
 * This is the code that decides whether someone gets into an account, so the
 * properties pinned here are the ones an auth bug would break silently: that a
 * wrong password never verifies, that the *old* hashes keep working during the
 * migration, that a correct legacy login reports it wants upgrading, and that a
 * malformed row reads as "wrong password" instead of throwing.
 *
 * Deliberately slow. scrypt at N=2^15 costs ~100 ms per call by design — that cost
 * IS the fix, and a test that mocked it away would be testing something else.
 */
import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { hashPasswordSecure, verifyPassword, isLegacyHash } from '../password';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

describe('new hashes', () => {
    it('verifies the correct password', async () => {
        const stored = await hashPasswordSecure('correct horse battery staple');
        const { ok, needsUpgrade } = await verifyPassword('correct horse battery staple', stored);
        expect(ok).toBe(true);
        expect(needsUpgrade).toBe(false);
    });

    it('rejects a wrong password', async () => {
        const stored = await hashPasswordSecure('correct horse battery staple');
        expect((await verifyPassword('Correct horse battery staple', stored)).ok).toBe(false);
        expect((await verifyPassword('', stored)).ok).toBe(false);
    });

    it('salts, so the same password never produces the same hash twice', async () => {
        // This is the whole difference from SHA-256: one rainbow table cannot break
        // two accounts that happen to share a password.
        const a = await hashPasswordSecure('same password');
        const b = await hashPasswordSecure('same password');
        expect(a).not.toBe(b);
        expect((await verifyPassword('same password', a)).ok).toBe(true);
        expect((await verifyPassword('same password', b)).ok).toBe(true);
    });

    it('carries its own cost parameters, so raising them later invalidates nothing', async () => {
        const stored = await hashPasswordSecure('x');
        const [prefix, N, r, p, salt, hash] = stored.split('$');
        expect(prefix).toBe('scrypt');
        expect(Number(N)).toBeGreaterThanOrEqual(16384);
        expect(Number(r)).toBeGreaterThan(0);
        expect(Number(p)).toBeGreaterThan(0);
        expect(Buffer.from(salt, 'base64').length).toBeGreaterThanOrEqual(16);
        expect(Buffer.from(hash, 'base64').length).toBe(32);
    });

    it('normalises unicode, so the same typed password works across input methods', async () => {
        // "é" composed vs decomposed are different byte strings for the same
        // character. Without NFKC a user could be locked out by their keyboard.
        const composed = 'été';
        const decomposed = 'été';
        const stored = await hashPasswordSecure(composed);
        expect((await verifyPassword(decomposed, stored)).ok).toBe(true);
    });
});

describe('legacy SHA-256 hashes, during the migration', () => {
    it('still verifies — nobody is locked out by the fix', async () => {
        const legacy = sha256('old password');
        const { ok, needsUpgrade } = await verifyPassword('old password', legacy);
        expect(ok).toBe(true);
        expect(needsUpgrade).toBe(true);
    });

    it('rejects a wrong password against a legacy hash', async () => {
        const legacy = sha256('old password');
        const { ok, needsUpgrade } = await verifyPassword('wrong', legacy);
        expect(ok).toBe(false);
        // No upgrade is signalled on failure — upgrading on a failed login would
        // rehash whatever the attacker typed.
        expect(needsUpgrade).toBe(true);
    });

    it('recognises the legacy format by shape', () => {
        expect(isLegacyHash(sha256('x'))).toBe(true);
        expect(isLegacyHash('scrypt$32768$8$1$c2FsdA==$aGFzaA==')).toBe(false);
        expect(isLegacyHash(sha256('x').toUpperCase())).toBe(false); // not our format
        expect(isLegacyHash('')).toBe(false);
    });

    it('upgrades to a hash that no longer reports needing an upgrade', async () => {
        // The loop the login route runs: verify legacy → rehash → verify again.
        const legacy = sha256('pw');
        expect((await verifyPassword('pw', legacy)).needsUpgrade).toBe(true);
        const upgraded = await hashPasswordSecure('pw');
        const after = await verifyPassword('pw', upgraded);
        expect(after.ok).toBe(true);
        expect(after.needsUpgrade).toBe(false);
    });
});

describe('malformed and missing stored hashes', () => {
    it.each([
        ['null', null],
        ['undefined', undefined],
        ['empty', ''],
        ['not our format', 'plaintext-password'],
        ['truncated scrypt', 'scrypt$32768$8$1$c2FsdA=='],
        ['non-numeric cost', 'scrypt$abc$8$1$c2FsdA==$aGFzaA=='],
        ['garbage base64', 'scrypt$32768$8$1$!!!$!!!'],
        // The one that mattered: '!!!' decodes to an EMPTY buffer, not an error.
        // Deriving a zero-length key and comparing gives timingSafeEqual(<>, <>)
        // === true, so this row would once have accepted any password at all.
        ['empty salt and hash', 'scrypt$32768$8$1$$'],
        ['hash shorter than the key length', 'scrypt$32768$8$1$c2FsdHNhbHRzYWx0c2E=$YWJj'],
    ])('reads %s as a wrong password rather than throwing', async (_label, stored) => {
        // A corrupt row must not 500. A 500 tells an attacker the account exists
        // and is unusual, which is information a failed login should not carry.
        await expect(verifyPassword('anything', stored as any)).resolves.toEqual({
            ok: false,
            needsUpgrade: false,
        });
    });
});
