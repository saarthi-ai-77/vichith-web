'use client';

import React, { useState } from 'react';

export default function EmbedsPage() {
  const [driveTheme, setDriveTheme] = useState<'light' | 'neutral' | 'dark'>('dark');
  const [launchTheme, setLaunchTheme] = useState<'light' | 'neutral' | 'dark'>('dark');
  const [copiedDrive, setCopiedDrive] = useState(false);
  const [copiedLaunch, setCopiedLaunch] = useState(false);

  const getDriveEmbedCode = (theme: 'light' | 'neutral' | 'dark') => {
    return `<a href="https://www.producthunt.com/products/vichith?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-vichith" target="_blank" rel="noopener noreferrer"><img alt="Vichith - Editor for Modern Video Workflows | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1178329&theme=${theme}&t=${Date.now()}" /></a>`;
  };

  const getLaunchEmbedCode = (theme: 'light' | 'neutral' | 'dark') => {
    const cardBg = theme === 'dark' ? '#0e1113' : theme === 'neutral' ? '#14191c' : '#ffffff';
    const cardBorder = theme === 'dark' ? '#2b353a' : theme === 'neutral' ? '#1c2327' : '#e2e8f0';
    const textColor = theme === 'light' ? '#0f172a' : '#f0f3f5';
    const descColor = theme === 'light' ? '#475569' : '#a3b2bc';

    return `<div style="max-width:380px; background:${cardBg}; border:1px solid ${cardBorder}; border-radius:12px; padding:24px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.15);">
  <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
    <div style="width:48px; height:48px; border-radius:8px; background:linear-gradient(135deg, #00ffd5 0%, #da552f 100%); display:flex; align-items:center; justify-content:center; color:#08090a; font-weight:bold; font-size:24px; font-family:'Outfit',sans-serif;">V</div>
    <div style="text-align:left;">
      <h4 style="margin:0; font-size:18px; color:${textColor}; font-weight:700; font-family:'Outfit',sans-serif;">Vichith</h4>
      <p style="margin:4px 0 0 0; font-size:13px; color:${descColor};">Editor for Modern Video Workflows</p>
    </div>
  </div>
  <a href="https://www.producthunt.com/products/vichith" target="_blank" rel="noopener noreferrer" style="display:block; text-align:center; background:#da552f; color:#ffffff; padding:10px 16px; border-radius:6px; font-weight:600; font-size:14px; text-decoration:none; transition:background 0.2s;">Check it out on Product Hunt &rarr;</a>
</div>`;
  };

  const handleCopyDrive = () => {
    navigator.clipboard.writeText(getDriveEmbedCode(driveTheme));
    setCopiedDrive(true);
    setTimeout(() => setCopiedDrive(false), 2000);
  };

  const handleCopyLaunch = () => {
    navigator.clipboard.writeText(getLaunchEmbedCode(launchTheme));
    setCopiedLaunch(true);
    setTimeout(() => setCopiedLaunch(false), 2000);
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '4rem 1.5rem 8rem 1.5rem', color: 'var(--text)' }}>
      <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* BREADCRUMBS */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>
          <a href="/" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Home</a>
          <span>&rsaquo;</span>
          <span>Vichith</span>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--text)' }}>Embeds</span>
        </div>

        {/* HEADER */}
        <div style={{ borderBottom: '1px solid var(--border-lo)', paddingBottom: '2.5rem', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            Launch embeds
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', margin: 0 }}>
            Add custom embeds for Vichith.
          </p>
        </div>

        {/* TABS GRID HIGHLIGHTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '4rem' }}>
          <a href="#drive-support" style={{ textDecoration: 'none', background: 'var(--surface)', border: '1px solid var(--border-lo)', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', transition: 'border-color 0.2s' }} className="embed-nav-card">
            <div style={{ fontSize: '1.5rem' }}>📣</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Drive support</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '0.25rem', lineHeight: '1.4' }}>Use badges to engage more of your community for your launch.</div>
            </div>
          </a>

          <a href="#social-proof" style={{ textDecoration: 'none', background: 'var(--surface)', border: '1px solid var(--border-lo)', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', transition: 'border-color 0.2s' }} className="embed-nav-card">
            <div style={{ fontSize: '1.5rem' }}>✅</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Social proof</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '0.25rem', lineHeight: '1.4' }}>Show off the success of your launch to validate your product.</div>
            </div>
          </a>

          <a href="#embed-launch" style={{ textDecoration: 'none', background: 'var(--surface)', border: '1px solid var(--border-lo)', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', transition: 'border-color 0.2s' }} className="embed-nav-card">
            <div style={{ fontSize: '1.5rem' }}>🔺</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Post embed</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '0.25rem', lineHeight: '1.4' }}>Drop a larger, more detailed embed of your launch.</div>
            </div>
          </a>
        </div>

        {/* SECTION 1: DRIVE SUPPORT */}
        <section id="drive-support" style={{ borderBottom: '1px solid var(--border-lo)', paddingBottom: '3.5rem', marginBottom: '3.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }} className="embeds-split-grid">
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
                Drive support
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.925rem', lineHeight: '1.6', margin: 0 }}>
                Use website badges to drive support from your community for your Product Hunt Launch. They're easy to embed on your homepage or footer.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border-lo)', borderRadius: '16px', padding: '2rem', alignItems: 'center' }}>
              {/* THEME TOGGLE */}
              <div style={{ display: 'flex', background: 'var(--bg-base)', borderRadius: '8px', padding: '0.25rem', gap: '0.25rem', alignSelf: 'flex-end' }}>
                {(['light', 'neutral', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDriveTheme(t)}
                    style={{
                      border: 'none',
                      background: driveTheme === t ? 'var(--surface2)' : 'transparent',
                      color: driveTheme === t ? 'var(--cyan)' : 'var(--text-3)',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* BADGE PREVIEW */}
              <div style={{ background: driveTheme === 'light' ? '#ffffff' : 'transparent', padding: '1.5rem', borderRadius: '12px', border: driveTheme === 'light' ? '1px solid #e2e8f0' : 'none', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <a
                  href="https://www.producthunt.com/products/vichith?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-vichith"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    alt="Vichith - Editor for Modern Video Workflows | Product Hunt"
                    width="250"
                    height="54"
                    src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1178329&theme=${driveTheme}&t=${Date.now()}`}
                  />
                </a>
              </div>

              {/* BUTTON */}
              <button
                onClick={handleCopyDrive}
                className="btn-primary"
                style={{ width: '100%', padding: '0.875rem' }}
              >
                {copiedDrive ? 'Copied to Clipboard! ✓' : 'Copy embed code'}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: SOCIAL PROOF */}
        <section id="social-proof" style={{ borderBottom: '1px solid var(--border-lo)', paddingBottom: '3.5rem', marginBottom: '3.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }} className="embeds-split-grid">
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
                Social proof
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.925rem', lineHeight: '1.6', margin: 0 }}>
                Use Product Hunt badges as a way to validate your product to potential customers.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px dashed var(--border-hi)', borderRadius: '16px', padding: '3.5rem 2rem', color: 'var(--text-2)', fontSize: '0.875rem', textAlign: 'center', lineHeight: '1.5' }}>
              Unlock these badges by being a top product of the day, week, or month.
            </div>
          </div>
        </section>

        {/* SECTION 3: EMBED YOUR LAUNCH */}
        <section id="embed-launch" style={{ borderBottom: '1px solid var(--border-lo)', paddingBottom: '3.5rem', marginBottom: '3.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }} className="embeds-split-grid">
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
                Embed your launch
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.925rem', lineHeight: '1.6', margin: 0 }}>
                Drop a full, more detailed embed of your launch into blog posts. These are also great for sharing with the press or partners.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border-lo)', borderRadius: '16px', padding: '2rem', alignItems: 'center' }}>
              {/* THEME TOGGLE */}
              <div style={{ display: 'flex', background: 'var(--bg-base)', borderRadius: '8px', padding: '0.25rem', gap: '0.25rem', alignSelf: 'flex-end' }}>
                {(['light', 'neutral', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLaunchTheme(t)}
                    style={{
                      border: 'none',
                      background: launchTheme === t ? 'var(--surface2)' : 'transparent',
                      color: launchTheme === t ? 'var(--cyan)' : 'var(--text-3)',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* CARD PREVIEW */}
              <div style={{
                maxWidth: '380px',
                width: '100%',
                background: launchTheme === 'dark' ? '#0e1113' : launchTheme === 'neutral' ? '#14191c' : '#ffffff',
                border: `1px solid ${launchTheme === 'dark' ? '#2b353a' : launchTheme === 'neutral' ? '#1c2327' : '#e2e8f0'}`,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #00ffd5 0%, #da552f 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#08090a',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    fontFamily: 'var(--font-display)'
                  }}>V</div>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', color: launchTheme === 'light' ? '#0f172a' : '#f0f3f5', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Vichith</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: launchTheme === 'light' ? '#475569' : '#a3b2bc' }}>Editor for Modern Video Workflows</p>
                  </div>
                </div>
                <a
                  href="https://www.producthunt.com/products/vichith"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: '#da552f',
                    color: '#ffffff',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none'
                  }}
                >
                  Check it out on Product Hunt &rarr;
                </a>
              </div>

              {/* BUTTON */}
              <button
                onClick={handleCopyLaunch}
                className="btn-primary"
                style={{ width: '100%', padding: '0.875rem' }}
              >
                {copiedLaunch ? 'Copied to Clipboard! ✓' : 'Copy embed code'}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 4: REVIEWS */}
        <section id="reviews" style={{ paddingBottom: '3.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }} className="embeds-split-grid">
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
                Reviews
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                People often use Product Hunt to search for their next personal or work tool. Encourage your community to leave reviews on Product Hunt — they play a key role in helping users to discover (oo, SEO!) and select your product.
              </p>
              <p style={{ color: 'var(--text-2)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                Embedded reviews look great on homepages and landing pages. They showcase how your community feels about your product.
              </p>
              <p style={{ color: 'var(--text-2)', fontSize: '0.925rem', lineHeight: '1.6', margin: 0 }}>
                You can also embed individual reviews. Just click the "share" link below the review.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px dashed var(--border-hi)', borderRadius: '16px', padding: '4.5rem 2rem', color: 'var(--text-2)', fontSize: '0.875rem', textAlign: 'center', lineHeight: '1.5' }}>
              Unlock these badges by being a top product of the day, week, or month.
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
