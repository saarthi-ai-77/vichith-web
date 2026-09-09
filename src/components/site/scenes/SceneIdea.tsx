"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SECTION_IDS } from "@/lib/spatial";

export function SceneIdea() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle entrance for typography
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleScrollDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(`#${SECTION_IDS.chithra}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id={SECTION_IDS.hero}
      ref={containerRef}
      className="relative min-h-[90vh] md:min-h-screen w-full flex flex-col items-center justify-between pt-36 sm:pt-44 md:pt-48 pb-16 sm:pb-20 px-4 sm:px-6 md:px-8 overflow-hidden"
    >
      {/* Background ambient radial gradients (Restrained, calm, expensive) */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[850px] h-[500px] rounded-full bg-accent/[0.07] blur-[160px] mix-blend-screen" />
        <div className="w-[600px] h-[350px] rounded-full bg-surface-2/30 blur-[130px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full my-auto">
        {/* ── 1. Hero Content & Monumental Typography ── */}
        <div
          ref={headlineRef}
          className="relative z-10 flex flex-col items-center text-center max-w-4xl select-none"
        >
          {/* Eyebrow / Restrained Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-line bg-surface/50 backdrop-blur-md mb-6 sm:mb-8 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-mono text-accent uppercase tracking-widest font-semibold">
              The Generative Editing Workspace
            </span>
          </div>

          {/* Main Headline (Dominant Level 1 Focal Point) */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.4rem] font-bold tracking-tight md:tracking-[-0.035em] leading-[1.02] text-foreground text-balance">
            AI does the work. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-deep to-foreground/85">
              You keep the craft.
            </span>
          </h1>

          {/* Supporting Statement (One Concise Product Thesis Sentence) */}
          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-muted-foreground font-normal leading-relaxed max-w-xl text-balance">
            Describe the cut. Let intelligence build the foundation. <br className="hidden sm:inline" />
            Take over the timeline whenever you want.
          </p>

          {/* Primary CTA & Natural Entrypoint */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3.5 z-20">
            <a
              href="https://app.vichith.in/request-access"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-foreground text-background font-semibold text-sm transition-all duration-200 hover:bg-accent hover:text-background active:scale-[0.97] shadow-lg shadow-black/40 flex items-center justify-center gap-2 group"
            >
              <span>Request Access</span>
              <span className="text-xs transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href={`#${SECTION_IDS.chithra}`}
              onClick={handleScrollDown}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-line bg-surface/30 text-muted-foreground hover:text-foreground font-medium text-sm transition-all duration-200 hover:bg-surface hover:border-line-strong active:scale-[0.97]"
            >
              See how it connects
            </a>
          </div>
        </div>
      </div>

      {/* ── Scroll Hint ── */}
      <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-200 z-10">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Scroll to explore the architecture
        </span>
        <div className="w-px h-6 bg-gradient-to-b from-accent to-transparent" />
      </div>
    </section>
  );
}
