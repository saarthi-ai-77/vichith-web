'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CreatorProfile {
  username: string;
  display_name?: string;
  avatar_url?: string;
}

interface PlatformHeaderProps {
  creator: CreatorProfile | null;
  user: any | null;
}

export default function PlatformHeader({ creator, user }: PlatformHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vichith.com';

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 2.5rem',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <a href={siteUrl} style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: '1.25rem',
        letterSpacing: '-0.02em',
        color: 'var(--text)',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <img src="/favicon_io/android-chrome-512x512.png" alt="Vichith Logo" style={{ width: '24px', height: '24px' }} />
        <span>vi<span>chith</span></span>
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'background 0.2s',
              }}
            >
              {creator?.avatar_url ? (
                <img
                  src={creator.avatar_url}
                  alt={creator.display_name || 'Creator Avatar'}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--cyan) 0%, var(--teal) 100%)',
                  color: 'var(--black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {(creator?.display_name || user.email || 'C')[0].toUpperCase()}
                </div>
              )}
              <span>@{creator?.username || 'user'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>▼</span>
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 0.5rem)',
                background: 'var(--surface2)',
                border: '1px solid var(--border-hi)',
                borderRadius: '12px',
                width: '180px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                padding: '0.5rem',
                zIndex: 1010,
              }}>
                {creator?.username && (
                  <a
                    href={`/${creator.username}`}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      color: 'var(--text)',
                      textDecoration: 'none',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      textAlign: 'left',
                      transition: 'background 0.2s'
                    }}
                  >
                    Profile
                  </a>
                )}
                <a
                  href="/projects/new"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    color: 'var(--text)',
                    textDecoration: 'none',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.875rem',
                    borderRadius: '8px',
                    textAlign: 'left',
                    transition: 'background 0.2s'
                  }}
                >
                  New Project
                </a>
                <a
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    color: 'var(--text)',
                    textDecoration: 'none',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.875rem',
                    borderRadius: '8px',
                    textAlign: 'left',
                    transition: 'background 0.2s'
                  }}
                >
                  Settings
                </a>
                <div style={{ height: '1px', background: 'var(--border)', margin: '0.375rem 0' }}></div>
                <a
                  href="/api/auth/signout"
                  style={{
                    color: '#ff5f57',
                    textDecoration: 'none',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.875rem',
                    borderRadius: '8px',
                    textAlign: 'left',
                    transition: 'background 0.2s'
                  }}
                >
                  Sign out
                </a>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="/login" className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }}>Log in</a>
            <a href="/signup" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }}>Sign up</a>
          </div>
        )}
      </div>
    </header>
  );
}
