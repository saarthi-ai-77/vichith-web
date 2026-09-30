/**
 * VICHITH DESIGN SYSTEM
 * =====================
 * 
 * A premium creative technology experience.
 * Not an AI SaaS landing page.
 * 
 * Core Philosophy:
 * - Spatial composition over card grids
 * - Typography as primary visual system
 * - Motion communicates product
 * - 3D depth creates immersion
 * - Minimal elements, maximum sophistication
 */

// COLOR SYSTEM
// Only Vichith's trademark colors
export const colors = {
  // Primary
  background: '#070809',      // Deep near-black
  foreground: '#F4F4F5',       // Off-white
  accent: '#83D0BE',          // Vichith cyan
  
  // Variants
  accentHover: '#98dec9',     // Lighter cyan
  accentDeep: '#479080',      // Darker cyan
  
  // Neutrals
  surface: '#0E1012',         // Elevated surface
  surfaceHover: '#121416',    // Hover state
  line: 'rgba(255,255,255,0.06)',      // Subtle borders
  lineStrong: 'rgba(255,255,255,0.12)', // Stronger borders
  
  // Text hierarchy
  textPrimary: '#F4F4F5',     // Headlines
  textSecondary: '#A1A1AA',   // Body
  textTertiary: '#71717A',    // Metadata
  textMuted: '#52525B',       // Disabled/quiet
} as const;

// TYPOGRAPHY SYSTEM
export const typography = {
  // Font families
  display: 'var(--font-syne)',      // Syne for display
  body: 'var(--font-inter)',         // Inter for body
  mono: 'var(--font-jetbrains-mono)', // JetBrains Mono for technical
  
  // Scale - extreme hierarchy
  sizes: {
    hero: 'clamp(3rem, 8vw, 7rem)',      // Hero headlines
    display: 'clamp(2.5rem, 5vw, 4rem)', // Section titles
    headline: 'clamp(1.75rem, 3vw, 2.5rem)', // Subsection
    title: '1.25rem',                    // Card titles
    body: '1rem',                        // Body text
    small: '0.875rem',                   // Secondary
    caption: '0.75rem',                  // Metadata
    micro: '0.6875rem',                  // Technical labels
  },
  
  // Weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Tracking
  tracking: {
    tight: '-0.03em',
    normal: '0',
    wide: '0.05em',
    wider: '0.1em',
    tech: '0.14em', // For mono uppercase
  },
  
  // Line height
  leading: {
    tight: 1,
    snug: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// SPATIAL SYSTEM
export const space = {
  // Base unit: 4px
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  32: '8rem',       // 128px
  40: '10rem',      // 160px
  48: '12rem',      // 192px
} as const;

// MOTION SYSTEM
export const motion = {
  // Easing
  easing: {
    smooth: [0.16, 1, 0.3, 1],      // Primary smooth
    snappy: [0.4, 0, 0.2, 1],       // UI interactions
    bounce: [0.68, -0.55, 0.265, 1.55], // Playful
    linear: [0, 0, 1, 1],           // Constant
  },
  
  // Durations
  duration: {
    micro: 0.15,    // 150ms - hover, focus
    fast: 0.25,     // 250ms - button clicks
    normal: 0.4,    // 400ms - UI transitions
    slow: 0.8,      // 800ms - section entrances
    narrative: 1.2, // 1200ms - major transitions
    cinematic: 1.6, // 1600ms - hero sequences
  },
  
  // Stagger
  stagger: {
    tight: 0.05,    // 50ms
    normal: 0.1,    // 100ms
    relaxed: 0.15,  // 150ms
    dramatic: 0.2,  // 200ms
  },
} as const;

// 3D SYSTEM
export const depth = {
  // Perspective values
  perspective: {
    near: 500,      // Intimate
    normal: 1000,   // Standard
    far: 1500,      // Expansive
  },
  
  // Z-depth scale
  z: {
    behind: -100,
    base: 0,
    raised: 50,
    floating: 100,
    overlay: 200,
    modal: 300,
  },
  
  // Transform defaults
  transform: {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    translateZ: 0,
  },
} as const;

// BORDERS & SHAPES
export const borders = {
  width: {
    hairline: '1px',
    thin: '1.5px',
    normal: '2px',
  },
  radius: {
    none: 0,
    sharp: '2px',
    slight: '4px',
    soft: '8px',
    round: '16px',
    pill: '9999px',
  },
} as const;

// SHADOWS (minimal, sophisticated)
export const shadows = {
  subtle: '0 1px 2px rgba(0,0,0,0.3)',
  soft: '0 4px 20px rgba(0,0,0,0.4)',
  medium: '0 8px 40px rgba(0,0,0,0.5)',
  large: '0 25px 80px rgba(0,0,0,0.6)',
  glow: '0 0 60px rgba(131,208,190,0.1)',
} as const;

// SECTION SPACING
export const sections = {
  padding: {
    sm: '4rem',
    md: '6rem',
    lg: '8rem',
    xl: '10rem',
  },
  maxWidth: {
    content: '72rem',    // 1152px
    text: '40rem',       // 640px
    feature: '56rem',    // 896px
  },
} as const;

// BREAKPOINTS
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
