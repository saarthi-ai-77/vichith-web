/**
 * Shared constants for the 3D Theater Scroll Experience.
 * Defines theater acts, calibrated scroll progress waypoints, and navigation anchors.
 */

export const THEATER_ACTS = [
  { id: "arrival", label: "Arrival", progress: 0.04 },
  { id: "context", label: "Thread", progress: 0.25 },
  { id: "chithra", label: "Chithra", progress: 0.45 },
  { id: "studio", label: "Studio", progress: 0.64 },
  { id: "control", label: "Control", progress: 0.81 },
  { id: "closing", label: "Access", progress: 0.96 },
] as const;

export const SECTION_IDS = {
  arrival: "arrival",
  context: "context",
  chithra: "chithra",
  studio: "studio",
  control: "control",
  closing: "closing",

  // Legacy & navigation aliases
  hero: "arrival",
  fragmentation: "context",
  intent: "chithra",
  canvas: "studio",
  image: "studio",
  refine: "control",
  loop: "control",
  future: "studio",
  access: "closing",
} as const;

export const THEATER_SCROLL_HEIGHT = "700vh";
export const SCROLL_DISTANCE = 10000;

export const STAGE_SCROLL = {
  chithra: 1800,
  studio: 1400,
} as const;

export const EASINGS = {
  cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
  smoothOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  expressive: "cubic-bezier(0.77, 0, 0.175, 1)",
} as const;

export const DEPTH = {
  idea: 0,
  context: -2000,
  conversationStart: -3200,
  conversationEnd: -6900,
  project: -8900,
  ecosystem: -10900,
  closing: -12900,
} as const;
