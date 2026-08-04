'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingForm() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Validate format local check
  const validateUsernameFormat = (val: string) => {
    if (!val) return '';
    if (val.length < 3) return 'Username must be at least 3 characters.';
    if (val.length > 30) return 'Username cannot exceed 30 characters.';
    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(val)) {
      return 'Only letters, numbers, and underscores are allowed.';
    }
    return '';
  };

  // Debounced API check
  useEffect(() => {
    if (!username) {
      setAvailable(null);
      setValidationError('');
      return;
    }

    const formatError = validateUsernameFormat(username);
    if (formatError) {
      setValidationError(formatError);
      setAvailable(null);
      return;
    }

    setValidationError('');
    setChecking(true);
    setAvailable(null);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/creators/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        if (res.ok) {
          setAvailable(data.available);
        } else {
          setValidationError(data.error || 'Failed to check availability.');
        }
      } catch (err) {
        setValidationError('Network error. Failed to check username.');
      } finally {
        setChecking(false);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !displayName) return;

    const formatError = validateUsernameFormat(username);
    if (formatError) {
      setValidationError(formatError);
      return;
    }

    if (available === false) {
      setValidationError('Username is already taken.');
      return;
    }

    setSubmitError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/creators/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          display_name: displayName.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/dashboard');
      } else {
        setSubmitError(data.error || 'Failed to complete profile. Please try again.');
      }
    } catch (err) {
      setSubmitError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
        Claim Your Username
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Complete your Vichith profile to claim your public URL.
      </p>

      {submitError && (
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
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="username" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Username</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-3)',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>@</span>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              placeholder="username"
              style={{
                width: '100%',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.75rem 1rem 0.75rem 2rem',
                color: 'var(--text)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
          
          {/* USERNAME AVAILABILITY / VALIDATION MESSAGES */}
          {validationError && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#ff5f57', marginTop: '0.375rem' }}>
              {validationError}
            </span>
          )}
          {checking && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.375rem' }}>
              Checking availability...
            </span>
          )}
          {available === true && !validationError && !checking && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--cyan)', marginTop: '0.375rem' }}>
              Username is available!
            </span>
          )}
          {available === false && !validationError && !checking && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#ff5f57', marginTop: '0.375rem' }}>
              Username is already taken.
            </span>
          )}
        </div>

        <div style={{ textAlign: 'left' }}>
          <label htmlFor="displayName" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Display Name</label>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="John Doe"
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
          disabled={submitting || checking || available === false || !username || !displayName}
          className="btn-primary"
          style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem' }}
        >
          {submitting ? 'Setting up profile...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
}
