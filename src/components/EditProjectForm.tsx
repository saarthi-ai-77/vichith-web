'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slugify';

interface ProjectDetails {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  tags: string[];
  visibility: 'public' | 'unlisted' | 'private';
}

interface EditProjectFormProps {
  project: ProjectDetails;
  username: string;
}

export default function EditProjectForm({ project, username }: EditProjectFormProps) {
  const [title, setTitle] = useState(project.title || '');
  const [description, setDescription] = useState(project.description || '');
  const [tagsInput, setTagsInput] = useState(project.tags ? project.tags.join(', ') : '');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>(project.visibility || 'private');
  const [coverUrl, setCoverUrl] = useState(project.cover_url || '');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  // Compute live slug preview
  const liveSlug = slugify(title);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Project title is required.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await fetch('/api/projects/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          title: title.trim(),
          description: description.trim() || null,
          tags,
          visibility,
          cover_url: coverUrl.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Project updated successfully.');
        router.refresh();
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to update project.');
      }
    } catch (err) {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure? This cannot be undone.');
    if (!confirmed) return;

    setErrorMsg('');
    setSuccessMsg('');
    setDeleting(true);

    try {
      const res = await fetch('/api/projects/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Project deleted successfully.');
        router.refresh();
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to delete project.');
        setDeleting(false);
      }
    } catch (err) {
      setErrorMsg('A network error occurred. Please try again.');
      setDeleting(false);
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1rem'
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--text)',
          margin: 0,
          letterSpacing: '-0.02em'
        }}>
          Edit Project
        </h2>
        
        <a
          href={`/${username}/${project.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--cyan)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          View Project ↗
        </a>
      </div>

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
        {/* Title */}
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
            disabled={saving || deleting}
            onClick={handleDelete}
            style={{
              flex: 1,
              padding: '0.875rem',
              background: 'rgba(255, 95, 87, 0.1)',
              border: '1px solid #ff5f57',
              color: '#ff5f57',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Project'}
          </button>
          
          <button
            type="submit"
            disabled={saving || deleting}
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
