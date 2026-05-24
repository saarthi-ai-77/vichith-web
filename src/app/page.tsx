'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Reusable Layered Logo matching the screenshot
const LogoSVG = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L12 3L20 6L12 9L4 6Z" fill="url(#logo-grad)" stroke="#00e5c3" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M4 11L12 8L20 11L12 14L4 11Z" fill="url(#logo-grad)" stroke="#00e5c3" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M4 16L12 13L20 16L12 19L4 16Z" fill="url(#logo-grad)" stroke="#00e5c3" strokeWidth="1.2" strokeLinejoin="round" />
    <defs>
      <linearGradient id="logo-grad" x1="4" y1="3" x2="20" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgba(0, 229, 195, 0.45)" />
        <stop offset="1" stopColor="rgba(67, 97, 238, 0.45)" />
      </linearGradient>
    </defs>
  </svg>
);

// Feature details mapping for the Image Feature Explorer
const featuresData = {
  navigation: {
    num: "01",
    title: "Navigation Sidebar",
    desc: "Quickly toggle between Media assets, Audio isolator controls, Text captioning layouts, and spatial vector Adjustments. Kept compact to maximize timeline space.",
    zoomStyle: "scale(1.9) translate(40%, 14%)",
    x: "2.5%",
    y: "28%"
  },
  media: {
    num: "02",
    title: "Asset Library Panel",
    desc: "Manage project media, record voiceovers, and search local folders. Features instant metadata ingestion that tracks file formats, frame sizes, and durations.",
    zoomStyle: "scale(1.7) translate(24%, -2%)",
    x: "12.5%",
    y: "42%"
  },
  player: {
    num: "03",
    title: "Viewer Viewport",
    desc: "Real-time frame preview. Manipulate visual assets directly in the canvas using a bounding-box transform gizmo, with precise timecode feedback.",
    zoomStyle: "scale(1.3) translate(2%, 4%)",
    x: "49%",
    y: "38%"
  },
  ai: {
    num: "04",
    title: "AI Command Core",
    desc: "Execute context-aware command chains via the search bar or the '+ Vichith AI' button. Accelerate edits like transient beat matching or dialog segmentation directly on timeline tracks.",
    zoomStyle: "scale(1.8) translate(-14%, 22%)",
    x: "68%",
    y: "8%"
  },
  inspector: {
    num: "05",
    title: "Project Inspector",
    desc: "Direct access to sequence parameters, FPS, active GPU backends, and active clip transform metrics like translation offset, scale, and rotation.",
    zoomStyle: "scale(1.7) translate(-22%, 8%)",
    x: "89%",
    y: "32%"
  },
  timeline: {
    num: "06",
    title: "Timeline & Tracks",
    desc: "Frame-accurate timeline supporting V1 video clips, keyframe interpolation nodes, A1 audio waveforms, and text captions synced directly in a unified timeline model.",
    zoomStyle: "scale(1.5) translate(3%, -18%)",
    x: "45%",
    y: "82%"
  }
};

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Feature explorer tab state
  const [activeTab, setActiveTab] = useState<'navigation' | 'media' | 'player' | 'ai' | 'inspector' | 'timeline'>('navigation');

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok || data.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Unable to join the list.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  return (
    <main style={{ position: 'relative', overflowX: 'hidden' }}>
      
      {/* Soft background ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(0, 229, 195, 0.02) 0%, transparent 60%)', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(67, 97, 238, 0.015) 0%, transparent 60%)', filter: 'blur(140px)' }} />
      </div>

      {/* Sleek transparent navbar */}
      <nav className="nav-container">
        <a href="#" className="logo">
          <span style={{ display: 'flex', alignItems: 'center' }}><LogoSVG /></span>
          <span className="logo-text">Vichith</span>
        </a>
        <div className="nav-links">
          <a href="#fragmentation">Workflow Friction</a>
          <a href="#workspace">Product Workspace</a>
          <a href="#features">Platform Features</a>
          <a href="#waitlist" className="btn-waitlist-nav">Join Waitlist</a>
        </div>
      </nav>

      {/* Layer 1: Hero & Vision */}
      <header className="hero container">
        <div className="hero-glow" />
        <motion.div 
          className="hero-badge"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', boxShadow: '0 0 8px var(--teal)' }}></span>
          <span>A Unified Video Workflow Platform</span>
        </motion.div>
        
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          A Unified Environment <br />
          <span style={{ background: 'linear-gradient(135deg, var(--teal) 0%, #4361ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>For Professional Editing</span>
        </motion.h1>

        <motion.p 
          className="hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Stop context-switching between fragmented tools. Vichith unifies timeline editing, keyframe motion curves, audio clean-up, and speech captioning into one high-performance desktop application.
        </motion.p>

        <motion.div 
          className="hero-ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <a href="#waitlist" className="btn-primary">Join the Waitlist</a>
          <a href="#workspace" className="btn-secondary">Explore the Workspace</a>
        </motion.div>
      </header>

      {/* Layer 2: Workflow Fragmentation (Emotional Friction) */}
      <section id="fragmentation" className="container">
        <div className="section-header" style={{ maxWidth: '640px' }}>
          <span className="section-label">Workflow Friction</span>
          <h2 className="section-title">The Pain of Disjointed Tools</h2>
          <p className="section-desc">Traditional creative production splits your edit across five different environments. It breaks continuity and creates constant technical barriers.</p>
        </div>

        <div className="friction-layout">
          
          {/* Chaos Stack */}
          <motion.div 
            className="friction-column chaos"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="friction-badge">The Disjointed Stack</div>
            <h3 className="friction-title">Constant App Switching</h3>
            <p className="friction-desc">Editing a single sequence forces you to manually manage file links and exports across conflicting engines.</p>

            <div className="flow-lane-container">
              <div className="flow-lane">
                <div className="flow-lane-step">
                  <span className="flow-lane-num">1</span>
                  <span className="flow-lane-title">Cut footage in Premiere</span>
                </div>
                <span className="flow-lane-tag">Export XML</span>
              </div>
              
              <div className="flow-lane-arrow" />
              
              <div className="flow-lane">
                <div className="flow-lane-step">
                  <span className="flow-lane-num">2</span>
                  <span className="flow-lane-title">Animate keyframes in After Effects</span>
                </div>
                <span className="flow-lane-tag">Render Video</span>
              </div>

              <div className="flow-lane-arrow" />
              
              <div className="flow-lane">
                <div className="flow-lane-step">
                  <span className="flow-lane-num">3</span>
                  <span className="flow-lane-title">Isolate dialogue noise in Audition</span>
                </div>
                <span className="flow-lane-tag">Export WAV</span>
              </div>

              <div className="flow-lane-arrow" />
              
              <div className="flow-lane">
                <div className="flow-lane-step">
                  <span className="flow-lane-num">4</span>
                  <span className="flow-lane-title">Generate transcript captions in CapCut</span>
                </div>
                <span className="flow-lane-tag">Export SRT</span>
              </div>

              <div className="flow-lane-arrow" />
              
              <div className="flow-lane" style={{ background: 'rgba(239,68,68,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
                <div className="flow-lane-step">
                  <span className="flow-lane-num" style={{ background: '#ef4444', color: '#fff' }}>!</span>
                  <span className="flow-lane-title" style={{ color: 'var(--text-primary)' }}>Re-align files & fix desync issues</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>Workflow Break</span>
              </div>
            </div>
          </motion.div>

          {/* Unified Vichith Stack */}
          <motion.div 
            className="friction-column calm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="friction-badge">The Vichith Workflow</div>
            <h3 className="friction-title">Creative Continuity</h3>
            <p className="friction-desc">A single environment holding a single source of truth for your entire timeline structure.</p>

            <div className="flow-lane-container">
              <div className="flow-lane">
                <div className="flow-lane-step">
                  <span className="flow-lane-num">1</span>
                  <span className="flow-lane-title">Timeline Editing</span>
                </div>
                <span className="flow-lane-subtext">Assemble visual clips</span>
              </div>
              
              <div className="flow-lane-arrow unified" />
              
              <div className="flow-lane">
                <div className="flow-lane-step">
                  <span className="flow-lane-num">2</span>
                  <span className="flow-lane-title">Keyframe & Spatial Motion</span>
                </div>
                <span className="flow-lane-subtext">Direct canvas control</span>
              </div>

              <div className="flow-lane-arrow unified" />
              
              <div className="flow-lane">
                <div className="flow-lane-step">
                  <span className="flow-lane-num">3</span>
                  <span className="flow-lane-title">Dialogue Captions & Audio Isolation</span>
                </div>
                <span className="flow-lane-subtext">Context-aware layers</span>
              </div>

              <div className="flow-lane-arrow unified" />
              
              <div className="flow-lane">
                <div className="flow-lane-step">
                  <span className="flow-lane-num">4</span>
                  <span className="flow-lane-title">Supervised AI Orchestration</span>
                </div>
                <span className="flow-lane-subtext">Timeline acceleration</span>
              </div>

              <div className="flow-lane-arrow unified" />
              
              <div className="flow-lane" style={{ background: 'rgba(0,229,195,0.03)', borderColor: 'var(--teal-glow)' }}>
                <div className="flow-lane-step">
                  <span className="flow-lane-num">✓</span>
                  <span className="flow-lane-title" style={{ color: 'var(--teal)' }}>Direct Render</span>
                </div>
                <span className="flow-lane-tag">No Desync</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Layer 3: Workspace Explorer (Animate around Real UI Screenshots) */}
      <section id="workspace" className="container">
        <div className="section-header center">
          <span className="section-label">Product Showcase</span>
          <h2 className="section-title">Designed for Real Workflows</h2>
          <p className="section-desc" style={{ maxWidth: '600px', margin: '0 auto' }}>Explore the actual Vichith desktop editor layout. Click tabs or hotspot dots to zoom into specific workflow layers.</p>
        </div>

        {/* Feature Explorer Showcase Container */}
        <div className="showcase-container">
          
          {/* OS Window header */}
          <div className="showcase-window-header">
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255, 95, 87, 0.4)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(254, 188, 46, 0.4)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(40, 200, 64, 0.4)' }} />
            </div>
            
            <div className="window-title-bar">
              <LogoSVG size={14} />
              <span>Vichith Workspace — Project_01.vch</span>
            </div>

            <div style={{ width: '40px' }} /> {/* Balance space */}
          </div>

          {/* Viewport viewport */}
          <div className="screenshot-viewport">
            
            {/* The Real Screenshot */}
            <img 
              src="/images/vichith-web.png" 
              alt="Vichith Desktop Editor UI" 
              className="screenshot-image"
              style={{
                transform: featuresData[activeTab].zoomStyle
              }}
            />

            {/* Hotspots Overlay */}
            <div className="hotspot-overlay-layer">
              {Object.entries(featuresData).map(([key, data]) => (
                <div 
                  key={key}
                  className={`hotspot ${activeTab === key ? 'active' : ''}`}
                  style={{ left: data.x, top: data.y }}
                  onClick={() => setActiveTab(key as any)}
                >
                  <div className="hotspot-pulse" />
                  <div className="hotspot-inner" />
                </div>
              ))}
            </div>

          </div>

          {/* Selector Tabs */}
          <div className="explorer-tabs-container">
            {Object.entries(featuresData).map(([key, data]) => (
              <button 
                key={key}
                className={`explorer-tab-btn ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key as any)}
              >
                <span className="tab-num">Section {data.num}</span>
                <span className="tab-name">{data.title}</span>
              </button>
            ))}
          </div>

          {/* Details Card */}
          <div className="explorer-content-card">
            <h4 className="explorer-card-title">{featuresData[activeTab].title}</h4>
            <p className="explorer-card-desc">{featuresData[activeTab].desc}</p>
          </div>

        </div>
      </section>

      {/* Layer 4: Platform Features (Creator-Focused) */}
      <section id="features" style={{ background: '#030508', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Creative Speed</span>
            <h2 className="section-title">Built for Performance</h2>
            <p className="section-desc">Vichith is designed to keep you in the flow, replacing slow cloud exports and sluggish playback buffers with high-performance desktop tools.</p>
          </div>

          <div className="creator-specs-grid">
            <div className="creator-spec-card">
              <div className="creator-spec-icon">⚡</div>
              <h3 className="creator-spec-title">Zero Export Lags</h3>
              <p className="creator-spec-desc">Adjust subtitles, modify crop keyframes, and isolate audio layers on the same timeline without rendering proxy files or intermediate sequences.</p>
            </div>

            <div className="creator-spec-card">
              <div className="creator-spec-icon">🎯</div>
              <h3 className="creator-spec-title">Preserved Track Metadata</h3>
              <p className="creator-spec-desc">Keep transcripts, speech intervals, and motion paths structurally bound to visual frames. Rearranging cuts immediately adjusts matching text and audio.</p>
            </div>

            <div className="creator-spec-card">
              <div className="creator-spec-icon">🛡️</div>
              <h3 className="creator-spec-title">Creator-in-Control AI</h3>
              <p className="creator-spec-desc">Automate tedious pacing, transient slicing, and caption alignment. The AI operates directly on your tracks under your visual supervision.</p>
            </div>

            <div className="creator-spec-card">
              <div className="creator-spec-icon">💻</div>
              <h3 className="creator-spec-title">Desktop-Native Efficiency</h3>
              <p className="creator-spec-desc">A lightweight desktop editor designed to load instantly and run locally on your workstation, leaving CPU and RAM free for your footage rendering.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Layer 5: Waitlist & Join */}
      <section id="waitlist" className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <span className="section-label">Early Adopter Cohorts</span>
          <h2 className="section-title">Redefine Your Creative Workflow</h2>
          <p className="section-desc">We are currently hosting private preview releases of the desktop client. Sign up to secure early access and update announcements.</p>
        </div>

        <div className="waitlist-card">
          <h3 className="waitlist-title">Secure Early Access</h3>
          <p className="waitlist-desc">A premium desktop video editing workspace designed to streamline creative orchestration. No browser wrappers, no export desync.</p>
          
          <form className="waitlist-form" onSubmit={handleWaitlistSubmit}>
            <input 
              type="email" 
              className="waitlist-input" 
              placeholder="Enter your professional email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading' || status === 'success'}
            />
            <button 
              type="submit" 
              className="btn-waitlist-submit"
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined!' : 'Join Now'}
            </button>
          </form>

          <AnimatePresence>
            {status === 'success' && (
              <motion.p 
                className="waitlist-success-text"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                ✓ You have been added to the waitlist queue.
              </motion.p>
            )}
            {status === 'error' && (
              <motion.p 
                className="waitlist-error-text"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                ✗ {errorMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container footer-inner">
          <a href="#" className="logo" style={{ fontSize: '1.1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}><LogoSVG size={22} /></span>
            <span className="logo-text">Vichith</span>
          </a>

          {/* Quick keyboard shortcuts list */}
          <div className="footer-shortcuts">
            <span className="shortcut-pill">Space = Play/Pause</span>
            <span className="shortcut-pill">C = Blade Tool</span>
            <span className="shortcut-pill">V = Select Tool</span>
            <span className="shortcut-pill">Ctrl+K = Quick Actions</span>
          </div>

          <div className="footer-copy">
            © 2026 Vichith. Built for creative speed.
          </div>
        </div>
      </footer>

    </main>
  );
}
