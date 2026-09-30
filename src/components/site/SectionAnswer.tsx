"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SectionAnswer() {
  const sectionRef    = useRef<HTMLElement>(null);
  const headlineRef   = useRef<HTMLHeadingElement>(null);
  const bodyRef       = useRef<HTMLParagraphElement>(null);
  const workspaceRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          end: "bottom 30%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out" },
      });

      tl.fromTo(headlineRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9 })
        .fromTo(bodyRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
        .fromTo(workspaceRef.current, { opacity: 0, y: 36, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 1 }, "-=0.3");
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="workspace"
      className="relative px-6 py-40 flex flex-col items-center text-center"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E9196] mb-8">One workspace</p>

      <h2
        ref={headlineRef}
        className="font-display text-[clamp(40px,5vw,68px)] font-light leading-[1.05] tracking-[-0.04em] text-[#F4F4F5] mb-6 opacity-0"
      >
        Everything connected.<br />
        <span className="text-[#83D0BE]">Nothing lost.</span>
      </h2>

      <p
        ref={bodyRef}
        className="text-[16px] text-[#8E9196] leading-[1.7] max-w-md mx-auto mb-20 opacity-0"
      >
        Your idea, your references, your generated visuals, your edits — one project. 
        From the first prompt to the finished frame.
      </p>

      {/* Abstract workspace window */}
      <div
        ref={workspaceRef}
        className="relative w-full max-w-3xl mx-auto opacity-0 product-window overflow-hidden"
        style={{ aspectRatio: "16 / 9" }}
      >
        {/* Titlebar chrome */}
        <div className="flex items-center gap-2 px-4 h-9 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
          <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
          <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E9196]/50">Vichith Studio</span>
        </div>

        {/* Simulated content: canvas + timeline split */}
        <div className="flex h-[calc(100%-36px)]">
          {/* Canvas area */}
          <div className="flex-1 bg-[#080A0A] relative flex items-center justify-center">
            <img
              src="/lighthouse.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
            />
            <div className="relative z-10 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E9196]/60">Sequence view</span>
            </div>
          </div>

          {/* Inspector sidebar */}
          <div className="w-[140px] border-l border-white/[0.06] bg-[#0C0E0E] p-3 flex flex-col gap-3">
            <div className="h-[6px] w-3/4 rounded-full bg-white/[0.06]" />
            <div className="h-[6px] w-1/2 rounded-full bg-white/[0.06]" />
            <div className="mt-2 h-16 rounded bg-white/[0.04] border border-white/[0.05]" />
            <div className="h-[6px] w-4/5 rounded-full bg-white/[0.06]" />
            <div className="mt-auto h-[4px] rounded-full bg-white/[0.05] overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-[#83D0BE]/40" />
            </div>
          </div>
        </div>

        {/* Accent glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(131,208,190,0.06), transparent)",
        }} />
      </div>
    </section>
  );
}
