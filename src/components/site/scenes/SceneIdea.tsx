"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SECTION_IDS } from "@/lib/spatial";

export function SceneIdea() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle entrance for typography
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }
      );

      // Entrance for workstation console
      gsap.fromTo(
        consoleRef.current,
        { opacity: 0, y: 32, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 1.3, delay: 0.15, ease: "power3.out" }
      );

      // Calm, expensive mouse parallax for the workstation console
      const xTo = gsap.quickTo(consoleRef.current, "rotationY", { duration: 1, ease: "power2.out" });
      const yTo = gsap.quickTo(consoleRef.current, "rotationX", { duration: 1, ease: "power2.out" });

      const onMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const normX = (e.clientX / innerWidth - 0.5) * 2;
        const normY = (e.clientY / innerHeight - 0.5) * 2;
        xTo(normX * 4.5);
        yTo(-normY * 3.5);
      };

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      return () => window.removeEventListener("mousemove", onMouseMove);
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
      className="relative min-h-screen w-full flex flex-col items-center justify-start pt-28 sm:pt-36 md:pt-40 pb-20 sm:pb-28 px-4 sm:px-6 md:px-8 overflow-hidden"
    >
      {/* Background ambient radial gradients (Restrained, calm, expensive) */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[850px] h-[500px] rounded-full bg-accent/[0.07] blur-[160px] mix-blend-screen" />
        <div className="w-[600px] h-[350px] rounded-full bg-surface-2/30 blur-[130px]" />
      </div>

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
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-foreground text-background font-semibold text-sm transition-all duration-200 hover:bg-accent hover:text-background active:scale-[0.97] shadow-lg shadow-black/40 flex items-center justify-center gap-2 group"
          >
            <span>Request Access</span>
            <span className="text-xs transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </a>
          <a
            href={`#${SECTION_IDS.chithra}`}
            onClick={handleScrollDown}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-line bg-surface/30 text-muted-foreground hover:text-foreground font-medium text-sm transition-all duration-200 hover:bg-surface hover:border-line-strong active:scale-[0.97]"
          >
            See how it connects
          </a>
        </div>
      </div>

      {/* ── 2. The Central Product Moment (AI Intent → Timeline Craft) ── */}
      <div className="w-full max-w-5xl mt-14 sm:mt-18 md:mt-24 z-10 perspective-1000">
        <div
          ref={consoleRef}
          className="w-full glass-panel shadow-float rounded-2xl border border-line-strong overflow-hidden preserve-3d will-change-transform"
          style={{ transform: "rotateX(0deg) rotateY(0deg)" }}
        >
          {/* Top Window Chrome */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-line bg-surface/70 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
                <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
                <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
              </div>
              <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">
                project / desert_dawn_reels.vch
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-mono text-accent font-medium">
                Chithra AI · Sequence Synced
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
              <span className="hidden md:inline-block px-2 py-0.5 rounded bg-surface border border-line text-[10px]">
                4K 60fps
              </span>
              <span className="text-foreground/80 font-semibold">00:00:14:18</span>
            </div>
          </div>

          {/* Workstation Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-background/60">
            
            {/* Left Column: AI Intent & Tool Registry (The "AI does the work" pillar) */}
            <div className="lg:col-span-4 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-line flex flex-col justify-between bg-surface/20">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">✨</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Chithra Directive
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">
                    Generated
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-line bg-surface/40 text-xs text-foreground/90 leading-relaxed font-sans">
                  &ldquo;Pull transcript silence, cut on sunrise match flare, and lock 1-word RSVP captions.&rdquo;
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">Transcript Cuts:</span>
                    <span className="text-accent font-semibold">14 cuts applied</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">Model Routed:</span>
                    <span className="text-foreground">Seedream 4.5</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">Word Captions:</span>
                    <span className="text-accent font-semibold">Synced (Track C1)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Execution status:</span>
                <span className="text-accent font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Ready on timeline
                </span>
              </div>
            </div>

            {/* Right Column: Live Monitor & Timeline Canvas (The "You keep the craft" pillar) */}
            <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col justify-between">
              
              {/* Preview Stage */}
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-surface-2 border border-line-strong shadow-2xl">
                <video
                  src="/Cinematic.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/shot.jpg"
                  className="w-full h-full object-cover"
                />
                
                {/* HUD Overlay */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-background/70 backdrop-blur-md text-[10px] font-mono text-foreground border border-line">
                  REC · 24.00 fps
                </div>

                {/* Simulated RSVP Word Caption */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center">
                  <span className="px-3 py-1 rounded bg-black/75 backdrop-blur-md text-xs sm:text-sm font-bold text-accent tracking-wide uppercase shadow-lg border border-accent/30 animate-pulse">
                    The Creator Keeps The Craft
                  </span>
                </div>
              </div>

              {/* Multi-track Timeline Bar (Tactile Craft in Action) */}
              <div className="mt-4 pt-3 border-t border-line space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
                  <span>TIMELINE WORKBENCH</span>
                  <span className="text-accent font-mono">00:00:14:18 / 00:00:45:00</span>
                </div>

                {/* Track V1 */}
                <div className="h-6 rounded-md bg-surface/50 border border-line flex items-center gap-1 p-0.5 overflow-hidden">
                  <span className="text-[9px] font-mono text-muted-foreground px-1.5 shrink-0">V1</span>
                  <div className="h-full bg-accent/25 hover:bg-accent/35 border border-accent/40 rounded-xs flex-1 flex items-center px-2 text-[9px] font-mono text-foreground truncate">
                    dune_approach.mp4
                  </div>
                  <div className="h-full bg-accent/35 hover:bg-accent/45 border border-accent/50 rounded-xs w-32 flex items-center px-2 text-[9px] font-mono text-foreground truncate">
                    sunrise_flare.mp4
                  </div>
                  <div className="h-full bg-accent/25 hover:bg-accent/35 border border-accent/40 rounded-xs flex-1 flex items-center px-2 text-[9px] font-mono text-foreground truncate">
                    portrait_close.mp4
                  </div>
                </div>

                {/* Track A1 with animated waveform indicator */}
                <div className="h-5 rounded-md bg-surface/40 border border-line flex items-center gap-1 p-0.5 overflow-hidden">
                  <span className="text-[9px] font-mono text-muted-foreground px-1.5 shrink-0">A1</span>
                  <div className="h-full bg-cyan-500/20 rounded-xs flex-1 flex items-center px-2 justify-between">
                    <span className="text-[8px] font-mono text-cyan-200">voiceover_master.wav</span>
                    <div className="flex items-center gap-0.5 h-2">
                      <span className="w-0.5 h-full bg-cyan-400 animate-pulse" />
                      <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse" />
                      <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" />
                      <span className="w-0.5 h-1 bg-cyan-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ── 3. Scroll Hint ── */}
      <div className="mt-12 sm:mt-16 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-200 z-10">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Scroll to explore the architecture
        </span>
        <div className="w-px h-5 bg-gradient-to-b from-accent to-transparent" />
      </div>

    </section>
  );
}
