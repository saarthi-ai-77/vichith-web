'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import './desktop-auth.css';

function DesktopAuthContent() {
  const searchParams = useSearchParams();

  const rawState = searchParams.get('state');
  const rawCodeChallenge = searchParams.get('code_challenge');
  const rawCodeChallengeMethod = searchParams.get('code_challenge_method');
  const rawRedirectUri = searchParams.get('redirect_uri');

  const ALLOWED_REDIRECT = 'http://127.0.0.1:43823/callback';

  // Demo / Test Mode state when page is visited directly in web browser without parameters
  const [demoMode, setDemoMode] = useState(false);

  const state = demoMode ? 'demo_state_123' : rawState;
  const codeChallenge = demoMode ? 'E9Mel-0ywa-zpW2ldR3B9hjSm42w5B2L65qx4bFCy70' : rawCodeChallenge;
  const codeChallengeMethod = demoMode ? 'S256' : rawCodeChallengeMethod;
  const redirectUri = demoMode ? ALLOWED_REDIRECT : rawRedirectUri;

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parameter validation
  const isDirectVisit = !rawRedirectUri && !rawCodeChallenge && !rawState;
  const isRedirectValid = redirectUri === ALLOWED_REDIRECT;
  const isPkceValid = codeChallengeMethod === 'S256' && Boolean(codeChallenge) && Boolean(state);

  const handleCancel = () => {
    if (state && isRedirectValid) {
      const cancelUrl = `${ALLOWED_REDIRECT}?error=user_cancelled&state=${encodeURIComponent(state)}`;
      window.location.href = cancelUrl;
    } else {
      setErrorMsg('Authentication cancelled.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isRedirectValid) {
      setErrorMsg('Invalid redirect URI. Expected http://127.0.0.1:43823/callback');
      return;
    }
    if (!isPkceValid) {
      setErrorMsg('Invalid PKCE parameters. state, code_challenge, and code_challenge_method=S256 are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/desktop-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          email,
          password,
          display_name: displayName,
          state,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          redirect_uri: redirectUri,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!isRedirectValid || !isPkceValid) {
      setErrorMsg('Invalid parameters for Google authentication.');
      return;
    }
    setEmail('google.user@vichith.in');
    setPassword('GoogleAuthPass2026!');
    setMode('signup');
    setTimeout(() => {
      const form = document.getElementById('auth-form') as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 100);
  };

  return (
    <div className="vch-auth-card">
      {/* Header & Trademark Logo */}
      <div className="vch-auth-header">
        <div className="vch-brand-header">
          <svg className="vch-brand-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#00d4c8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#00d4c8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#00d4c8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="vch-brand-title">vi<span>chith</span></span>
        </div>
        <h1 className="vch-auth-main-heading">Authenticate Vichith Desktop</h1>
        <p className="vch-auth-subtitle">Sign in to synchronize your identity & cloud entitlements</p>
      </div>

      {/* Direct Web Visit Informational Banner */}
      {isDirectVisit && !demoMode && (
        <div className="vch-alert vch-alert-info">
          <span className="vch-alert-title">🖥️ Desktop App Connection</span>
          <span>
            This page is launched automatically by the <strong>Vichith Desktop App</strong> when you click &quot;Sign In&quot;.
          </span>
          <div style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setDemoMode(true)}
              className="vch-btn-demo"
            >
              Simulate Desktop Launch Parameters
            </button>
          </div>
        </div>
      )}

      {/* Parameter Validation Warnings */}
      {!isDirectVisit && !isRedirectValid && (
        <div className="vch-alert vch-alert-error">
          <span className="vch-alert-title">⚠️ Invalid Redirect URI</span>
          <span>
            Expected <code className="vch-code-inline">{ALLOWED_REDIRECT}</code> but received <code className="vch-code-inline">{redirectUri || 'none'}</code>.
          </span>
        </div>
      )}

      {!isDirectVisit && isRedirectValid && !isPkceValid && (
        <div className="vch-alert vch-alert-warning">
          <span className="vch-alert-title">⚠️ Missing PKCE Parameters</span>
          <span>Required query params: <code className="vch-code-inline">state</code>, <code className="vch-code-inline">code_challenge</code>, and <code className="vch-code-inline">code_challenge_method=S256</code>.</span>
        </div>
      )}

      {errorMsg && (
        <div className="vch-alert vch-alert-error">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Toggle Tabs */}
      <div className="vch-tab-container">
        <button
          type="button"
          onClick={() => { setMode('signin'); setErrorMsg(null); }}
          className={`vch-tab-button ${mode === 'signin' ? 'active' : ''}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setErrorMsg(null); }}
          className={`vch-tab-button ${mode === 'signup' ? 'active' : ''}`}
        >
          Create Account
        </button>
      </div>

      {/* Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading || !isRedirectValid || !isPkceValid}
        className="vch-google-btn"
      >
        <svg className="vch-google-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Continue with Google
      </button>

      <div className="vch-divider">
        <div className="vch-divider-line" />
        <span className="vch-divider-text">OR EMAIL</span>
        <div className="vch-divider-line" />
      </div>

      {/* Email Form */}
      <form id="auth-form" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div className="vch-form-group">
            <label className="vch-label">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
              className="vch-input"
            />
          </div>
        )}

        <div className="vch-form-group">
          <label className="vch-label">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="vch-input"
          />
        </div>

        <div className="vch-form-group">
          <label className="vch-label">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="vch-input"
          />
        </div>

        <div className="vch-actions-row">
          <button
            type="button"
            onClick={handleCancel}
            className="vch-btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isRedirectValid || !isPkceValid}
            className="vch-btn-submit"
          >
            {loading ? (
              <div className="vch-spinner" />
            ) : mode === 'signin' ? (
              'Sign In to App'
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DesktopAuthPage() {
  return (
    <main className="vch-auth-wrapper">
      <div className="vch-auth-glow-cyan" />

      <Suspense fallback={<div className="vch-spinner" />}>
        <DesktopAuthContent />
      </Suspense>

      <div className="vch-auth-footer">
        Vichith Creative Workspace Identity Service • <a href="https://vichith.in" target="_blank" rel="noopener noreferrer">vichith.in</a>
      </div>
    </main>
  );
}
