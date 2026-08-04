import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface ProjectPageProps {
  params: {
    username: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const username = decodeURIComponent(params.username).toLowerCase();
  const slug = decodeURIComponent(params.slug).toLowerCase();
  const supabase = createServerSupabaseClient();

  const { data: creator } = await supabase
    .from('creators')
    .select('id, username, display_name')
    .eq('username', username)
    .maybeSingle();

  if (!creator) return { title: 'Project Not Found | Vichith' };

  const { data: project } = await supabase
    .from('projects')
    .select('title, description, visibility, creator_id')
    .eq('creator_id', creator.id)
    .eq('slug', slug)
    .maybeSingle();

  if (!project) return { title: 'Project Not Found | Vichith' };

  // Security check for metadata preview
  const { data: { session } } = await supabase.auth.getSession();
  const isOwner = session?.user && session.user.id === project.creator_id;
  if (project.visibility === 'private' && !isOwner) {
    return { title: 'Project Not Found | Vichith' };
  }

  return {
    title: `${project.title} | by ${creator.display_name || creator.username} on Vichith`,
    description: project.description || `View project ${project.title} by @${creator.username} on Vichith.`,
    alternates: {
      canonical: `https://app.vichith.com/@${creator.username}/${slug}`,
    },
  };
}

// Simple relative time helper
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Simple duration formatter
function formatDuration(secs: number): string {
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  if (mins === 0) return `${remainingSecs}s`;
  return `${mins}m ${remainingSecs}s`;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const username = decodeURIComponent(params.username).toLowerCase();
  const slug = decodeURIComponent(params.slug).toLowerCase();
  const supabase = createServerSupabaseClient();

  // 1. Fetch creator
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (!creator) notFound();

  // 2. Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('slug', slug)
    .maybeSingle();

  if (!project) notFound();

  // 3. Security check: private projects visible to creator only
  const { data: { session } } = await supabase.auth.getSession();
  const isOwner = session?.user && session.user.id === project.creator_id;

  if (project.visibility === 'private' && !isOwner) {
    notFound();
  }

  // 4. Fetch commits (last 10)
  const { data: commits } = await supabase
    .from('commits')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem',
      paddingBottom: '4rem',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Project Header block */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
      }}>
        {/* Cover Image or Gradient Placeholder */}
        <div style={{
          height: '280px',
          position: 'relative',
          background: project.cover_url
            ? `url(${project.cover_url}) center/cover no-repeat`
            : 'linear-gradient(135deg, var(--cyan) 0%, #0d1e21 70%, var(--black) 100%)',
        }}>
          {isOwner && (
            <span style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(0,0,0,0.85)',
              border: '1px solid var(--border-hi)',
              color: project.visibility === 'private' ? '#ff5f57' : project.visibility === 'unlisted' ? '#ffb86c' : 'var(--cyan)',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {project.visibility}
            </span>
          )}
        </div>

        {/* Header Details */}
        <div style={{ padding: '2rem 2.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'var(--text)',
            margin: '0 0 1rem 0',
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
          }}>
            {project.title}
          </h1>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            marginTop: '1.5rem'
          }}>
            {/* Creator user badge */}
            <a
              href={`/${creator.username}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              {creator.avatar_url ? (
                <img
                  src={creator.avatar_url}
                  alt={creator.display_name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--cyan) 0%, var(--teal) 100%)',
                  color: 'var(--black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem'
                }}>
                  {creator.display_name ? creator.display_name[0].toUpperCase() : 'C'}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
                  {creator.display_name}
                </div>
                <div style={{ color: 'var(--cyan)', fontSize: '0.8rem', fontWeight: 500 }}>
                  @{creator.username}
                </div>
              </div>
            </a>

            {/* Meta Dates & Tags */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-3)' }}>
                Published {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              
              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {project.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-2)',
                        padding: '0.1rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description section */}
      {project.description && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2rem 2.5rem'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '1rem',
            letterSpacing: '-0.01em'
          }}>
            Project Description
          </h3>
          <p style={{
            color: 'var(--text-2)',
            fontSize: '1rem',
            lineHeight: '1.6',
            margin: 0,
            whiteSpace: 'pre-line'
          }}>
            {project.description}
          </p>
        </div>
      )}

      {/* Version History section */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '2rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text)',
          margin: 0,
          letterSpacing: '-0.01em'
        }}>
          Version History
        </h3>

        {!commits || commits.length === 0 ? (
          <div style={{
            background: 'var(--surface2)',
            border: '1px dotted var(--border-hi)',
            borderRadius: '12px',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: 'var(--text-3)'
          }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.75rem' }}>⏱</span>
            <p style={{ fontWeight: 600, color: 'var(--text-2)', margin: '0 0 0.5rem 0' }}>
              No versions saved yet.
            </p>
            <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
              Connect the Vichith editor to start tracking versions.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {commits.map((commit) => (
              <div
                key={commit.id}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
                    {commit.message}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-3)' }}>
                    <span>{getRelativeTime(commit.created_at)}</span>
                    {commit.metadata?.operation_count && (
                      <span>• {commit.metadata.operation_count} operations</span>
                    )}
                    {commit.metadata?.duration_secs && (
                      <span>• {formatDuration(Number(commit.metadata.duration_secs))} of edit time</span>
                    )}
                  </div>
                </div>

                {/* Restore button */}
                <button
                  disabled
                  title="Coming soon"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'not-allowed'
                  }}
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
