import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Dashboard | Vichith Platform',
  description: 'Manage your creator identity, view profile, and configure settings.',
};

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Get profile
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!creator) {
    redirect('/onboarding');
  }

  // Get projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('creator_id', session.user.id)
    .order('updated_at', { ascending: false });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem',
      padding: '1rem 0'
    }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 212, 200, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '2.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--cyan)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Creator Space
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'var(--text)',
            marginBottom: '0.75rem',
            letterSpacing: '-0.03em',
            lineHeight: '1.1'
          }}>
            Welcome, {creator.display_name}
          </h1>
          <p style={{
            color: 'var(--text-2)',
            fontSize: '1rem',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}>
            Customize your professional portfolio identity, track revisions, and present your editing work to clients.
          </p>
        </div>
        <div style={{
          position: 'absolute',
          right: '-10%',
          top: '-20%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 212, 200, 0.08) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          zIndex: 1
        }}></div>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {/* Profile Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'var(--text)'
            }}>
              Your Identity Profile
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              {creator.avatar_url ? (
                <img
                  src={creator.avatar_url}
                  alt={creator.display_name}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                />
              ) : (
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--cyan) 0%, var(--teal) 100%)',
                  color: 'var(--black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem'
                }}>
                  {creator.display_name ? creator.display_name[0].toUpperCase() : 'C'}
                </div>
              )}
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem', margin: 0 }}>
                  {creator.display_name}
                </h4>
                <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                  @{creator.username}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              {creator.bio && (
                <p style={{ color: 'var(--text-2)', lineHeight: '1.5', margin: 0 }}>
                  {creator.bio}
                </p>
              )}
              {creator.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-3)' }}>
                  <span>📍</span> {creator.location}
                </div>
              )}
              {creator.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan)' }}>
                  <span>🔗</span> 
                  <a
                    href={creator.website.startsWith('http') ? creator.website : `https://${creator.website}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--cyan)', textDecoration: 'none' }}
                  >
                    {creator.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <a
              href={`/${creator.username}`}
              className="btn-primary"
              style={{
                flex: 1,
                textAlign: 'center',
                textDecoration: 'none',
                padding: '0.75rem 0',
                fontSize: '0.9rem'
              }}
            >
              Preview Public Profile
            </a>
            <a
              href="/settings"
              className="btn-ghost"
              style={{
                flex: 1,
                textAlign: 'center',
                textDecoration: 'none',
                padding: '0.75rem 0',
                fontSize: '0.9rem',
                border: '1px solid var(--border)'
              }}
            >
              Edit Details
            </a>
          </div>
        </div>

        {/* Info & Setup Status */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'var(--text)'
            }}>
              Beta Setup Progress
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Your Vichith Platform account is active. Next phases will roll out video timeline diff, portfolios, and client review dashboards.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--cyan)' }}>✔</span>
                <span style={{ color: 'var(--text)' }}>Account Created</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--cyan)' }}>✔</span>
                <span style={{ color: 'var(--text)' }}>Username Claimed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: creator.bio || creator.website ? 'var(--cyan)' : 'var(--text-3)' }}>
                  {creator.bio || creator.website ? '✔' : '○'}
                </span>
                <span style={{ color: creator.bio || creator.website ? 'var(--text)' : 'var(--text-3)' }}>
                  Bio & Contact Details Added
                </span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--surface2)',
            borderRadius: '8px',
            padding: '1rem',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
            color: 'var(--text-2)',
            marginTop: '1.5rem'
          }}>
            <strong>Public Profile Link:</strong>
            <div style={{
              marginTop: '0.5rem',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              color: 'var(--cyan)'
            }}>
              app.vichith.com/{creator.username}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Management Section */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '2.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text)',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Your Projects
          </h2>
          
          <a
            href="/projects/new"
            className="btn-primary"
            style={{
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              textDecoration: 'none'
            }}
          >
            + New Project
          </a>
        </div>

        {!projects || projects.length === 0 ? (
          <div style={{
            background: 'var(--surface2)',
            border: '1px dashed var(--border)',
            borderRadius: '12px',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: 'var(--text-3)'
          }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>🎬</span>
            <p style={{ fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.5rem' }}>
              No projects yet.
            </p>
            <p style={{ fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>
              Create your first project to showcase your video work.
            </p>
            <a
              href="/projects/new"
              className="btn-primary"
              style={{
                display: 'inline-block',
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                textDecoration: 'none'
              }}
            >
              Create Project
            </a>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-hi)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-3)', fontWeight: 600 }}>Project</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-3)', fontWeight: 600 }}>Visibility</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-3)', fontWeight: 600 }}>Last Updated</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-3)', fontWeight: 600 }}>Commits</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-3)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                    className="table-row-hover"
                  >
                    {/* Title */}
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                        {project.title}
                      </span>
                    </td>
                    
                    {/* Visibility */}
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: project.visibility === 'public'
                          ? 'rgba(0, 212, 200, 0.1)'
                          : project.visibility === 'unlisted'
                          ? 'rgba(255, 184, 108, 0.1)'
                          : 'rgba(255, 95, 87, 0.1)',
                        color: project.visibility === 'public'
                          ? 'var(--cyan)'
                          : project.visibility === 'unlisted'
                          ? '#ffb86c'
                          : '#ff5f57',
                        textTransform: 'capitalize'
                      }}>
                        {project.visibility}
                      </span>
                    </td>

                    {/* Updated At */}
                    <td style={{ padding: '1rem', color: 'var(--text-2)' }}>
                      {new Date(project.updated_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Commit Count */}
                    <td style={{ padding: '1rem', color: 'var(--text-2)', fontWeight: 500 }}>
                      {project.commit_count || 0}
                    </td>

                    {/* Action Links */}
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.75rem' }}>
                        <a
                          href={`/${creator.username}/${project.slug}`}
                          className="btn-ghost"
                          style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.8rem',
                            border: '1px solid var(--border)',
                            textDecoration: 'none',
                            borderRadius: '6px'
                          }}
                        >
                          View
                        </a>
                        <a
                          href={`/projects/${project.id}/edit`}
                          className="btn-ghost"
                          style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.8rem',
                            border: '1px solid var(--border)',
                            textDecoration: 'none',
                            borderRadius: '6px'
                          }}
                        >
                          Edit
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity section */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '2.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--text)',
          margin: 0,
          letterSpacing: '-0.02em'
        }}>
          Recent Activity
        </h2>
        
        <div style={{
          background: 'var(--surface2)',
          border: '1px dashed var(--border)',
          borderRadius: '12px',
          padding: '2.5rem',
          textAlign: 'center',
          color: 'var(--text-3)',
          fontSize: '0.85rem'
        }}>
          Recent video edits, rendering updates, and commits activity will show up here in Phase 3.
        </div>
      </div>
    </div>
  );
}
