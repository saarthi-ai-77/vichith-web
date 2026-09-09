"use client";

import { useEffect, useState } from "react";
import { SECTION_IDS } from "@/lib/spatial";
import { IconRefresh } from "@/components/site/icons/CreativeIcons";

const LOOP_NODES = [
  { id: "idea", label: "IDEA" },
  { id: "chithra", label: "CHITHRA" },
  { id: "create", label: "CREATE" },
  { id: "edit", label: "EDIT" },
  { id: "see", label: "SEE" },
  { id: "refine", label: "REFINE" },
];

export function Section08Loop() {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % LOOP_NODES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id={SECTION_IDS.loop}
      className="relative w-full py-28 sm:py-36 px-6 sm:px-10 md:px-16 bg-[#070709] border-t border-white/[0.05] overflow-hidden"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        
        {/* Subtle section label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-12">
          <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            08 / The Continuous Loop
          </span>
        </div>

        {/* Sparse Kinetic Loop Diagram */}
        <div className="relative flex flex-col items-center py-6 w-full max-w-xs">
          
          {/* Central flowing guide line */}
          <div className="absolute top-2 bottom-2 w-px bg-white/[0.08]" />

          {/* Nodes */}
          <div className="space-y-6 relative z-10 w-full flex flex-col items-center">
            {LOOP_NODES.map((node, idx) => {
              const isCurrent = activeNode === idx;
              return (
                <div
                  key={node.id}
                  className={`px-5 py-2 rounded-full border font-mono text-xs tracking-widest transition-all duration-300 flex items-center gap-2 ${
                    isCurrent
                      ? "bg-white/[0.08] border-white/[0.25] text-white font-medium shadow-sm scale-105"
                      : "bg-[#09090c] border-white/[0.05] text-white/30"
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isCurrent ? "bg-accent shadow-[0_0_8px_rgba(54,226,206,0.6)]" : "bg-white/10"
                    }`}
                  />
                  <span>{node.label}</span>
                  {idx === LOOP_NODES.length - 1 && (
                    <IconRefresh size={11} className={isCurrent ? "text-accent" : "text-white/20"} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* The Distilled Editorial Conclusion */}
        <div className="mt-16 sm:mt-20">
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08]">
            Make something. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-white/85">Then make it better.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-white/50 font-normal max-w-md mx-auto leading-relaxed">
            No friction between your first spark and your final polish.
          </p>
        </div>

      </div>
    </section>
  );
}
