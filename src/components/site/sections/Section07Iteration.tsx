"use client";

import { useState } from "react";
import { SECTION_IDS } from "@/lib/spatial";
import {
  IconRefresh,
  IconAperture,
  IconFilm,
  IconCheck,
} from "@/components/site/icons/CreativeIcons";

const ITERATION_STEPS = [
  {
    step: 1,
    prompt: "Generate initial establishing shot: Desert sunrise.",
    critique: "Initial candidate generated.",
    image: "/shot.jpg",
    filter: "brightness(0.9) contrast(1.0)",
    status: "Candidate A · Standard Wide",
    timelineNote: "Track V1: Candidate A staged",
  },
  {
    step: 2,
    prompt: '"This shot feels too generic."',
    critique: "Chithra: Re-angling camera lower, adding lens flare match.",
    image: "/shot.jpg",
    filter: "brightness(1.05) contrast(1.15) saturate(1.1)",
    status: "Candidate B · Low-Angle Flare",
    timelineNote: "Track V1: Alternate B ready",
  },
  {
    step: 3,
    prompt: '"Make it warmer."',
    critique: "Chithra: Golden hour color temperature shifted to 3200K.",
    image: "/shot.jpg",
    filter: "sepia(0.25) saturate(1.35) brightness(1.05)",
    status: "Candidate C · 3200K Golden Warmth",
    timelineNote: "Track V1: Color pass applied",
  },
  {
    step: 4,
    prompt: '"Use the second version."',
    critique: "Chithra: Candidate B locked into master sequence.",
    image: "/shot.jpg",
    filter: "brightness(1.05) contrast(1.15) saturate(1.1)",
    status: "Locked: Candidate B",
    timelineNote: "Track V1: Candidate B confirmed on timeline",
  },
  {
    step: 5,
    prompt: '"Keep the original composition."',
    critique: "Chithra: Restored Candidate A composition non-destructively.",
    image: "/shot.jpg",
    filter: "brightness(0.9) contrast(1.0)",
    status: "Restored: Candidate A",
    timelineNote: "Track V1: Reverted cleanly",
  },
];

export function Section07Iteration() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const current = ITERATION_STEPS[currentIdx];

  return (
    <section
      id={SECTION_IDS.refine}
      className="relative w-full py-28 sm:py-36 px-6 sm:px-10 md:px-16 bg-[#08080a] border-t border-white/[0.05] overflow-hidden"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Section Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            07 / Iterative Refinement
          </span>
        </div>

        {/* Section Headline */}
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] text-center">
          Creation isn&apos;t one shot. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-white/85">Create. Change. Refine. Repeat.</span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-white/50 font-normal max-w-lg text-center leading-relaxed text-balance">
          Great films are sculpted through iteration. Explore versions freely without losing the path back.
        </p>

        {/* The Refinement Console */}
        <div className="w-full mt-12 rounded-2xl border border-white/[0.08] bg-[#0c0c10] shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6">
          
          {/* Turn Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-5 border-b border-white/[0.06]">
            {ITERATION_STEPS.map((step, idx) => {
              const isSelected = currentIdx === idx;
              return (
                <button
                  key={step.step}
                  onClick={() => setCurrentIdx(idx)}
                  className={`p-3 rounded-xl border text-left font-mono text-xs transition-all duration-200 ${
                    isSelected
                      ? "bg-white/[0.05] border-white/[0.2] text-white shadow-sm"
                      : "bg-black/30 border-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" : "bg-white/20"}`} />
                    <span className="text-[9px] text-white/30">Turn 0{step.step}</span>
                  </div>
                  <span className="truncate block font-sans text-xs font-medium">{step.prompt}</span>
                </button>
              );
            })}
          </div>

          {/* Iteration Frame Split */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Monitor */}
            <div className="md:col-span-7">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/[0.1] shadow-xl">
                <img
                  src={current.image}
                  alt="Iterative shot frame"
                  style={{ filter: current.filter }}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-white/80 border border-white/[0.08] flex items-center gap-2">
                  <IconAperture size={11} className="text-accent" />
                  <span>{current.status}</span>
                </div>
              </div>
            </div>

            {/* Turn Logs */}
            <div className="md:col-span-5 space-y-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                <span className="text-[10px] text-white/40 uppercase tracking-wider block">
                  Creator Instruction
                </span>
                <p className="font-sans text-sm font-semibold text-white">
                  {current.prompt}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                <span className="text-[10px] text-accent/80 uppercase tracking-wider block font-semibold flex items-center gap-1.5">
                  <IconRefresh size={10} />
                  <span>Chithra Response</span>
                </span>
                <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed">
                  {current.critique}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-white/40 flex items-center justify-between">
                <span>Timeline Status:</span>
                <span className="text-white/80 font-medium">{current.timelineNote}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
