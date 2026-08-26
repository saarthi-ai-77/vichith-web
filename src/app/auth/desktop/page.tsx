'use client';

import React, { useState, Suspense, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const [tabTransitioning, setTabTransitioning] = useState(false);

  // Parameter validation
  const isDirectVisit = !rawRedirectUri && !rawCodeChallenge && !rawState;
  const isRedirectValid = redirectUri === ALLOWED_REDIRECT;
  const isPkceValid = codeChallengeMethod === 'S256' && Boolean(codeChallenge) && Boolean(state);

  const handleModeSwitch = (newMode: 'signin' | 'signup') => {
    if (newMode === mode) return;
    setTabTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      setErrorMsg(null);
      setTabTransitioning(false);
    }, 150); // Matches the blur transition duration roughly
  };

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
      setLoading(false);
    }
  };

  return (
    <div className="vch-auth-card" data-mounted={mounted}>
      {/* Header & Trademark Logo */}
      <div className="vch-auth-header vch-stagger-1">
        <div className="vch-brand-header">
          <svg className="vch-brand-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="var(--accent-cyan)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="var(--accent-cyan)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="var(--accent-cyan)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="vch-brand-title">vi<span>chith</span></span>
        </div>
        <h1 className="vch-auth-main-heading">Authenticate Desktop</h1>
        <p className="vch-auth-subtitle">Sign in to synchronize your identity & cloud entitlements</p>
      </div>

      <div className="vch-stagger-2">
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
              Expected <code>{ALLOWED_REDIRECT}</code> but received <code>{redirectUri || 'none'}</code>.
            </span>
          </div>
        )}

        {!isDirectVisit && isRedirectValid && !isPkceValid && (
          <div className="vch-alert vch-alert-warning">
            <span className="vch-alert-title">⚠️ Missing PKCE Parameters</span>
            <span>Required params: state, code_challenge, code_challenge_method=S256.</span>
          </div>
        )}

        {errorMsg && (
          <div className="vch-alert vch-alert-error" style={{ marginBottom: '16px' }}>
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Toggle Tabs */}
      <div className="vch-tab-container vch-stagger-2">
        <button
          type="button"
          onClick={() => handleModeSwitch('signin')}
          className={`vch-tab-button ${mode === 'signin' ? 'active' : ''}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('signup')}
          className={`vch-tab-button ${mode === 'signup' ? 'active' : ''}`}
        >
          Create Account
        </button>
      </div>

      <div className={`vch-form-container ${tabTransitioning ? 'transitioning' : ''}`} style={{ transition: 'filter 150ms ease, opacity 150ms ease', filter: tabTransitioning ? 'blur(4px)' : 'none', opacity: tabTransitioning ? 0.5 : 1 }}>
        {/* Email Form */}
        <form id="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="vch-stagger-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          </div>

          <div className="vch-actions-row vch-stagger-5">
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
    </div>
  );
}

export default function DesktopAuthPage() {
  return (
    <main className="vch-auth-wrapper">
      <div className="vch-auth-mesh" />

      <Suspense fallback={<div className="vch-spinner white" style={{ position: 'absolute' }} />}>
        <DesktopAuthContent />
      </Suspense>

      <div className="vch-auth-footer">
        Vichith Creative Workspace Identity Service • <a href="https://vichith.in" target="_blank" rel="noopener noreferrer">vichith.in</a>
      </div>
    </main>
  );
}
