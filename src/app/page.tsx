'use client';
import React from 'react';

export default function LandingPage() {
  return (
    <main>
      {/* Navigation */}
      <nav className="nav-container">
        <a href="#" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src="/favicon_io/android-chrome-192x192.png" 
            alt="Vichith Logo" 
            style={{ width: '48px', height: '48px' }} 
          />
          <span className="logo-text" style={{ fontSize: '1.75rem' }}>Vichith</span>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#vision">Vision</a>
          <a href="#waitlist" className="btn-waitlist">Join Waitlist</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-glow"></div>
        <div className="hero-badge">
          <span>AI Native Generation</span>
        </div>
        <h1 className="hero-title">
          Create Videos. <span className="gradient-text">Don't Edit Them.</span>
        </h1>
        <p className="hero-sub">
          The world's first AI-native platform that transforms your raw ideas into cinematic content instantly. Stop clicking, start creating.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a href="#waitlist" className="btn-waitlist" style={{ padding: '16px 40px', fontSize: '1.125rem' }}>Get Early Access</a>
        </div>

        {/* Editor Mockup */}
        <div style={{ 
          marginTop: '80px', 
          width: '100%', 
          maxWidth: '1200px', 
          background: 'var(--surface)', 
          borderRadius: '24px', 
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: '0 60px 120px rgba(0,0,0,0.6)',
          position: 'relative'
        }}>
          <div style={{ background: 'var(--surface2)', padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }}></div>
            <span style={{ marginLeft: '12px', fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '500' }}>Vichith Editor — My New Video</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
            <div style={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              border: '1px solid var(--border)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}>
              <img 
                src="/images/editor-preview.png" 
                alt="Vichith Editor Preview" 
                style={{ width: '100%', height: 'auto', display: 'block' }} 
              />
            </div>
            {/* AI Assistant - Now Vertical */}
            <div style={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              border: '1px solid var(--border)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              background: 'var(--surface2)'
            }}>
              <img src="/images/ai-assistant.png" alt="AI Assistant" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features">
        <span className="section-label">Core Capabilities</span>
        <h2 className="section-title">Beyond Traditional Editing</h2>
        <p className="section-desc">We reimagined video creation from the ground up, replacing tedious timelines with intelligent agents.</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3 className="feature-title">Intent-Based Creation</h3>
            <p className="feature-text">Describe your vision in natural language. Our AI handles the cutting, pacing, and color grading automatically.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎥</div>
            <h3 className="feature-title">Instant B-Roll</h3>
            <p className="feature-text">Seamlessly integrate relevant visuals and assets generated in real-time to match your narrative perfectly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3 className="feature-title">Contextual Intelligence</h3>
            <p className="feature-text">AI agents that understand your brand voice, audience preferences, and platform requirements.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="waitlist" style={{ 
        textAlign: 'center', 
        background: 'var(--surface2)', 
        borderRadius: '40px', 
        padding: '100px 48px', 
        margin: '0 auto 120px',
        maxWidth: '1000px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 className="section-title">The Future of Content is Here</h2>
        <p className="section-desc" style={{ margin: '0 auto 40px' }}>Join the waitlist for early access to the Vichith beta. Space is limited as we scale our intelligence.</p>
        <div style={{ maxWidth: '480px', width: '100%', display: 'flex', gap: '12px' }}>
          <input type="email" placeholder="Enter your email" style={{ 
            flex: 1, 
            background: 'var(--bg)', 
            border: '1px solid var(--border)', 
            padding: '16px 20px', 
            borderRadius: '12px', 
            color: 'white' 
          }} />
          <button className="btn-waitlist" style={{ padding: '0 32px' }}>Join Now</button>
        </div>
        <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--teal)', fontWeight: '500' }}>Be the first to redefine video creation.</p>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '60px 48px', 
        borderTop: '1px solid var(--border)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div className="logo" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/favicon_io/favicon-32x32.png" 
            alt="Vichith" 
            style={{ width: '32px', height: '32px' }} 
          />
          <span className="logo-text" style={{ fontSize: '1.25rem' }}>Vichith</span>
        </div>
        <p className="footer-text">© 2026 Vichith Intelligence. All cinematic rights reserved.</p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" className="footer-text" style={{ textDecoration: 'none' }}>Twitter</a>
          <a href="#" className="footer-text" style={{ textDecoration: 'none' }}>Discord</a>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
