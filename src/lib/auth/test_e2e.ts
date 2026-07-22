import crypto from 'crypto';

// Helper for Base64URL
function base64urlEncode(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Generate PKCE Pair
export function generatePkcePair() {
  const codeVerifier = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  const codeChallenge = base64urlEncode(hash);
  return { codeVerifier, codeChallenge };
}

console.log('PKCE Pair Generator Test:');
const { codeVerifier, codeChallenge } = generatePkcePair();
console.log('Verifier:', codeVerifier);
console.log('Challenge:', codeChallenge);
