"use client";

import { useEffect, useRef } from "react";
import { CAMERA_EVENT } from "../SpatialCanvas";
import { DEPTH } from "@/lib/spatial";

// The full sentence that types out word by word as you scroll
const WORDS = ["FROM", "A", "SENTENCE", "TO", "A", "FINISHED", "FRAME."];

// Bezier control points for the animated easing curve
// P0=(40,160) P1=(110,40) P2=(220,40) P3=(280,40)
// P1 Y will flex with scroll progress for a physical spring feel

export function SceneMotion() {
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const curveRef = useRef<SVGPathElement>(null);
  const handle1Ref = useRef<SVGCircleElement>(null);
  const tangent1Ref = useRef<SVGLineElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    function onCamera(e: Event) {
      const { cameraZ, velocity } = (e as CustomEvent<{ cameraZ: number; velocity: number }>).detail;
      const motionZ = Math.abs(DEPTH.motion);
      // Window: 1400px approach → 1400px dwell. Extra room means all 7 words
      // reveal during the approach AND the bezier dot finishes its curve
      // before the scene begins fading out.
      const p = Math.max(0, Math.min(1, (cameraZ - (motionZ - 1400)) / 2800));

      // Word reveal — imperatively update each span's style, no React re-render
      const newCount = Math.min(WORDS.length, Math.floor(p * WORDS.length) + 1);
      wordRefs.current.forEach((el, idx) => {
        if (!el) return;
        const isActive = idx === newCount - 1;
        const isRevealed = idx < newCount;
        el.style.color = isActive
          ? "var(--color-accent)"
          : isRevealed
          ? "oklch(0.95 0.005 200)"
          : "oklch(0.95 0.005 200 / 10%)";
        el.style.textShadow = isActive
          ? "0 0 40px var(--color-accent), 0 0 80px oklch(0.82 0.15 178 / 30%)"
          : "none";
        el.style.transform = isActive ? "scale(1.06)" : "scale(1)";
      });

      // Bezier handle — flex with velocity for tactile spring feel
      const vy = Math.max(-60, Math.min(60, (velocity ?? 0) * 0.05));
      const h1y = 40 + vy; // resting at y=40, bounces ±60 with scroll
      if (handle1Ref.current) {
        handle1Ref.current.setAttribute("cy", String(h1y));
      }
      if (tangent1Ref.current) {
        tangent1Ref.current.setAttribute("y2", String(h1y));
      }
      if (curveRef.current) {
        curveRef.current.setAttribute(
          "d",
          `M 40,160 C 110,${h1y} 220,40 280,40`
        );
      }

      // Animated ball on the curve — follows scroll progress
      // Parametric cubic bezier approximation
      const t = p;
      const mt = 1 - t;
      const bx = mt * mt * mt * 40 + 3 * mt * mt * t * 110 + 3 * mt * t * t * 220 + t * t * t * 280;
      const by = mt * mt * mt * 160 + 3 * mt * mt * t * h1y + 3 * mt * t * t * 40 + t * t * t * 40;
      if (dotRef.current) {
        dotRef.current.setAttribute("cx", String(bx.toFixed(1)));
        dotRef.current.setAttribute("cy", String(by.toFixed(1)));
      }
    }

    window.addEventListener(CAMERA_EVENT, onCamera);
    return () => window.removeEventListener(CAMERA_EVENT, onCamera);
  }, []);

  return (
    <div
      className="scene absolute inset-0 flex items-center justify-center preserve-3d"
      style={{ transform: `translateZ(${DEPTH.motion}px)` }}
      data-z={DEPTH.motion}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4
                      scale-[0.36] sm:scale-[0.52] md:scale-[0.78] lg:scale-100 pointer-events-none">

        {/* ── Minimal label ── */}
        <div className="text-center mb-8" style={{ transform: "translateZ(200px)" }}>
          <p className="eyebrow text-accent tracking-[0.25em] mb-2">Motion Intelligence · Structure, Not Pixels</p>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">
            Editable motion. <span className="serif-accent text-accent">Not a re-roll.</span>
          </h2>
        </div>

        {/* ═══════════════════════════════════════════════
            VISUAL BLOCK A — Kinetic Typography Stage (hero)
        ═══════════════════════════════════════════════ */}
        <div
          className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-float"
          style={{
            transform: "translateZ(260px) rotateX(3deg)",
            background: "radial-gradient(ellipse 90% 70% at 50% 50%, oklch(0.19 0.012 200 / 80%), oklch(0.08 0.008 200))",
            minHeight: "220px",
          }}
        >
          {/* Subtle grid */}
          <div className="absolute inset-0 grid-field opacity-10 pointer-events-none" />

          {/* Layer controls row — like a real motion design tool */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-accent tracking-widest uppercase">Motion Layer · Text</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[9px] text-white/30">
              <span>T = 00:00:07:12</span>
              <span className="text-accent">●  LIVE</span>
            </div>
          </div>

          {/* The kinetic text — DOMINANT element. Styled imperatively via wordRefs. */}
          <div
            className="px-8 py-16 text-center"
            style={{ lineHeight: 1.15 }}
          >
            {WORDS.map((word, idx) => (
              <span
                key={idx}
                ref={(el) => { wordRefs.current[idx] = el; }}
                className="font-display font-extrabold tracking-tight transition-[color,text-shadow,transform] duration-300 select-none inline-block"
                style={{
                  fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
                  marginRight: "0.35em",
                  // Initial state: first 2 words visible, rest dimmed
                  color: idx < 2 ? "oklch(0.95 0.005 200)" : "oklch(0.95 0.005 200 / 10%)",
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Bottom HUD — language pills */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {["हिन्दी", "తెలుగు", "Hinglish", "English"].map((lang) => (
                <span
                  key={lang}
                  className="font-mono text-[9px] text-white/50 bg-white/5 border border-white/10 rounded px-2 py-0.5"
                >
                  {lang}
                </span>
              ))}
            </div>
            <span className="font-mono text-[8px] text-white/25">Whisper.cpp · ±12ms accuracy</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            VISUAL BLOCK B — Bezier Curve Editor + Caption Preview side by side
        ═══════════════════════════════════════════════ */}
        <div className="mt-4 grid grid-cols-5 gap-4">

          {/* LEFT 3/5: Bezier Curve Graph — dominant visual */}
          <div
            className="col-span-3 glass-panel shadow-float rounded-2xl overflow-hidden border border-white/8"
            style={{ transform: "translateZ(200px) rotateY(-6deg) rotateX(8deg)" }}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-black/20">
              <span className="font-mono text-[9px] text-white/50 tracking-widest uppercase">Easing Curve Editor</span>
              <span className="font-mono text-[9px] text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded">
                Spring · 180 / 22
              </span>
            </div>

            <div className="relative p-2" style={{ height: "240px" }}>
              {/* Grid background */}
              <svg className="absolute inset-2 opacity-10" width="100%" height="100%" viewBox="0 0 320 200" preserveAspectRatio="none">
                {[1, 2, 3].map((i) => (
                  <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="200" stroke="white" strokeWidth="1" />
                ))}
                {[1, 2, 3].map((i) => (
                  <line key={`h${i}`} x1="0" y1={i * 50} x2="320" y2={i * 50} stroke="white" strokeWidth="1" />
                ))}
              </svg>

              {/* Axis labels */}
              <div className="absolute bottom-3 left-4 right-4 flex justify-between font-mono text-[8px] text-white/25">
                <span>0s</span><span>0.1s</span><span>0.2s</span><span>0.3s</span><span>0.4s</span>
              </div>
              <div className="absolute top-3 left-3 font-mono text-[8px] text-white/25 -rotate-90 origin-top-left translate-y-20">
                value
              </div>

              {/* The curve SVG */}
              <svg className="absolute inset-2" viewBox="0 0 320 200" preserveAspectRatio="none">
                {/* Tangent arms */}
                <line
                  ref={tangent1Ref}
                  x1="40" y1="160" x2="110" y2="40"
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="4 3"
                  strokeWidth="1.5"
                />
                <line
                  x1="280" y1="40" x2="220" y2="40"
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="4 3"
                  strokeWidth="1.5"
                />

                {/* Glow path (wide, blurred) */}
                <path
                  d="M 40,160 C 110,40 220,40 280,40"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="10"
                  opacity="0.15"
                />

                {/* Main path — updates via ref */}
                <path
                  ref={curveRef}
                  d="M 40,160 C 110,40 220,40 280,40"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="2.5"
                />

                {/* Keyframe diamonds */}
                <rect x="34" y="154" width="12" height="12" transform="rotate(45 40 160)" fill="var(--color-accent)" />
                <rect x="274" y="34" width="12" height="12" transform="rotate(45 280 40)" fill="var(--color-accent)" />

                {/* Tangent handles */}
                <circle ref={handle1Ref} cx="110" cy="40" r="5" fill="#fff" stroke="var(--color-accent)" strokeWidth="2" />
                <circle cx="220" cy="40" r="5" fill="#fff" stroke="var(--color-accent)" strokeWidth="2" />

                {/* Moving ball tracking the curve */}
                <circle
                  ref={dotRef}
                  cx="40" cy="160" r="6"
                  fill="var(--color-accent)"
                  style={{ filter: "drop-shadow(0 0 6px var(--color-accent))" }}
                />
              </svg>
            </div>

            {/* Footer value row */}
            <div className="px-4 py-2 border-t border-white/8 bg-black/20 flex items-center justify-between font-mono text-[9px]">
              <span className="text-white/40">cubic-bezier(0.16, 1.0, 0.3, 1.0)</span>
              <span className="text-accent">easeOutQuart</span>
            </div>
          </div>

          {/* RIGHT 2/5: Caption Layer Stack */}
          <div
            className="col-span-2 glass-panel shadow-float rounded-2xl overflow-hidden border border-white/8 flex flex-col"
            style={{ transform: "translateZ(230px) rotateY(6deg) rotateX(8deg)" }}
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/8 bg-black/20">
              <span className="font-mono text-[9px] text-white/50 tracking-widest uppercase">Caption Layer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            </div>

            {/* Live caption frame */}
            <div
              className="flex-1 flex items-center justify-center relative"
              style={{
                backgroundImage: "url('/vintage.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              {/* Caption block */}
              <div className="relative z-10 flex flex-col items-center gap-2 px-4">
                <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                  <p className="font-display font-bold text-base text-white leading-snug">
                    <span className="text-accent">FROM</span> A SENTENCE TO
                  </p>
                  <p className="font-display font-bold text-base text-white leading-snug">
                    A FINISHED{" "}
                    <span
                      className="text-accent"
                      style={{ textShadow: "0 0 20px var(--color-accent)" }}
                    >
                      FRAME.
                    </span>
                  </p>
                </div>
                {/* Script badges */}
                <div className="flex gap-1.5 mt-1">
                  {["हिन्दी", "English"].map((l) => (
                    <span
                      key={l}
                      className="font-mono text-[8px] text-white/60 bg-black/50 border border-white/15 rounded px-1.5 py-0.5"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timing footer */}
            <div className="px-3 py-2 border-t border-white/8 bg-black/20 font-mono text-[8px] text-white/30 flex justify-between">
              <span>IN 00:00:06:12</span>
              <span>OUT 00:00:09:00</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
