"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const APPS = [
  {
    name: "01 / PROMPT APP",
    label: "Midjourney / ChatGPT",
    meta: "Context lost on copy-paste",
    color: "#e2865c",
    x: -360,
    y: -180,
    rotateZ: -12,
    rotateX: 18,
  },
  {
    name: "02 / VIDEO GENERATOR",
    label: "Runway / Kling / Luma",
    meta: "Random seeds, disconnected shots",
    color: "#5c9ee2",
    x: 360,
    y: -160,
    rotateZ: 14,
    rotateX: -15,
  },
  {
    name: "03 / NLE TIMELINE",
    label: "Premiere / DaVinci",
    meta: "Manual relinking & roundtripping",
    color: "#a45ce2",
    x: -320,
    y: 160,
    rotateZ: -8,
    rotateX: -12,
  },
  {
    name: "04 / AUDIO WORKSTATION",
    label: "ElevenLabs / Suno",
    meta: "Audio drifting, desynced stems",
    color: "#e25c88",
    x: 340,
    y: 180,
    rotateZ: 10,
    rotateX: 14,
  },
  {
    name: "05 / CLOUD STORAGE",
    label: "Drive / Dropbox",
    meta: "Fragmented asset versions",
    color: "#5ce29b",
    x: 0,
    y: -260,
    rotateZ: -4,
    rotateX: 20,
  },
];

export function SectionFragmentationV2() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const coreHubRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const resolvedTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = containerRef.current;
      if (!el) return;

      // Pin the section for smooth multi-phase GSAP storytelling
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=2600",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // Initial positions
      cardsRef.current.forEach((card, idx) => {
        if (!card) return;
        const app = APPS[idx];
        gsap.set(card, {
          x: app.x,
          y: app.y,
          rotationZ: app.rotateZ,
          rotationX: app.rotateX,
          opacity: 0.85,
          scale: 1,
        });
      });

      gsap.set(coreHubRef.current, { scale: 0, opacity: 0 });
      gsap.set(beamRef.current, { scaleY: 0, opacity: 0 });
      gsap.set(resolvedTextRef.current, { opacity: 0, y: 30 });

      // Phase 1: Focus on the fragmented state
      tl.to(headlineRef.current, {
        opacity: 0.2,
        scale: 0.95,
        duration: 0.4,
      });

      // Phase 2: All 5 fragmented tools get pulled into the singularity center
      cardsRef.current.forEach((card) => {
        if (!card) return;
        tl.to(
          card,
          {
            x: 0,
            y: 0,
            rotationZ: 0,
            rotationX: 0,
            scale: 0.4,
            opacity: 0.9,
            duration: 0.8,
            ease: "power2.inOut",
          },
          0.3
        );
      });

      // Phase 3: The Fusion Core explodes outward with energy
      tl.to(
        cardsRef.current,
        {
          opacity: 0,
          scale: 0.1,
          duration: 0.2,
        },
        1.1
      )
        .to(
          coreHubRef.current,
          {
            scale: 1.2,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(2)",
          },
          1.15
        )
        .to(
          beamRef.current,
          {
            scaleY: 1,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
          },
          1.25
        )
        // Phase 4: Emergence of the single system
        .to(
          resolvedTextRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          1.4
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 z-10"
      style={{ perspective: "1200px" }}
    >
      {/* Background radial gradient accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(131,208,190,0.04),transparent)] pointer-events-none" />

      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 relative z-20">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#83D0BE]">
          The Friction Point
        </span>
        <h2
          ref={headlineRef}
          className="font-display text-[clamp(32px,5vw,60px)] font-light leading-[1.05] tracking-[-0.03em] text-[#F4F4F5] mt-3"
        >
          Creative production is{" "}
          <span className="text-[#8E9196]">shattered.</span>
        </h2>
      </div>

      {/* 3D Kinetic Stage for Tool Shards */}
      <div
        className="relative w-full max-w-4xl h-[420px] flex items-center justify-center pointer-events-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Core Fusion Hub (Reveals on convergence) */}
        <div
          ref={coreHubRef}
          className="absolute z-30 w-32 h-32 rounded-full border border-[#83D0BE] bg-[#070809] shadow-[0_0_80px_rgba(131,208,190,0.6)] flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#83D0BE]/20 animate-pulse border border-[#83D0BE]/60 flex items-center justify-center">
            <span className="font-mono text-[11px] text-[#83D0BE] font-bold">
              VICHITH
            </span>
          </div>
        </div>

        {/* Vertical Energy Beam */}
        <div
          ref={beamRef}
          className="absolute z-20 w-[2px] h-[500px] bg-gradient-to-b from-transparent via-[#83D0BE] to-transparent origin-center pointer-events-none shadow-[0_0_20px_#83D0BE]"
        />

        {/* 5 Fragmented Application Cards */}
        {APPS.map((app, idx) => (
          <div
            key={idx}
            ref={(el) => {
              cardsRef.current[idx] = el;
            }}
            className="absolute w-[260px] p-4 rounded-xl border border-white/[0.08] bg-[#0C0E10]/85 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] z-10 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E9196]">
                {app.name}
              </span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: app.color }}
              />
            </div>
            <p className="text-sm font-medium text-[#F4F4F5]">{app.label}</p>
            <p className="text-[11px] text-[#8E9196] leading-tight font-mono">
              {app.meta}
            </p>
          </div>
        ))}
      </div>

      {/* Resolved Payoff Text */}
      <div
        ref={resolvedTextRef}
        className="text-center max-w-xl mx-auto mt-4 relative z-20"
      >
        <p className="font-display text-[clamp(26px,3.8vw,44px)] font-light text-[#F4F4F5] leading-tight tracking-[-0.03em]">
          One connected workspace.
          <br />
          <span className="text-[#83D0BE] italic font-serif">
            From imagination to final edit.
          </span>
        </p>
        <p className="text-[14px] text-[#8E9196] mt-3 max-w-md mx-auto">
          Generation creates the raw material. Vichith Studio gives you the
          apparatus to shape and finish it.
        </p>
      </div>
    </section>
  );
}
