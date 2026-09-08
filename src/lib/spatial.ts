/**
 * Shared motion, section, and spatial constants for the Vichith Hybrid Experience.
 * Defines section anchors, pinned stage durations, and fluid easing curves.
 */

export const SECTION_IDS = {
  hero: "idea",
  context: "context",
  chithra: "chithra",
  canvas: "canvas",
  studio: "studio",
  image: "image",
  closing: "closing",
} as const;

/** Pinned scroll distances for narrative stages that require focused interactive choreography */
export const STAGE_SCROLL = {
  chithra: 1800, // Distance for Chithra's 4-beat generative dialogue
  studio: 1400,  // Distance for Studio workbench clip landing and intent demonstration
} as const;

/** Canonical easing tokens */
export const EASINGS = {
  cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
  smoothOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  expressive: "cubic-bezier(0.77, 0, 0.175, 1)",
} as const;
