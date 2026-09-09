"use client";

import { useState, useRef, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { SECTION_IDS } from "@/lib/spatial";
import { IconCheck, IconDiamond } from "@/components/site/icons/CreativeIcons";

const STEPS = [
  { id: "idea", label: "IDEA", app: "Notes", pain: "Isolated" },
  { id: "plan", label: "PLAN", app: "Brainstorm", pain: "Scattered Docs" },
  { id: "gen", label: "GENERATION", app: "Web UI", pain: "Model Hopping" },
  { id: "edit", label: "EDIT", app: "Desktop NLE", pain: "Manual Import" },
  { id: "captions", label: "CAPTIONS", app: "Sub-Tool", pain: "De-synced" },
  { id: "audio", label: "AUDIO", app: "DAW", pain: "Stems Lost" },
  { id: "export", label: "EXPORT", app: "Encoder", pain: "Render Roundtrip" },
];

export function Section02Fragmentation() {
  const [isConnected, setIsConnected] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= 0.38) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  });

  useEffect(() => {
    if (scrollYProgress.get() >= 0.38) {
      setIsConnected(true);
    }
  }, [scrollYProgress]);

  return (
    <section
      id={SECTION_IDS.fragmentation}
      ref={containerRef}
      className="relative w-full h-[175vh] bg-[#070709] border-t border-white/[0.05]"
    >
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-6 sm:px-10 md:px-16 overflow-hidden py-6 sm:py-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center w-full">
          
          {/* Subtle section pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-6 sm:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              02 / The Disconnection
            </span>
          </div>

          {/* Editorial Headline */}
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Everything shouldn&apos;t require <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-white/85">another tool.</span>
          </h2>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-white/50 max-w-md font-normal leading-relaxed text-balance">
            Vichith keeps the creative process connected.
          </p>

          {/* Minimalist State Switcher */}
          <div className="mt-6 sm:mt-8 inline-flex p-1 rounded-full border border-white/[0.08] bg-[#0c0c10]">
            <button
              onClick={() => setIsConnected(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
                !isConnected
                  ? "bg-white/[0.08] text-white font-medium"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Fragmented Reality
            </button>
            <button
              onClick={() => setIsConnected(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all duration-200 flex items-center gap-2 ${
                isConnected
                  ? "bg-white/[0.08] text-white font-medium"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" : "bg-white/30"}`} />
              Vichith Unified System
            </button>
          </div>

          {/* The Single Visual Interaction: 7 Steps as One Continuous Rail */}
          <div className="w-full mt-8 sm:mt-12 p-5 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0c0c10] shadow-[0_24px_80px_rgba(0,0,0,0.6)] relative overflow-hidden">
            
            {/* Status readout bar */}
            <div className="flex items-center justify-between pb-4 sm:pb-5 mb-5 sm:mb-6 border-b border-white/[0.06] text-xs font-mono">
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    isConnected ? "bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" : "bg-white/30"
                  }`}
                />
                <span className="text-white/70 text-[11px] sm:text-xs">
                  {isConnected
                    ? "Continuous In-Memory Context"
                    : "Disconnected Workflow · 7 Isolated Hand-offs"}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-white/40 hidden sm:inline-block">
                {isConnected ? "Zero export latency" : "File proliferation & context loss"}
              </span>
            </div>

            {/* The Nodes Conduit */}
            <div className="relative py-4 sm:py-6">
              {/* Luminous backbone line */}
              <div
                className={`absolute top-1/2 left-4 right-4 h-px -translate-y-1/2 transition-all duration-500 ${
                  isConnected
                    ? "bg-accent/40 shadow-[0_0_8px_rgba(54,226,206,0.4)]"
                    : "border-t border-dashed border-white/10 bg-transparent"
                }`}
              />

              {/* Steps Array */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5 md:gap-3">
                {STEPS.map((step, idx) => (
                  <div
                    key={step.id}
                    style={{
                      transform: !isConnected
                        ? `translateY(${(idx % 2 === 0 ? -1 : 1) * (10 + (idx % 3) * 6)}px)`
                        : "translateY(0px)",
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-500 flex flex-col items-center justify-between text-center ${
                      isConnected
                        ? "bg-[#111116] border-accent/25 shadow-[0_0_15px_rgba(54,226,206,0.05)] hover:border-accent/40"
                        : "bg-[#0a0a0d] border-white/[0.04] opacity-55"
                    }`}
                  >
                    <span className="text-[9px] font-mono text-white/30 mb-1">
                      0{idx + 1}
                    </span>

                    <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider text-white">
                      {step.label}
                    </span>

                    <div className="mt-2 pt-2 border-t border-white/[0.05] w-full">
                      <span
                        className={`text-[8px] sm:text-[9px] font-mono block ${
                          isConnected ? "text-accent/85 font-medium" : "text-white/30"
                        }`}
                      >
                        {isConnected ? "Integrated" : step.pain}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom resolution sentence */}
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-center text-xs font-mono text-white/50">
              {isConnected ? (
                <span className="flex items-center gap-2 text-white/80">
                  <IconCheck size={13} className="text-accent" />
                  <span className="text-[11px] sm:text-xs">One project state. From prompt understanding to final delivery.</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-white/40">
                  <IconDiamond size={7} className="text-white/30" />
                  <span className="text-[11px] sm:text-xs">Multiple disconnected tools, broken timeline context, and friction.</span>
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
