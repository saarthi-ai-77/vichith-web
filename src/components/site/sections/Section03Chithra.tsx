"use client";

import { useState, useEffect } from "react";
import { SECTION_IDS } from "@/lib/spatial";
import {
  IconTerminal,
  IconAperture,
  IconSliders,
  IconScissors,
  IconCheck,
} from "@/components/site/icons/CreativeIcons";

const ACTIONS = [
  {
    phase: "UNDERSTANDING",
    icon: IconTerminal,
    label: "01. Intent Deconstruction",
    description: "Analyzes pacing, emotional cadence, and target duration from the directive.",
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
    description: "Orchestrates model routing, shot distribution, and audio synchronization.",
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
    description: "Synthesizes missing bridge frames and separates vocal dialogue stems.",
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
    description: "Places clips, snaps handles, applies match cuts, and binds vector RSVP captions.",
    details: [
      "14 split points applied with non-destructive handles",
      "Word captions locked to Track C1 safe zone",
      "4K 60fps timeline state assembled",
    ],
    status: "Assembled",
  },
];

export function Section03Chithra() {
  const [activeActionIndex, setActiveActionIndex] = useState(0);

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
      className="relative w-full py-28 sm:py-36 px-6 sm:px-10 md:px-16 bg-[#08080a] border-t border-white/[0.05] overflow-hidden"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Section Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            03 / Creative Intelligence
          </span>
        </div>

        {/* Section Header */}
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] text-center">
          Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-white/85">Chithra.</span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-white/50 font-normal max-w-md text-center leading-relaxed">
          Your creative intelligence inside Vichith.
        </p>

        {/* The Sleek Studio Console */}
        <div className="w-full mt-12 rounded-2xl border border-white/[0.08] bg-[#0c0c10] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          
          {/* Top Directive Prompt Bar */}
          <div className="p-5 sm:p-6 border-b border-white/[0.06] bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-white/70">
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

            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] text-white/60 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)] animate-pulse" />
              <span>Orchestrating</span>
            </div>
          </div>

          {/* 4 Mental Phases: Minimalist Monochromatic Switcher */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-white/[0.06] bg-[#09090c]">
            {ACTIONS.map((action, idx) => {
              const isSelected = activeActionIndex === idx;
              const StepIcon = action.icon;
              return (
                <button
                  key={action.phase}
                  onClick={() => setActiveActionIndex(idx)}
                  className={`p-4 text-left transition-all duration-200 border-r last:border-r-0 border-white/[0.05] relative ${
                    isSelected
                      ? "bg-white/[0.03] text-white"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.01]"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <StepIcon size={12} className={isSelected ? "text-accent" : "text-white/30"} />
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

          {/* Active Phase Display */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Explanatory Breakdown */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-mono text-accent font-medium">
                  {activeAction.label}
                </span>
                <h3 className="text-base sm:text-lg font-display font-medium text-white/90 mt-1 leading-snug">
                  {activeAction.description}
                </h3>
              </div>

              {/* Dynamic Action Details */}
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
            </div>

            {/* Right: Architectural Project State Card */}
            <div className="md:col-span-5">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-black/60 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[11px] text-white/40">
                  <span>PROJECT STATE</span>
                  <span className="text-accent">{activeAction.status}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">Target Sequence:</span>
                    <span className="text-white/90 font-medium">Launch_Film_45s.vch</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">Tracks Allocated:</span>
                    <span className="text-white/70">V1, V2, C1, A1</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">Autonomy Level:</span>
                    <span className="text-white/90 font-medium">Staged for Review</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-white/40">
                  <span>Creator override:</span>
                  <span className="text-white/70">100% Unlocked</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
