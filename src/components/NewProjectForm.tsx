'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slugify';

interface NewProjectFormProps {
  username: string;
}

export default function NewProjectForm({ username }: NewProjectFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('private');
  const [coverUrl, setCoverUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  // Compute live slug preview
  const liveSlug = slugify(title);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Project title is required.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    // Convert comma-separated tags string to array
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          tags,
          visibility,
          cover_url: coverUrl.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Failed to create project.');
      }
    } catch (err) {
      setErrorMsg('A network error occurred. Please try again.');
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
      maxWidth: '640px',
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
        Create New Project
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '2rem', textAlign: 'center' }}>
        Publish a video project timeline or start tracking drafts in private mode.
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Title & Live URL Preview */}
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="title" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Project Title *</label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cinematic Showreel 2026"
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
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-3)',
            marginTop: '0.5rem',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            Your project URL: <span style={{ color: 'var(--cyan)' }}>app.vichith.com/@{username}/{liveSlug || '...'}</span>
          </div>
        </div>

        {/* Description */}
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="description" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Description</label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, revision feedback details, or process logs..."
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

        {/* Tags */}
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="tags" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="showreel, premiere, colorgrading"
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

        {/* Cover Image URL */}
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="coverUrl" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem', fontWeight: 600 }}>Cover Image URL</label>
          <input
            id="coverUrl"
            type="text"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
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

        {/* Visibility Selector */}
        <div style={{ textAlign: 'left' }}>
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.75rem', fontWeight: 600 }}>Visibility</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                style={{ marginTop: '0.2rem' }}
              />
              <div>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>Public</span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-3)' }}>Visible to everyone on your profile</span>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="visibility"
                value="unlisted"
                checked={visibility === 'unlisted'}
                onChange={() => setVisibility('unlisted')}
                style={{ marginTop: '0.2rem' }}
              />
              <div>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>Unlisted</span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-3)' }}>Only accessible via direct link</span>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                style={{ marginTop: '0.2rem' }}
              />
              <div>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>Private</span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-3)' }}>Only visible to you</span>
              </div>
            </label>
          </div>
        </div>

        {/* Buttons */}
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
            disabled={submitting}
            className="btn-primary"
            style={{ flex: 1, padding: '0.875rem' }}
          >
            {submitting ? 'Creating Project...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
