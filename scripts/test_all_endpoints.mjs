import crypto from 'crypto';

function base64urlEncode(buf) {
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function generatePkcePair() {
  const codeVerifier = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  const codeChallenge = base64urlEncode(hash);
  return { codeVerifier, codeChallenge };
}

async function runTests() {
  const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
  console.log(`Starting E2E API Verification against ${BASE_URL}...`);

  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = `st_${crypto.randomBytes(8).toString('hex')}`;
  const redirectUri = 'http://127.0.0.1:43823/callback';
  const testEmail = `test_desktop_${Date.now()}@vichith.in`;
  const testPassword = 'TestPassword2026!';
  const testName = 'Vichith Tester';

  // Step 1: POST /api/auth/desktop-login (Simulate desktop web auth submit)
  console.log('\n--- Step 1: Desktop Sign-Up & Auth Code Issuance ---');
  const loginRes = await fetch(`${BASE_URL}/api/auth/desktop-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      email: testEmail,
      password: testPassword,
      display_name: testName,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: redirectUri,
    }),
  });

  const loginData = await loginRes.json();
  console.log('Desktop Login Status:', loginRes.status);
  console.log('Desktop Login Response:', loginData);

  if (!loginRes.ok || !loginData.code) {
    throw new Error('Step 1 Failed!');
  }

  const authCode = loginData.code;

  // Step 2: POST /api/auth/exchange
  console.log('\n--- Step 2: Token Exchange (Code + PKCE Verifier) ---');
  const exchangeRes = await fetch(`${BASE_URL}/api/auth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: authCode,
      code_verifier: codeVerifier,
    }),
  });

  const exchangeData = await exchangeRes.json();
  console.log('Exchange Status:', exchangeRes.status);
  console.log('Exchange Response:', JSON.stringify(exchangeData, null, 2));

  if (!exchangeRes.ok || !exchangeData.access_token) {
    throw new Error('Step 2 Failed!');
  }

  const { access_token, refresh_token, expires_at, user } = exchangeData;

  // Step 3: GET /api/me
  console.log('\n--- Step 3: GET /api/me (Profile + Entitlements) ---');
  const meRes = await fetch(`${BASE_URL}/api/me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const meData = await meRes.json();
  console.log('Me Status:', meRes.status);
  console.log('Me Response:', JSON.stringify(meData, null, 2));

  if (!meRes.ok || !meData.entitlements) {
    throw new Error('Step 3 Failed!');
  }

  // Step 4: POST /api/usage
  console.log('\n--- Step 4: POST /api/usage (Usage Metering) ---');
  const usageRes = await fetch(`${BASE_URL}/api/usage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({
      events: [
        {
          id: `evt_${Date.now()}`,
          type: 'render_export',
          runtime: 'cloud',
          provider: 'vichith',
          model: 'video_v1',
          units: 1,
          credits_cost: 0,
          project_id: 'prj_test_101',
          meta: { resolution: '4K', fps: 60 },
          ts: Date.now(), // Unix Milliseconds
        },
      ],
    }),
  });

  const usageData = await usageRes.json();
  console.log('Usage Status:', usageRes.status);
  console.log('Usage Response:', JSON.stringify(usageData, null, 2));

  if (!usageRes.ok || usageData.accepted === undefined) {
    throw new Error('Step 4 Failed!');
  }

  // Step 5: POST /api/auth/refresh
  console.log('\n--- Step 5: POST /api/auth/refresh (Token Rotation) ---');
  const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refresh_token: refresh_token,
    }),
  });

  const refreshData = await refreshRes.json();
  console.log('Refresh Status:', refreshRes.status);
  console.log('Refresh Response:', JSON.stringify(refreshData, null, 2));

  if (!refreshRes.ok || !refreshData.access_token) {
    throw new Error('Step 5 Failed!');
  }

  console.log('\n✅ ALL 5 ENDPOINTS VERIFIED SUCCESSFULLY AND WORKING AS SPECIFIED!');
}

runTests().catch((err) => {
  console.error('\n❌ E2E Test Failed:', err);
  process.exit(1);
});
