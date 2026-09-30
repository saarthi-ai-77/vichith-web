"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";

const APP_URL = "https://app.vichith.in";

// Images scattered as blurred orbs behind the text — not a grid, just light
const BG_ORBS = [
  { src: "/lighthouse.jpg", x: "10%", y: "20%", size: 480, opacity: 0.12 },
  { src: "/man.jpg",        x: "72%", y: "15%", size: 360, opacity: 0.10 },
  { src: "/shot.jpg",       x: "55%", y: "65%", size: 440, opacity: 0.09 },
  { src: "/vintage.jpg",    x: "15%", y: "70%", size: 320, opacity: 0.08 },
  { src: "/waves.mp4",      x: "85%", y: "55%", size: 300, opacity: 0.07, isVideo: true },
];

export function SectionHero() {
  const headlineRef  = useRef<HTMLHeadingElement>(null);
  const subRef       = useRef<HTMLParagraphElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const orbsRef      = useRef<HTMLDivElement>(null);
  const sectionRef   = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // --- Entrance sequence ---
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 1.1 }
      )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5"
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        )
        .fromTo(
          orbsRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 2.5, ease: "power1.out" },
          "-=1.2"
        );

      // --- Scroll exit: headline shrinks away ---
      const el = sectionRef.current;
      if (!el) return;

      gsap.to([headlineRef.current, subRef.current, ctaRef.current], {
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "60% top",
          scrub: 1.2,
        },
        opacity: 0,
        y: -32,
        scale: 0.94,
        ease: "none",
      });

      gsap.to(orbsRef.current, {
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "80% top",
          scrub: 1.6,
        },
        opacity: 0,
        ease: "none",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden px-6"
    >
      {/* Blurred image orbs */}
      <div ref={orbsRef} className="absolute inset-0 pointer-events-none opacity-0" aria-hidden>
        {BG_ORBS.map((orb, i) =>
          orb.isVideo ? (
            <video
              key={i}
              src={orb.src}
              autoPlay
              loop
              muted
              playsInline
              className="absolute rounded-full object-cover"
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.size,
                height: orb.size,
                marginLeft: -orb.size / 2,
                marginTop: -orb.size / 2,
                filter: `blur(72px)`,
                opacity: orb.opacity,
              }}
            />
          ) : (
            <img
              key={i}
              src={orb.src}
              alt=""
              className="absolute rounded-full object-cover"
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.size,
                height: orb.size,
                marginLeft: -orb.size / 2,
                marginTop: -orb.size / 2,
                filter: `blur(72px)`,
                opacity: orb.opacity,
              }}
            />
          )
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1
          ref={headlineRef}
          className="font-display text-[clamp(52px,8vw,96px)] font-light leading-[1.0] tracking-[-0.04em] text-[#F4F4F5] mb-6 opacity-0"
        >
          Make what<br />you imagined.
        </h1>

        <p
          ref={subRef}
          className="text-[17px] text-[#8E9196] leading-[1.7] max-w-lg mx-auto mb-10 opacity-0"
        >
          Vichith is the creative workspace where your idea becomes a real visual
          project — with an AI that actually understands creative work.
        </p>

        <div ref={ctaRef} className="flex items-center justify-center gap-4 opacity-0">
          <Link href={APP_URL} className="pill-btn-primary px-6 py-[10px] text-[14px]">
            Start creating
          </Link>
          <Link href="#chithra" className="pill-btn-secondary px-6 py-[10px] text-[14px]">
            See how it works
          </Link>
        </div>
      </div>

      {/* Scroll nudge */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E9196]">scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-[#8E9196] to-transparent" />
      </div>
    </section>
  );
}
