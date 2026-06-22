'use client';

import React from 'react';

const ISSUES_LIST = [
  {
    category: 'KEYFRAMES',
    title: 'Keyframe edge cases after the keyframing overhaul',
    status: 'In Progress',
    statusColor: '#ff9800',
    description: "Keyframing was recently reworked to fix value corruption, duplicate keyframes, and half-undo states. Core position/scale/rotation/opacity keyframing is now reliable, but a few edge cases remain while we harden it: audio volume/pan keyframes currently interpolate linearly (keyframe easing curves aren't applied to audio yet), and gizmo-driven keyframe edits on heavily-animated clips can occasionally need a second adjustment.",
    workaround: "For audio fades prefer the dedicated Fade In/Out controls over volume keyframes; re-open the keyframe value if an edit doesn't land first try.",
    fixWindow: 'Rolling fixes across upcoming patches.'
  },
  {
    category: 'TRANSFORM',
    title: 'Selection box larger than letterboxed overlay images',
    status: 'Known Limitation',
    statusColor: '#a855f7',
    description: 'Non-16:9 images added as overlays now correctly keep their aspect ratio (letterboxed), but the selection/transform box can still span the full frame instead of hugging the visible image, making the handles sit outside the picture.',
    workaround: "Scale/position using the Transform panel values; the box is cosmetic and doesn't affect the rendered output.",
    fixWindow: 'In progress.'
  },
  {
    category: 'RENDERING',
    title: 'Text can look soft at some zoom levels',
    status: 'In Progress',
    statusColor: '#ff9800',
    description: "Text overlays can appear slightly soft or aliased at certain preview zoom levels compared to dedicated text tools. The rendered/exported output is correct; this is a preview-sharpness pass we're still tuning.",
    workaround: 'Increase font size slightly, or judge final sharpness from an exported clip.',
    fixWindow: 'Higher-quality text render pass, in progress.'
  },
  {
    category: 'PLAYBACK',
    title: 'Stutter on integrated / low-end GPUs',
    status: 'Known Limitation',
    statusColor: '#a855f7',
    description: 'On integrated or older GPUs, timeline playback can stutter or briefly drop frames under load. Playback now auto-recovers and will not freeze (it falls back to a reliable hardware decode path and restarts any stalled decoder), but smoothness is lower than on discrete GPUs.',
    workaround: 'Lower the preview resolution/zoom; close other GPU-heavy apps. Export quality is unaffected.',
    fixWindow: 'Ongoing low-end performance work.'
  },
  {
    category: 'WORKSPACES',
    title: 'Studio, VIMO, Chitra AI and several tools are under development',
    status: 'Planned',
    statusColor: '#2196f3',
    description: "The following are visible but not yet active: Studio and VIMO workspaces, the Chitra AI copilot, Speed-curve graphs, Auto-captions, Filters, Adjust, Chroma key, and Background removal. They're intentionally labeled \"under development\" during beta.",
    workaround: 'None needed — these will light up in upcoming releases.',
    fixWindow: 'Phased rollout post-beta.'
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
