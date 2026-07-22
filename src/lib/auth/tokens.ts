import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'vichith_desktop_jwt_secret_key_2026_super_secure';

export interface TokenPayload {
  sub: string;
  email: string;
  display_name: string;
  exp: number; // Unix timestamp in SECONDS
  iat: number; // Unix timestamp in SECONDS
}

/**
 * Base64URL encode buffer/string
 */
function base64urlEncode(input: Buffer): string {
  return input
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Verifies S256 PKCE Code Verifier against Code Challenge
 * base64url(SHA256(code_verifier)) == code_challenge
 */
export function verifyPkceChallenge(codeVerifier: string, codeChallenge: string): boolean {
  if (!codeVerifier || !codeChallenge) return false;
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  const computedChallenge = base64urlEncode(hash);
  return computedChallenge === codeChallenge;
}

/**
 * Generates an Access Token (HMAC-SHA256 JWT) with 1-hour expiration
 * Returns access_token and unix timestamp (in SECONDS) for expires_at.
 */
export function createAccessToken(user: { id: string; email: string; display_name: string }): {
  access_token: string;
  expires_at: number; // UNIX SECONDS
} {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = nowInSeconds + 3600; // 1 hour TTL

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    display_name: user.display_name,
    exp: expiresAt,
    iat: nowInSeconds,
  };

  const encodedHeader = base64urlEncode(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64urlEncode(Buffer.from(JSON.stringify(payload)));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  const encodedSignature = base64urlEncode(signature);
  const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

  return {
    access_token: token,
    expires_at: expiresAt,
  };
}

/**
 * Verifies Access Token JWT and returns payload if valid
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = base64urlEncode(
      crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest()
    );

    if (signature !== expectedSignature) return null;

    const payloadJson = Buffer.from(encodedPayload, 'base64').toString('utf-8');
    const payload: TokenPayload = JSON.parse(payloadJson);

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowInSeconds) {
      return null; // Expired token
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Generates an opaque Refresh Token string
 */
export function createRefreshTokenString(): string {
  return `vch_rf_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Generates a single-use Authorization Code (TTL ≤60s)
 */
export function createAuthCodeString(): string {
  return `vch_code_${crypto.randomBytes(24).toString('hex')}`;
}
