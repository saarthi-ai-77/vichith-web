/**
 * Shared motion, section, and spatial constants for the Vichith Hybrid Experience.
 * Defines section anchors, pinned stage durations, and fluid easing curves.
 */

export const SECTION_IDS = {
  arrival: "arrival",
  fragmentation: "fragmentation",
  chithra: "chithra",
  intent: "intent",
  control: "control",
  canvas: "canvas",
  refine: "refine",
  loop: "loop",
  future: "future",
  access: "access",

  // Legacy aliases for compatibility
  hero: "arrival",
  context: "fragmentation",
  studio: "control",
  image: "canvas",
  closing: "access",
} as const;

/** Canonical easing tokens */
export const EASINGS = {
  cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
  smoothOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  expressive: "cubic-bezier(0.77, 0, 0.175, 1)",
} as const;

export const STAGE_SCROLL = {
  chithra: 1800,
  studio: 1400,
} as const;


