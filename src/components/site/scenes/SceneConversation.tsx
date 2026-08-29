"use client";

import { useEffect, useRef } from "react";
import { CAMERA_EVENT } from "../SpatialCanvas";
import { DEPTH } from "@/lib/spatial";

/**
 * The Chithra section, rebuilt as a real exchange instead of one static
 * "meet the orchestrator" moment. Eight beats, each its own `.scene[data-z]`
 * (SpatialCanvas's existing opacity-by-distance pass already handles them
 * individually, same mechanism every top-level scene uses — nothing new
 * there). What IS new: everything below reacts to `CAMERA_EVENT`, the exact
 * same cameraZ/progress SpatialCanvas already computes every frame, applied
 * imperatively via refs (no React state per scroll frame — a re-render on
 * every scrub tick is how you get jank; direct style writes are how the rest
 * of this codebase already avoids it, e.g. SpatialCanvas's own
 * applyOpacityToLeaves).
 *
 * Deliberately NOT a progress bar / line-fill anywhere:
 *   - dialogue reveals character-by-character, tied to scroll position, not
 *     a timed stagger
 *   - "thinking" is three noise-driven, velocity-reactive dots, not a spinner
 *   - approval is a radial wipe from a center point, not a linear fill
 *   - generation is a photograph developing (blur+desaturate -> sharp+color)
 *   - the connecting thread is a single marker moving along a fixed path,
 *     not a bar filling up
 */

// Deterministic "random" — same technique SceneEcosystem already uses
// (Math.random() in render differs between server and client hydration;
// a pure function of a stable seed does not).
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

type Beat =
  | { z: number; kind: "user"; text: string }
  | { z: number; kind: "thinking" }
  | { z: number; kind: "chithra"; text: string }
  | { z: number; kind: "proposal"; model: string; reason: string; cost: string }
  | { z: number; kind: "approve"; model: string; cost: string }
  | { z: number; kind: "generating"; caption: string }
  | { z: number; kind: "landed" };

// Positions relative to DEPTH.conversationStart, not separately-hardcoded
// absolute values -- found live once already (see spatial.ts's own history):
// a shared constant only prevents drift if every consumer actually reads it
// instead of duplicating the number. The LAST beat's offset must equal
// DEPTH.conversationEnd - DEPTH.conversationStart, or the two files have
// silently disagreed about where this section ends again.
const s = DEPTH.conversationStart;
const BEATS: Beat[] = [
  { z: s, kind: "user", text: "I want a cinematic shot of a lighthouse at sunset, warm golden light." },
  { z: s - 500, kind: "thinking" },
  { z: s - 1000, kind: "chithra", text: "One shot, or a short sequence building up to it?" },
  { z: s - 1500, kind: "user", text: "Just one shot. Make it feel like a memory, not a postcard." },
  { z: s - 2200, kind: "proposal", model: "Seedream 4.5", reason: "Strongest at held reference light and mood.", cost: "4 credits" },
  { z: s - 2700, kind: "approve", model: "Seedream 4.5", cost: "4 credits" },
  { z: s - 3200, kind: "generating", caption: "A solitary lighthouse, warm golden light" },
  { z: s - 3700, kind: "landed" }, // must equal DEPTH.conversationEnd
];

// CONFIRMED BUG, FIXED (found live -- screenshots showed the "thinking"
// beat's dots still on screen while the NEXT beat's text was already fully
// visible, overlapping in the same spot). Beats are 500px apart; the old
// values (500/1500) meant a beat only STARTED receding right as the next
// one finished arriving, so there was a real window where both sat at
// meaningful opacity simultaneously. Tightened so a beat is most of the way
// gone by the time its neighbor centers, instead of handing off cleanly.
const RECEDE_START = 150;
const RECEDE_END = 450;

/**
 * CONFIRMED BUG, FIXED (found live): splitting text into one <span> per
 * character breaks line-wrapping in this environment -- verified directly,
 * not guessed. The SAME text in the SAME box wraps correctly as plain text
 * (scrollWidth === offsetWidth) and does NOT wrap at all as per-character
 * spans (scrollWidth > offsetWidth, forced onto one line, overflowing the
 * card). Replaced with RevealText below -- a real single text node (wraps
 * normally) revealed via a clip-path mask, which also plays correctly
 * across however many lines the text wraps to, unlike per-character opacity.
 */
function RevealText({ text, reserveRef, align = "left" }: { text: string; reserveRef: (el: HTMLParagraphElement | null) => void; align?: "left" | "right" }) {
  return (
    <p
      ref={reserveRef}
      className={"text-xl md:text-2xl font-light leading-snug" + (align === "right" ? " text-right" : "")}
      style={{ clipPath: "inset(0 100% 0 0)" }}
    >
      {text}
    </p>
  );
}

function BeatCard({
  beat, index, rootRef, innerRef, glowRef, textRef,
}: {
  beat: Beat; index: number;
  rootRef: (el: HTMLDivElement | null) => void;
  innerRef: (el: HTMLDivElement | null) => void;
  glowRef?: (el: HTMLDivElement | null) => void;
  textRef?: (el: HTMLParagraphElement | null) => void;
}) {
  const tilt = (noise(index * 7.3) - 0.5) * 16; // -8..8deg, varied per beat so entrances don't feel templated
  const fromLeft = index % 2 === 0; // dialogue alternates sides, like a real exchange

  return (
    <div
      ref={rootRef}
      className="scene absolute inset-0 flex items-center preserve-3d pointer-events-none"
      data-z={beat.z}
      style={{ transform: `translateZ(${beat.z}px)` }}
    >
      <div
        ref={innerRef}
        className={
          "w-full max-w-xl px-6 pointer-events-auto preserve-3d " +
          (beat.kind === "user" ? "ml-auto md:mr-[12vw]" : beat.kind === "chithra" ? "mr-auto md:ml-[12vw]" : "mx-auto")
        }
        style={{ transform: `translateY(40px) rotateZ(${fromLeft ? tilt : -tilt}deg)`, opacity: 0 }}
        data-beat-inner=""
      >
        {beat.kind === "user" && (
          <div className="glass-panel shadow-float px-6 py-4 rounded-2xl">
            <div className="eyebrow mb-2 text-right">You</div>
            <RevealText text={beat.text} reserveRef={textRef ?? (() => {})} align="right" />
          </div>
        )}

        {beat.kind === "chithra" && (
          <div className="glass-panel shadow-float px-6 py-4 rounded-2xl">
            <div className="eyebrow mb-2">Chithra</div>
            <RevealText text={beat.text} reserveRef={textRef ?? (() => {})} />
          </div>
        )}

        {beat.kind === "thinking" && (
          <div className="flex items-center gap-3">
            <div className="eyebrow">Chithra</div>
            <div ref={glowRef} className="flex items-center gap-2 h-8">
              {[0, 1, 2].map((i) => (
                <span key={i} data-dot={i} className="inline-block w-2.5 h-2.5 rounded-full bg-accent" />
              ))}
            </div>
          </div>
        )}

        {beat.kind === "proposal" && (
          <div className="glass-panel shadow-float p-6 rounded-2xl">
            <div className="eyebrow mb-3">Proposed</div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-medium">{beat.model}</span>
              <span className="font-mono text-sm text-accent">{beat.cost}</span>
            </div>
            <p className="text-sm text-muted-foreground">{beat.reason}</p>
            <div className="mt-4 pt-4 border-t border-line flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Nothing happens until you approve.
            </div>
          </div>
        )}

        {beat.kind === "approve" && (
          // Not a bare checkmark in a void -- the SAME proposal chip
          // (model + cost) from the beat before it, so this reads as
          // confirming a specific thing, not a generic "success" icon.
          <div className="glass-panel shadow-float px-5 py-4 rounded-2xl flex items-center gap-4">
            <div ref={glowRef} className="relative w-11 h-11 shrink-0">
              <div
                data-approve-wipe=""
                className="absolute inset-0 rounded-full border-2 border-accent"
                style={{ clipPath: "circle(0% at 50% 50%)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">{beat.model}</div>
              <div className="text-xs text-muted-foreground">{beat.cost} · approved</div>
            </div>
          </div>
        )}

        {beat.kind === "generating" && (
          // A real 16:9 frame (this IS the shot's aspect ratio, not an
          // arbitrary blob) with a faint scan texture -- reads as a frame
          // developing, not a decorative gradient -- captioned with the
          // actual prompt so it's clearly THIS shot, not a stand-in.
          <div className="flex flex-col items-center gap-3">
            <div
              ref={glowRef}
              data-develop=""
              className="w-72 aspect-video rounded-xl overflow-hidden relative bg-gradient-to-br from-accent/40 via-accent-deep/30 to-surface"
              style={{ filter: "blur(14px) saturate(0.3)" }}
            >
              <div
                className="absolute inset-0 opacity-25 mix-blend-overlay"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)",
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground italic max-w-72 text-center">&ldquo;{beat.caption}&rdquo;</p>
          </div>
        )}

        {beat.kind === "landed" && (
          // Same treatment as the finished "generating" frame, deliberately
          // -- it's the SAME shot, now settling in place, not a new random
          // card. The dashed connector + dot is the exact provenance-edge
          // language SceneProject's own graph uses, foreshadowing it rather
          // than introducing a new visual vocabulary for one beat.
          <div className="flex items-center gap-3">
            <div className="w-36 aspect-video rounded-lg bg-gradient-to-br from-accent/50 to-accent-deep/40 border border-accent/40 shadow-float shrink-0" />
            <div className="flex items-center gap-2">
              <svg width="28" height="12" viewBox="0 0 28 12" className="text-accent/60 shrink-0">
                <path d="M0 6 H28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
              <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                Added to your project
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SceneConversation() {
  const rootRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const innerRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const glowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const textRefs = useRef<Record<number, HTMLParagraphElement | null>>({});
  const threadDotRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onCamera(e: Event) {
      const { cameraZ, velocity } = (e as CustomEvent<{ cameraZ: number; velocity: number }>).detail;

      BEATS.forEach((beat, i) => {
        const inner = innerRefs.current[i];
        if (!inner) return;
        // SpatialCanvas's real cameraZ is ALWAYS POSITIVE (progress * scrollDistance,
        // 0..SCROLL_DISTANCE) -- every data-z in this codebase is negative, and every
        // OTHER distance check (SpatialCanvas's own opacity pass included) compares
        // against Math.abs(dataZ), never the signed value. Comparing against the raw
        // negative beat.z here would never line up with a real (positive) cameraZ --
        // caught by dispatching synthetic camera-update events directly rather than
        // trusting an untested formula.
        const d = cameraZ - Math.abs(beat.z); // >0: camera has passed this beat (it's "history")

        // Skip real work for beats nowhere near the camera -- SpatialCanvas
        // already hides them (opacity 0 / visibility hidden), this just
        // avoids computing reveal/wipe/develop math for ~7 offscreen beats
        // every single scroll frame.
        if (d < -1200 || d > RECEDE_END + 200) {
          inner.style.opacity = "0";
          return;
        }

        // Entrance: rises up + settles from a slight tilt as the camera
        // arrives (d moving from -600 toward 0).
        const entrance = Math.max(0, Math.min(1, (d + 600) / 600));
        // CONFIRMED BUG, FIXED (found live): `local` used to keep revealing
        // all the way to d=400, but RECEDE_START (150) already had the beat
        // fading OUT by then -- text was still being typed while
        // simultaneously vanishing, never reaching full visibility. `local`
        // must finish BEFORE recede starts, not overlap it. Completes at
        // d=100 now, with recede not starting until d=150 -- a real 50px
        // window where the text sits fully revealed before it begins to fade.
        const local = Math.max(0, Math.min(1, (d + 500) / 600));

        // Recede: once the camera has moved on, shrink + blur rather than
        // just relying on SpatialCanvas's opacity alone -- real depth, not
        // a flat fade. Must start AFTER `local` above finishes revealing.
        const recede = Math.max(0, Math.min(1, (d - RECEDE_START) / (RECEDE_END - RECEDE_START)));
        const scale = 1 - recede * 0.14;
        const blurPx = recede * 5;
        const translateY = (1 - entrance) * 40 * (d < 0 ? 1 : 0.15); // settle in from below, barely drift once arrived

        // Opacity must be gated by BOTH: fading IN as the beat arrives
        // (entrance) and fading OUT once the camera's moved on (recede).
        // `entrance` was previously only driving the Y-position, so a beat
        // that hadn't arrived yet sat at full opacity, just lower -- caught
        // the same way, firing synthetic events at "not yet arrived" camera
        // positions and finding opacity stuck at 1.
        inner.style.opacity = String(Math.max(0, Math.min(entrance, 1 - recede * 1.05)));
        inner.style.transform = `translateY(${translateY}px) scale(${scale})`;
        inner.style.filter = blurPx > 0.05 ? `blur(${blurPx}px)` : "";

        // Per-beat effect
        if (beat.kind === "user" || beat.kind === "chithra") {
          const text = textRefs.current[i];
          if (text) {
            // Reveal left-to-right by box percentage -- plays correctly
            // across however many lines this wraps to, which per-character
            // spans could not (see RevealText's header comment for why
            // those were replaced). A thin accent border rides the clip
            // edge as a simple caret while still revealing.
            const hiddenPct = Math.round((1 - local) * 100);
            text.style.clipPath = `inset(0 ${hiddenPct}% 0 0)`;
            text.style.borderRight = local < 1 && local > 0 ? "2px solid var(--color-accent)" : "none";
          }
        } else if (beat.kind === "thinking") {
          const dots = glowRefs.current[i]?.querySelectorAll<HTMLElement>("[data-dot]");
          const speed = 1 + Math.min(3, Math.abs(velocity) / 400); // faster scroll -> livelier pulse
          dots?.forEach((dot, di) => {
            const phase = (local * speed * 3 + di * 0.9) % 1;
            const s = 0.6 + noise(Math.floor(phase * 8) + di * 3.1) * 0.6;
            dot.style.transform = `scale(${s.toFixed(2)})`;
            dot.style.opacity = String(0.4 + s * 0.5);
          });
        } else if (beat.kind === "approve") {
          const wipe = glowRefs.current[i]?.querySelector<HTMLElement>("[data-approve-wipe]");
          if (wipe) wipe.style.clipPath = `circle(${Math.round(local * 75)}% at 50% 50%)`;
        } else if (beat.kind === "generating") {
          const el = glowRefs.current[i];
          if (el) {
            const blur = 14 * (1 - local);
            const sat = 0.3 + local * 0.9;
            el.style.filter = `blur(${blur.toFixed(1)}px) saturate(${sat.toFixed(2)})`;
          }
        }
      });

      // The connecting thread's marker -- follows overall progress through
      // THIS section only, as a single moving point, not a bar filling.
      // Same abs() fix as the per-beat distance above -- DEPTH's values are
      // negative, real cameraZ is not.
      const convStart = Math.abs(DEPTH.conversationStart);
      const convEnd = Math.abs(DEPTH.conversationEnd);
      const convProgress = Math.max(0, Math.min(1, (cameraZ - convStart) / (convEnd - convStart)));
      if (threadDotRef.current) {
        threadDotRef.current.style.top = `${(8 + convProgress * 84).toFixed(1)}%`;
        threadDotRef.current.style.opacity =
          cameraZ > convStart - 400 && cameraZ < convEnd + 600 ? "1" : "0";
      }

      // Orienting kicker (Phase 4): the section previously opened cold on
      // beat 1 with nothing establishing "this is Chithra" before the
      // exchange starts. Fades in just ahead of it, holds through the
      // first exchange, then fades out once the dialogue is self-evident
      // (each bubble already labels itself "You"/"Chithra") rather than
      // lingering as clutter for the whole section.
      if (kickerRef.current) {
        const kd = cameraZ - convStart;
        let kickerOpacity: number;
        if (kd < -500) kickerOpacity = 0;
        else if (kd < -100) kickerOpacity = (kd + 500) / 400;
        else if (kd < 400) kickerOpacity = 1;
        else if (kd < 700) kickerOpacity = 1 - (kd - 400) / 300;
        else kickerOpacity = 0;
        kickerRef.current.style.opacity = String(Math.max(0, Math.min(1, kickerOpacity)));
      }
    }

    window.addEventListener(CAMERA_EVENT, onCamera);
    return () => window.removeEventListener(CAMERA_EVENT, onCamera);
  }, []);

  return (
    <>
      {BEATS.map((beat, i) => (
        <BeatCard
          key={i}
          beat={beat}
          index={i}
          rootRef={(el) => { rootRefs.current[i] = el; }}
          innerRef={(el) => { innerRefs.current[i] = el; }}
          glowRef={(el) => { glowRefs.current[i] = el; }}
          textRef={(el) => { textRefs.current[i] = el; }}
        />
      ))}

      {/* Orienting kicker -- see the fade-timing comment above. Fixed to the
          viewport (not a .scene node) since it isn't part of the 3D depth
          stack, just a UI label riding alongside it. */}
      <div
        ref={kickerRef}
        className="fixed top-[10%] left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-1 opacity-0"
      >
        <span className="eyebrow text-accent">Chithra</span>
        <span className="text-xs text-muted-foreground">watch how it actually works</span>
      </div>

      {/* The thread -- a fixed path, a single moving glow, not a fill bar. */}
      <div className="fixed left-6 md:left-10 top-0 bottom-0 w-px pointer-events-none z-10 hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-line to-transparent opacity-40" />
        <div
          ref={threadDotRef}
          className="absolute -left-[3px] w-2 h-2 rounded-full bg-accent shadow-[0_0_12px_3px_var(--color-accent)] transition-[top] duration-150 ease-out opacity-0"
          style={{ top: "8%" }}
        />
      </div>
    </>
  );
}
