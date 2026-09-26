"use client";

import { useEffect, useRef } from "react";
import { CAMERA_EVENT } from "../SpatialCanvas";
import { DEPTH } from "@/lib/spatial";

function pr(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const WAVEFORM_VOICE = Array.from({ length: 28 }, (_, i) => pr(i * 3.1) * 65 + 20);
const WAVEFORM_MUSIC = Array.from({ length: 28 }, (_, i) => pr(i * 2.7 + 9) * 40 + 15);
const BEAT_POS = [0.18, 0.33, 0.52, 0.70, 0.85];

const CLIPS = [
  { label: "01_Lighthouse_Sunset", img: "/lighthouse.jpg", w: 42, color: "oklch(0.82 0.15 178)" },
  { label: "02_Pouring_Tea",       img: "/pouring_tea.jpg", w: 35, color: "oklch(0.72 0.10 200)" },
  { label: "03_Silhouette",        img: "/man.jpg",          w: 23, color: "oklch(0.60 0.07 185)" },
];

export function SceneEditing() {
  const playheadRef   = useRef<HTMLDivElement>(null);
  const timecodeRef   = useRef<HTMLSpanElement>(null);
  const voiceBarRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onCamera(e: Event) {
      const { cameraZ } = (e as CustomEvent<{ cameraZ: number }>).detail;
      const z = Math.abs(DEPTH.editing);
      const p = Math.max(0, Math.min(1, (cameraZ - (z - 1200)) / 2400));

      if (playheadRef.current)
        playheadRef.current.style.left = `${(3 + p * 90).toFixed(1)}%`;

      if (timecodeRef.current) {
        const f = Math.floor(p * 13 * 24);
        const s = Math.floor(f / 24), fr = f % 24;
        timecodeRef.current.textContent = `00:00:0${s}:${fr < 10 ? "0" + fr : fr}`;
      }

      if (voiceBarRef.current)
        voiceBarRef.current.style.width = `${(p * 100).toFixed(1)}%`;
    }
    window.addEventListener(CAMERA_EVENT, onCamera);
    return () => window.removeEventListener(CAMERA_EVENT, onCamera);
  }, []);

  return (
    <div
      className="scene absolute inset-0 flex items-center justify-center preserve-3d"
      style={{ transform: `translateZ(${DEPTH.editing}px)` }}
      data-z={DEPTH.editing}
    >
      {/* Fixed-pixel stage — same pattern as SceneProject/SceneContext */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{
          width: 1080,
          height: 700,
          marginLeft: -540,
          marginTop: -350,
          transform: "scale(0.38) translateZ(0px)",
        }}
      >
        {/* ── Scale wrapper for responsive sizing ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "scale(var(--scene-scale, 1))",
            transformOrigin: "center center",
          }}
        >
          {/* tiny label */}
          <div
            className="absolute left-0 right-0 text-center"
            style={{ top: -60, transform: "translateZ(160px)" }}
          >
            <p className="eyebrow text-accent tracking-[0.22em] mb-1">
              Timeline · Frame-Accurate NLE
            </p>
            <h2
              className="text-foreground font-light tracking-tight"
              style={{ fontSize: 46, letterSpacing: "-0.03em", lineHeight: 1.15 }}
            >
              Generated. Cut.{" "}
              <span className="serif-accent" style={{ color: "var(--color-accent)" }}>
                Done.
              </span>
            </h2>
          </div>

          {/* ══ MONITOR FRAME ══ */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 380,
              transform: "translateZ(200px) rotateX(4deg)",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
            }}
          >
            {/* Bg image */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/lighthouse.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Letterbox bars */}
            <div style={{ position: "absolute", inset: "0 0 auto 0", height: "11%", background: "#000" }} />
            <div style={{ position: "absolute", inset: "auto 0 0 0", height: "11%", background: "#000" }} />
            {/* 9:16 safe zone */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "34.5%",
                width: "31%",
                borderLeft: "2px dashed rgba(131,208,190,0.7)",
                borderRight: "2px dashed rgba(131,208,190,0.7)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: 14,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "oklch(0.82 0.15 178)",
                  background: "rgba(0,0,0,0.65)",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                9:16 · Reel
              </span>
            </div>
            {/* Top HUD */}
            <div
              style={{
                position: "absolute",
                top: "12%",
                left: 16,
                right: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(0,0,0,0.65)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 8,
                  padding: "5px 12px",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#ef4444",
                    display: "inline-block",
                    animation: "pulse 2s infinite",
                  }}
                />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.9)" }}>
                  4K · ProRes
                </span>
              </div>
              <span
                ref={timecodeRef}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "oklch(0.82 0.15 178)",
                  background: "rgba(0,0,0,0.75)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 8,
                  padding: "5px 14px",
                }}
              >
                00:00:00:00
              </span>
            </div>
            {/* Bottom HUD */}
            <div
              style={{
                position: "absolute",
                bottom: "12%",
                left: 16,
                right: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(0,0,0,0.65)",
                  borderRadius: 8,
                  padding: "4px 12px",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "oklch(0.82 0.15 178)",
                    display: "inline-block",
                  }}
                />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.8)" }}>
                  01_Lighthouse_Sunset · Playing
                </span>
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.65)",
                  borderRadius: 8,
                  padding: "4px 12px",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                  Subject isolated · SAM2
                </span>
              </div>
            </div>
          </div>

          {/* ══ MULTI-TRACK TIMELINE ══ */}
          <div
            style={{
              position: "absolute",
              top: 390,
              left: 0,
              right: 0,
              height: 240,
              transform: "translateZ(120px) rotateX(18deg) rotateZ(-1deg)",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "color-mix(in oklab, oklch(0.19 0.008 200) 50%, transparent)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              // NO overflow:hidden — it would clip the 3D-rotated child
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "oklch(0.82 0.15 178)",
                  }}
                >
                  VICHITH TIMELINE
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.22)" }}>
                  MAGNETIC SNAP · RIPPLE DELETE
                </span>
              </div>
              <div style={{ display: "flex", gap: 24, fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.22)" }}>
                {["0:00", "0:04", "0:08", "0:12"].map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>

            {/* Tracks */}
            <div style={{ position: "relative", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>

              {/* Live playhead */}
              <div
                ref={playheadRef}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "3%",
                  width: 1,
                  background: "oklch(0.82 0.15 178)",
                  boxShadow: "0 0 10px 2px oklch(0.82 0.15 178)",
                  zIndex: 30,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "oklch(0.82 0.15 178)",
                    position: "absolute",
                    top: -4,
                    left: -4.5,
                  }}
                />
              </div>

              {/* V2 — mask */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 26 }}>
                <span style={{ width: 28, fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.3)", textAlign: "right", flexShrink: 0 }}>V2</span>
                <div style={{ flex: 1, height: "100%", background: "rgba(255,255,255,0.04)", borderRadius: 5, border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(131,208,190,0.12)", border: "1px solid rgba(131,208,190,0.3)", borderRadius: 4, padding: "3px 10px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(0.82 0.15 178 / 70%)", display: "inline-block" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "oklch(0.82 0.15 178)" }}>Subject Isolation · SAM2 Alpha</span>
                  </div>
                </div>
              </div>

              {/* V1 — video clips */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 40 }}>
                <span style={{ width: 28, fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.6)", textAlign: "right", flexShrink: 0, fontWeight: 700 }}>V1</span>
                <div style={{ flex: 1, height: "100%", background: "rgba(255,255,255,0.04)", borderRadius: 5, border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: 4, gap: 2 }}>
                  {CLIPS.map((clip, i) => (
                    <div
                      key={i}
                      style={{
                        flex: clip.w,
                        height: "100%",
                        borderRadius: 4,
                        background: `color-mix(in oklab, ${clip.color} 22%, transparent)`,
                        borderLeft: `2.5px solid ${clip.color}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "0 8px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 24,
                          borderRadius: 3,
                          background: `url('${clip.img}') center/cover`,
                          flexShrink: 0,
                          opacity: 0.8,
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                      />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", overflow: "hidden" }}>{clip.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* A1 — voice */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 30 }}>
                <span style={{ width: 28, fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.3)", textAlign: "right", flexShrink: 0 }}>A1</span>
                <div style={{ flex: 1, height: "100%", background: "rgba(255,255,255,0.04)", borderRadius: 5, border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 10px", gap: 10, position: "relative", overflow: "hidden" }}>
                  {/* Waveform */}
                  <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, height: 18 }}>
                    {WAVEFORM_VOICE.map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: "rgba(255,255,255,0.28)", borderRadius: 2 }} />
                    ))}
                  </div>
                  {/* Silence badge */}
                  <div style={{ flexShrink: 0, background: "rgba(131,208,190,0.12)", border: "1px solid rgba(131,208,190,0.3)", borderRadius: 4, padding: "2px 8px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "oklch(0.82 0.15 178)" }}>−1.2s dead air removed</span>
                  </div>
                  {/* Playback progress tint */}
                  <div ref={voiceBarRef} style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: "rgba(131,208,190,0.08)", width: 0, pointerEvents: "none" }} />
                </div>
              </div>

              {/* A2 — music */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 26 }}>
                <span style={{ width: 28, fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.3)", textAlign: "right", flexShrink: 0 }}>A2</span>
                <div style={{ flex: 1, height: "100%", background: "rgba(255,255,255,0.04)", borderRadius: 5, border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 10px", position: "relative", overflow: "hidden" }}>
                  {/* Music waveform */}
                  <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, height: 14, opacity: 0.35 }}>
                    {WAVEFORM_MUSIC.map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: "white", borderRadius: 2 }} />
                    ))}
                  </div>
                  {/* Beat pins */}
                  {BEAT_POS.map((pos, i) => (
                    <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${pos * 100}%`, width: 1, background: "rgba(131,208,190,0.5)", pointerEvents: "none" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(0.82 0.15 178)", position: "absolute", top: -1, marginLeft: -2.5 }} />
                    </div>
                  ))}
                  <span style={{ position: "absolute", right: 10, fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.25)" }}>Auto-Ducked −14dB</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Responsive scale via CSS custom property */}
      <style>{`
        @media (max-width: 480px)  { .scene[data-z="${DEPTH.editing}"] > div { transform: scale(0.32) translateZ(0) !important; } }
        @media (min-width: 481px) and (max-width: 767px)  { .scene[data-z="${DEPTH.editing}"] > div { transform: scale(0.50) translateZ(0) !important; } }
        @media (min-width: 768px) and (max-width: 1023px) { .scene[data-z="${DEPTH.editing}"] > div { transform: scale(0.72) translateZ(0) !important; } }
        @media (min-width: 1024px) { .scene[data-z="${DEPTH.editing}"] > div { transform: scale(0.92) translateZ(0) !important; } }
      `}</style>
    </div>
  );
}
