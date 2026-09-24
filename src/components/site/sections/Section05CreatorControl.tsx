"use client";

import { useState } from "react";
import { SECTION_IDS } from "@/lib/spatial";
import {
  IconScissors,
  IconUndo,
  IconSliders,
  IconTypography,
  IconCheck,
} from "@/components/site/icons/CreativeIcons";

export function Section05CreatorControl() {
  const [clipLength, setClipLength] = useState(45);
  const [activeWords, setActiveWords] = useState(["THE", "CREATOR", "KEEPS", "THE", "CRAFT"]);
  const [editHistory, setEditHistory] = useState<string>("Default Timeline Sequence");
  const [lastDirective, setLastDirective] = useState<string | null>(null);

  const handleMakeTighter = () => {
    setLastDirective('"Make this tighter."');
    setClipLength(32);
    setEditHistory("Chithra: Tightened by 13s, removed 4 pause frames.");
  };

  const handleUndoToOriginal = () => {
    setLastDirective('"Actually, keep the original."');
    setClipLength(45);
    setEditHistory("Creator Override: Reverted to original baseline.");
  };

  const toggleWord = (index: number) => {
    const updated = [...activeWords];
    updated[index] =
      updated[index] === updated[index].toLowerCase()
        ? updated[index].toUpperCase()
        : updated[index].toLowerCase();
    setActiveWords(updated);
  };

  return (
    <section
      id={SECTION_IDS.control}
      className="relative w-full bg-[#08080a] border-t border-white/[0.05] overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-16 grid grid-cols-1 lg:grid-cols-[42%_58%]">

        {/* ── Left column: editorial typography ── */}
        <div className="pt-28 md:pt-36 pb-10 md:pb-36 pr-0 md:pr-10 lg:sticky lg:top-16 lg:self-start">
          {/* Eyebrow */}
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">
            CREATOR CONTROL · 05
          </p>

          {/* Headline — two separate lines, no gradient */}
          <h2
            className="font-display font-extrabold text-white"
            style={{
              fontSize: "clamp(2.4rem, 5.5vw, 5rem)",
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
            }}
          >
            You direct.
            <br />
            Chithra executes.
          </h2>

          {/* Thin rule */}
          <div className="h-px max-w-[60px] bg-white/20 my-6" />

          {/* Editorial pull-quote */}
          <p className="font-editorial italic text-sm md:text-base text-white/40 leading-relaxed max-w-[280px]">
            &ldquo;Every decision Chithra makes is a handle you can grab.&rdquo;
          </p>
        </div>

        {/* ── Right column: interactive console panels ── */}
        <div className="py-28 md:py-36">
          <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0c0c10] shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6">

            {/* 1. Directive Simulation Bar */}
            <div className="p-4 sm:p-5 rounded-xl border border-white/[0.06] bg-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 block">
                  Directorial Instruction
                </span>
                <div className="font-mono text-xs sm:text-sm text-white font-medium">
                  {lastDirective || 'Try instructing: "Make this tighter."'}
                </div>
                <span className="font-mono text-[11px] text-accent/80 block">
                  {editHistory}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleMakeTighter}
                  className="px-3.5 py-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] text-white hover:bg-white/[0.08] text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <IconScissors size={12} className="text-white/60" />
                  <span>&ldquo;Make this tighter.&rdquo;</span>
                </button>
                <button
                  onClick={handleUndoToOriginal}
                  className="px-3.5 py-1.5 rounded-lg border border-white/[0.08] bg-transparent text-white/60 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <IconUndo size={12} className="text-white/40" />
                  <span>Undo to original</span>
                </button>
              </div>
            </div>

            {/* 2. Manual Clip Trimmer */}
            <div className="p-4 sm:p-5 rounded-xl bg-black/40 border border-white/[0.06] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-white/50">
                <div className="flex items-center gap-2 text-white/80 font-medium">
                  <IconSliders size={13} className="text-white/40" />
                  <span>MANUAL CLIP TRIMMER</span>
                </div>
                <span className="text-white font-semibold">{clipLength}.0s (Handle Drag)</span>
              </div>

              <div className="relative pt-1">
                <input
                  type="range"
                  min={20}
                  max={60}
                  value={clipLength}
                  onChange={(e) => {
                    setClipLength(Number(e.target.value));
                    setLastDirective(null);
                    setEditHistory("Creator manual handle adjustment.");
                  }}
                  className="w-full h-1 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] text-white/30 mt-2">
                  <span>20s (Snappy)</span>
                  <span className="text-white/50">45s (Original Baseline)</span>
                  <span>60s (Extended)</span>
                </div>
              </div>
            </div>

            {/* 3. Word Caption Inspector */}
            <div className="p-4 sm:p-5 rounded-xl bg-black/40 border border-white/[0.06] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-white/50">
                <div className="flex items-center gap-2 text-white/80 font-medium">
                  <IconTypography size={13} className="text-white/40" />
                  <span>VECTOR WORD-BY-WORD CAPTION INSPECTOR</span>
                </div>
                <span className="text-[10px] text-white/30">Click word to edit emphasis</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {activeWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleWord(idx)}
                    className="px-3 py-1.5 rounded border border-white/[0.1] bg-white/[0.03] text-white/90 hover:border-white/[0.25] transition-all text-xs font-semibold"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Console Authority Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-white/40">
              <div className="flex items-center gap-2">
                <IconCheck size={12} className="text-accent" />
                <span>Full Non-Destructive History Tree</span>
              </div>
              <span>Every machine decision maps to an editable timeline handle</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
