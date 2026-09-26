/**
 * Shared depth-timeline constants for the homepage's scroll-jacked 3D
 * experience (SpatialCanvas + every Scene*). Total scroll distance grew when
 * the Chithra section became a real multi-beat conversation instead of one
 * static moment — kept here, not duplicated as a magic number in every file
 * that needs to agree on where things sit in Z.
 */
export const SCROLL_DISTANCE = 18000;

/**
 * Every top-level scene's own data-z, single source of truth so neighboring
 * scenes can't drift out of the pacing that was actually tuned.
 *
 * Spacing rationale:
 *   idea → context:          2000  (short — quick reveal, no beats)
 *   context → convStart:     1200  (bridge)
 *   convStart → convEnd:     3700  (8 beats, 500px each)
 *   convEnd → project:       2000  (breather)
 *   project → editing:       2300  (complex visual, needs entry time)
 *   editing → motion:        3800  (matches conversation-beat spacing —
 *                                   was 2400 which caused motion to cut
 *                                   out of visibility before settling)
 *   motion → closing:        3000  (comfortable exit into CTA)
 */
export const DEPTH = {
  idea: 0,
  context: -2000,
  conversationStart: -3200,
  conversationEnd: -6900,
  project: -8900,
  editing: -11200,
  motion: -15000,
  closing: -18000,
  // Backward compatibility alias
  ecosystem: -11200,
} as const;

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

  // Legacy aliases
  hero: "arrival",
  context: "fragmentation",
  studio: "control",
  image: "canvas",
  closing: "access",
} as const;

export const THEATER_SCROLL_HEIGHT = "700vh";

export const THEATER_ACTS = [
  { id: "arrival", label: "Arrival", progress: 0.04 },
  { id: "context", label: "Thread", progress: 0.25 },
  { id: "chithra", label: "Chithra", progress: 0.45 },
  { id: "studio", label: "Studio", progress: 0.64 },
  { id: "control", label: "Control", progress: 0.81 },
  { id: "closing", label: "Access", progress: 0.96 },
] as const;

export const STAGE_SCROLL = {
  chithra: 1800,
  studio: 1400,
} as const;

export const EASINGS = {
  cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
  smoothOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  expressive: "cubic-bezier(0.77, 0, 0.175, 1)",
} as const;
