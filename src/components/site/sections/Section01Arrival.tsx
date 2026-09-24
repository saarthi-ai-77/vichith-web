"use client";

/**
 * Section01Arrival — 3-Act Pinned Hero
 *
 * Architecture: 200vh outer container (scrollable) + sticky inner viewport
 * (stays fixed at top:0 for the full scroll budget). GSAP ScrollTrigger
 * scrubs a timeline through three acts as the user scrolls.
 *
 * Act I   (0 → 0.25):  Timecode fades in
 * Act II  (0.25 → 0.65): Timecode out → headline in (two lines, staggered)
 * Act III (0.65 → 1.0):  Rule slides, sub-headline + CTA fade in
 */

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SECTION_IDS } from "@/lib/spatial";

const EARLY_ACCESS_URL = "https://app.vichith.in/request-access";

gsap.registerPlugin(ScrollTrigger);

export function Section01Arrival() {
  const containerRef = useRef<HTMLElement>(null);
  const timecodeRef  = useRef<HTMLDivElement>(null);
  const line1Ref     = useRef<HTMLDivElement>(null);
  const line2Ref     = useRef<HTMLDivElement>(null);
  const ruleRef      = useRef<HTMLDivElement>(null);
  const subRef       = useRef<HTMLDivElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // ── Reduced-motion: skip animation, show final state immediately ──
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReduced) {
        gsap.set(timecodeRef.current, { opacity: 0 });
        gsap.set([line1Ref.current, line2Ref.current], { opacity: 1, y: 0 });
        gsap.set(ruleRef.current, { scaleX: 1, opacity: 1 });
        gsap.set([subRef.current, ctaRef.current], { opacity: 1, y: 0 });
        return;
      }

      // ── Scrubbed timeline (duration = 1 normalized unit; scrub maps it
      //    across the 200vh scroll budget of the outer section) ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      // Act I — timecode enters (0 → 0.25)
      tl.fromTo(
        timecodeRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
        0
      );

      // Act II — timecode exits (0.2 → 0.4)
      tl.to(
        timecodeRef.current,
        { opacity: 0, y: -24, duration: 0.2, ease: "power2.in" },
        0.2
      );

      // Act II — headline line 1 enters (0.3 → 0.6)
      tl.fromTo(
        line1Ref.current,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        0.3
      );

      // Act II — headline line 2 enters with stagger (0.42 → 0.72)
      tl.fromTo(
        line2Ref.current,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        0.42
      );

      // Act III — horizontal rule slides in from left (0.58 → 0.83)
      tl.fromTo(
        ruleRef.current,
        { scaleX: 0, opacity: 0, transformOrigin: "left center" },
        { scaleX: 1, opacity: 1, duration: 0.25, ease: "power2.out" },
        0.58
      );

      // Act III — sub-headline fades in (0.65 → 0.9)
      tl.fromTo(
        subRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
        0.65
      );

      // Act III — CTA fades in (0.72 → 0.97)
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
        0.72
      );
    },
    { scope: containerRef }
  );

  return (
    /*
     * Outer section is 200vh tall — it acts as the scroll runway.
     * The inner sticky div locks to the viewport for that entire journey.
     */
    <section
      id={SECTION_IDS.arrival}
      ref={containerRef}
      className="relative w-full"
      style={{ height: "200vh" }}
    >
      {/* ── Sticky viewport shell ── */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#070709]">

        {/* ── Background layer stack (pointer-events: none, behind content) ── */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          {/* Soft radial glow centred on the hero */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[900px] h-[500px] rounded-full bg-accent/[0.035] blur-[200px]" />
          </div>

          {/* Faint perspective grid — masked to an ellipse so edges fade out */}
          <div
            className="absolute inset-0 grid-field"
            style={{
              maskImage:
                "radial-gradient(ellipse 60% 50% at 50% 50%, #000 20%, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 60% 50% at 50% 50%, #000 20%, transparent 70%)",
            }}
          />
        </div>

        {/* Animated noise grain overlay (from globals.css @utility noise-overlay) */}
        <div className="noise-overlay" aria-hidden="true" />

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* Act I — Timecode                                                  */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <div
          ref={timecodeRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ opacity: 0 }}
          aria-hidden="true"
        >
          <span
            className="font-mono text-white/30 tracking-[0.15em]"
            style={{ fontSize: "clamp(2.5rem, 8vw, 7rem)" }}
          >
            00:00:00:00
          </span>
        </div>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* Act II + III — Headline, rule, sub, CTA                           */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <div className="relative z-10 px-6 md:px-10 max-w-5xl w-full mx-auto">

          {/* Headline line 1 */}
          <div
            ref={line1Ref}
            className="font-display font-extrabold text-white leading-[1.01] select-none"
            style={{
              fontSize: "clamp(2.8rem, 7.5vw, 7.5rem)",
              letterSpacing: "-0.035em",
              opacity: 0,
            }}
          >
            AI DOES THE WORK.
          </div>

          {/* Headline line 2 */}
          <div
            ref={line2Ref}
            className="font-display font-extrabold text-white leading-[1.01] select-none"
            style={{
              fontSize: "clamp(2.8rem, 7.5vw, 7.5rem)",
              letterSpacing: "-0.035em",
              opacity: 0,
            }}
          >
            YOU KEEP THE CRAFT.
          </div>

          {/* Act III — Horizontal rule */}
          <div
            ref={ruleRef}
            className="mt-8 md:mt-10 h-px max-w-[480px] bg-white/15"
            style={{ opacity: 0, transformOrigin: "left center" }}
          />

          {/* Act III — Sub-headline */}
          <div
            ref={subRef}
            className="mt-5 max-w-md"
            style={{ opacity: 0 }}
          >
            <p className="font-sans text-base md:text-lg text-white/55 font-light leading-relaxed">
              Chithra is the intelligence.{" "}
              <span className="text-white/75">Vichith</span> is the studio.
            </p>
          </div>

          {/* Act III — CTA */}
          <div
            ref={ctaRef}
            className="mt-8"
            style={{ opacity: 0 }}
          >
            <a
              href={EARLY_ACCESS_URL}
              className="
                inline-flex items-center gap-2
                px-8 py-3.5 rounded-full
                bg-white text-black
                font-semibold text-xs sm:text-sm tracking-wider uppercase
                transition-all duration-200
                hover:bg-accent hover:text-black
                active:scale-[0.97]
                shadow-xl shadow-black/50
              "
            >
              Request Early Access
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* ── Scroll indicator (no GSAP, always visible) ── */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          aria-hidden="true"
        >
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/25">
            SCROLL
          </span>
          <div className="w-px h-6 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </div>
    </section>
  );
}
