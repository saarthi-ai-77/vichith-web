"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const APP_URL = "https://app.vichith.in";

export function SectionFinalCTAV2() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 40, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "power3.out" }
      ).fromTo(
        ctaCardRef.current,
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power2.out" },
        "-=0.6"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90svh] py-32 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden z-10"
    >
      {/* Ambient background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#83D0BE]/[0.08] blur-[160px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-black/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#83D0BE] animate-ping" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8E9196]">
            Ready For Production
          </span>
        </div>

        <h2
          ref={headlineRef}
          className="font-display text-[clamp(44px,7.5vw,96px)] font-light leading-[0.98] tracking-[-0.04em] text-[#F4F4F5]"
        >
          Your idea is waiting
          <br />
          to become{" "}
          <span className="italic font-serif text-[#83D0BE] drop-shadow-[0_0_40px_rgba(131,208,190,0.4)]">
            something.
          </span>
        </h2>

        {/* Action Apparatus (21st.dev style) */}
        <div
          ref={ctaCardRef}
          className="max-w-xl mx-auto p-8 rounded-3xl border border-white/[0.1] bg-[#0A0C0E]/80 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] space-y-6"
        >
          <div className="space-y-2">
            <p className="text-base text-[#F4F4F5] font-medium">
              Start building your first timeline in under sixty seconds.
            </p>
            <p className="text-xs text-[#8E9196]">
              Free forever tier · No credit card required · Instant access
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={APP_URL}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#83D0BE] text-[#070809] font-semibold text-sm hover:bg-[#97e2d1] hover:shadow-[0_0_35px_rgba(131,208,190,0.5)] transition-all duration-300"
            >
              Launch Vichith Web
            </Link>
            <a
              href="https://discord.gg/679D4UsTS"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-white/[0.1] text-xs font-mono text-[#F4F4F5] hover:bg-white/[0.05] transition-colors"
            >
              Join Creators Community
            </a>
          </div>

          {/* Telemetry Footer */}
          <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#8E9196]">
            <span>ENGINE: VICHITH-V1.4</span>
            <span className="text-[#83D0BE]">REGION: ASIA-SOUTH (BOM)</span>
            <span>UPTIME: 99.98%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
