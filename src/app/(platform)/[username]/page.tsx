import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const username = decodeURIComponent(params.username).toLowerCase();
  const supabase = createServerSupabaseClient();
  const { data: creator } = await supabase
    .from('creators')
    .select('display_name, username, bio')
    .eq('username', username)
    .maybeSingle();

  if (!creator) {
    return {
      title: 'Creator Not Found | Vichith',
    };
  }

  return {
    title: `${creator.display_name} (@${creator.username}) | Vichith`,
    description: creator.bio || `View ${creator.display_name}'s professional video editing profile on Vichith.`,
    alternates: {
      canonical: `https://app.vichith.com/@${creator.username}`,
    },
  };
}

export default async function CreatorProfilePage({ params }: ProfilePageProps) {
  const username = decodeURIComponent(params.username).toLowerCase();
  const supabase = createServerSupabaseClient();

  // 1. Fetch creator details
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (!creator) {
    notFound();
  }

  // 2. Determine if the current viewer is the owner
  const { data: { session } } = await supabase.auth.getSession();
  const isOwner = session?.user && session.user.id === creator.id;

  // 3. Fetch projects
  let projectQuery = supabase
    .from('projects')
    .select('*')
    .eq('creator_id', creator.id);

  if (!isOwner) {
    // If not owner, only show public projects
    projectQuery = projectQuery.eq('visibility', 'public');
  }

  const { data: projects } = await projectQuery.order('updated_at', { ascending: false });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem',
      padding: '2rem 0',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {/* Profile Header Block */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
      }}>
        {/* Banner Gradient */}
        <div style={{
          height: '160px',
          background: 'linear-gradient(135deg, var(--cyan) 0%, #0d1e21 50%, var(--black) 100%)',
          position: 'relative'
        }}>
          {creator.verified && (
            <span style={{
              position: 'absolute',
              top: '1rem',
              right: '1.25rem',
              background: 'rgba(0, 212, 200, 0.1)',
              border: '1px solid var(--cyan)',
              color: 'var(--cyan)',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Verified Editor
            </span>
          )}
        </div>

        {/* Profile Details Container */}
        <div style={{
          padding: '0 2.5rem 2.5rem 2.5rem',
          position: 'relative',
          marginTop: '-50px'
        }}>
          {/* Avatar placement */}
          <div style={{ marginBottom: '1.5rem' }}>
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.display_name}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--surface)',
                  background: 'var(--surface2)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.4)'
                }}
              />
            ) : (
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--cyan) 0%, var(--teal) 100%)',
                color: 'var(--black)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '2rem',
                border: '4px solid var(--surface)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.4)'
              }}>
                {creator.display_name ? creator.display_name[0].toUpperCase() : 'C'}
              </div>
            )}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.25rem',
            fontWeight: 800,
            color: 'var(--text)',
            margin: '0 0 0.25rem 0',
            letterSpacing: '-0.02em'
          }}>
            {creator.display_name}
          </h1>
          
          <div style={{
            fontSize: '1rem',
            color: 'var(--cyan)',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            @{creator.username}
          </div>

          {creator.bio ? (
            <p style={{
              color: 'var(--text-2)',
              fontSize: '1.05rem',
              lineHeight: '1.6',
              margin: '0 0 2rem 0',
              whiteSpace: 'pre-line'
            }}>
              {creator.bio}
            </p>
          ) : (
            <p style={{
              color: 'var(--text-3)',
              fontStyle: 'italic',
              fontSize: '1rem',
              margin: '0 0 2rem 0'
            }}>
              No bio provided yet.
            </p>
          )}

          {/* Location & Website Meta */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            fontSize: '0.9rem',
            color: 'var(--text-2)'
          }}>
            {creator.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>📍</span>
                <span>{creator.location}</span>
              </div>
            )}
            
            {creator.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🔗</span>
                <a
                  href={creator.website.startsWith('http') ? creator.website : `https://${creator.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 500 }}
                >
                  {creator.website}
                </a>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-3)', marginLeft: 'auto' }}>
              <span>Joined</span>
              <span>{new Date(creator.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Projects Section */}
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--text)',
          marginBottom: '1.5rem',
          letterSpacing: '-0.02em'
        }}>
          Projects Portfolio
        </h2>

        {!projects || projects.length === 0 ? (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: 'var(--text-3)'
          }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>📁</span>
            {isOwner ? 'No projects yet. Create your first project.' : 'No projects published yet.'}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {projects.map((project) => (
              <a
                key={project.id}
                href={`/${creator.username}/${project.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, border-color 0.2s',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                className="project-card"
                >
                  {/* Cover URL or Placeholder */}
                  <div style={{
                    height: '180px',
                    position: 'relative',
                    background: project.cover_url
                      ? `url(${project.cover_url}) center/cover no-repeat`
                      : 'linear-gradient(135deg, rgba(0, 212, 200, 0.2) 0%, rgba(0,0,0,0.6) 100%)',
                  }}>
                    {isOwner && project.visibility !== 'public' && (
                      <span style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        background: 'var(--black)',
                        border: '1px solid var(--border-hi)',
                        color: project.visibility === 'private' ? '#ff5f57' : '#ffb86c',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>
                        🔒 {project.visibility}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: 'var(--text)',
                        margin: '0 0 0.5rem 0',
                        lineHeight: '1.3'
                      }}>
                        {project.title}
                      </h4>
                      {project.description && (
                        <p style={{
                          color: 'var(--text-2)',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          margin: '0 0 1rem 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {project.description}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                        {project.tags.slice(0, 3).map((tag: string, index: number) => (
                          <span
                            key={index}
                            style={{
                              background: 'var(--surface2)',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              padding: '0.15rem 0.5rem',
                              fontSize: '0.75rem',
                              color: 'var(--text-2)'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', alignSelf: 'center' }}>
                            +{project.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
