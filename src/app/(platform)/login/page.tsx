'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        const { data: creator } = await supabase
          .from('creators')
          .select('username')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!creator) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) setErrorMsg(error.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication error.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-hi)',
        borderRadius: '16px',
        padding: '2.5rem',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 40px 80px -10px rgba(0,0,0,0.8)',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          Welcome Back
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Log in to manage your Vichith creator profile.
        </p>

        {errorMsg && (
          <div style={{
            background: 'rgba(255, 95, 87, 0.05)',
            border: '1px solid rgba(255, 95, 87, 0.2)',
            borderRadius: '8px',
            color: '#ff5f57',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Email Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--text)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--text)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="btn-ghost"
          style={{
            width: '100%',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            border: '1px solid var(--border)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.56-1.56 2.95-3.24 3.51v2.9h5.13c3-2.76 4.77-6.84 4.77-11.64c0-.77-.07-1.5-.22-2.18z"/>
            <path fill="currentColor" d="M12.18 21.43c2.75 0 5.06-.92 6.75-2.5l-5.13-2.9c-.81.55-1.85.88-3.06.88c-2.94 0-5.43-1.99-6.32-4.67H1.1v3.01c2.14 4.29 6.57 7.18 11.08 7.18z"/>
            <path fill="currentColor" d="M5.86 12.24a7.08 7.08 0 0 1 0-2.28V6.95H1.1a11.94 11.94 0 0 0 0 10.58l4.76-3.79c-.1-.49-.15-.99-.15-1.5z"/>
            <path fill="currentColor" d="M12.18 5.76c1.88 0 3.32.78 4.15 1.5l3.1-3.1A11.75 11.75 0 0 0 12.18.57C7.67.57 3.24 3.46 1.1 7.75l4.76 3.79c.89-2.68 3.38-4.67 6.32-4.67z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '1.75rem', margin: '1.75rem 0 0 0' }}>
          Don't have an account? <a href="/signup" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}
