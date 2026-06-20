'use client';

import React from 'react';

const CHANGELOG_DATA = [
  {
    version: 'Beta 0.5.0',
    date: 'June 20, 2026',
    tagline: 'The Public Beta Milestone',
    highlights: [
      {
        title: 'Timeline Editing',
        description: 'Rewritten engine for drag-and-drop actions, clip splicing, ripple edits, and frame-accurate seeking.'
      },
      {
        title: 'Playback Stabilization',
        description: 'Optimized rendering loop using direct GPU memory mapping to deliver smooth 60fps playback for multi-track compositions.'
      },
      {
        title: 'Keyframe Animation System',
        description: 'Introduced visual keyframe tracks for custom position, scale, opacity, and audio volume automation curves.'
      },
      {
        title: 'Effects Runtime',
        description: 'Integration of real-time shaders for color grading, Gaussian blurs, and cinematic grain overlays.'
      },
      {
        title: 'Project Organization',
        description: 'New media pool interface with folders, color tags, metadata sorting, and batch asset imports.'
      }
    ]
  },
  {
    version: 'Beta 0.4.0',
    date: 'May 15, 2026',
    tagline: 'AI Integration Update',
    highlights: [
      {
        title: 'Voice-to-Video Model',
        description: 'First public testing of offline transcription that aligns voice scripts directly with timeline cuts.'
      },
      {
        title: 'Multi-Language Caption Rendering',
        description: 'Added high-performance font rendering for Hindi, Telugu, Tamil, and Kannada scripts.'
      },
      {
        title: 'Local-First Save States',
        description: 'Automated background state snapshots preventing database loss on sudden crash events.'
      }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="changelog-container">
      <div className="changelog-bg-glow"></div>
      
      <div className="changelog-header">
        <span className="changelog-kicker">Releases & Updates</span>
        <h1>Product Changelog</h1>
        <p>Follow our building in public journey. We release updates frequently, fixing bugs and shipping new editing capabilities alongside our community.</p>
      </div>

      <div className="changelog-timeline">
        {CHANGELOG_DATA.map((release, idx) => (
          <div key={idx} className="changelog-node">
            <div className="changelog-aside">
              <div className="changelog-badge">{release.version}</div>
              <div className="changelog-date">{release.date}</div>
            </div>
            
            <div className="changelog-main">
              <h2 className="changelog-tagline">{release.tagline}</h2>
              
              <div className="changelog-highlights-list">
                {release.highlights.map((highlight, hIdx) => (
                  <div key={hIdx} className="changelog-item">
                    <h4>{highlight.title}</h4>
                    <p>{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
