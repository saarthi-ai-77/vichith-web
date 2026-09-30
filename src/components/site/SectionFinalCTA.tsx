"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";

const APP_URL = "https://app.vichith.in";

const BG_ORBS = [
  { src: "/lighthouse.jpg", x: "20%", y: "30%", size: 520, opacity: 0.18 },
  { src: "/man.jpg",        x: "75%", y: "65%", size: 400, opacity: 0.14 },
  { src: "/vintage.jpg",    x: "60%", y: "20%", size: 350, opacity: 0.10 },
];

export function SectionFinalCTA() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const orbsRef     = useRef<HTMLDivElement>(null);
  const btnRef      = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 55%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out" },
      });

      tl.fromTo(orbsRef.current, { opacity: 0 }, { opacity: 1, duration: 2, ease: "power1.out" })
        .fromTo(headlineRef.current, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 1.0 }, "-=1.5")
        .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");

      // CTA button breathing glow
      gsap.to(btnRef.current, {
        boxShadow: "0 0 48px rgba(131,208,190,0.35)",
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden px-6"
    >
      {/* Blurred orbs — warmer, more visible than hero */}
      <div ref={orbsRef} className="absolute inset-0 pointer-events-none opacity-0" aria-hidden>
        {BG_ORBS.map((orb, i) => (
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
              filter: "blur(80px)",
              opacity: orb.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <h2
          ref={headlineRef}
          className="font-display text-[clamp(48px,7vw,88px)] font-light leading-[1.0] tracking-[-0.04em] text-[#F4F4F5] mb-10 opacity-0"
        >
          Your idea is waiting<br />to become something.
        </h2>

        <div ref={ctaRef} className="flex flex-col items-center gap-4 opacity-0">
          <Link
            href={APP_URL}
            ref={btnRef}
            className="pill-btn-primary px-8 py-3 text-[15px] shadow-[0_0_24px_rgba(131,208,190,0.2)]"
          >
            Start creating at app.vichith.in
          </Link>
          <p className="text-[12px] text-[#8E9196]">Free forever tier · No credit card required</p>
        </div>
      </div>
    </section>
  );
}
