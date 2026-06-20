'use client';

import React from 'react';

const ISSUES_LIST = [
  {
    category: 'Playback',
    title: '4K H.265 playback stuttering',
    status: 'In Progress',
    statusColor: '#ff9800',
    description: 'High bitrate HEVC/H.265 media clips might skip frames on older integrated GPUs during scrub operations.',
    workaround: 'Go to Settings > Playback and toggle "Generate 1080p Proxies" to edit smoothly.',
    fixWindow: 'v0.5.2 patch release'
  },
  {
    category: 'Exports',
    title: 'MP4 render crash with multiple effects stacks',
    status: 'Under Investigation',
    statusColor: '#e91e63',
    description: 'Exporting projects containing more than 4 simultaneous shader overlays on a single clip can occasionally cause NVENC hardware encoder to timeout.',
    workaround: 'Try disabling hardware-accelerated exports in the Export settings, which falls back to CPU encoding.',
    fixWindow: 'v0.6.0 milestone'
  },
  {
    category: 'Audio',
    title: 'Audio drift on clips longer than 20 minutes',
    status: 'Fixed in next patch',
    statusColor: '#4caf50',
    description: 'Audio sync shifts by 150-300ms on long continuous recordings due to sample rate conversions from 44.1kHz to 48kHz.',
    workaround: 'Pre-split longer clips on the timeline into sub-clips of under 10 minutes to reset sync clocks.',
    fixWindow: 'v0.5.1 hotfix (Releasing tomorrow)'
  },
  {
    category: 'Performance',
    title: 'High memory usage on timeline undo history',
    status: 'In Progress',
    statusColor: '#ff9800',
    description: 'Undo buffers are keeping heavy image cached textures in RAM instead of purging them, leading to increased memory footprints after hours of editing.',
    workaround: 'Save and restart the editor to flush RAM cache.',
    fixWindow: 'v0.5.5 stability updates'
  },
  {
    category: 'UI',
    title: 'Dual monitors drag drop misalignment',
    status: 'Planned',
    statusColor: '#2196f3',
    description: 'Dragging layout panels to a second display with a different DPI scaling value causes dock targets to offset.',
    workaround: 'Set both monitors to matching DPI scale percentages (e.g. 100% or 125%) in Windows Display settings.',
    fixWindow: 'v0.7.0 layout engine rework'
  }
];

export default function KnownIssuesPage() {
  return (
    <div className="issues-container">
      <div className="issues-bg-glow"></div>
      
      <div className="issues-header">
        <span className="issues-kicker">Status & Tracking</span>
        <h1>Known Issues</h1>
        <p>Before submitting a bug report, check here to see if the issue is already recognized. This list is updated in real-time as reports are verified by our team.</p>
        <div style={{ marginTop: '1.25rem' }}>
          <a href="/report" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            Report Unlisted Issue
          </a>
        </div>
      </div>

      <div className="issues-list">
        {ISSUES_LIST.map((issue, idx) => (
          <div key={idx} className="issue-card">
            <div className="issue-meta">
              <span className="issue-category">{issue.category}</span>
              <span className="issue-status" style={{ borderLeftColor: issue.statusColor }}>
                <span className="status-dot" style={{ backgroundColor: issue.statusColor }}></span>
                {issue.status}
              </span>
            </div>
            
            <h3 className="issue-title">{issue.title}</h3>
            <p className="issue-desc">{issue.description}</p>
            
            <div className="issue-workaround">
              <strong>Workaround:</strong> {issue.workaround}
            </div>
            
            <div className="issue-fix-window">
              <span>Expected Fix:</span> <strong>{issue.fixWindow}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
