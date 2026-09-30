"use client";

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SHOTS = [
  {
    id: "shot-01",
    title: "Opening Sequence",
    type: "video",
    src: "/Cinematic.mp4",
    duration: "00:04:12",
    lut: "Kodak 2383 / Warm",
  },
  {
    id: "shot-02",
    title: "Coastal Tide Swell",
    type: "video",
    src: "/waves.mp4",
    duration: "00:03:00",
    lut: "Cyan / High Contrast",
  },
  {
    id: "shot-03",
    title: "Beacon Sentinel",
    type: "image",
    src: "/lighthouse.jpg",
    duration: "00:05:08",
    lut: "Golden Hour Glow",
  },
];

export function SectionStudioV2() {
  const [activeShotIdx, setActiveShotIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrubPercent, setScrubPercent] = useState(38);
  const [chithraGradeActive, setChithraGradeActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"inspector" | "chithra">("chithra");

  const containerRef = useRef<HTMLElement>(null);
  const studioWindowRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeShot = SHOTS[activeShotIdx];

  // GSAP scroll trigger for studio entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!studioWindowRef.current) return;

      gsap.fromTo(
        studioWindowRef.current,
        {
          opacity: 0,
          y: 60,
          scale: 0.94,
          rotateX: 6,
        },
        {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "top 25%",
            scrub: 1.2,
          },
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          ease: "power3.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section
      ref={containerRef}
      id="studio"
      className="relative min-h-screen py-32 px-4 sm:px-8 md:px-12 flex flex-col items-center justify-center overflow-hidden z-10"
      style={{ perspective: "1400px" }}
    >
      {/* Header Info */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-[#0A0C0E] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#83D0BE]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8E9196]">
            Interactive Apparatus
          </span>
        </div>
        <h2 className="font-display text-[clamp(34px,5.5vw,68px)] font-light leading-[1.02] tracking-[-0.03em] text-[#F4F4F5]">
          The Studio Canvas.
        </h2>
        <p className="text-[16px] text-[#8E9196] max-w-xl mx-auto mt-4 font-light leading-relaxed">
          Not a static mockup. An interactive multi-track timeline where AI
          generations arrive as editable assets. Try switching shots or toggling
          Chithra&apos;s lighting intent below.
        </p>
      </div>

      {/* Main Studio Window Frame (21st.dev & tasteskill.dev standard) */}
      <div
        ref={studioWindowRef}
        className="w-full max-w-6xl rounded-2xl border border-white/[0.1] bg-[#0B0D0F]/90 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(131,208,190,0.06)] overflow-hidden flex flex-col"
      >
        {/* Studio Top Chrome Bar */}
        <div className="h-11 border-b border-white/[0.08] bg-white/[0.02] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white/[0.1] hover:bg-red-500/80 transition-colors cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-white/[0.1] hover:bg-yellow-500/80 transition-colors cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-white/[0.1] hover:bg-green-500/80 transition-colors cursor-pointer" />
            <span className="ml-3 font-mono text-[11px] text-[#F4F4F5] font-medium hidden sm:inline">
              Vichith Studio V1 · Project: Beacon_04
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-[#8E9196]">
              <span>RES:</span>
              <span className="text-[#83D0BE]">3840×2160</span>
              <span className="text-white/20">|</span>
              <span>COLOR:</span>
              <span className="text-[#F4F4F5]">ACEScc</span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full border border-white/[0.06] font-mono text-[10px] text-[#8E9196]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#83D0BE] animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>
        </div>

        {/* Studio Body: Viewport + Inspector Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] sm:min-h-[460px] border-b border-white/[0.08]">
          {/* Central Viewport Player (lg:col-span-8) */}
          <div className="lg:col-span-8 relative bg-[#060708] flex items-center justify-center overflow-hidden group">
            {activeShot.type === "video" ? (
              <video
                ref={videoRef}
                key={activeShot.src}
                src={activeShot.src}
                autoPlay
                loop
                muted
                playsInline
                className={`w-full h-full object-cover transition-all duration-700 ${
                  chithraGradeActive
                    ? "filter saturate-[1.4] brightness-[0.85] contrast-[1.1] hue-rotate-[15deg]"
                    : ""
                }`}
              />
            ) : (
              <img
                src={activeShot.src}
                alt={activeShot.title}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  chithraGradeActive
                    ? "filter saturate-[1.4] brightness-[0.85] contrast-[1.1] hue-rotate-[15deg]"
                    : ""
                }`}
              />
            )}

            {/* Viewport Overlay Info */}
            <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
              <span className="px-2 py-1 rounded bg-black/70 backdrop-blur-md border border-white/[0.1] font-mono text-[10px] text-[#F4F4F5]">
                {activeShot.title}
              </span>
              {chithraGradeActive && (
                <span className="px-2 py-1 rounded bg-[#83D0BE]/20 backdrop-blur-md border border-[#83D0BE]/40 font-mono text-[10px] text-[#83D0BE]">
                  LUT: CHITHRA_MOODY_GRADE
                </span>
              )}
            </div>

            {/* Play/Pause Hover Trigger Button */}
            {activeShot.type === "video" && (
              <button
                onClick={togglePlay}
                className="absolute bottom-4 left-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.1] text-white hover:bg-[#83D0BE] hover:text-black transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Right Inspector & Chithra Assistant Drawer (lg:col-span-4) */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-white/[0.08] bg-[#0A0C0E]/70 flex flex-col">
            {/* Tab Header */}
            <div className="flex border-b border-white/[0.08] text-[11px] font-mono">
              <button
                onClick={() => setActiveTab("chithra")}
                className={`flex-1 py-2.5 text-center transition-colors border-b ${
                  activeTab === "chithra"
                    ? "border-[#83D0BE] text-[#83D0BE] font-medium bg-white/[0.02]"
                    : "border-transparent text-[#8E9196] hover:text-[#F4F4F5]"
                }`}
              >
                ● CHITHRA INTENT
              </button>
              <button
                onClick={() => setActiveTab("inspector")}
                className={`flex-1 py-2.5 text-center transition-colors border-b ${
                  activeTab === "inspector"
                    ? "border-[#83D0BE] text-[#83D0BE] font-medium bg-white/[0.02]"
                    : "border-transparent text-[#8E9196] hover:text-[#F4F4F5]"
                }`}
              >
                CLIP INSPECTOR
              </button>
            </div>

            {/* Tab 1: Chithra Intent Assist */}
            {activeTab === "chithra" && (
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#83D0BE]" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#8E9196]">
                      Semantic Project Control
                    </span>
                  </div>
                  <p className="text-[13px] text-[#F4F4F5] leading-relaxed">
                    Instruct Chithra to alter color grades, clip lengths, or
                    re-render frames across the entire sequence.
                  </p>

                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-black/40 space-y-2.5">
                    <p className="text-[11px] font-mono text-[#83D0BE]">
                      &gt; PROMPT APPLIED
                    </p>
                    <p className="text-[12px] text-[#F4F4F5] italic">
                      &ldquo;Enhance coastal atmosphere. Make lighting moodier
                      with deeper shadows and amber highlights.&rdquo;
                    </p>
                    <button
                      onClick={() => setChithraGradeActive(!chithraGradeActive)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        chithraGradeActive
                          ? "bg-[#83D0BE] text-[#070809] shadow-[0_0_20px_rgba(131,208,190,0.4)]"
                          : "border border-[#83D0BE]/40 text-[#83D0BE] hover:bg-[#83D0BE]/10"
                      }`}
                    >
                      <span>
                        {chithraGradeActive
                          ? "✓ Grade Active (Click to Reset)"
                          : "Toggle Chithra Moody Grade"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-[#8E9196] font-mono border-t border-white/[0.06] pt-3 flex justify-between">
                  <span>MODEL: SEEDREAM 4.5</span>
                  <span className="text-[#83D0BE]">LATENCY: 18ms</span>
                </div>
              </div>
            )}

            {/* Tab 2: Manual Inspector */}
            {activeTab === "inspector" && (
              <div className="p-5 flex-1 flex flex-col justify-between font-mono text-[11px]">
                <div className="space-y-4">
                  <div>
                    <span className="text-white/40 block mb-1">CLIP ID</span>
                    <span className="text-[#F4F4F5] font-semibold">
                      {activeShot.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block mb-1">DURATION</span>
                    <span className="text-[#F4F4F5]">{activeShot.duration}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block mb-1">COLOR LUT</span>
                    <span className="text-[#83D0BE]">{activeShot.lut}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block mb-1">AUDIO TRACK</span>
                    <span className="text-[#F4F4F5]">Foley Ocean Ambient (48kHz)</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/[0.06] text-[10px] text-white/30">
                  MANUAL TIMELINE OVERRIDES ACTIVE
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Studio Bottom: Interactive Multi-Track Timeline */}
        <div className="p-4 sm:p-6 bg-[#070809] space-y-3">
          {/* Timecode & Playhead Slider */}
          <div className="flex items-center justify-between text-xs font-mono text-[#8E9196]">
            <div className="flex items-center gap-3">
              <span className="text-[#83D0BE] font-semibold">00:00:04:12</span>
              <span className="text-white/20">/</span>
              <span>00:00:14:00</span>
            </div>
            <span className="text-[11px] text-white/40 hidden sm:inline">
              CLICK TRACK CLIPS TO SWITCH PREVIEW
            </span>
          </div>

          {/* Interactive Timeline Track Strip */}
          <div
            className="relative h-14 rounded-xl border border-white/[0.08] bg-black/60 p-1.5 flex gap-2 cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = ((e.clientX - rect.left) / rect.width) * 100;
              setScrubPercent(Math.max(5, Math.min(95, pct)));
            }}
          >
            {/* Scrubber Playhead Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#83D0BE] z-30 shadow-[0_0_12px_#83D0BE]"
              style={{ left: `${scrubPercent}%` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#83D0BE] -translate-x-[4px] -translate-y-1 shadow-[0_0_8px_#83D0BE]" />
            </div>

            {/* Track Shot Blocks */}
            {SHOTS.map((shot, idx) => (
              <div
                key={shot.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveShotIdx(idx);
                }}
                className={`flex-1 rounded-lg border transition-all duration-200 relative overflow-hidden flex items-center px-3 gap-2 ${
                  activeShotIdx === idx
                    ? "border-[#83D0BE] bg-[#83D0BE]/15 shadow-[0_0_20px_rgba(131,208,190,0.15)]"
                    : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#83D0BE]" />
                <span className="font-mono text-[11px] text-[#F4F4F5] truncate font-medium">
                  {shot.title}
                </span>
                <span className="ml-auto font-mono text-[9px] text-[#8E9196] hidden md:inline">
                  {shot.duration}
                </span>
              </div>
            ))}
          </div>

          {/* Secondary Audio Track Waveform */}
          <div className="h-6 rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 flex items-center gap-1 opacity-60">
            <span className="font-mono text-[9px] text-[#8E9196] mr-2">
              A1 MASTER
            </span>
            {[...Array(36)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-[#83D0BE]/40 rounded-full"
                style={{
                  height: `${Math.max(
                    20,
                    Math.sin(i * 0.45) * 80 + (i % 3) * 15
                  )}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
