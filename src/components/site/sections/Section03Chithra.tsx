"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { SECTION_IDS } from "@/lib/spatial";
import {
  IconTerminal,
  IconAperture,
  IconSliders,
  IconScissors,
  IconCheck,
} from "@/components/site/icons/CreativeIcons";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const ACTIONS = [
  {
    phase: "UNDERSTANDING",
    icon: IconTerminal,
    label: "01. Intent Deconstruction",
    description:
      "Analyzes pacing, emotional cadence, and target duration from the directive.",
    details: [
      "Target runtime: 45.00s",
      "Pacing envelope: Kinetic hook → Atmospheric breath → Dynamic reveal",
      "Tone profile: Editorial, restrained, high-contrast",
    ],
    status: "Resolved",
  },
  {
    phase: "PLANNING",
    icon: IconSliders,
    label: "02. Timeline Architecture",
    description:
      "Orchestrates model routing, shot distribution, and audio synchronization.",
    details: [
      "Model routed: Seedream 4.5",
      "B-roll requirements: 3 supplementary macro cutaways",
      "Downbeat sync: 110 BPM downbeat flare",
    ],
    status: "Planned",
  },
  {
    phase: "CREATING",
    icon: IconAperture,
    label: "03. Generative Synthesis",
    description:
      "Synthesizes missing bridge frames and separates vocal dialogue stems.",
    details: [
      "3 non-existent bridge frames rendered at 4K",
      "Transcript pauses stripped from master track",
      "82 dialogue tokens mapped to timeline ticks",
    ],
    status: "Generated",
  },
  {
    phase: "EDITING",
    icon: IconScissors,
    label: "04. Non-Destructive Assembly",
    description:
      "Places clips, snaps handles, applies match cuts, and binds vector RSVP captions.",
    details: [
      "14 split points applied with non-destructive handles",
      "Word captions locked to Track C1 safe zone",
      "4K 60fps timeline state assembled",
    ],
    status: "Assembled",
  },
] as const;

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

/** Fade + subtle upward slide for the active panel swap */
const panelVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    // "easeOut" is the closest named preset to cubic-bezier(0.16, 1, 0.3, 1)
    transition: { duration: 0.28, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.16, ease: "easeIn" },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Section03Chithra() {
  const [activeActionIndex, setActiveActionIndex] = useState(0);

  // Auto-cycle through phases
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveActionIndex((prev) => (prev + 1) % ACTIONS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const activeAction = ACTIONS[activeActionIndex];
  const ActiveIcon = activeAction.icon;

  return (
    <section
      id={SECTION_IDS.chithra}
      className="relative w-full min-h-screen bg-[#08080a] border-t border-white/[0.05] overflow-hidden"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Two-column grid                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] w-full">

        {/* ================================================================ */}
        {/* LEFT — Typographic monument                                        */}
        {/* ================================================================ */}
        <div className="lg:sticky lg:top-16 lg:self-start py-16 lg:py-28 px-6 sm:px-10 md:px-12 lg:px-14">

          {/* Eyebrow label */}
          <p
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 mb-8"
            aria-label="Creative Intelligence · Vichith"
          >
            CREATIVE INTELLIGENCE · VICHITH
          </p>

          {/* Giant CHITHRA wordmark — pure white, no gradient */}
          <h2
            className="font-display font-extrabold text-white leading-[0.92] select-none"
            style={{
              fontSize: "clamp(4rem, 11vw, 11rem)",
              letterSpacing: "-0.04em",
            }}
          >
            CHITHRA
          </h2>

          {/* Horizontal rule */}
          <div className="h-px max-w-[80px] bg-white/20 my-5" />

          {/* Sub-description */}
          <p className="font-sans font-light text-sm md:text-base text-white/45 leading-relaxed max-w-[280px]">
            Your creative intelligence inside Vichith.
          </p>

          {/* Live accent dot */}
          <div
            className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse mt-6"
            aria-hidden="true"
          />
        </div>

        {/* ================================================================ */}
        {/* RIGHT — 4-phase console                                           */}
        {/* ================================================================ */}
        <div className="py-16 lg:py-28 pr-6 md:pr-16 pl-4 md:pl-8">

          {/* Studio Console card */}
          <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0c0c10] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">

            {/* ------------------------------------------------------------ */}
            {/* Top Directive Prompt Bar                                       */}
            {/* ------------------------------------------------------------ */}
            <div className="p-5 sm:p-6 border-b border-white/[0.06] bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Directive label + prompt */}
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-white/70 shrink-0">
                  <IconTerminal size={15} />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 block">
                    Creator Directive
                  </span>
                  <p className="font-mono text-xs sm:text-sm text-white font-medium mt-0.5">
                    &ldquo;Turn this into a 45-second launch video.&rdquo;
                  </p>
                </div>
              </div>

              {/* Orchestrating badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] text-white/60 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)] animate-pulse" />
                <span>Orchestrating</span>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* 4 Phase Tabs                                                   */}
            {/* ------------------------------------------------------------ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-white/[0.06] bg-[#09090c]">
              {ACTIONS.map((action, idx) => {
                const isSelected = activeActionIndex === idx;
                const StepIcon = action.icon;
                return (
                  <button
                    key={action.phase}
                    onClick={() => setActiveActionIndex(idx)}
                    className={[
                      "p-4 text-left transition-colors duration-200",
                      "border-r last:border-r-0 border-white/[0.05] relative",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50",
                      isSelected
                        ? "text-white bg-white/[0.02]"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.01]",
                    ].join(" ")}
                    aria-selected={isSelected}
                    role="tab"
                  >
                    {/* Accent top border for active tab */}
                    {isSelected && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute top-0 left-0 right-0 h-[2px] bg-accent"
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}

                    {/* Phase meta */}
                    <div className="flex items-center gap-2 mb-1">
                      <StepIcon
                        size={12}
                        className={isSelected ? "text-accent" : "text-white/30"}
                      />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">
                        Phase 0{idx + 1}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-semibold block tracking-wide">
                      {action.phase}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Active Phase Display — animated swap                           */}
            {/* ------------------------------------------------------------ */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-h-[260px]">
              <AnimatePresence mode="wait">
                {/* Explanatory Breakdown */}
                <motion.div
                  key={`detail-${activeActionIndex}`}
                  className="md:col-span-7 space-y-4"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div>
                    <span className="text-xs font-mono text-accent font-medium">
                      {activeAction.label}
                    </span>
                    <h3 className="text-base sm:text-lg font-display font-medium text-white/90 mt-1 leading-snug">
                      {activeAction.description}
                    </h3>
                  </div>

                  {/* Detail lines */}
                  <div className="space-y-2 pt-1">
                    {activeAction.details.map((detail, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-center gap-2.5 text-xs font-mono text-white/60 bg-white/[0.02] border border-white/[0.04] px-3 py-2 rounded-lg"
                      >
                        <IconCheck size={11} className="text-white/40 shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* ---------------------------------------------------------- */}
              {/* Project State Card — also animated on swap                   */}
              {/* ---------------------------------------------------------- */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`card-${activeActionIndex}`}
                  className="md:col-span-5"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="p-4 rounded-xl border border-white/[0.08] bg-black/60 font-mono text-xs space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[11px] text-white/40">
                      <span>PROJECT STATE</span>
                      <span className="text-accent">{activeAction.status}</span>
                    </div>

                    {/* Rows */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/40">Target Sequence:</span>
                        <span className="text-white/90 font-medium">
                          Launch_Film_45s.vch
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/40">Tracks Allocated:</span>
                        <span className="text-white/70">V1, V2, C1, A1</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/40">Autonomy Level:</span>
                        <span className="text-white/90 font-medium">
                          Staged for Review
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-white/40">
                      <span>Creator override:</span>
                      <span className="text-white/70">100% Unlocked</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* end phase display */}

          </div>
          {/* end console card */}

        </div>
        {/* end right column */}

      </div>
      {/* end grid */}

    </section>
  );
}
