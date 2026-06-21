'use client';

import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav id="nav" className={`${scrolled ? 'scrolled' : ''} ${isOpen ? 'mobile-open' : ''}`}>
      <a href="/" className="nav-logo">
        <img src="/favicon_io/android-chrome-512x512.png" alt="Vichith Logo" style={{ height: '28px', width: 'auto' }} />
        <span>vi<span>chith</span></span>
      </a>

      {/* Hamburger menu button */}
      <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        <a href="/#download" onClick={() => setIsOpen(false)}>Download</a>
        <a href="/download-guide" onClick={() => setIsOpen(false)}>Guide</a>
        <a href="/changelog" onClick={() => setIsOpen(false)}>Changelog</a>
        <a href="/known-issues" onClick={() => setIsOpen(false)}>Issues</a>
        <a href="/report" className="nav-cta" onClick={() => setIsOpen(false)}>Report Issue</a>
      </div>
    </nav>
  );
}
