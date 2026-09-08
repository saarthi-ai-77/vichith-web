"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SECTION_IDS } from "@/lib/spatial";

const CLIPS = [
  { id: 1, title: "Lighthouse Sunset", duration: "04.2s", src: "/lighthouse.jpg", speed: "1.0x" },
  { id: 2, title: "Tea Pouring Ref", duration: "03.0s", src: "/pouring_tea.jpg", speed: "1.0x" },
  { id: 3, title: "Split Angle", duration: "02.8s", src: "/split_pour.jpg", speed: "1.25x" },
  { id: 4, title: "Vintage Street", duration: "05.1s", src: "/vintage.jpg", speed: "0.8x" },
];

export function SceneEcosystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const workbenchRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [isReframed, setIsReframed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Intent simulation. Every effect it shows is a tool the editor really has:
  // split, retime, reframe, caption. Nothing here touches colour.
  const handleTriggerIntent = () => {
    setIsReframed((prev) => !prev);
  };

  return (
    <section
      id={SECTION_IDS.studio}
      ref={sectionRef}
      className="relative w-full py-24 md:py-36 px-6 md:px-12 border-t border-line/40 bg-background overflow-hidden"
    >
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
            Multiple video and audio tracks. Split at the playhead, trim by the handle, retime a clip and watch everything after it move. Captions styled word by word and placed clear of the platform's own interface. Export MP4.
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

        {/* Studio Workspace Interface Viewport */}
        <div
          ref={workbenchRef}
          className={`w-full max-w-5xl rounded-2xl border border-line/80 bg-surface/30 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 ${
            isReframed ? "border-accent/40 shadow-[0_0_50px_rgba(0,0,0,0.8)]" : ""
          }`}
        >
          {/* Studio Top Chrome */}
          <div className="h-11 border-b border-line px-4 flex items-center justify-between bg-surface/80">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs font-mono text-muted-foreground font-medium">Vichith Editor</span>
            </div>

            <div className="text-[11px] font-mono text-muted-foreground px-3 py-1 rounded bg-background/60 border border-line">
              Sequence_01 · 24.00 FPS · MP4
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] font-mono text-accent uppercase">Live Engine</span>
            </div>
          </div>

          {/* Workbench Center Grid: Monitor & Inspector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-line">
            
            {/* Sequence Viewport Monitor (Left 8 cols) */}
            <div className="md:col-span-8 p-4 sm:p-6 flex flex-col items-center justify-center bg-background/50 border-b md:border-b-0 md:border-r border-line">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-line-strong shadow-lg">
                <div
                  className="w-full h-full transition-all duration-700"
                  style={{
                    backgroundImage: `url('${CLIPS[activeClipIndex].src}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                {/* The reframe, shown as the crop it is: everything outside the
                    9:16 window dims, and a caption sits clear of the bottom
                    third where the platform puts its own interface. */}
                {isReframed && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-background/70" />
                    {/* Centred with left-1/2 and a translate, not with flex:
                        an absolutely positioned child is out of flex flow, so
                        justify-center would never have centred it. */}
                    <div
                      className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 aspect-[9/16] border-x-2 border-accent/70 overflow-hidden"
                      style={{
                        backgroundImage: `url('${CLIPS[activeClipIndex].src}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {/* The caption rides inside the crop, above the bottom
                          third the platform covers with its own interface. */}
                      <span className="absolute inset-x-2 top-[36%] text-center px-2 py-0.5 rounded bg-black/70 text-white text-sm font-semibold tracking-tight">
                        सुबह की <span className="text-accent">रोशनी</span>
                      </span>
                    </div>
                  </>
                )}

                {/* Chithra intent badge banner */}
                {isReframed && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-accent/90 text-accent-foreground text-xs font-semibold backdrop-blur-md shadow-md animate-in fade-in duration-300">
                    Chithra: split at 0:12, captions retimed, reframed 9:16
                  </div>
                )}

                {/* Transport Controls Bar */}
                <div className="absolute bottom-3 inset-x-3 h-10 px-3 rounded-lg bg-background/80 backdrop-blur-md border border-line flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying((p) => !p)}
                      className="w-6 h-6 rounded flex items-center justify-center text-foreground hover:text-accent transition-colors"
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
                    <span className="text-xs font-mono text-muted-foreground">00:00:04:18</span>
                  </div>

                  <div className="text-[10px] font-mono text-muted-foreground">
                    100% · {CLIPS[activeClipIndex].title}
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Property Inspector (Right 4 cols) */}
            <div className="md:col-span-4 p-4 sm:p-5 flex flex-col justify-between bg-surface/20 text-xs">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Clip Inspector</span>
                  <span className="font-mono text-[10px] text-accent">Active Clip</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground block mb-1">CLIP ASSET</label>
                    <div className="font-medium text-foreground text-sm">{CLIPS[activeClipIndex].title}</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
                      <span>PLAYBACK SPEED</span>
                      <span className="text-accent">{CLIPS[activeClipIndex].speed}</span>
                    </div>
                    <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-accent rounded-full" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground block mb-1">FRAMING</label>
                    <div className="p-2 rounded bg-background/60 border border-line text-[11px] font-mono text-foreground flex items-center justify-between">
                      <span>{isReframed ? "9:16 · 1080×1920" : "16:9 · source"}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${isReframed ? "bg-accent" : "bg-muted-foreground"}`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-line mt-4">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>TIMELINE OCCUPANCY</span>
                  <span>15.1s TOTAL</span>
                </div>
              </div>
            </div>

          </div>

          {/* Timeline Multi-Track Area */}
          <div className="p-4 bg-surface/40">
            {/* Time Ruler */}
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-2 px-1">
              <span>00:00:00</span>
              <span>00:00:05</span>
              <span>00:00:10</span>
              <span>00:00:15</span>
            </div>

            {/* Video Track (V1) with 4 Clips */}
            <div className="mb-2">
              <div className="text-[9px] font-mono text-muted-foreground mb-1">TRACK V1 (VIDEO)</div>
              <div className="grid grid-cols-4 gap-2 h-11">
                {CLIPS.map((clip, i) => (
                  <button
                    key={clip.id}
                    onClick={() => setActiveClipIndex(i)}
                    className={`h-full rounded-md border p-1.5 flex items-center justify-between text-left transition-all ${
                      activeClipIndex === i
                        ? "border-accent bg-accent/15 text-foreground shadow-sm"
                        : "border-line bg-surface/80 text-muted-foreground hover:border-line-strong"
                    }`}
                  >
                    <span className="text-[11px] font-medium truncate">{clip.title}</span>
                    <span className="text-[9px] font-mono opacity-60 shrink-0 ml-1">{clip.duration}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Track (A1) */}
            <div>
              <div className="text-[9px] font-mono text-muted-foreground mb-1">TRACK A1 (AUDIO MASTER)</div>
              <div className="w-full h-6 rounded-md bg-background/50 border border-line flex items-center px-2">
                <div className="w-full h-1 bg-accent/30 rounded-full" />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
