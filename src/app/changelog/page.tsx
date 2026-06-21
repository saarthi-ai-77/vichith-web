'use client';

import React from 'react';

export default function ChangelogPage() {
  return (
    <div className="changelog-container">
      <div className="changelog-bg-glow"></div>
      
      <div className="changelog-header" style={{ marginBottom: '2rem' }}>
        <span className="changelog-kicker">Releases & Updates</span>
        <h1>Product Changelog</h1>
      </div>

      <div className="changelog-notice-card" style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        maxWidth: '640px',
        margin: '0 auto',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>📋</div>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '1rem',
          color: 'var(--text)'
        }}>
          Changelog will begin with next updates
        </h3>
        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--text-2)',
          lineHeight: '1.6',
          marginBottom: '0'
        }}>
          Previous changelog listings were written based on early development assumptions and have been removed to maintain absolute accuracy and transparency. As we release public beta updates, detailed release notes, bug fixes, and feature releases will be documented here.
        </p>
      </div>
    </div>
  );
}
