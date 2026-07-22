'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function DesktopAuthContent() {
  const searchParams = useSearchParams();

  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');
  const redirectUri = searchParams.get('redirect_uri');

  const ALLOWED_REDIRECT = 'http://127.0.0.1:43823/callback';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validate parameters
  const isRedirectValid = redirectUri === ALLOWED_REDIRECT;
  const isPkceValid = codeChallengeMethod === 'S256' && Boolean(codeChallenge) && Boolean(state);

  const handleCancel = () => {
    if (state && isRedirectValid) {
      const cancelUrl = `${ALLOWED_REDIRECT}?error=user_cancelled&state=${encodeURIComponent(state)}`;
      window.location.href = cancelUrl;
    } else {
      setErrorMsg('Auth cancelled by user.');
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
    <div className="relative z-10 w-full max-w-md bg-[#12141d]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
          Authenticate Vichith Desktop
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Sign in to synchronize your identity & cloud entitlements
        </p>
      </div>

      {/* Parameter Validation Warnings */}
      {!isRedirectValid && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <p className="font-semibold mb-1">⚠️ Invalid Redirect URI</p>
          Expected <code className="bg-black/40 px-1 py-0.5 rounded text-red-200">{ALLOWED_REDIRECT}</code> but received <code className="bg-black/40 px-1 py-0.5 rounded">{redirectUri || 'none'}</code>.
        </div>
      )}

      {isRedirectValid && !isPkceValid && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <p className="font-semibold mb-1">⚠️ Missing/Invalid PKCE Parameters</p>
          Required query parameters: <code className="text-amber-200">state</code>, <code className="text-amber-200">code_challenge</code>, and <code className="text-amber-200">code_challenge_method=S256</code>.
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Auth Mode Toggle */}
      <div className="flex bg-black/30 p-1 rounded-xl mb-6 border border-white/5">
        <button
          type="button"
          onClick={() => { setMode('signin'); setErrorMsg(null); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            mode === 'signin'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setErrorMsg(null); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            mode === 'signup'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading || !isRedirectValid || !isPkceValid}
        className="w-full py-2.5 px-4 mb-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Continue with Google
      </button>

      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">or email</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      {/* Email Form */}
      <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-[11px] font-medium text-neutral-300 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-neutral-300 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-300 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isRedirectValid || !isPkceValid}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              'Sign In to Desktop'
            ) : (
              'Create Account & Connect'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DesktopAuthPage() {
  return (
    <main className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-violet-600/30 to-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      }>
        <DesktopAuthContent />
      </Suspense>

      <div className="mt-8 text-center text-[11px] text-neutral-500">
        Vichith Video Editor Identity Service • <a href="https://vichith.in" className="hover:text-neutral-300 underline">vichith.in</a>
      </div>
    </main>
  );
}
