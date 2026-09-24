"use client";

/**
 * Section06Canvas — Timeline Track Visualization
 *
 * Renders a horizontal multi-track timeline panel that mirrors
 * the Vichith Studio editor UI, minus any interactivity export roundtrip.
 * GSAP ScrollTrigger staggers each track row in on scroll entry,
 * then sweeps a playhead line across the timeline bar area.
 */

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SECTION_IDS } from "@/lib/spatial";
import {
  IconFilm,
  IconAperture,
  IconWaveform,
  IconTypography,
  IconGraph,
} from "@/components/site/icons/CreativeIcons";

// Register GSAP plugins once
gsap.registerPlugin(ScrollTrigger);

// ─── Track data ───────────────────────────────────────────────────────────────

interface TrackDef {
  id: string;
  /** Short label shown in the track-ID column */
  trackId: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  spec: string;
  /** 0–1: fraction of the track bar to fill */
  fill: number;
  /** 0–1: where the clip block starts inside the bar */
  offset: number;
  /** Clip block Tailwind color classes */
  color: string;
  glowColor: string;
  /** If true, renders a dot-line instead of a filled block */
  isDot?: boolean;
}

const TRACKS: TrackDef[] = [
  {
    id: "v1",
    trackId: "V1",
    Icon: IconFilm,
    label: "master_video.mp4",
    spec: "4K ProRes · 60fps",
    fill: 1.0,
    offset: 0,
    color: "bg-white/[0.12] border-white/[0.2]",
    glowColor: "shadow-[0_0_12px_rgba(255,255,255,0.06)]",
  },
  {
    id: "v2",
    trackId: "V2",
    Icon: IconAperture,
    label: "sunrise_flare.mp4",
    spec: "Seedream 4.5 · synced",
    fill: 0.55,
    offset: 0.22,
    color: "bg-accent/[0.12] border-accent/[0.2]",
    glowColor: "shadow-[0_0_12px_rgba(54,226,206,0.08)]",
  },
  {
    id: "a1",
    trackId: "A1",
    Icon: IconWaveform,
    label: "master_mix.wav",
    spec: "96kHz · -14 LUFS",
    fill: 0.92,
    offset: 0,
    color: "bg-white/[0.08] border-white/[0.14]",
    glowColor: "",
  },
  {
    id: "c1",
    trackId: "C1",
    Icon: IconTypography,
    label: "THE · CREATOR · KEEPS",
    spec: "Dynamic Word Sync",
    fill: 0.5,
    offset: 0.18,
    color: "bg-white/[0.07] border-white/[0.12]",
    glowColor: "",
  },
  {
    id: "sg",
    trackId: "──",
    Icon: IconGraph,
    label: "Scene Graph Node",
    spec: "Shared AST · Synced",
    fill: 1.0,
    offset: 0,
    isDot: true,
    color: "bg-transparent border-transparent",
    glowColor: "",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Section06Canvas() {
  const sectionRef = useRef<HTMLElement>(null);
  /** Refs for each track row (used for stagger animation) */
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Ref for the playhead line element */
  const playheadRef = useRef<HTMLDivElement>(null);

  // GSAP scroll-driven entrance + playhead sweep
  useGSAP(
    () => {
      // ── Reduced-motion: skip animation, show final state ──────────────────
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReduced) {
        rowRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 1, x: 0 });
        });
        if (playheadRef.current) {
          gsap.set(playheadRef.current, { left: "80%" });
        }
        return;
      }

      // ── Initial hidden state for track rows ──────────────────────────────
      rowRefs.current.forEach((el) => {
        if (el) gsap.set(el, { opacity: 0, x: -12 });
      });

      if (playheadRef.current) {
        gsap.set(playheadRef.current, { left: "0%" });
      }

      // ── Stagger tracks in on scroll ───────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
      });

      tl.to(rowRefs.current.filter(Boolean), {
        opacity: 1,
        x: 0,
        duration: 0.55,
        ease: "cubic-bezier(0.16, 1, 0.3, 1)",
        stagger: 0.1,
      });

      // ── Playhead sweep after rows appear ─────────────────────────────────
      if (playheadRef.current) {
        tl.to(
          playheadRef.current,
          {
            left: "80%",
            duration: 2,
            ease: "power1.inOut",
          },
          "-=0.1" // start almost immediately after stagger finishes
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      id={SECTION_IDS.canvas}
      ref={sectionRef}
      className="relative w-full py-28 sm:py-36 px-6 sm:px-10 md:px-16 bg-[#070709] border-t border-white/[0.05] overflow-hidden"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center">

        {/* ── Section pill ────────────────────────────────────────────────── */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            06 / Unified Canvas
          </span>
        </div>

        {/* ── Headline ────────────────────────────────────────────────────── */}
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] text-center">
          One canvas.{" "}
          <span className="text-white/60">Everything connected.</span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-white/50 font-normal max-w-lg text-center leading-relaxed text-balance">
          Creation and editing live in the same project. No export roundtrip.
        </p>

        {/* ── Timeline console panel ───────────────────────────────────────── */}
        <div className="w-full mt-12 rounded-2xl border border-white/[0.08] bg-[#0c0c10] shadow-[0_24px_80px_rgba(0,0,0,0.65)] overflow-hidden">

          {/* Console header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              {/* macOS-style traffic lights */}
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/10" />
                <span className="w-2 h-2 rounded-full bg-white/10" />
                <span className="w-2 h-2 rounded-full bg-white/10" />
              </div>
              <span className="font-mono text-[10px] sm:text-xs text-white/60 tracking-wide">
                PROJECT / DESERT_DAWN_REELS.VCH
              </span>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse drop-shadow-[0_0_6px_rgba(54,226,206,0.7)]" />
              <span className="font-mono text-[9px] text-accent/80 uppercase tracking-wider">
                LIVE
              </span>
            </div>
          </div>

          {/* Track rows */}
          <div className="px-3 sm:px-5 py-4 space-y-1.5">
            {TRACKS.map((track, idx) => (
              <div
                key={track.id}
                ref={(el) => { rowRefs.current[idx] = el; }}
                className="flex items-center gap-2 sm:gap-3 h-9"
              >
                {/* Track ID */}
                <span className="w-8 shrink-0 font-mono text-[9px] text-white/30 text-center select-none">
                  {track.trackId}
                </span>

                {/* Icon */}
                <span className="w-5 shrink-0 text-white/25 flex items-center">
                  <track.Icon size={13} />
                </span>

                {/* Timeline bar area — relative container for rail + clip + playhead */}
                <div className="flex-1 relative h-6">
                  {/* Rail background */}
                  <div className="absolute inset-0 rounded bg-white/[0.02] border border-white/[0.04]" />

                  {track.isDot ? (
                    /* ── Scene Graph dot-line track ────────────────────── */
                    <div className="absolute inset-0 flex items-center px-2">
                      <div className="w-2 h-2 rounded-full bg-accent/60 shrink-0 shadow-[0_0_8px_rgba(54,226,206,0.4)]" />
                      <div className="flex-1 border-t border-dashed border-white/[0.08] mx-2" />
                      <span className="font-mono text-[9px] text-accent/60">
                        synced
                      </span>
                    </div>
                  ) : (
                    /* ── Normal clip block ──────────────────────────────── */
                    <div
                      className={`absolute top-[4px] bottom-[4px] rounded border flex items-center px-2 ${track.color} ${track.glowColor}`}
                      style={{
                        left: `${track.offset * 100}%`,
                        width: `${track.fill * 100}%`,
                        /* Clamp so it never overflows the rail */
                        maxWidth: `${(1 - track.offset) * 100}%`,
                      }}
                    >
                      <span className="font-mono text-[9px] text-white/80 truncate leading-none">
                        {track.label}
                      </span>
                    </div>
                  )}

                  {/* Playhead — only rendered on the first row, spans the full panel height visually via z-index */}
                  {idx === 0 && (
                    <div
                      ref={playheadRef}
                      aria-hidden
                      className="absolute top-0 -translate-x-px w-px bg-white/30 pointer-events-none"
                      style={{
                        /* Extend downward to cover all 5 rows: 5 × 36px rows + 4 × 6px gaps ≈ 204px */
                        height: "204px",
                        zIndex: 10,
                      }}
                    />
                  )}
                </div>

                {/* Spec label (hidden on small screens) */}
                <span className="font-mono text-[9px] text-white/30 text-right hidden md:block w-36 shrink-0 truncate">
                  {track.spec}
                </span>
              </div>
            ))}
          </div>

          {/* Console status bar */}
          <div className="px-4 sm:px-6 py-2.5 border-t border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-white/35">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
              <span>In-Memory Context Active</span>
            </span>
            <span className="hidden sm:block text-white/50">
              5 Layers Synchronized · Zero Export Roundtrip
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
