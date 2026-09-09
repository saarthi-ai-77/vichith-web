"use client";

import { useState } from "react";
import { SECTION_IDS } from "@/lib/spatial";
import {
  IconFilm,
  IconAperture,
  IconWaveform,
  IconTypography,
  IconGraph,
} from "@/components/site/icons/CreativeIcons";

interface LayerItem {
  id: string;
  index: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  spec: string;
  track: string;
}

const LAYERS: LayerItem[] = [
  {
    id: "video",
    index: "01",
    name: "Moving Video",
    icon: IconFilm,
    spec: "4K ProRes · 60fps",
    track: "Track V1 · Master",
  },
  {
    id: "generative",
    index: "02",
    name: "Synthetic Frames",
    icon: IconAperture,
    spec: "Seedream 4.5",
    track: "Track V2 · In-Timeline",
  },
  {
    id: "audio",
    index: "03",
    name: "Audio Stems & Foley",
    icon: IconWaveform,
    spec: "96kHz · 24-bit WAV",
    track: "Track A1 · Mastered",
  },
  {
    id: "captions",
    index: "04",
    name: "Styled Captions",
    icon: IconTypography,
    spec: "Dynamic Word Sync",
    track: "Track C1 · Safe Zone",
  },
  {
    id: "scenes",
    index: "05",
    name: "Project Scene Graph",
    icon: IconGraph,
    spec: "Shared AST Memory",
    track: "Graph Node · Synced",
  },
];

export function Section06Canvas() {
  const [activeLayers, setActiveLayers] = useState<string[]>([
    "video",
    "generative",
    "audio",
    "captions",
    "scenes",
  ]);

  const toggleLayer = (id: string) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section
      id={SECTION_IDS.canvas}
      className="relative w-full py-28 sm:py-36 px-6 sm:px-10 md:px-16 bg-[#070709] border-t border-white/[0.05] overflow-hidden"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Section Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            06 / Unified Canvas
          </span>
        </div>

        {/* Section Headline */}
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] text-center">
          Everything stays <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-white/85">connected.</span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-white/50 font-normal max-w-lg text-center leading-relaxed text-balance">
          Creation and editing live in the same project. No exports between steps.
        </p>

        {/* The Professional Anodized Console */}
        <div className="w-full mt-12 rounded-2xl border border-white/[0.08] bg-[#0c0c10] shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6">
          
          {/* Top Console Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/10" />
                <span className="w-2 h-2 rounded-full bg-white/10" />
                <span className="w-2 h-2 rounded-full bg-white/10" />
              </div>
              <span className="font-mono text-xs text-white/80 font-medium tracking-wide">
                PROJECT / DESERT_DAWN_REELS.VCH
              </span>
            </div>

            <button
              onClick={() =>
                setActiveLayers(["video", "generative", "audio", "captions", "scenes"])
              }
              className="font-mono text-[11px] text-white/40 hover:text-white transition-colors self-start sm:self-auto"
            >
              Reset Stack
            </button>
          </div>

          {/* Stacking Layers Array: Monochromatic, Sleek, Precision */}
          <div className="space-y-2.5">
            {LAYERS.map((layer) => {
              const isActive = activeLayers.includes(layer.id);
              const Icon = layer.icon;

              return (
                <div
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? "bg-white/[0.03] border-white/[0.12] hover:border-white/[0.22] shadow-sm"
                      : "bg-black/40 border-white/[0.04] opacity-35 hover:opacity-60"
                  }`}
                >
                  {/* Left: Icon + Index + Title */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-white/[0.04] border-white/[0.1] text-white"
                          : "bg-transparent border-white/[0.06] text-white/30"
                      }`}
                    >
                      <Icon size={15} />
                    </div>

                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-[11px] text-white/30">
                        {layer.index}
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-semibold tracking-wide text-white/90">
                        {layer.name}
                      </span>
                    </div>
                  </div>

                  {/* Right: Technical Spec & State Indicator */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-white/40 text-[11px] hidden md:inline">
                      {layer.spec}
                    </span>

                    <span className="text-white/50 text-[11px]">
                      {layer.track}
                    </span>

                    <div
                      className={`px-2.5 py-1 rounded border text-[10px] flex items-center gap-1.5 transition-colors ${
                        isActive
                          ? "bg-white/[0.03] border-white/[0.12] text-white/80"
                          : "bg-transparent border-white/[0.04] text-white/25"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" : "bg-white/20"
                        }`}
                      />
                      <span>{isActive ? "Active" : "Muted"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Console Status Bar */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-white/40">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>In-Memory Context Active</span>
            </span>

            <span className="text-white/70">
              {activeLayers.length} of 5 Layers Synchronized · Zero Export Roundtrip
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
