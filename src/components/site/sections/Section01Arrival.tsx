"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SECTION_IDS } from "@/lib/spatial";
import { IconPlayhead } from "@/components/site/icons/CreativeIcons";

const EARLY_ACCESS_URL = "https://app.vichith.in/request-access";

export function Section01Arrival() {
  const containerRef = useRef<HTMLElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const [lineTwoVisible, setLineTwoVisible] = useState(false);
  const [timecode, setTimecode] = useState("00:00:00:00");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLineTwoVisible(true);
    }, 800);

    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % 72;
      const sec = Math.floor(frame / 24);
      const fr = frame % 24;
      setTimecode(`00:00:0${sec}:${fr < 10 ? "0" + fr : fr}`);
    }, 41.67);

    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !playheadRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const percentage = (relativeX / rect.width) * 100;
      gsap.to(playheadRef.current, {
        left: `${percentage}%`,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <section
      id={SECTION_IDS.arrival}
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col justify-between items-center px-6 sm:px-10 md:px-16 pt-32 pb-16 bg-[#070709] text-foreground overflow-hidden"
    >
      {/* Background Volumetric Depth (Signature Vichith Cyan Atmosphere) */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[850px] h-[500px] rounded-full bg-accent/[0.04] blur-[180px]" />
      </div>

      {/* Top Label: Architectural wordmark */}
      <div className="relative z-10 flex flex-col items-center">
        <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.35em] text-white/40 uppercase font-medium">
          Vichith
        </span>
        <div className="mt-2 h-px w-5 bg-white/20" />
      </div>

      {/* Monumental Progressive Thesis: Clean, Straight, Modern Typography */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center select-none my-auto">
        
        {/* Line 1: AI DOES THE WORK. */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight md:tracking-[-0.03em] leading-[1.02] text-white">
          AI DOES THE WORK.
        </h1>

        {/* Dynamic Minimal Bridge: The Vector Creative Playhead Signal in Signature Cyan */}
        <div className="w-full max-w-lg my-6 sm:my-8 md:my-10 relative">
          <div className="h-px w-full bg-white/[0.08] relative">
            <div
              ref={playheadRef}
              className="absolute -top-3.5 left-1/4 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
            >
              <IconPlayhead size={14} className="text-accent drop-shadow-[0_0_8px_rgba(54,226,206,0.6)]" />
              <span className="mt-2 font-mono text-[9px] text-white/40 tracking-wider">
                {timecode}
              </span>
            </div>
          </div>
        </div>

        {/* Line 2: YOU KEEP THE CRAFT. (Sleek subtle gradient, zero italic/curved slant) */}
        <div
          className={`transition-all duration-1000 transform ${
            lineTwoVisible
              ? "opacity-100 translate-y-0 filter blur-0"
              : "opacity-0 translate-y-6 filter blur-sm pointer-events-none"
          }`}
        >
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight md:tracking-[-0.03em] leading-[1.02]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-white/80">
              YOU KEEP THE CRAFT.
            </span>
          </h2>
        </div>

        {/* Minimal early access CTA */}
        <div
          className={`mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 transition-all duration-1000 delay-200 ${
            lineTwoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <a
            href={EARLY_ACCESS_URL}
            className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:bg-accent hover:text-black active:scale-[0.97] shadow-xl shadow-black/60 flex items-center gap-2 group"
          >
            <span>REQUEST EARLY ACCESS</span>
            <span className="text-xs transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>

      {/* Subtle bottom scroll cue */}
      <div className="relative z-10 flex flex-col items-center gap-2 opacity-35 hover:opacity-80 transition-opacity duration-300">
        <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/40">
          Scroll to enter the workflow
        </span>
        <div className="w-px h-5 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  );
}
