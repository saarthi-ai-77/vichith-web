"use client";

/**
 * Section08Loop — Orbit / Clock Diagram
 *
 * Six nodes arranged in a circle (CSS-only orbit, no canvas/SVG for nodes).
 * An interval cycles the active node every 1800ms so the diagram feels alive.
 * A dashed SVG ring sits behind the nodes as a guide track.
 */

import { useEffect, useState } from "react";
import { SECTION_IDS } from "@/lib/spatial";

// ─── Node data ────────────────────────────────────────────────────────────────

const LOOP_NODES = [
  { id: "idea",   label: "IDEA" },
  { id: "chithra", label: "CHITHRA" },
  { id: "create", label: "CREATE" },
  { id: "edit",   label: "EDIT" },
  { id: "see",    label: "SEE" },
  { id: "refine", label: "REFINE" },
] as const;

// ─── Layout constants ─────────────────────────────────────────────────────────

/**
 * The orbit container is 256px (w-64) on mobile and 320px (w-80) on md+.
 * We use a single shared SVG viewBox of 280×280 with r=120.
 * Node positions are derived in CSS via translate() so they match the SVG ring.
 */
const ORBIT_RADIUS_PX = 120;
const ORBIT_CONTAINER_PX = 280; // matches SVG viewBox center = 140

/**
 * Returns the (x, y) offset from center for a node at `index` of `total`.
 * Starts at top (−90°) and goes clockwise.
 */
function nodePosition(index: number, total: number): { x: number; y: number } {
  const angleDeg = (index * (360 / total)) - 90;
  const angleRad = angleDeg * (Math.PI / 180);
  return {
    x: Math.cos(angleRad) * ORBIT_RADIUS_PX,
    y: Math.sin(angleRad) * ORBIT_RADIUS_PX,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Section08Loop() {
  const [activeNode, setActiveNode] = useState(0);

  // Cycle active node every 1800ms
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % LOOP_NODES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id={SECTION_IDS.loop}
      className="relative w-full min-h-screen py-28 sm:py-36 px-6 sm:px-10 md:px-16 bg-[#070709] border-t border-white/[0.05] overflow-hidden flex items-center"
    >
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center">

        {/* ── Section pill ─────────────────────────────────────────────────── */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-16">
          <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            08 / The Continuous Loop
          </span>
        </div>

        {/* ── Orbit diagram ────────────────────────────────────────────────── */}
        {/*
          Container: fixed logical size matching the SVG viewBox.
          Nodes are absolutely positioned via inline transform;
          the container itself is centered via mx-auto.
        */}
        <div
          className="relative mx-auto"
          style={{
            width: ORBIT_CONTAINER_PX,
            height: ORBIT_CONTAINER_PX,
          }}
        >
          {/* Dashed orbit ring (SVG) */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${ORBIT_CONTAINER_PX} ${ORBIT_CONTAINER_PX}`}
            aria-hidden
          >
            <circle
              cx={ORBIT_CONTAINER_PX / 2}
              cy={ORBIT_CONTAINER_PX / 2}
              r={ORBIT_RADIUS_PX}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
          </svg>

          {/* Center dot */}
          <div
            className="absolute w-2 h-2 rounded-full bg-white/20"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Orbit nodes */}
          {LOOP_NODES.map((node, idx) => {
            const isActive = activeNode === idx;
            const { x, y } = nodePosition(idx, LOOP_NODES.length);

            return (
              <div
                key={node.id}
                className={[
                  "absolute px-3 py-1 rounded-full border font-mono text-[10px] uppercase tracking-widest",
                  "transition-all duration-500",
                  "select-none whitespace-nowrap",
                  // Position from exact center of container
                  "-translate-x-1/2 -translate-y-1/2",
                  isActive
                    ? "border-accent/50 bg-accent/[0.08] text-white shadow-[0_0_12px_rgba(54,226,206,0.2)]"
                    : "border-white/[0.08] bg-transparent text-white/30",
                ].join(" ")}
                style={{
                  top: `calc(50% + ${y}px)`,
                  left: `calc(50% + ${x}px)`,
                }}
              >
                {/* Active pulse dot */}
                {isActive && (
                  <span className="inline-block w-1 h-1 rounded-full bg-accent mr-1.5 shadow-[0_0_6px_rgba(54,226,206,0.7)] animate-pulse" />
                )}
                {node.label}
              </div>
            );
          })}
        </div>

        {/* ── Headline block ───────────────────────────────────────────────── */}
        <div className="mt-16 md:mt-20 text-center">
          {/* Pure white headlines — no accent gradient on both lines */}
          <h2
            className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-[-0.035em] leading-[1.05]"
          >
            Make something.
          </h2>
          <h2
            className="font-display text-4xl sm:text-6xl font-extrabold text-white/60 tracking-[-0.035em] leading-[1.05]"
          >
            Then make it better.
          </h2>

          {/* Newsreader editorial italic sub-paragraph */}
          <p className="font-editorial italic text-base md:text-xl text-white/40 mt-4 max-w-md mx-auto leading-relaxed">
            No friction between your first spark and your final polish.
          </p>
        </div>

      </div>
    </section>
  );
}
