"use client";

import { SECTION_IDS } from "@/lib/spatial";
import { IconLock } from "@/components/site/icons/CreativeIcons";

const EARLY_ACCESS_URL = "https://app.vichith.in/request-access";
const INVITE_CODE_URL = "https://app.vichith.in/invite";

export function Section10EarlyAccess() {
  return (
    <section
      id={SECTION_IDS.access}
      className="relative w-full min-h-[85vh] flex flex-col justify-center items-center py-28 sm:py-36 px-6 sm:px-10 md:px-16 bg-[#070709] border-t border-white/[0.05] overflow-hidden text-center"
    >
      {/* Background Volumetric Depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[850px] h-[500px] rounded-full bg-accent/[0.05] blur-[180px]" />
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center z-10">
        
        {/* Subtle status tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            Early Access · Rolling Cohorts
          </span>
        </div>

        {/* The Product Statement */}
        <p className="font-sans text-base sm:text-lg text-white/50 font-normal max-w-lg mx-auto leading-relaxed text-balance">
          Vichith is being built in public, one creative workflow at a time.
        </p>

        {/* The Direct Question */}
        <h2 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white my-6 sm:my-10 leading-[0.98]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-white/90">
            Want in?
          </span>
        </h2>

        {/* The Conversion Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a
            href={EARLY_ACCESS_URL}
            className="w-full sm:w-auto px-9 py-3.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:bg-accent hover:text-black active:scale-[0.97] shadow-xl shadow-black/80 flex items-center justify-center gap-2 group"
          >
            <span>REQUEST EARLY ACCESS</span>
            <span className="text-xs transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>

          <a
            href={INVITE_CODE_URL}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/[0.1] bg-white/[0.02] text-white/80 hover:text-white font-medium text-xs sm:text-sm transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.2] active:scale-[0.97]"
          >
            Enter Invite Code
          </a>
        </div>

        {/* Honest Reassurance with Vector Icon */}
        <div className="mt-12 font-mono text-[11px] text-white/30 flex items-center gap-2">
          <IconLock size={12} className="text-white/40" />
          <span>No credit card required. Direct communication with the builders.</span>
        </div>

      </div>
    </section>
  );
}
