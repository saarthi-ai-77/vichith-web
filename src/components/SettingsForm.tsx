'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreatorDetails {
  display_name: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
}

interface SettingsFormProps {
  initialCreator: CreatorDetails;
}

export default function SettingsForm({ initialCreator }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(initialCreator.display_name || '');
  const [bio, setBio] = useState(initialCreator.bio || '');
  const [location, setLocation] = useState(initialCreator.location || '');
  const [website, setWebsite] = useState(initialCreator.website || '');
  const [avatarUrl, setAvatarUrl] = useState(initialCreator.avatar_url || '');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Display name is required.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    try {
      const res = await fetch('/api/creators/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio.trim(),
          location: location.trim(),
          website: website.trim(),
          avatar_url: avatarUrl.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Profile settings saved successfully.');
        router.refresh(); // Refresh page data
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to update settings.');
      }
    } catch (err) {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-hi)',
      borderRadius: '16px',
      padding: '2.5rem',
      maxWidth: '600px',
      width: '100%',
      boxShadow: '0 40px 80px -10px rgba(0,0,0,0.8)'
    }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.75rem',
        fontWeight: 800,
        color: 'var(--text)',
        marginBottom: '0.5rem',
        letterSpacing: '-0.02em',
        textAlign: 'center'
      }}>
        Profile Settings
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '2rem', textAlign: 'center' }}>
        Update the public information visible on your creator profile.
      </p>

      {errorMsg && (
        <div style={{
          background: 'rgba(255, 95, 87, 0.05)',
          border: '1px solid rgba(255, 95, 87, 0.2)',
          borderRadius: '8px',
          color: '#ff5f57',
          padding: '0.75rem 1rem',
          fontSize: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{
          background: 'rgba(0, 212, 200, 0.05)',
          border: '1px solid rgba(0, 212, 200, 0.2)',
          borderRadius: '8px',
          color: 'var(--cyan)',
          padding: '0.75rem 1rem',
          fontSize: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="displayName" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Display Name</label>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name or team brand"
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
          <label htmlFor="bio" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Bio</label>
          <textarea
            id="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell clients about your specialized video editing skills..."
            style={{
              width: '100%',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--text)',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{ textAlign: 'left' }}>
            <label htmlFor="location" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Los Angeles, CA"
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
            <label htmlFor="website" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Website URL</label>
            <input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. portfolio.com"
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
        </div>

        <div style={{ textAlign: 'left' }}>
          <label htmlFor="avatarUrl" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Avatar Image URL</label>
          <input
            id="avatarUrl"
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="e.g. https://example.com/avatar.jpg"
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

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="btn-ghost"
            style={{ flex: 1, padding: '0.875rem', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ flex: 1, padding: '0.875rem' }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
