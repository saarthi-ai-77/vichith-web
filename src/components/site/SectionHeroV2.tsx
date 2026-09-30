"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";

const APP_URL = "https://app.vichith.in";

export function SectionHeroV2() {
  const containerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const [timecode, setTimecode] = useState("00:00:04:18");

  useEffect(() => {
    // Dynamic Timecode ticking (like tasteskill / film suite)
    const interval = setInterval(() => {
      const now = new Date();
      const frames = Math.floor((now.getMilliseconds() / 1000) * 24)
        .toString()
        .padStart(2, "0");
      const secs = now.getSeconds().toString().padStart(2, "0");
      const mins = now.getMinutes().toString().padStart(2, "0");
      setTimecode(`00:${mins}:${secs}:${frames}`);
    }, 41); // ~24fps tick

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -16, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: 0.1 }
      )
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 40, filter: "blur(12px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2 },
          "-=0.5"
        )
        .fromTo(
          subheadRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.9 },
          "-=0.7"
        )
        .fromTo(
          ctaGroupRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          hudRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.2 },
          "-=0.4"
        );

      // Scroll out exit
      if (containerRef.current) {
        gsap.to(
          [
            headlineRef.current,
            subheadRef.current,
            ctaGroupRef.current,
            badgeRef.current,
          ],
          {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "65% top",
              scrub: 1.2,
            },
            opacity: 0,
            y: -40,
            scale: 0.95,
            ease: "none",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] flex flex-col justify-between px-6 md:px-12 pt-28 pb-12 overflow-hidden z-10"
    >
      {/* Top Ambient Glow Spot */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#83D0BE]/[0.06] blur-[140px] pointer-events-none rounded-full" />

      {/* Main Hero Typography & Callout */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto my-auto relative z-10">
        {/* Precision Badge (tasteskill.dev aesthetic) */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-[#0A0C0E]/70 backdrop-blur-md mb-8 shadow-[0_0_25px_rgba(131,208,190,0.08)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#83D0BE] animate-ping" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8E9196]">
            V1 Workspace Architecture
          </span>
          <span className="text-white/20 font-mono text-[10px]">/</span>
          <span className="font-mono text-[10px] text-[#83D0BE] tracking-wider">
            Web & Studio
          </span>
        </div>

        {/* Dramatic Display Headline */}
        <h1
          ref={headlineRef}
          className="font-display text-[clamp(44px,7.5vw,94px)] font-light leading-[0.98] tracking-[-0.04em] text-[#F4F4F5] mb-8"
        >
          Make what you{" "}
          <span className="italic font-serif text-[#83D0BE] drop-shadow-[0_0_35px_rgba(131,208,190,0.3)]">
            imagined.
          </span>
        </h1>

        {/* Editorial Subline */}
        <p
          ref={subheadRef}
          className="text-base sm:text-lg md:text-xl text-[#8E9196] font-light leading-[1.65] max-w-2xl mx-auto mb-10"
        >
          The unified creative environment where intent becomes footage. Plan
          with Chithra, generate visual assets, and finish in an integrated
          multi-track timeline without ever leaving your project context.
        </p>

        {/* Interactive CTA Group (21st.dev magnetic feel) */}
        <div
          ref={ctaGroupRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Link
            href={APP_URL}
            className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-[#83D0BE] text-[#070809] font-medium text-[14px] transition-all duration-300 hover:bg-[#97e0cf] hover:shadow-[0_0_35px_rgba(131,208,190,0.45)] active:scale-[0.98]"
          >
            <span>Start Creating</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="#studio"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.2] text-[#F4F4F5] text-[14px] font-medium transition-all duration-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>Interactive Apparatus</span>
          </Link>
        </div>
      </div>

      {/* Micro-HUD Live Telemetry Bar (tasteskill.dev & 21st.dev) */}
      <div
        ref={hudRef}
        className="relative z-10 w-full max-w-5xl mx-auto border-t border-white/[0.06] pt-5 flex flex-wrap items-center justify-between gap-4 text-[#8E9196] font-mono text-[11px]"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#83D0BE]/80" />
            <span className="text-[#F4F4F5] font-medium tracking-wider">
              ENGINE ACTIVE
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-white/30">TC:</span>
            <span className="text-[#83D0BE] font-semibold">{timecode}</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-white/30">CANVAS:</span>
            <span>4K PRORES 4444</span>
          </div>
        </div>

        {/* Audio Waveform Simulator */}
        <div className="flex items-center gap-1.5">
          <span className="text-white/30 mr-2 text-[10px] hidden sm:inline">
            AUDIO SYNC:
          </span>
          {[16, 24, 12, 28, 20, 32, 18, 10, 22, 14, 26, 8].map((h, idx) => (
            <span
              key={idx}
              className="w-[2px] bg-[#83D0BE]/60 rounded-full transition-all duration-300"
              style={{
                height: `${h}px`,
                opacity: 0.3 + (idx % 3) * 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
