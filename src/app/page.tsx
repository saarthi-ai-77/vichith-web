'use client';

import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState('No spam. No waitlist games. We\'ll reach out directly.');

  // NAV scrolled state
  const [scrolled, setScrolled] = useState(false);

  // Timeline playhead position state
  const [cursorPos, setCursorPos] = useState(47);

  // Scroll active nav listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver reveals and initial animations
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

  // Waitlist email form submit action
  const handleBetaSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setFeedbackMsg('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setFeedbackMsg('Requesting access...');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok || data.success) {
        setStatus('success');
        setFeedbackMsg(`You're on the list, ${email.split('@')[0]}. We'll be in touch.`);
        setEmail('');
      } else {
        setStatus('error');
        setFeedbackMsg(data.error || 'Unable to join waitlist.');
      }
    } catch (err) {
      setStatus('error');
      setFeedbackMsg('Network error. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBetaSubmit();
    }
  };

  return (
    <>
      {/* NAV */}
      <nav id="nav" className={scrolled ? 'scrolled' : ''}>
        <a href="#" className="nav-logo">
          <img src="/favicon_io/android-chrome-512x512.png" alt="Vichith Logo" style={{ height: '28px', width: 'auto' }} />
          <span>vi<span>chith</span></span>
        </a>
        <div className="nav-links">
          <a href="#howitworks">How it works</a>
          <a href="#features">Features</a>
          <a href="#studio">Studio</a>
          <a href="#vision">Vision</a>
          <a href="#beta" className="nav-cta">Join Beta</a>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-bg-glow"></div>
        <div className="hero-bg-glow2"></div>
        <div className="hero-badge reveal"><span className="dot"></span>Now in Private Beta</div>
        <h1 className="reveal reveal-delay-1">
          The workflow layer for<br /><span className="line-accent">modern video editing.</span>
        </h1>
        <p className="hero-sub reveal reveal-delay-2">
          Describe your video. Generate a timeline. Edit with full control.
          Vichith replaces the chaos of five tools with one intelligent workspace.
        </p>
        <div className="hero-actions reveal reveal-delay-3">
          <a href="#beta" className="btn-primary">Join the Beta</a>
          <a href="#howitworks" className="btn-ghost">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10,8 16,12 10,16" />
            </svg>
            See how it works
          </a>
        </div>

        {/* UI MOCKUP */}
        <div className="hero-visual reveal reveal-delay-4">
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
      </section>

      {/* TICKER */}
      <div className="ticker-container">
        <div className="ticker-track">
          <span className="ticker-item"><span>→</span>Prompt to Timeline</span>
          <span className="ticker-item"><span>→</span>Voice-to-Video</span>
          <span className="ticker-item"><span>→</span>AI Auto-Edit</span>
          <span className="ticker-item"><span>→</span>Multi-Language Captions</span>
          <span className="ticker-item"><span>→</span>Timeline Intelligence</span>
          <span className="ticker-item"><span>→</span>One Platform</span>
          <span className="ticker-item"><span>→</span>No Context Switching</span>
          <span className="ticker-item"><span>→</span>Prompt to Timeline</span>
          <span className="ticker-item"><span>→</span>Voice-to-Video</span>
          <span className="ticker-item"><span>→</span>AI Auto-Edit</span>
          <span className="ticker-item"><span>→</span>Multi-Language Captions</span>
          <span className="ticker-item"><span>→</span>Timeline Intelligence</span>
          <span className="ticker-item"><span>→</span>One Platform</span>
          <span className="ticker-item"><span>→</span>No Context Switching</span>
        </div>
      </div>

      {/* STATS */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="stat-row reveal">
            <div className="stat-cell">
              <div className="stat-num">5<span>→</span>1</div>
              <div className="stat-label">Tools replaced by one workspace</div>
            </div>
            <div className="stat-cell">
              <div className="stat-num"><span>~</span>80<span>%</span></div>
              <div className="stat-label">Reduction in editing time</div>
            </div>
            <div className="stat-cell">
              <div className="stat-num">4<span>+</span></div>
              <div className="stat-label">Indian languages supported at launch</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
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

      {/* FEATURES */}
      <section id="features">
        <div className="container">
          <div className="features-header reveal">
            <div className="section-kicker">Features</div>
            <h2>Intelligence at every layer of your workflow.</h2>
          </div>
          <div className="features-grid reveal reveal-delay-1">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M9 17H5a2 2 0 0 0-2 2v2" />
                  <path d="M11 11h8a2 2 0 0 1 2 2v3" />
                  <rect x="1" y="3" width="14" height="8" rx="1" />
                  <rect x="13" y="13" width="8" height="8" rx="1" />
                </svg>
              </div>
              <div className="feature-title">Timeline Intelligence</div>
              <div className="feature-desc">AI reads your intent and arranges scenes into a professional timeline with proper pacing, cuts, and transitions.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <div className="feature-title">Voice-to-Video</div>
              <div className="feature-desc">Narrate your video concept out loud. Vichith transcribes, structures, and turns your spoken ideas into editable timelines.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.93 4.93 14.14 14.14" />
                </svg>
              </div>
              <div className="feature-title">AI Auto-Edit</div>
              <div className="feature-desc">Describe an edit in plain language. "Make the intro tighter" or "add B-roll between scene 2 and 3." Vichith executes.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="15" rx="2" />
                  <polyline points="17 2 12 7 7 2" />
                </svg>
              </div>
              <div className="feature-title">Multi-Language Captions</div>
              <div className="feature-desc">Auto-generated captions with full support for Hindi, Telugu, Tamil, and Kannada — with proper script rendering.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="feature-title">Creator Control</div>
              <div className="feature-desc">AI assists, you decide. Every AI action is a suggestion. You approve, reject, or modify anything the model produces.</div>
            </div>

          </div>
        </div>
      </section>

      {/* STUDIO */}
      <section id="studio">
        <div className="container">
          <div className="studio-inner">
            <div>
              <div className="section-kicker reveal">Vichith Studio — Coming Soon</div>
              <h2 className="reveal reveal-delay-1">Every AI model.<br />One workspace.</h2>
              <p className="lead reveal reveal-delay-2" style={{ marginTop: '1.25rem' }}>
                The future of Vichith is a unified creative environment where you generate video, images, and audio — all inside the same timeline, all connected.
              </p>
              <div className="studio-models reveal reveal-delay-3">
                <div className="model-card">
                  <div className="model-card-type">Video</div>
                  <div className="model-card-name">Video Generation</div>
                  <div className="model-card-desc">Generate clips directly from text prompts inside your timeline.</div>
                </div>
                <div className="model-card">
                  <div className="model-card-type">Image</div>
                  <div className="model-card-name">Image Generation</div>
                  <div className="model-card-desc">Create thumbnails, B-roll stills, and motion graphics in-context.</div>
                </div>
                <div className="model-card">
                  <div className="model-card-type">Audio</div>
                  <div className="model-card-name">Audio & Music</div>
                  <div className="model-card-desc">Generate background scores and voiceovers tuned to your edit.</div>
                </div>
                <div className="model-card">
                  <div className="model-card-type">Language</div>
                  <div className="model-card-name">Script Intelligence</div>
                  <div className="model-card-desc">Rewrite, translate, and restructure scripts in any regional language.</div>
                </div>
              </div>
            </div>
            <div className="studio-orbit reveal reveal-delay-2">
              <div className="orbit-ring orbit-ring-1">
                <div className="orbit-dot" style={{ top: '-16px', left: 'calc(50% - 16px)' }}>Vid</div>
              </div>
              <div className="orbit-ring orbit-ring-2">
                <div className="orbit-dot" style={{ top: '-16px', left: 'calc(50% - 16px)' }}>Img</div>
                <div className="orbit-dot" style={{ bottom: '-16px', left: 'calc(50% - 16px)' }}>Aud</div>
              </div>
              <div className="orbit-ring orbit-ring-3">
                <div className="orbit-dot" style={{ top: '-16px', left: 'calc(50% - 16px)' }}>TTS</div>
                <div className="orbit-dot" style={{ bottom: '-16px', left: 'calc(50% - 16px)' }}>LLM</div>
                <div className="orbit-dot" style={{ left: '-16px', top: 'calc(50% - 16px)' }}>STT</div>
              </div>
              <div className="orbit-center">
                <div className="orbit-center-text">VICHITH</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section id="vision">
        <div className="vision-glow"></div>
        <div className="container-sm">
          <div className="section-kicker reveal" style={{ textAlign: 'center' }}>Our vision</div>
          <div className="vision-quote reveal reveal-delay-1">
            The future isn't AI <em>generating</em> videos.<br />The future is AI <em>understanding</em> workflows.
          </div>
          <p className="vision-body reveal reveal-delay-2">
            Every creator today loses hours to toolchain friction — not creative work. Vichith is building the missing layer: an intelligent operating system where your intent becomes content, without the chaos in between.
          </p>
          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }} className="reveal reveal-delay-3">
            <a href="#beta" className="btn-primary">Be part of the story</a>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section id="proof">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
            <div className="section-kicker">Early Access</div>
            <h2>Built for creators,<br />by builders who get it.</h2>
          </div>
          <div className="proof-grid">
            <div className="proof-card reveal">
              <div className="proof-stars">
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
              </div>
              <div className="proof-text">
                "I've been waiting for something like this. Jumping between CapCut, ElevenLabs, and Canva for every video is exhausting. Vichith feels like the thing that should have existed two years ago."
              </div>
              <div className="proof-author">
                <div className="proof-avatar">RK</div>
                <div>
                  <div className="proof-name">Ravi Kumar</div>
                  <div className="proof-role">Telugu YouTuber · 240K subscribers</div>
                </div>
              </div>
            </div>
            <div className="proof-card reveal reveal-delay-1">
              <div className="proof-stars">
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
              </div>
              <div className="proof-text">
                "The prompt-to-timeline feature alone saves me 3–4 hours per video. The AI understands context in a way I haven't seen in any other tool. The Hindi caption support is exactly what the creator space needed."
              </div>
              <div className="proof-author">
                <div className="proof-avatar">PS</div>
                <div>
                  <div className="proof-name">Priya Sharma</div>
                  <div className="proof-role">Solo Creator · Tech & Finance · Hindi</div>
                </div>
              </div>
            </div>
            <div className="proof-card reveal reveal-delay-2">
              <div className="proof-stars">
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
              </div>
              <div className="proof-text">
                "What Linear did for project management, Vichith is doing for video. It respects my intelligence as a creator and gives me AI that assists rather than decides. Local-first is a massive differentiator."
              </div>
              <div className="proof-author">
                <div className="proof-avatar">AJ</div>
                <div>
                  <div className="proof-name">Arjun J.</div>
                  <div className="proof-role">Indie Filmmaker · Beta Tester</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BETA CTA */}
      <section id="beta">
        <div className="beta-glow"></div>
        <div className="container-sm" style={{ textAlign: 'center' }}>
          <div className="section-kicker reveal">Private Beta</div>
          <h2 className="beta-title reveal reveal-delay-1">
            Start creating<br />without the <span className="accent">chaos.</span>
          </h2>
          <p className="beta-sub reveal reveal-delay-2">
            Join early access and help shape the future of video creation for Indian creators and beyond.
          </p>
          <div className="beta-input-row reveal reveal-delay-3">
            <input
              className="beta-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              className="btn-primary"
              onClick={() => handleBetaSubmit()}
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading' ? 'Requesting...' : 'Request Access'}
            </button>
          </div>
          <div className="beta-note reveal reveal-delay-4" style={{ color: status === 'error' ? '#ff6b6b' : status === 'success' ? 'var(--cyan)' : 'var(--text-3)' }}>
            {feedbackMsg}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-inner">
            <a href="#" className="footer-logo">vi<span>chith</span></a>
            <div className="footer-links">
              <a href="https://www.linkedin.com/in/nikshith-yadagiri-884985375/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://discord.gg/baBZSv5s" target="_blank" rel="noopener noreferrer">Discord</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-copy">© 2026 Vichith. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
