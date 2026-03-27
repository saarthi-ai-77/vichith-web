'use client';
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// The Transparent Logo (Vector Graphic based on user's image)
const LogoSVG = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top Diamond */}
    <path d="M50 20L85 38L50 56L15 38L50 20Z" stroke="url(#paint0_linear)" strokeWidth="6" strokeLinejoin="round" />
    {/* Middle Chevron */}
    <path d="M15 52L50 70L85 52" stroke="url(#paint1_linear)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    {/* Bottom Chevron */}
    <path d="M15 66L50 84L85 66" stroke="url(#paint2_linear)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="paint0_linear" x1="15" y1="38" x2="85" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00E5C3" />
        <stop offset="1" stopColor="#5B8CFF" />
      </linearGradient>
      <linearGradient id="paint1_linear" x1="15" y1="61" x2="85" y2="61" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5B8CFF" />
        <stop offset="1" stopColor="#A855F7" />
      </linearGradient>
      <linearGradient id="paint2_linear" x1="15" y1="75" x2="85" y2="75" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A855F7" />
        <stop offset="1" stopColor="#00E5C3" />
      </linearGradient>
    </defs>
  </svg>
);

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll();
  const editorY = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
  const editorScale = useTransform(scrollYProgress, [0, 0.3], [0.9, 1]);
  const editorRotateX = useTransform(scrollYProgress, [0, 0.3], [10, 0]);
  const editorOpacity = useTransform(scrollYProgress, [0, 0.2], [0.4, 1]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
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
      }
    } catch (err) {
      setStatus('error');
    }
  };

  if (!mounted) return null; // Avoid hydration mismatch for motion values

  return (
    <main style={{ overflowX: 'hidden' }}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', top: '10%', left: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,229,195,0.05) 0%, transparent 60%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', bottom: '20%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(91,140,255,0.05) 0%, transparent 60%)', filter: 'blur(60px)' }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        className="nav-container"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <a href="#" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LogoSVG />
          <span className="logo-text" style={{ fontSize: '1.75rem' }}>Vichith</span>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#waitlist" className="btn-waitlist shadow-glow">Join Waitlist</a>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.header
        className="hero"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp} className="hero-badge" style={{ marginTop: '40px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', marginRight: 8, boxShadow: '0 0 10px var(--teal)' }}></span>
          <span>AI Assisted Editing</span>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          You describe it, <br />
          <span className="gradient-text">Vichith gets it done.</span>
        </motion.h1>

        <motion.p variants={fadeInUp} className="hero-sub">
          The world's first AI-native platform that transforms your raw ideas into cinematic content instantly. Stop clicking, start creating.
        </motion.p>

        <motion.div variants={fadeInUp} style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a href="#waitlist" className="btn-waitlist" style={{ padding: '16px 40px', fontSize: '1.125rem', boxShadow: '0 0 30px rgba(0, 229, 195, 0.4)' }}>
            Get Early Access
          </a>
        </motion.div>

        {/* 3D Editor Mockup */}
        <div style={{ perspective: '1200px', width: '100%', maxWidth: '1200px', marginTop: '100px', zIndex: 10 }}>
          <motion.div
            style={{
              background: 'var(--surface)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
              boxShadow: '0 60px 140px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
              y: editorY,
              scale: editorScale,
              rotateX: editorRotateX,
              opacity: editorOpacity,
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }}></div>
              <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: '500', letterSpacing: '0.05em' }}>Vichith Editor — My Setup</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative' }}>
                <img src="/images/editor-preview.png" alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 80%, rgba(0,0,0,0.5))' }}></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface2)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
                >
                  <p className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center' }}>"Make the cuts match the beat of the background music."</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', background: 'var(--surface2)' }}
                >
                  <img src="/images/editor-ai-full.png" alt="AI Assistant" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Features Section */}
      <motion.section id="features" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
        <motion.span variants={fadeInUp} className="section-label">Core Capabilities</motion.span>
        <motion.h2 variants={fadeInUp} className="section-title">Beyond Traditional Editing</motion.h2>
        <motion.p variants={fadeInUp} className="section-desc">We reimagined video creation from the ground up, replacing tedious timelines with intelligent agents.</motion.p>

        <motion.div variants={staggerContainer} className="features-grid">
          <motion.div variants={fadeInUp} className="feature-card" whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,229,195,0.1)' }}>
            <div className="feature-icon">✨</div>
            <h3 className="feature-title">Intent-Based Creation</h3>
            <p className="feature-text">Describe your vision in natural language. Our AI handles the cutting, pacing, and color grading automatically.</p>
          </motion.div>
          <motion.div variants={fadeInUp} className="feature-card" whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,229,195,0.1)' }}>
            <div className="feature-icon">🎥</div>
            <h3 className="feature-title">Instant B-Roll</h3>
            <p className="feature-text">Seamlessly integrate relevant visuals and assets generated in real-time to match your narrative perfectly.</p>
          </motion.div>
          <motion.div variants={fadeInUp} className="feature-card" whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,229,195,0.1)' }}>
            <div className="feature-icon">🧠</div>
            <h3 className="feature-title">Contextual Intelligence</h3>
            <p className="feature-text">AI agents that understand your brand voice, audience preferences, and platform requirements.</p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Workflow Section */}
      <motion.section id="workflow" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
        <motion.span variants={fadeInUp} className="section-label" style={{ textAlign: 'center', display: 'block' }}>How It Works</motion.span>
        <motion.h2 variants={fadeInUp} className="section-title" style={{ textAlign: 'center' }}>A new way to edit your videos.</motion.h2>
        <motion.p variants={fadeInUp} className="section-desc" style={{ textAlign: 'center', margin: '0 auto' }}>From creative spark to finished export — entirely inside one intelligent environment.</motion.p>

        <div className="workflow-diagram">
          <motion.div variants={fadeInUp} className="wf-node">
            <div className="wf-icon">💡</div>
            <div className="wf-content">
              <h4>Idea</h4>
              <p>Start with your concept or raw footage</p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="wf-connector"></motion.div>

          <motion.div variants={fadeInUp} className="wf-node">
            <div className="wf-icon">🗣️</div>
            <div className="wf-content">
              <h4>Describe to Vichith</h4>
              <p>Use natural language to tell our AI what you want</p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="wf-connector"></motion.div>

          <motion.div variants={fadeInUp} className="wf-node">
            <div className="wf-icon">🗺️</div>
            <div className="wf-content">
              <h4>Vichith Plans</h4>
              <p>AI agents analyze your request and structure the timeline</p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="wf-connector"></motion.div>

          <motion.div variants={fadeInUp} className="wf-node">
            <div className="wf-icon">🤖</div>
            <div className="wf-content">
              <h4>Vichith AI does the work</h4>
              <p>Generating assets, B-roll, and applying effects</p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="wf-connector"></motion.div>

          <motion.div variants={fadeInUp} className="wf-node">
            <div className="wf-icon">🎬</div>
            <div className="wf-content">
              <h4>User Finalizes the Edit</h4>
              <p>Review, tweak, and export your masterpiece</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        id="waitlist"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(14,19,24,0.8), rgba(20,27,34,0.8))',
          borderRadius: '40px',
          padding: '100px 48px',
          margin: '120px auto',
          maxWidth: '1000px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid rgba(0, 229, 195, 0.2)',
          boxShadow: '0 40px 100px rgba(0,229,195,0.05)',
        }}
      >
        <h2 className="section-title">The Future of Content is Here</h2>
        <p className="section-desc" style={{ margin: '0 auto 40px' }}>Join the waitlist for early access to the Vichith beta. Space is limited as we scale our intelligence.</p>

        <form onSubmit={handleJoin} style={{ maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading' || status === 'success'}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border)',
                padding: '16px 20px',
                borderRadius: '12px',
                color: 'white',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
            />
            <button
              type="submit"
              className="btn-waitlist"
              disabled={status === 'loading' || status === 'success'}
              style={{ padding: '0 32px', opacity: (status === 'loading' || status === 'success') ? 0.7 : 1, width: '140px', boxShadow: '0 0 20px rgba(0,229,195,0.3)' }}
            >
              {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined!' : 'Join Now'}
            </button>
          </div>
          <AnimatePresence>
            {status === 'success' && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#00e5c3', fontSize: '0.9rem', marginTop: '8px' }}>
                You're on the list! Keep an eye on your inbox.
              </motion.p>
            )}
            {status === 'error' && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#ff5f57', fontSize: '0.9rem', marginTop: '8px' }}>
                Something went wrong. Please try again.
              </motion.p>
            )}
          </AnimatePresence>
        </form>
        <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--teal)', fontWeight: '500' }}>Be the first to redefine video creation.</p>
      </motion.section>

      {/* Footer */}
      <footer style={{ padding: '60px 48px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LogoSVG />
          <span className="logo-text" style={{ fontSize: '1.25rem' }}>Vichith</span>
        </div>
        <p className="footer-text">© 2026 Vichith Intelligence. All cinematic rights reserved.</p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" className="footer-text" style={{ textDecoration: 'none' }}>Twitter</a>
          <a href="#" className="footer-text" style={{ textDecoration: 'none' }}>Discord</a>
        </div>
      </footer>
    </main>
  );
}
