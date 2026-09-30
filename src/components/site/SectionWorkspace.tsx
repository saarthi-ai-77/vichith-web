"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SHOTS = [
  { src: "/shot.jpg",        label: "GEN_001" },
  { src: "/pouring_tea.jpg", label: "GEN_002" },
  { src: "/split_pour.jpg",  label: "GEN_003" },
  { src: "/vintage.jpg",     label: "GEN_004" },
];

export function SectionWorkspace() {
  const sectionRef    = useRef<HTMLElement>(null);
  const headlineARef  = useRef<HTMLHeadingElement>(null);
  const headlineBRef  = useRef<HTMLHeadingElement>(null);
  const gridRef       = useRef<HTMLDivElement>(null);
  const shotRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef   = useRef<HTMLDivElement>(null);
  const trackRef      = useRef<HTMLDivElement>(null);
  const studioRef     = useRef<HTMLDivElement>(null);
  const chithraBubble = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      // Initial set
      gsap.set(headlineBRef.current, { opacity: 0, y: 16 });
      gsap.set(timelineRef.current, { opacity: 0, y: 60 });
      gsap.set(studioRef.current, { opacity: 0 });
      gsap.set(chithraBubble.current, { opacity: 0, scale: 0.85, y: 8 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=3200",
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
        },
      });

      // Phase 1: headline A + grid visible (0–0.3)
      tl.fromTo(headlineARef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0);
      SHOTS.forEach((_, i) => {
        tl.fromTo(
          shotRefs.current[i],
          { opacity: 0, scale: 0.9, y: 16 },
          { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" },
          0.05 + i * 0.06
        );
      });

      // Phase 2: grid shots compress and drop into timeline (0.4–0.85)
      tl.to(headlineARef.current, { opacity: 0, y: -12, duration: 0.15, ease: "power2.in" }, 0.38);
      tl.fromTo(headlineBRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.2 }, 0.42);

      // Studio + timeline slide up
      tl.to(studioRef.current, { opacity: 1, duration: 0.25, ease: "power2.out" }, 0.4);
      tl.to(timelineRef.current, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, 0.42);

      // Individual shots compress + drop to track positions
      SHOTS.forEach((_, i) => {
        const destX = -300 + i * 200; // spaced along track
        tl.to(
          shotRefs.current[i],
          {
            y: 180 + 30,  // drop to track level
            x: destX,
            scaleX: 1.0,
            scaleY: 0.28, // compress into clip bar
            borderRadius: 4,
            duration: 0.35,
            ease: "power2.inOut",
          },
          0.5 + i * 0.04
        );
      });

      // Phase 3: Chithra + studio (0.9–1.2)
      tl.to({}, { duration: 0.1 }, 0.85);
      tl.to(chithraBubble.current, { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "back.out(1.4)" }, 0.88);

      // Shots tint change — Chithra made them moodier
      tl.to(shotRefs.current, {
        filter: "hue-rotate(20deg) saturate(1.4) brightness(0.75)",
        duration: 0.35,
        stagger: 0.04,
      }, 0.98);
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="studio"
      className="relative overflow-hidden"
      style={{ height: "100vh" }}
    >
      <div className="relative h-full flex flex-col items-center justify-center px-6">
        
        {/* Headline A: Generate */}
        <h2
          ref={headlineARef}
          className="font-display text-[clamp(36px,4.5vw,64px)] font-light tracking-[-0.04em] text-[#F4F4F5] text-center mb-12 opacity-0 absolute top-[12%]"
        >
          Generate.<br />
          <span className="text-[#83D0BE]">Then shape.</span>
        </h2>

        {/* Headline B: In one workspace */}
        <h2
          ref={headlineBRef}
          className="font-display text-[clamp(36px,4.5vw,64px)] font-light tracking-[-0.04em] text-[#F4F4F5] text-center mb-12 opacity-0 absolute top-[12%]"
        >
          In one workspace.<br />
          <span className="text-[#83D0BE]">Always connected.</span>
        </h2>

        {/* Studio chrome */}
        <div
          ref={studioRef}
          className="absolute inset-x-6 md:inset-x-16 top-[26%] bottom-[8%] product-window overflow-hidden opacity-0"
        >
          {/* Titlebar */}
          <div className="h-9 flex items-center gap-2 px-4 border-b border-white/[0.05] bg-white/[0.015]">
            <div className="w-3 h-3 rounded-full bg-white/[0.05]" />
            <div className="w-3 h-3 rounded-full bg-white/[0.05]" />
            <div className="w-3 h-3 rounded-full bg-white/[0.05]" />
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E9196]/40">Vichith Studio</span>
          </div>

          {/* Canvas */}
          <div className="absolute top-9 left-0 right-[140px] bottom-[120px] flex items-center justify-center">
            <img src="/lighthouse.jpg" alt="" className="w-full h-full object-cover opacity-20" />
            <span className="absolute font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E9196]/40">Canvas</span>
          </div>

          {/* Inspector */}
          <div className="absolute top-9 right-0 w-[140px] bottom-[120px] border-l border-white/[0.05] bg-white/[0.01] p-4 flex flex-col gap-3">
            <div className="h-[5px] w-3/4 rounded bg-white/[0.05]" />
            <div className="h-[5px] w-1/2 rounded bg-white/[0.05]" />
            <div className="mt-1 h-20 rounded border border-white/[0.05] bg-white/[0.02]" />
          </div>
        </div>

        {/* Shot grid — these animate into timeline */}
        <div ref={gridRef} className="relative z-10 flex gap-5 pointer-events-none">
          {SHOTS.map((shot, i) => (
            <div
              key={i}
              ref={(el) => { shotRefs.current[i] = el; }}
              className="w-[200px] aspect-video rounded-lg overflow-hidden border border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.5)] opacity-0"
            >
              <img src={shot.src} alt={shot.label} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8E9196]/70">{shot.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline bar */}
        <div
          ref={timelineRef}
          className="absolute bottom-[8%] left-6 md:left-16 right-6 md:right-16 h-[120px] border-t border-white/[0.07] bg-[#0A0C0C]/80 backdrop-blur-sm px-4 pt-3 opacity-0"
          style={{ transform: "translateY(60px)" }}
        >
          <div className="flex items-center gap-6 mb-3 opacity-40">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E9196]">Timeline</span>
            <div className="flex gap-4 text-[9px] font-mono text-[#8E9196]">
              <span>00:00</span><span>00:05</span><span>00:10</span><span>00:15</span><span>00:20</span>
            </div>
          </div>
          {/* Track row — shots land here */}
          <div ref={trackRef} className="relative h-[40px] bg-white/[0.02] rounded border border-white/[0.05]" />
          <div className="mt-2 h-[20px] bg-white/[0.02] rounded border border-white/[0.04] opacity-50" />
        </div>

        {/* Chithra action bubble */}
        <div
          ref={chithraBubble}
          className="absolute top-[40%] left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 glass rounded-full px-5 py-2.5 border border-[#83D0BE]/30 shadow-[0_0_30px_rgba(131,208,190,0.12)]"
        >
          <span className="w-[7px] h-[7px] rounded-full bg-[#83D0BE] animate-pulse shadow-[0_0_8px_#83D0BE]" />
          <span className="text-[13px] text-[#F4F4F5]">Make the lighting moodier</span>
        </div>
      </div>
    </section>
  );
}
