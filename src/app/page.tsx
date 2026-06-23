'use client';

import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState("We'll send updates on new releases.");

  // Timeline playhead position state
  const [cursorPos, setCursorPos] = useState(47);

  // Survey Modal State
  const [showSurvey, setShowSurvey] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [surveyRole, setSurveyRole] = useState('');
  const [surveySource, setSurveySource] = useState('');
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const [surveySuccess, setSurveySuccess] = useState(false);

  // IntersectionObserver reveals
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));

    // Immediately reveal hero fold
    document.querySelectorAll('#hero .reveal').forEach(el => {
      el.classList.add('visible');
    });

    return () => observer.disconnect();
  }, []);

  // Timeline cursor simulation loop
  useEffect(() => {
    let dir = 1;
    const interval = setInterval(() => {
      setCursorPos(prev => {
        let next = prev + dir * 0.3;
        if (next > 90 || next < 5) {
          dir *= -1;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Download warning trigger
  const handleDownload = () => {
    setShowWarning(true);
  };

  // Actual download execution after passing warning
  const executeDownload = () => {
    setShowWarning(false);

    // Trigger direct download of the installer executable
    window.location.href = 'https://github.com/saarthi-ai-77/vichith-updater/releases/download/v0.5.0/Vichith_0.5.0_x64-setup.exe';

    // Log download in database
    fetch('/api/download', { method: 'POST' }).catch((err) => console.error('Failed to log download:', err));

    // Track analytics click
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', { name: 'download_click' });
    }

    // Open Survey Modal
    setShowSurvey(true);
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyRole || !surveySource) return;
    setSurveySubmitting(true);

    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: surveyRole, source: surveySource }),
      });
      if (res.ok) {
        setSurveySuccess(true);
        setTimeout(() => {
          setShowSurvey(false);
          setSurveySuccess(false);
          setSurveyRole('');
          setSurveySource('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setSurveySuccess(true);
      setTimeout(() => {
        setShowSurvey(false);
        setSurveySuccess(false);
      }, 2000);
    } finally {
      setSurveySubmitting(false);
    }
  };

  // Follow updates newsletter submission
  const handleNewsletterSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setNewsletterStatus('error');
      setNewsletterMsg('Please enter a valid email address.');
      return;
    }
    setNewsletterStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok || data.success) {
        setNewsletterStatus('success');
        setNewsletterMsg(`Subscribed successfully!`);
        setEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMsg(data.error || 'Subscription failed.');
      }
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterMsg('Network error. Please try again.');
    }
  };

  return (
    <>
      {/* HERO */}
      <section id="hero">
        <div className="hero-bg-glow"></div>
        <div className="hero-bg-glow2"></div>
        <div className="hero-badge reveal">
          <span className="dot"></span>Beta 0.5.0 Available
        </div>
        <h1 className="reveal reveal-delay-1">
          Vichith Beta
        </h1>
        <p className="hero-tagline-sub reveal reveal-delay-1">
          A new editor for modern video workflows.
        </p>
        <p className="hero-sub reveal reveal-delay-2">
          Built with creators. Improved with creators.<br />
          We're opening the first public beta and inviting creators, editors, filmmakers, and storytellers to help shape what comes next.
        </p>
        <div className="hero-actions reveal reveal-delay-3">
          <button onClick={handleDownload} className="btn-primary">
            Download Beta
          </button>
          <a href="https://discord.gg/MSeSsbgD" target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
            </svg>
            Join Discord
          </a>
        </div>
        <div className="hero-metadata reveal reveal-delay-3">
          <span>Beta Release</span>
          <span className="divider">·</span>
          <span>Version 0.5.0</span>
          <span className="divider">·</span>
          <span>Windows Available</span>
        </div>
      </section>

      {/* DOWNLOAD SECTION */}
      <section id="download">
        <div className="container-sm">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-kicker">Get Vichith</div>
            <h2>Download Public Beta</h2>
            <div className="download-community-callout" style={{ marginTop: '1.5rem', padding: '1.25rem', border: '1px solid var(--border-hi)', borderRadius: '8px', background: 'var(--surface2)', fontSize: '0.9375rem', color: 'var(--text-2)', lineHeight: '1.6', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
              There is a lot more to build. This beta access is just to build the community and get feedback from real users to make Vichith a better product. So if you are an editor, creator, or a builder, you can try Vichith and if interested can contribute to Vichith as well.
            </div>
          </div>

          <div className="download-card reveal">
            <div className="download-grid">
              <div className="download-details">
                <div className="download-row">
                  <span className="label">Current Version:</span>
                  <span className="val">Beta 0.5.0</span>
                </div>
                <div className="download-row">
                  <span className="label">Release Date:</span>
                  <span className="val">June 20, 2026</span>
                </div>
                <div className="download-row">
                  <span className="label">File Size:</span>
                  <span className="val">~101 MB</span>
                </div>
                <div className="download-row">
                  <span className="label">Platform:</span>
                  <span className="val">Windows 10 / 11 (64-bit)</span>
                </div>
              </div>
              <div className="download-action-cell">
                <button onClick={handleDownload} className="btn-primary" style={{ width: '100%' }}>
                  Download for Windows
                </button>
                <div className="download-stats">
                  <span className="stat-dot"></span>12 active builders this week
                </div>
              </div>
            </div>

            {/* Notice Card */}
            <div className="notice-card">
              <div className="notice-icon">🛈</div>
              <div className="notice-body">
                <p>
                  <strong>Vichith is distributed directly by the Vichith team.</strong>
                </p>
                <p>
                  Because this beta build is not yet code-signed, Windows may display security warnings during installation. This is expected behavior for unsigned software.
                </p>
                <a href="/download-guide" className="notice-link">
                  View Installation Guide &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BETA WARNING MODAL POPUP */}
      {showWarning && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <button onClick={() => setShowWarning(false)} className="modal-close-btn">&times;</button>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Beta Version Notice</h3>
            </div>
            
            <p style={{ color: 'var(--text-2)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.25rem', textAlign: 'center' }}>
              Vichith is currently in active development. There are still many features to build and bugs to resolve.
            </p>
            
            <p style={{ color: 'var(--text-2)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>
              Please do NOT use Vichith for your primary editing projects. We encourage you to explore, test the editor, and report any issues or suggestions you encounter.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={executeDownload} 
                className="btn-primary" 
                style={{ width: '100%', padding: '0.875rem' }}
              >
                Proceed to Download
              </button>
              
              <a 
                href="https://discord.gg/MSeSsbgD" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-ghost" 
                style={{ width: '100%', padding: '0.875rem', textAlign: 'center', display: 'block', textDecoration: 'none' }}
              >
                Join Discord Community
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SURVEY MODAL POPUP */}
      {showSurvey && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button onClick={() => setShowSurvey(false)} className="modal-close-btn">&times;</button>
            {surveySuccess ? (
              <div className="modal-success">
                <div className="success-icon">✓</div>
                <h3>Thank you!</h3>
                <p>Your responses help us improve Vichith and fuel our developer updates.</p>
              </div>
            ) : (
              <form onSubmit={handleSurveySubmit}>
                <h3>Thank you for downloading Vichith!</h3>
                <p className="modal-sub">Help us tailor your beta experience by answering two quick questions.</p>

                <div className="modal-group">
                  <label>What best describes you?</label>
                  <select
                    value={surveyRole}
                    onChange={(e) => setSurveyRole(e.target.value)}
                    required
                    className="modal-select"
                  >
                    <option value="">Select a description...</option>
                    <option value="Creator">Creator</option>
                    <option value="Editor">Editor</option>
                    <option value="YouTuber">YouTuber</option>
                    <option value="Filmmaker">Filmmaker</option>
                    <option value="Student">Student</option>
                    <option value="Agency">Agency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="modal-group">
                  <label>How did you discover Vichith?</label>
                  <select
                    value={surveySource}
                    onChange={(e) => setSurveySource(e.target.value)}
                    required
                    className="modal-select"
                  >
                    <option value="">Select a source...</option>
                    <option value="Product Hunt">Product Hunt</option>
                    <option value="X">X (formerly Twitter)</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Discord">Discord</option>
                    <option value="Friend">Friend / Word of Mouth</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} disabled={surveySubmitting}>
                  {surveySubmitting ? 'Saving...' : 'Submit & Finish'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PROBLEM / SOLUTION */}
      <section id="problem">
        <div className="container">
          <div className="problem-grid">
            <div>
              <div className="section-kicker reveal">The Problem</div>
              <h2 className="reveal reveal-delay-1">Creators live inside<br />five broken tools.</h2>
              <p className="lead reveal reveal-delay-2" style={{ marginTop: '1.25rem' }}>
                Every workflow jump costs time, focus, and creative momentum. You export. You import. You switch. You start over.
              </p>
              <div className="tools-chaos reveal reveal-delay-3" style={{ marginTop: '2rem' }}>
                <div className="tool-tag strikethrough">
                  <div className="tool-icon" style={{ background: '#ff5f5720', color: '#ff5f57' }}>AI</div>
                  AI Video Generator
                </div>
                <div className="arrow-chaos">↓ export · re-upload</div>
                <div className="tool-tag strikethrough">
                  <div className="tool-icon" style={{ background: '#ffbd2e20', color: '#ffbd2e' }}>Ed</div>
                  Video Editor
                </div>
                <div className="arrow-chaos">↓ export · switch tabs</div>
                <div className="tool-tag strikethrough">
                  <div className="tool-icon" style={{ background: '#28ca4120', color: '#28ca41' }}>CC</div>
                  Caption Tool
                </div>
                <div className="arrow-chaos">↓ export · re-import</div>
                <div className="tool-tag strikethrough">
                  <div className="tool-icon" style={{ background: '#0091a820', color: '#00d4c8' }}>🎵</div>
                  Audio & Music
                </div>
                <div className="arrow-chaos">↓ export one more time</div>
                <div className="tool-tag strikethrough">
                  <div className="tool-icon" style={{ background: '#a855f720', color: '#d08aff' }}>Im</div>
                  Image Generator
                </div>
              </div>
            </div>
            <div className="reveal reveal-delay-2">
              <div className="vichith-unify">
                <div className="unify-label">With Vichith</div>
                <div className="unify-flow">
                  <div className="flow-step">
                    <div className="flow-num">1</div>
                    <div className="flow-text"><strong>Describe your video</strong> — via text prompt or voice</div>
                  </div>
                  <div className="flow-step">
                    <div className="flow-num">2</div>
                    <div className="flow-text"><strong>AI generates a timeline</strong> — structured, editable, intelligent</div>
                  </div>
                  <div className="flow-step">
                    <div className="flow-num">3</div>
                    <div className="flow-text"><strong>Edit with full control</strong> — clips, captions, audio, all inside one interface</div>
                  </div>
                  <div className="flow-step">
                    <div className="flow-num">4</div>
                    <div className="flow-text"><strong>Generate assets in-context</strong> — video, images, audio without leaving</div>
                  </div>
                  <div className="flow-step">
                    <div className="flow-num">5</div>
                    <div className="flow-text"><strong>Export when ready</strong> — no re-imports, no re-syncing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="howitworks">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div className="section-kicker">How it works</div>
            <h2>From idea to export<br />in four steps.</h2>
          </div>
          <div className="steps-grid reveal reveal-delay-2">
            <div className="step-card">
              <div className="step-num">01</div>
              <div className="step-title">Describe your video</div>
              <div className="step-desc">Type a prompt or speak your idea. Tell Vichith the topic, tone, length, and structure you need.</div>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <div className="step-title">Generate structure</div>
              <div className="step-desc">AI converts your intent into a fully structured timeline — scenes, captions, audio cues, and pacing included.</div>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <div className="step-title">Edit with control</div>
              <div className="step-desc">Tweak every element directly in the workspace. Move clips. Swap assets. Adjust captions. The AI adapts with you.</div>
            </div>
            <div className="step-card">
              <div className="step-num">04</div>
              <div className="step-title">Export anywhere</div>
              <div className="step-desc">Render to any format. No re-importing. No re-syncing. What you see is what ships.</div>
            </div>
          </div>
        </div>
      </section>

      {/* UI MOCKUP */}
      <section id="studio">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem' }}>
            <div className="section-kicker">The Editor</div>
            <h2>Vichith Desktop Studio</h2>
          </div>
          <div className="hero-visual reveal reveal-delay-2">
            <div className="hero-screen">
              <div className="screen-bar">
                <div className="screen-dot"></div>
                <div className="screen-dot"></div>
                <div className="screen-dot"></div>
                <span className="screen-title">Vichith Studio — Untitled Project</span>
              </div>
              <div className="screen-body">
                <div className="screen-sidebar">
                  <div className="sidebar-label">Workspace</div>
                  <div className="sidebar-item active">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15 10l4.5-4.5M3 3h18v18H3z" />
                    </svg>
                    Timeline
                  </div>
                  <div className="sidebar-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2" />
                      <path d="M12 8v4l3 3" />
                    </svg>
                    Assets
                  </div>
                  <div className="sidebar-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                    </svg>
                    AI Studio
                  </div>
                  <div className="sidebar-label">Recent</div>
                  <div className="sidebar-item">Product Launch v2</div>
                  <div className="sidebar-item">Tutorial Series</div>
                  <div className="sidebar-item">Vlog — March</div>
                </div>
                <div className="screen-main">
                  <div className="screen-toolbar">
                    <div className="tool-btn primary">▶ Generate</div>
                    <div className="tool-btn ghost">Export</div>
                    <div className="tool-btn ghost">AI Edit</div>
                    <div style={{ flex: 1 }}></div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)' }}>
                      00:02:34 / 00:05:00
                    </span>
                  </div>
                  <div className="timeline-area">
                    <div className="timeline-prompt">
                      <div className="prompt-label">AI Prompt</div>
                      Create a 5-minute product walkthrough. Start with the problem, demo the main features,
                      end with a strong CTA. Use upbeat background music.
                    </div>
                    <div className="timeline-tracks">
                      <div className="track-row">
                        <div className="track-label">Video 1</div>
                        <div className="track-line">
                          <div className="track-clip video" style={{ left: '2%', width: '30%' }}>Intro Scene</div>
                          <div className="track-clip video" style={{ left: '34%', width: '38%' }}>Feature Demo</div>
                          <div className="track-clip video" style={{ left: '74%', width: '24%' }}>CTA Outro</div>
                          <div className="timeline-cursor" style={{ left: `${cursorPos}%` }}></div>
                        </div>
                      </div>
                      <div className="track-row">
                        <div className="track-label">Audio</div>
                        <div className="track-line">
                          <div className="track-clip audio" style={{ left: '2%', width: '96%' }}>Background Music — Upbeat Corporate</div>
                        </div>
                      </div>
                      <div className="track-row">
                        <div className="track-label">Voice</div>
                        <div className="track-line">
                          <div className="track-clip audio" style={{ left: '2%', width: '28%' }}>Narration 1</div>
                          <div className="track-clip audio" style={{ left: '32%', width: '40%' }}>Narration 2</div>
                          <div className="track-clip audio" style={{ left: '74%', width: '22%' }}>Narration 3</div>
                        </div>
                      </div>
                      <div className="track-row">
                        <div className="track-label">Captions</div>
                        <div className="track-line">
                          <div className="track-clip text" style={{ left: '2%', width: '96%' }}>Auto-generated — Hindi/English</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUILDING IN PUBLIC SECTION */}
      <section id="building-in-public">
        <div className="container-sm" style={{ textAlign: 'center' }}>
          <div className="section-kicker reveal">Transparency</div>
          <h2 className="reveal reveal-delay-1">Building in Public</h2>
          <p className="vision-body reveal reveal-delay-2" style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: 'var(--text-2)' }}>
            We're launching early because we believe great creative tools are built alongside real creators.
            Some features are incomplete. Some workflows will evolve. Some bugs still exist.
          </p>
          <p className="vision-body reveal reveal-delay-3" style={{ marginTop: '1rem', fontSize: '1.1rem', color: 'var(--text-2)' }}>
            Your feedback directly influences what Vichith becomes. Thank you for helping us build it.
          </p>
        </div>
      </section>

      {/* ROADMAP SECTION */}
      <section id="roadmap">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-kicker">THE ROADMAP</div>
            <h2>Building Vichith, One Workflow at a Time</h2>
            <p className="roadmap-sub reveal reveal-delay-1" style={{ color: 'var(--text-2)', marginTop: '1rem', fontSize: '1.1rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6' }}>
              The beta is only the beginning. Here's what we're actively improving, what we're building next, and where we're headed long term.
            </p>
          </div>

          <div className="roadmap-grid reveal reveal-delay-2">
            <div className="roadmap-col">
              <div className="roadmap-header-col">
                <span className="badge-col now">Now</span>
                <h3>Available in Beta</h3>
              </div>
              <ul className="roadmap-list">
                <li><span>➔</span> Timeline Editing</li>
                <li><span>➔</span> Keyframes & Animation</li>
                <li><span>➔</span> Playback & Export Workflows</li>
                <li><span>➔</span> Active Stability & Performance Improvements</li>
              </ul>
              <div className="roadmap-footer-text" style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-3)' }}>
                Available today in the public beta.
              </div>
            </div>

            <div className="roadmap-col">
              <div className="roadmap-header-col">
                <span className="badge-col next">Next</span>
                <h3>Coming Next</h3>
              </div>
              <ul className="roadmap-list">
                <li><span>➔</span> Audio Editing Enhancements</li>
                <li><span>➔</span> Multi-Track Workflow Improvements</li>
                <li><span>➔</span> Faster Export Performance</li>
                <li><span>➔</span> Expanded Effects Library</li>
                <li><span>➔</span> Better Creator Quality-of-Life Tools</li>
                <li><span>➔</span> Improved Editing Experience</li>
              </ul>
              <div className="roadmap-footer-text" style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-3)' }}>
                Features currently being developed.
              </div>
            </div>

            <div className="roadmap-col">
              <div className="roadmap-header-col">
                <span className="badge-col future">Future</span>
                <h3>The Vision</h3>
              </div>
              <ul className="roadmap-list">
                <li><span>➔</span> AI-Assisted Editing Workflows</li>
                <li><span>➔</span> Voice-Powered Creative Commands</li>
                <li><span>➔</span> Collaborative Editing</li>
                <li><span>➔</span> Intelligent Project Organization</li>
                <li><span>➔</span> Workflow Automation</li>
                <li><span>➔</span> A More Connected Creative Workspace</li>
              </ul>
              <div className="roadmap-footer-text" style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-3)' }}>
                The long-term direction of Vichith.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY SECTION */}
      <section id="community">
        <div className="beta-glow"></div>
        <div className="container-sm" style={{ textAlign: 'center' }}>
          <div className="section-kicker reveal">Community-Driven</div>
          <h2 className="reveal reveal-delay-1">Help Build Vichith</h2>
          <p className="beta-sub reveal reveal-delay-2">
            Vichith is still in its early stages. There is a lot more to build, improve, and reimagine. Join the community to share feedback, report issues, suggest features, discuss workflows, get beta updates, and help shape the future of Vichith.
          </p>
          <div className="hero-actions reveal reveal-delay-3" style={{ marginTop: '2rem' }}>
            <a href="https://discord.gg/MSeSsbgD" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Join Discord
            </a>
            <a href="#newsletter-footer" className="btn-ghost">
              Follow Updates
            </a>
          </div>
        </div>
      </section>

      {/* SOCIAL HUB */}
      <section id="social-hub">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="reveal" style={{ marginBottom: '3rem' }}>
            <div className="section-kicker">Get Connected</div>
            <h2>Follow the Journey</h2>
          </div>
          
          <div className="social-links-grid reveal reveal-delay-2">
            <a href="https://x.com/vichith_ai" target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-title">X (Twitter)</div>
              <div className="social-subtitle">@vichith_ai</div>
            </a>
            <a href="https://www.linkedin.com/company/117674481" target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-title">LinkedIn</div>
              <div className="social-subtitle">Vichith AI</div>
            </a>
            <a href="https://www.instagram.com/vichith.ai" target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-title">Instagram</div>
              <div className="social-subtitle">@vichith.ai</div>
            </a>
            <a href="https://discord.gg/MSeSsbgD" target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-title">Discord</div>
              <div className="social-subtitle">Vichith Creator Hub</div>
            </a>
          </div>
        </div>
      </section>

      {/* FOUNDER SECTION */}
      <section id="founder" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface2)', padding: '5rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="reveal" style={{ marginBottom: '2.5rem' }}>
            <div className="section-kicker">The Builder</div>
            <h2>Behind Vichith</h2>
          </div>
          
          <div className="reveal reveal-delay-2" style={{ display: 'flex', justifyContent: 'center' }}>
            <a 
              href="https://www.linkedin.com/in/nikshith-yadagiri-884985375/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="founder-card"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1.25rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '50px',
                padding: '0.75rem 2rem 0.75rem 0.75rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
            >
              <div 
                className="founder-avatar"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--cyan) 0%, var(--teal) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--black)',
                  fontFamily: 'var(--font-display)'
                }}
              >
                N
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Nikshith</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Founder & Builder</div>
              </div>
              <div style={{ color: 'var(--text-3)', marginLeft: '1rem', fontSize: '1.25rem' }}>↗</div>
            </a>
          </div>
        </div>
      </section>

      {/* NEWSLETTER FOOTER REGISTRATION */}
      <section id="newsletter-footer" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
        <div className="container-sm" style={{ textAlign: 'center' }}>
          <h3>Get Beta Updates</h3>
          <p style={{ color: 'var(--text-2)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Be the first to hear when new features and security-signed releases are available.
          </p>
          <div className="beta-input-row">
            <input
              className="beta-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
            />
            <button
              className="btn-primary"
              onClick={() => handleNewsletterSubmit()}
              disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
            >
              {newsletterStatus === 'loading' ? 'Saving...' : 'Follow Updates'}
            </button>
          </div>
          <div className="beta-note" style={{ color: newsletterStatus === 'error' ? '#ff6b6b' : newsletterStatus === 'success' ? 'var(--cyan)' : 'var(--text-3)', marginTop: '0.75rem' }}>
            {newsletterMsg}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-cols">
            <div className="footer-brand-col">
              <a href="#" className="footer-logo">vi<span>chith</span></a>
              <p className="footer-desc">An editor for modern video workflows. Built for and alongside creators.</p>
              <div className="footer-status-badge">
                <span className="dot"></span>Public Beta Active
              </div>
            </div>
            
            <div className="footer-links-col">
              <h4>Download</h4>
              <a href="/#download">Download Beta</a>
              <a href="/download-guide">Installation Guide</a>
              <span className="footer-version">v0.5.0 (Windows)</span>
            </div>

            <div className="footer-links-col">
              <h4>Beta Hub</h4>
              <a href="/report">Report Issue</a>
              <a href="/known-issues">Known Issues</a>
              <a href="/changelog">Changelog</a>
              <a href="/#roadmap">Roadmap</a>
            </div>

            <div className="footer-links-col">
              <h4>Community</h4>
              <a href="https://discord.gg/MSeSsbgD" target="_blank" rel="noopener noreferrer">Discord</a>
              <a href="https://x.com/vichith_ai" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
              <a href="https://www.linkedin.com/company/117674481" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="mailto:info.vichith@gmail.com">Contact Support</a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 Vichith. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
