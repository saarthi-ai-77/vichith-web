'use client';

import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav id="nav" className={scrolled ? 'scrolled' : ''}>
      <a href="/" className="nav-logo">
        <img src="/favicon_io/android-chrome-512x512.png" alt="Vichith Logo" style={{ height: '28px', width: 'auto' }} />
        <span>vi<span>chith</span></span>
      </a>
      <div className="nav-links">
        <a href="/#download">Download</a>
        <a href="/download-guide">Guide</a>
        <a href="/changelog">Changelog</a>
        <a href="/known-issues">Issues</a>
        <a href="/report" className="nav-cta">Report Issue</a>
      </div>
    </nav>
  );
}
