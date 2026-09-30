"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Beat types for the Chithra conversation
type Beat =
  | { kind: "user";      text: string }
  | { kind: "thinking" }
  | { kind: "chithra";   text: string }
  | { kind: "proposal";  model: string; reason: string; cost: string }
  | { kind: "approve" }
  | { kind: "image" };

const BEATS: Beat[] = [
  { kind: "user",     text: "I want a cinematic lighthouse shot, warm golden light." },
  { kind: "thinking" },
  { kind: "chithra",  text: "One shot or a sequence? I'll pull from your coastal references." },
  { kind: "user",     text: "Just one. Make it feel like a memory, not a postcard." },
  { kind: "proposal", model: "Seedream 4.5", reason: "Strongest at held reference light and mood.", cost: "4 credits" },
  { kind: "approve"  },
  { kind: "image"    },
];

// deterministic "random" — same value on server and client
function pseudo(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function SectionChithra() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef   = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef    = useRef<HTMLParagraphElement>(null);
  const beatRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const devRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      // Left copy entrance
      const leftTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 55%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out" },
      });
      leftTl
        .fromTo(labelRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo(headlineRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
        .fromTo(bodyRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4");

      // Set all beats hidden
      gsap.set(beatRefs.current, { opacity: 0, y: 20 });

      // Scroll-pinned conversation — each beat reveals as camera moves
      const convTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${BEATS.length * 340}`,
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      BEATS.forEach((beat, i) => {
        const el = beatRefs.current[i];
        if (!el) return;

        // arrive
        convTl.to(el, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, i * 0.55);

        // recede after next one arrives
        if (i < BEATS.length - 2) {
          convTl.to(el, { opacity: 0.25, y: -10, duration: 0.2, ease: "power1.in" }, i * 0.55 + 0.45);
        }
      });

      // Developing image animation (last beat)
      if (devRef.current) {
        convTl.to(devRef.current, {
          filter: "blur(0px) saturate(1)",
          duration: 0.5,
          ease: "power2.inOut",
        }, (BEATS.length - 1) * 0.55 + 0.1);
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="chithra"
      className="relative overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-full flex flex-col md:flex-row items-start gap-16 md:gap-24 pt-32 pb-24">
        
        {/* Left: editorial copy */}
        <div className="md:w-[42%] md:sticky md:top-32 shrink-0">
          <div ref={labelRef} className="opacity-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#83D0BE] mb-5">Chithra</p>
          </div>
          <h2
            ref={headlineRef}
            className="font-display text-[clamp(32px,3.5vw,52px)] font-light leading-[1.08] tracking-[-0.04em] text-[#F4F4F5] mb-5 opacity-0"
          >
            The intelligence<br />
            that moves with<br />
            your <span className="text-[#83D0BE]">creative intent.</span>
          </h2>
          <p
            ref={bodyRef}
            className="text-[15px] text-[#8E9196] leading-[1.75] max-w-xs opacity-0"
          >
            Not a chatbot. Not a prompt box. A creative mind that understands what 
            you&apos;re building — and helps you build it.
          </p>
        </div>

        {/* Right: scroll-driven conversation */}
        <div className="flex-1 flex flex-col gap-5 py-4">
          {BEATS.map((beat, i) => {
            const isRight = beat.kind === "user";
            return (
              <div
                key={i}
                ref={(el) => { beatRefs.current[i] = el; }}
                className={`flex ${isRight ? "justify-end" : "justify-start"}`}
              >
                {beat.kind === "user" && (
                  <div className="max-w-xs glass rounded-2xl rounded-br-sm px-5 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8E9196] mb-1">You</p>
                    <p className="text-[15px] text-[#F4F4F5] leading-snug text-right">{beat.text}</p>
                  </div>
                )}

                {beat.kind === "thinking" && (
                  <div className="flex items-center gap-3 px-5 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8E9196]">Chithra</p>
                    <div className="flex gap-[5px]">
                      {[0, 1, 2].map((j) => (
                        <span
                          key={j}
                          className="w-[6px] h-[6px] rounded-full bg-[#83D0BE]/60 animate-pulse"
                          style={{ animationDelay: `${j * 0.18}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {beat.kind === "chithra" && (
                  <div className="max-w-xs glass rounded-2xl rounded-bl-sm px-5 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8E9196] mb-1">Chithra</p>
                    <p className="text-[15px] text-[#F4F4F5] leading-snug">{beat.text}</p>
                  </div>
                )}

                {beat.kind === "proposal" && (
                  <div className="glass rounded-2xl rounded-bl-sm px-5 py-4 max-w-xs">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8E9196] mb-3">Proposed</p>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[14px] font-medium text-[#F4F4F5]">{beat.model}</span>
                      <span className="font-mono text-[12px] text-[#83D0BE]">{beat.cost}</span>
                    </div>
                    <p className="text-[13px] text-[#8E9196]">{beat.reason}</p>
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2 text-[12px] text-[#8E9196]">
                      <span className="w-[5px] h-[5px] rounded-full bg-[#83D0BE]" />
                      Nothing happens until you approve.
                    </div>
                  </div>
                )}

                {beat.kind === "approve" && (
                  <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-[#83D0BE]/60 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#83D0BE" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#F4F4F5]">Approved</p>
                      <p className="text-[11px] text-[#8E9196]">Generating now</p>
                    </div>
                  </div>
                )}

                {beat.kind === "image" && (
                  <div className="flex flex-col items-start gap-2">
                    <div
                      ref={devRef}
                      className="w-64 aspect-video rounded-xl overflow-hidden border border-white/[0.07]"
                      style={{ filter: "blur(10px) saturate(0.2)" }}
                    >
                      <img
                        src="/lighthouse.jpg"
                        alt="Generated frame"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-mono text-[10px] text-[#8E9196] italic">
                      &ldquo;A solitary lighthouse, warm golden light&rdquo;
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
