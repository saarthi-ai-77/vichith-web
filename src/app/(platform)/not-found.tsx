import React from 'react';

export default function PlatformNotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔍</div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        fontWeight: 800,
        marginBottom: '1rem',
        letterSpacing: '-0.02em'
      }}>
        Creator Not Found
      </h1>
      <p style={{
        color: 'var(--text-2)',
        maxWidth: '460px',
        lineHeight: '1.6',
        fontSize: '0.95rem',
        marginBottom: '2rem'
      }}>
        The creator profile or page you are trying to access does not exist or has been removed from the platform.
      </p>
      <a href="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '0.75rem 1.5rem' }}>
        Back to Dashboard
      </a>
    </div>
  );
}
