"use client";

import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

/**
 * Vichith Bespoke Creative Production Iconography
 * Distinct, geometric, technical, non-generic SVG glyphs.
 */

// Project Core: Concentric technical diamond & core node
export function IconProjectCore({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 7v2m0 6v2M7 12h2m6 0h2" strokeWidth="1.5" />
    </svg>
  );
}

// Precision Splice / Razor: NLE razor blade with optical angle
export function IconSplice({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 3h12v18H6z" rx="1.5" />
      <path d="M9 3v4a3 3 0 0 0 6 0V3" />
      <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
      <line x1="12" y1="9" x2="12" y2="15" strokeDasharray="1.5 1.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

// Semantic Motion Curve: Non-standard Bézier curve with vector control handles
export function IconMotionCurve({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 19C8 19 8 5 15 5c4 0 6 6 6 6" />
      <circle cx="3" cy="19" r="1.75" />
      <circle cx="15" cy="5" r="1.75" />
      <line x1="15" y1="5" x2="20" y2="5" strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx="20" cy="5" r="1" fill="currentColor" />
    </svg>
  );
}

// Anamorphic Viewfinder Frame: 2.39:1 crop with center reticle
export function IconAnamorphic({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="2" y="6" width="20" height="12" rx="1.5" />
      <path d="M6 9H4v6h2M18 9h2v6h-2" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <line x1="12" y1="10" x2="12" y2="14" strokeWidth="0.8" />
      <line x1="10" y1="12" x2="14" y2="12" strokeWidth="0.8" />
    </svg>
  );
}

// Chithra Intelligent Spark / Synthesis Glyph
export function IconChithraNode({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2C12 7.52 7.52 12 2 12c5.52 0 10 4.48 10 10 0-5.52 4.48-10 10-10-5.52 0-10-4.48-10-10Z" />
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

// Multi-Track Timeline Stack: 3 staggered technical tracks
export function IconTimelineStack({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="4" width="8" height="3.5" rx="1" />
      <rect x="13" y="4" width="8" height="3.5" rx="1" />
      <rect x="5" y="10.25" width="13" height="3.5" rx="1" fill="currentColor" fillOpacity="0.15" />
      <rect x="3" y="16.5" width="6" height="3.5" rx="1" />
      <rect x="11" y="16.5" width="10" height="3.5" rx="1" />
      <line x1="9" y1="2" x2="9" y2="22" strokeWidth="1" stroke="#83D0BE" />
    </svg>
  );
}

// Pipeline Weave: Connected production pipeline graph
export function IconPipelineWeave({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="4" cy="12" r="2" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <circle cx="20" cy="12" r="2" />
      <path d="M6 12h2a4 4 0 0 0 4-4v-0a4 4 0 0 1 4-4h2" />
      <path d="M6 12h2a4 4 0 0 1 4 4v0a4 4 0 0 0 4 4h2" />
    </svg>
  );
}

// Harmonic Sound Waveform: Frequency bars with center envelope
export function IconHarmonicWave({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <line x1="3" y1="12" x2="3" y2="12.01" strokeWidth="2" />
      <line x1="6" y1="8" x2="6" y2="16" />
      <line x1="9" y1="4" x2="9" y2="20" />
      <line x1="12" y1="7" x2="12" y2="17" strokeWidth="1.75" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="18" y1="9" x2="18" y2="15" />
      <line x1="21" y1="12" x2="21" y2="12.01" strokeWidth="2" />
    </svg>
  );
}

// Continuous Creative Loop Glyph
export function IconLoopContinuous({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M21 21v-5h-5" />
    </svg>
  );
}

// Arrow Right Clean Pill Link
export function IconArrowRightPill({ size = 14, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

// Idea Genesis: Concentric geometric thought focal point
export function IconIdeaGenesis({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Dialogue Intent: Minimal optical message token
export function IconDialogueIntent({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M7 17l-2 4 4-2h12" />
      <line x1="7" y1="9" x2="17" y2="9" />
      <line x1="7" y1="13" x2="13" y2="13" />
    </svg>
  );
}

// Generative Synthesis: Dynamic multi-angle prism
export function IconPrismGen({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="2 2" />
      <line x1="2" y1="8.5" x2="22" y2="15.5" strokeOpacity="0.5" />
      <line x1="2" y1="15.5" x2="22" y2="8.5" strokeOpacity="0.5" />
    </svg>
  );
}

// Optical Scale: Resolution magnifier
export function IconOpticalScale({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 9v6M9 12h6" strokeWidth="1" />
    </svg>
  );
}

// Master Delivery Export: Clean tape reel container
export function IconTapeContainer({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="12" r="2.5" />
      <circle cx="16" cy="12" r="2.5" />
      <line x1="8" y1="9.5" x2="16" y2="9.5" />
    </svg>
  );
}

// Camera Aperture Iris: 6-blade mechanical iris
export function IconApertureIris({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
      <line x1="9.69" y1="8" x2="21.17" y2="8" />
      <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
      <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
      <line x1="14.31" y1="16" x2="2.83" y2="16" />
      <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
    </svg>
  );
}
