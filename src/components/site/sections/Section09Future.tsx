"use client";

import { SECTION_IDS } from "@/lib/spatial";
import {
  IconFilm,
  IconTypography,
  IconAperture,
  IconSliders,
  IconGraph,
} from "@/components/site/icons/CreativeIcons";

const HORIZONS = [
  {
    icon: IconFilm,
    title: "Long-Form to Multi-Platform Shorts",
    desc: "Intelligent narrative extraction to produce matching horizontal cinema cuts and vertical Reels/Shorts from one source project.",
    status: "We're building toward this.",
  },
  {
    icon: IconTypography,
    title: "Multilingual & Vernacular Dubbing",
    desc: "Deep voice-match translation preserving natural vocal cadence, emotional emphasis, and localized RSVP typography across languages.",
    status: "We're building toward this.",
  },
  {
    icon: IconAperture,
    title: "Persistent Creator Memory",
    desc: "A personal creative model that remembers your pacing rhythm, typography favorites, color grading taste, and directorial signatures.",
    status: "We're building toward this.",
  },
  {
    icon: IconSliders,
    title: "Hybrid Web & Desktop Architecture",
    desc: "Browser-speed collaborative ideation seamlessly linked with the high-throughput native desktop engine for instant ProRes timeline rendering.",
    status: "We're building toward this.",
  },
  {
    icon: IconGraph,
    title: "Autonomous Agent Tooling",
    desc: "Opening timeline AST and track hooks so external generative vision and audio agents can perform surgical clip modifications safely.",
    status: "We're building toward this.",
  },
];

export function Section09Future() {
  return (
    <section
      id={SECTION_IDS.future}
      className="relative w-full py-28 sm:py-36 px-6 sm:px-10 md:px-16 bg-[#08080a] border-t border-white/[0.05] overflow-hidden"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Section Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            09 / Horizons
          </span>
        </div>

        {/* Section Headline */}
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] text-center">
          One idea. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-white/85">Many ways forward.</span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-white/50 font-normal max-w-lg text-center leading-relaxed text-balance">
          We are expanding Vichith&apos;s creative reach in public — thoughtfully, reliably, and without fabricated roadmap hype.
        </p>

        {/* Horizons Grid */}
        <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          {HORIZONS.map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border border-white/[0.08] bg-[#0c0c10] flex flex-col justify-between space-y-4 hover:border-white/[0.18] transition-colors shadow-sm ${
                  idx === HORIZONS.length - 1 ? "md:col-span-2" : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/70">
                        <ItemIcon size={14} />
                      </div>
                      <span className="font-mono text-xs text-white/90 font-semibold">
                        {item.title}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[9px] font-mono text-white/40 shrink-0">
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-white/50 font-normal leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-white/30">
                  <span>Vichith R&D Spec</span>
                  <span>Active Track</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
