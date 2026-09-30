"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Tool shards — fragments of different creative tools
const SHARDS = [
  { label: "Script",      x: -38, y: -42, rot: -8,  w: 140, h: 60  },
  { label: "Storyboard",  x:  32, y: -38, rot:  6,  w: 160, h: 48  },
  { label: "Generation",  x: -44, y:  -8, rot: -4,  w: 150, h: 54  },
  { label: "References",  x:  38, y:   4, rot:  9,  w: 130, h: 52  },
  { label: "Timeline",    x: -28, y:  36, rot: -6,  w: 170, h: 46  },
  { label: "Export",      x:  40, y:  32, rot:  5,  w: 120, h: 50  },
  { label: "Characters",  x:  -4, y:  52, rot: -3,  w: 145, h: 48  },
  { label: "Audio",       x:  -8, y: -56, rot:  7,  w: 110, h: 44  },
];

export function SectionProblem() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const shardsRef  = useRef<HTMLDivElement[]>([]);
  const closerRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      // Shard initial state — scattered outward
      shardsRef.current.forEach((el, i) => {
        const s = SHARDS[i];
        gsap.set(el, {
          x: `${s.x * 1.8}vw`,
          y: `${s.y * 1.6}vh`,
          rotation: s.rot * 2,
          opacity: 0,
          scale: 0.6,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=2400",
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
        },
      });

      // Phase 1: title reveals
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.3 },
        0
      );

      // Phase 2: shards tumble in from chaos
      shardsRef.current.forEach((el, i) => {
        const s = SHARDS[i];
        tl.to(
          el,
          {
            x: `${s.x}%`,
            y: `${s.y}%`,
            rotation: s.rot,
            opacity: 0.55,
            scale: 1,
            duration: 0.5,
            ease: "power3.out",
          },
          0.15 + i * 0.06
        );
      });

      // Phase 3: hold moment — shards visible, chaos settled
      tl.to({}, { duration: 0.4 }, 0.8);

      // Phase 4: shards converge to center (getting sucked in)
      shardsRef.current.forEach((el) => {
        tl.to(
          el,
          { x: 0, y: 0, rotation: 0, scale: 0.85, opacity: 0.8, duration: 0.4, ease: "power2.inOut" },
          1.25
        );
      });

      // Phase 5: flash out — all shards vanish
      tl.to(shardsRef.current, { opacity: 0, scale: 1.1, duration: 0.15, ease: "power3.in" }, 1.65);

      // Phase 6: closer copy arrives
      tl.fromTo(
        closerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3 },
        1.7
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ height: "100vh" }}>
      {/* Title — left aligned */}
      <div
        ref={titleRef}
        className="absolute top-[18%] left-[8%] opacity-0 max-w-lg"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E9196] mb-5">The problem</p>
        <h2 className="font-display text-[clamp(40px,5vw,64px)] font-light leading-[1.05] tracking-[-0.04em] text-[#F4F4F5]">
          Creative work<br />is scattered<br />across five tools.
        </h2>
        <p className="mt-5 text-[16px] text-[#8E9196] leading-[1.7] max-w-xs">
          Prompt here. Generate there. Edit somewhere else. Export. Lose the context. Start over.
        </p>
      </div>

      {/* Shards orbit container — centred */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {SHARDS.map((s, i) => (
          <div
            key={i}
            ref={(el) => { if (el) shardsRef.current[i] = el; }}
            className="absolute flex items-center justify-center border border-white/10 bg-white/[0.03] rounded-md text-[#8E9196] font-mono text-[10px] uppercase tracking-[0.1em] backdrop-blur-sm"
            style={{ width: s.w, height: s.h }}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Closer statement */}
      <div
        ref={closerRef}
        className="absolute bottom-[20%] left-1/2 -translate-x-1/2 text-center opacity-0"
      >
        <p className="font-display text-[clamp(32px,4vw,52px)] font-light tracking-[-0.04em] text-[#F4F4F5]">
          What if it all happened<br />
          <span className="text-[#83D0BE]">in one place?</span>
        </p>
      </div>
    </section>
  );
}
