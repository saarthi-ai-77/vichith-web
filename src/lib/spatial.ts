/**
 * Shared depth-timeline constants for the homepage's scroll-jacked 3D
 * experience (SpatialCanvas + every Scene*). Total scroll distance grew when
 * the Chithra section became a real multi-beat conversation instead of one
 * static moment — kept here, not duplicated as a magic number in every file
 * that needs to agree on where things sit in Z.
 */
export const SCROLL_DISTANCE = 12900;

/**
 * Every top-level scene's own data-z, single source of truth so neighboring
 * scenes can't drift out of the pacing that was actually tuned.
 *
 * Idea->Context stays a full 2000px apart: SpatialCanvas's own opacity
 * formula only reaches true zero at >=2000px distance, and Context is what
 * you see FIRST, at rest, before any scrolling -- a smaller gap here
 * previously meant Context was already ~40% visible at scroll position
 * zero (a real bug, fixed once already). That risk is specific to what's
 * visible before scrolling starts, though -- it does NOT apply to a
 * transition happening mid-scroll, where some crossfade overlap between
 * neighbors is the desired smooth handoff, not a bug. Context->conversation
 * was tightened from 2000 to 1200 for that reason (found too slow/empty
 * live) -- Conversation itself uses its own tighter custom opacity logic,
 * not this formula, so this gap only governs the handoff INTO it.
 */
export const DEPTH = {
  idea: 0,
  context: -2000,
  conversationStart: -3200,
  conversationEnd: -6900,
  project: -8900,
  ecosystem: -10900,
  closing: -12900,
} as const;
