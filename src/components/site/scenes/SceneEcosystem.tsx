"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SECTION_IDS } from "@/lib/spatial";

export function SceneEcosystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const workbenchRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReframed, setIsReframed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (workbenchRef.current) {
        gsap.fromTo(
          workbenchRef.current,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: workbenchRef.current,
              start: "top 85%",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleTriggerIntent = () => {
    setIsReframed((prev) => !prev);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section
      id={SECTION_IDS.studio}
      ref={sectionRef}
      className="relative w-full py-24 md:py-36 px-4 sm:px-6 md:px-12 border-t border-line/40 bg-background overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[700px] h-[400px] rounded-full bg-accent/[0.04] blur-[150px]" />
      </div>

      <div className="max-w-[1240px] mx-auto flex flex-col items-center">
        
        {/* Editorial Section Header */}
        <div className="text-center max-w-3xl mb-12 md:mb-16 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-surface/60 backdrop-blur-md mb-4">
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest">03 / Editor</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-tight mb-4 text-foreground">
            A real timeline.<br />
            <span className="serif-accent text-accent">Not a preview.</span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Multiple video and audio tracks. Split at the playhead, trim by the handle, retime a clip and watch everything after it move. Captions styled word by word and placed clear of the platform&apos;s own interface. Export MP4.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={handleTriggerIntent}
              className={`px-4 py-2 rounded-full border text-xs font-mono transition-all duration-200 active:scale-[0.97] flex items-center gap-2 ${
                isReframed
                  ? "bg-accent text-accent-foreground border-accent font-semibold shadow-md shadow-accent/20"
                  : "bg-surface/60 border-line text-muted-foreground hover:text-foreground hover:border-line-strong"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isReframed ? "bg-black" : "bg-accent animate-pulse"}`} />
              {isReframed ? "Reels cut applied" : "Simulate: 'Cut this for Reels'"}
            </button>
          </div>
        </div>

        {/* Workstation Console (Transferred from Hero sequence) */}
        <div
          ref={workbenchRef}
          className={`w-full max-w-5xl rounded-2xl border bg-surface/30 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 ${
            isReframed ? "border-accent/50 shadow-[0_0_50px_rgba(0,0,0,0.8)]" : "border-line-strong shadow-float"
          }`}
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
                {isReframed ? "Chithra AI · Reels Reframed" : "Chithra AI · Sequence Synced"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
              <span className="hidden md:inline-block px-2 py-0.5 rounded bg-surface border border-line text-[10px]">
                {isReframed ? "9:16 60fps" : "4K 60fps"}
              </span>
              <span className="text-foreground/80 font-semibold">00:00:14:18</span>
            </div>
          </div>

          {/* Workstation Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-background/60">
            
            {/* Left Column: AI Intent & Directive (The "AI does the work" pillar) */}
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

                <div className="mt-4 space-y-2.5">
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
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">Framing Target:</span>
                    <span className="text-foreground font-medium">
                      {isReframed ? "9:16 (1080×1920) · Vertical" : "16:9 (3840×2160) · Widescreen"}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={handleTriggerIntent}
                    className={`w-full py-2 px-3 rounded-lg border text-xs font-mono transition-all duration-200 flex items-center justify-center gap-2 ${
                      isReframed
                        ? "bg-accent/20 border-accent text-accent font-semibold"
                        : "bg-surface/50 border-line text-muted-foreground hover:text-foreground hover:border-line-strong"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isReframed ? "bg-accent" : "bg-muted-foreground"}`} />
                    {isReframed ? "Reframe Active: 9:16" : "Toggle 9:16 Reframe"}
                  </button>
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
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-line-strong shadow-2xl">
                <video
                  ref={videoRef}
                  src="/Cinematic.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/shot.jpg"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-cover"
                />
                
                {/* HUD Overlay */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-background/70 backdrop-blur-md text-[10px] font-mono text-foreground border border-line z-10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>REC · 24.00 fps</span>
                </div>

                {/* 9:16 Reframe Visual Overlay */}
                {isReframed && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-background/75 backdrop-blur-[1px] z-10" />
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 aspect-[9/16] border-x-2 border-accent/80 shadow-[0_0_30px_rgba(255,255,255,0.06)] overflow-hidden z-20">
                      <div className="absolute top-3 left-2 right-2 text-center">
                        <span className="px-2 py-0.5 rounded bg-accent/90 text-accent-foreground text-[10px] font-mono font-semibold backdrop-blur-md shadow-md">
                          Reels Crop 9:16
                        </span>
                      </div>
                      <div className="absolute bottom-6 inset-x-2 flex justify-center">
                        <span className="px-3 py-1 rounded bg-black/80 backdrop-blur-md text-xs sm:text-sm font-bold text-accent tracking-wide uppercase shadow-lg border border-accent/40 animate-pulse">
                          The Creator Keeps The Craft
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Simulated RSVP Word Caption (when widescreen) */}
                {!isReframed && (
                  <div className="absolute bottom-4 inset-x-0 flex justify-center z-10">
                    <span className="px-3 py-1 rounded bg-black/75 backdrop-blur-md text-xs sm:text-sm font-bold text-accent tracking-wide uppercase shadow-lg border border-accent/30 animate-pulse">
                      The Creator Keeps The Craft
                    </span>
                  </div>
                )}

                {/* Transport Controls Bar */}
                <div className="absolute bottom-3 inset-x-3 h-9 px-3 rounded-lg bg-background/80 backdrop-blur-md border border-line flex items-center justify-between z-30">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-6 h-6 rounded flex items-center justify-center text-foreground hover:text-accent transition-colors"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                      )}
                    </button>
                    <span className="text-[11px] font-mono text-muted-foreground">00:00:14:18</span>
                  </div>

                  <div className="text-[10px] font-mono text-muted-foreground">
                    H.264 · 24.00 fps · {isReframed ? "1080×1920" : "3840×2160"}
                  </div>
                </div>
              </div>

              {/* Multi-track Timeline Bar (Tactile Craft in Action) */}
              <div className="mt-4 pt-3 border-t border-line space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
                  <span>TIMELINE WORKBENCH</span>
                  <span className="text-accent font-mono">00:00:14:18 / 00:00:45:00</span>
                </div>

                {/* Track C1 - Word Captions */}
                <div className="h-5 rounded-md bg-surface/30 border border-line/60 flex items-center gap-1 p-0.5 overflow-hidden">
                  <span className="text-[9px] font-mono text-muted-foreground px-1.5 shrink-0">C1</span>
                  <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {["THE", "CREATOR", "KEEPS", "THE", "CRAFT"].map((word, idx) => (
                      <span
                        key={idx}
                        className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                          idx === 2
                            ? "bg-accent/30 text-accent border border-accent/50 font-bold"
                            : "bg-surface/70 text-muted-foreground border border-line"
                        }`}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
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
    </section>
  );
}
