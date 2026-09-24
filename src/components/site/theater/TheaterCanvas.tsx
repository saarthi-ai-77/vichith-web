"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SECTION_IDS, THEATER_SCROLL_HEIGHT } from "@/lib/spatial";
import {
  IconFilm,
  IconAperture,
  IconWaveform,
  IconTypography,
  IconPlay,
  IconPause,
  IconLock,
  IconCheck,
  IconRefresh,
  IconScissors,
  IconUndo,
  IconTerminal,
  IconSliders,
  IconFrame169,
  IconFrame916,
} from "@/components/site/icons/CreativeIcons";

gsap.registerPlugin(ScrollTrigger);

const REQUEST_ACCESS_URL = "https://app.vichith.in/request-access";
const INVITE_CODE_URL = "https://app.vichith.in/invite";

export function TheaterCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageViewportRef = useRef<HTMLDivElement>(null);

  // Timecode live ticker
  const [timecode, setTimecode] = useState("00:00:00:00");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReelsMode, setIsReelsMode] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState(2);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Act container refs
  const act1TextRef = useRef<HTMLDivElement>(null);
  const act1StageRef = useRef<HTMLDivElement>(null);

  const act2TextRef = useRef<HTMLDivElement>(null);
  const act2StageRef = useRef<HTMLDivElement>(null);

  const act3TextRef = useRef<HTMLDivElement>(null);
  const act3StageRef = useRef<HTMLDivElement>(null);

  const act4TextRef = useRef<HTMLDivElement>(null);
  const act4StageRef = useRef<HTMLDivElement>(null);

  const act5TextRef = useRef<HTMLDivElement>(null);
  const act5StageRef = useRef<HTMLDivElement>(null);

  const act6TextRef = useRef<HTMLDivElement>(null);
  const act6StageRef = useRef<HTMLDivElement>(null);

  // Running timecode interval
  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % 96;
      const sec = Math.floor(frame / 24);
      const fr = frame % 24;
      setTimecode(`00:00:0${sec}:${fr < 10 ? "0" + fr : fr}`);
    }, 41.67);
    return () => clearInterval(interval);
  }, []);

  // Word caption cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIdx((prev) => (prev + 1) % 5);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        // Reduced motion: show clean states without motion
        gsap.set([act1TextRef.current, act1StageRef.current], { opacity: 1, y: 0 });
        return;
      }

      // Initial positions for all text cues and stages:
      // Act 1 starts at center stage
      gsap.set([act1TextRef.current, act1StageRef.current], { opacity: 1, y: 0, scale: 1 });

      // Acts 2 through 6 start below or hidden, ready to flow up
      gsap.set([act2TextRef.current, act3TextRef.current, act4TextRef.current, act5TextRef.current, act6TextRef.current], {
        opacity: 0,
        y: 60,
        filter: "blur(0px)",
      });
      gsap.set([act2StageRef.current, act3StageRef.current, act4StageRef.current, act5StageRef.current, act6StageRef.current], {
        opacity: 0,
        scale: 0.92,
        y: 40,
      });

      // Master 3D Theater Scroll Timeline
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.0, // Ultra-smooth inertial scrub
          anticipatePin: 1,
        },
      });

      // ── ACT 1: ARRIVAL / THESIS (0 -> 18) ──
      // Act 1 text holds then flows up and fades out
      masterTl.to(
        act1TextRef.current,
        {
          y: -60,
          opacity: 0,
          filter: "blur(4px)",
          duration: 6,
          ease: "power2.in",
        },
        10
      );
      masterTl.to(
        act1StageRef.current,
        {
          opacity: 0,
          scale: 1.08,
          duration: 6,
          ease: "power2.in",
        },
        10
      );

      // ── ACT 2: GATHERING THE THREAD / CONTEXT (18 -> 36) ──
      // Text flows up from below into razor-sharp focus
      masterTl.fromTo(
        act2TextRef.current,
        { y: 60, opacity: 0, filter: "blur(0px)" },
        { y: 0, opacity: 1, duration: 6, ease: "power2.out" },
        18
      );
      // Stage cards glide in from 3D depth
      masterTl.fromTo(
        act2StageRef.current,
        { opacity: 0, scale: 0.9, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 6, ease: "power2.out" },
        18
      );

      // Act 2 holds from 24 -> 30 for reading
      // Act 2 flows up and fades out from 30 -> 36
      masterTl.to(
        act2TextRef.current,
        {
          y: -60,
          opacity: 0,
          filter: "blur(4px)",
          duration: 6,
          ease: "power2.in",
        },
        30
      );
      masterTl.to(
        act2StageRef.current,
        {
          opacity: 0,
          scale: 1.08,
          duration: 6,
          ease: "power2.in",
        },
        30
      );

      // ── ACT 3: CHITHRA ORCHESTRATION (36 -> 54) ──
      // Text flows up into focus
      masterTl.fromTo(
        act3TextRef.current,
        { y: 60, opacity: 0, filter: "blur(0px)" },
        { y: 0, opacity: 1, duration: 6, ease: "power2.out" },
        36
      );
      // 3D holographic core materializes
      masterTl.fromTo(
        act3StageRef.current,
        { opacity: 0, scale: 0.9, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 6, ease: "power2.out" },
        36
      );

      // Act 3 holds from 42 -> 48 for reading
      // Act 3 flows up and fades out from 48 -> 54
      masterTl.to(
        act3TextRef.current,
        {
          y: -60,
          opacity: 0,
          filter: "blur(4px)",
          duration: 6,
          ease: "power2.in",
        },
        48
      );
      masterTl.to(
        act3StageRef.current,
        {
          opacity: 0,
          scale: 1.08,
          duration: 6,
          ease: "power2.in",
        },
        48
      );

      // ── ACT 4: UNIFIED STUDIO & TIMELINE (54 -> 72) ──
      // Text flows up into focus
      masterTl.fromTo(
        act4TextRef.current,
        { y: 60, opacity: 0, filter: "blur(0px)" },
        { y: 0, opacity: 1, duration: 6, ease: "power2.out" },
        54
      );
      // Studio workstation tilts in
      masterTl.fromTo(
        act4StageRef.current,
        { opacity: 0, scale: 0.92, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 6, ease: "power2.out" },
        54
      );

      // Act 4 holds from 60 -> 66 for reading and inspecting timeline
      // Act 4 flows up and fades out from 66 -> 72
      masterTl.to(
        act4TextRef.current,
        {
          y: -60,
          opacity: 0,
          filter: "blur(4px)",
          duration: 6,
          ease: "power2.in",
        },
        66
      );
      masterTl.to(
        act4StageRef.current,
        {
          opacity: 0,
          scale: 1.08,
          duration: 6,
          ease: "power2.in",
        },
        66
      );

      // ── ACT 5: CREATOR CONTROL & ITERATION (72 -> 86) ──
      // Text flows up into focus
      masterTl.fromTo(
        act5TextRef.current,
        { y: 60, opacity: 0, filter: "blur(0px)" },
        { y: 0, opacity: 1, duration: 5, ease: "power2.out" },
        72
      );
      // Version history tree branches in
      masterTl.fromTo(
        act5StageRef.current,
        { opacity: 0, scale: 0.92, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 5, ease: "power2.out" },
        72
      );

      // Act 5 holds from 77 -> 81
      // Act 5 flows up and fades out from 81 -> 86
      masterTl.to(
        act5TextRef.current,
        {
          y: -60,
          opacity: 0,
          filter: "blur(4px)",
          duration: 5,
          ease: "power2.in",
        },
        81
      );
      masterTl.to(
        act5StageRef.current,
        {
          opacity: 0,
          scale: 1.08,
          duration: 5,
          ease: "power2.in",
        },
        81
      );

      // ── ACT 6: GRAND THEATER FINALE & CTA (86 -> 100) ──
      // Finale text flows up monumentally
      masterTl.fromTo(
        act6TextRef.current,
        { y: 70, opacity: 0, filter: "blur(0px)" },
        { y: 0, opacity: 1, duration: 6, ease: "power2.out" },
        86
      );
      // Finale access portal materializes
      masterTl.fromTo(
        act6StageRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 6, ease: "power2.out" },
        86
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#060608] text-foreground overflow-x-clip"
      style={{ height: THEATER_SCROLL_HEIGHT }}
    >
      {/* ── STICKY THEATER STAGE PROSCENIUM ── */}
      <div
        ref={stageViewportRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#070709] preserve-3d perspective-1000 select-none"
      >
        {/* Ambient Stage Lighting */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          {/* Volumetric Cyan Stage Spotlight */}
          <div className="w-[950px] h-[550px] rounded-full bg-accent/[0.045] blur-[180px] mix-blend-screen" />
          <div className="w-[600px] h-[400px] rounded-full bg-surface-2/20 blur-[140px]" />
        </div>

        {/* Ambient noise grain overlay */}
        <div className="noise-overlay" aria-hidden="true" />

        {/* Perspective Stage Grid Floor (Extends deeply into theater space) */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-[60vh] opacity-25 grid-field"
          style={{
            transform: "rotateX(75deg) translateY(220px)",
            transformOrigin: "bottom center",
          }}
        />

        {/* ========================================================================= */}
        {/* ACT 1: THE ARRIVAL & CORE THESIS */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.arrival}
          className="absolute inset-0 flex flex-col items-center justify-between py-20 px-6 pointer-events-none z-10"
        >
          {/* Act 1 Text Cue (Flows up, holds, fades out up) */}
          <div
            ref={act1TextRef}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto my-auto pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-accent font-semibold">
                An AI-Native Creative Studio
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight md:tracking-[-0.035em] leading-[1.01] text-white">
              AI DOES THE WORK. <br />
              <span className="text-white">YOU KEEP THE CRAFT.</span>
            </h1>

            <p className="mt-6 sm:mt-8 font-sans text-base sm:text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-xl text-balance">
              Where your ideas become finished video. <br className="hidden sm:inline" />
              Chithra plans and generates. You shape the cut.
            </p>

            <div className="mt-8 sm:mt-10 flex items-center gap-4">
              <a
                href={REQUEST_ACCESS_URL}
                className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:bg-accent hover:text-black active:scale-[0.97] shadow-xl shadow-black/60 flex items-center gap-2 group"
              >
                <span>Request Early Access</span>
                <span className="text-xs transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>

          {/* Act 1 3D Stage Elements: Live Playhead + Flanking 3D Cards */}
          <div ref={act1StageRef} className="w-full max-w-4xl relative pointer-events-auto">
            {/* Playhead bar */}
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full max-w-md h-px bg-white/[0.1] relative">
                <div className="absolute -top-3.5 left-1/3 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-accent drop-shadow-[0_0_8px_rgba(54,226,206,0.8)] border border-black" />
                  <span className="mt-2 font-mono text-[10px] text-white/40 tracking-wider">
                    {timecode}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle scroll cue */}
            <div className="mt-8 flex flex-col items-center gap-1.5 opacity-40">
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/50">
                SCROLL TO EXPLORE THE STAGE
              </span>
              <div className="w-px h-5 bg-gradient-to-b from-white/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACT 2: GATHERING THE THREAD (CONTEXT & STORYBOARDS) */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.context}
          className="absolute inset-0 flex flex-col items-center justify-between py-20 px-6 pointer-events-none z-10"
        >
          {/* Act 2 Text Cue */}
          <div
            ref={act2TextRef}
            className="text-center max-w-3xl mx-auto pt-6 pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                02 / Gathering the Thread
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Context isn&apos;t lost.
            </h2>

            <p className="mt-3 text-sm sm:text-base md:text-lg text-white/55 font-normal max-w-lg mx-auto leading-relaxed text-balance">
              Characters, visual references, and narrative beats wrap around your vision — holding every detail in place across shots.
            </p>
          </div>

          {/* Act 2 3D Curved Stage Amphitheater */}
          <div
            ref={act2StageRef}
            className="w-full max-w-5xl h-[380px] sm:h-[420px] relative preserve-3d flex items-center justify-center my-auto pointer-events-auto"
          >
            {/* Card 1: Character Reference (Left foreground) */}
            <div
              className="absolute left-[4%] sm:left-[8%] w-52 sm:w-60 glass-panel p-3.5 shadow-float transition-all duration-300 hover:scale-105"
              style={{ transform: "rotateY(16deg) rotateX(-5deg) translateZ(60px)" }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-2">
                <span>CHARACTER REF 01</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </div>
              <div
                className="w-full h-44 rounded-lg overflow-hidden relative mb-2"
                style={{
                  backgroundImage: "url('/man.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 left-2 font-mono text-[9px] text-white/90 bg-black/60 px-1.5 py-0.5 rounded">
                  Protagonist · Consistent Face
                </span>
              </div>
              <div className="text-[11px] font-mono text-white/60">Hold wardrobe & lighting across cuts</div>
            </div>

            {/* Card 2: Storyboard Sequence (Center-Right) */}
            <div
              className="absolute right-[4%] sm:right-[10%] w-64 sm:w-72 glass-panel p-3.5 shadow-float transition-all duration-300 hover:scale-105"
              style={{ transform: "rotateY(-18deg) rotateZ(3deg) translateZ(40px)" }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-2">
                <span>STORYBOARD BEATS</span>
                <span className="text-accent font-mono text-[9px]">3 Shots Linked</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-28 rounded-lg overflow-hidden mb-2">
                <div
                  className="rounded bg-cover bg-center border border-white/10"
                  style={{ backgroundImage: "url('/pouring_tea.jpg')" }}
                />
                <div
                  className="rounded bg-cover bg-center border border-white/10"
                  style={{ backgroundImage: "url('/split_pour.jpg')" }}
                />
                <div
                  className="rounded bg-cover bg-center border border-white/10"
                  style={{ backgroundImage: "url('/shot.jpg')" }}
                />
              </div>
              <div className="text-[11px] font-mono text-white/60">Sequence pacing: 24fps master</div>
            </div>

            {/* Card 3: Style Target Prompt Tag (Floating top center) */}
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl glass-panel shadow-float text-center max-w-xs"
              style={{ transform: "translateZ(80px)" }}
            >
              <span className="font-mono text-[9px] text-accent uppercase tracking-wider block mb-0.5">
                Style Directive
              </span>
              <span className="font-sans text-xs text-white/90 font-medium">
                &ldquo;Cinematic 35mm, warm sunset flare, natural contrast&rdquo;
              </span>
            </div>
          </div>

          <div className="h-4" />
        </div>

        {/* ========================================================================= */}
        {/* ACT 3: CHITHRA (THE CREATIVE ORCHESTRATOR) */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.chithra}
          className="absolute inset-0 flex flex-col items-center justify-between py-20 px-6 pointer-events-none z-10"
        >
          {/* Act 3 Text Cue */}
          <div
            ref={act3TextRef}
            className="text-center max-w-3xl mx-auto pt-6 pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                03 / Creative Intelligence
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Meet Chithra.
            </h2>

            <p className="mt-3 text-sm sm:text-base md:text-lg text-white/55 font-normal max-w-lg mx-auto leading-relaxed text-balance">
              Not a chatbot. An orchestrator. Translates creative intent into timeline structure, asset routing, and precise edit handles.
            </p>
          </div>

          {/* Act 3 3D Holographic Orchestrator Console */}
          <div
            ref={act3StageRef}
            className="w-full max-w-4xl rounded-2xl border border-white/[0.08] bg-[#0c0c10]/90 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] p-5 sm:p-7 overflow-hidden my-auto pointer-events-auto"
          >
            {/* Top Directive Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-white/70">
                  <IconTerminal size={15} />
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 block">
                    Directorial Directive
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-white font-medium">
                    &ldquo;Turn this footage into a 45-second launch cut with dynamic pacing.&rdquo;
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-white/60 bg-white/[0.03] border border-white/[0.08] px-3 py-1 rounded-full self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.8)] animate-pulse" />
                <span>Orchestrating</span>
              </div>
            </div>

            {/* Central Tri-axial Kinetic Core & Execution Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6">
              {/* Left: Tri-axial Kinetic Rings */}
              <div className="md:col-span-5 flex flex-col items-center justify-center relative h-48 preserve-3d">
                <div className="w-36 h-36 relative flex items-center justify-center preserve-3d">
                  <div
                    className="absolute inset-0 border border-accent/40 rounded-full animate-[spin_5s_linear_infinite]"
                    style={{ transform: "rotateX(70deg)" }}
                  />
                  <div
                    className="absolute inset-0 border border-accent/40 rounded-full animate-[spin_7s_linear_infinite_reverse]"
                    style={{ transform: "rotateY(70deg)" }}
                  />
                  <div
                    className="absolute inset-0 border border-white/20 rounded-full animate-[spin_6s_linear_infinite]"
                    style={{ transform: "rotateZ(45deg) rotateX(45deg)" }}
                  />
                  <div className="relative z-10 text-center bg-black/80 px-3 py-1.5 rounded border border-accent/30 font-mono text-[10px] text-accent font-semibold tracking-wider">
                    CHITHRA CORE
                  </div>
                </div>
                <span className="font-mono text-[10px] text-white/40 mt-2">Active AST Scene Model</span>
              </div>

              {/* Right: 4-Step Synchronized Execution Stream */}
              <div className="md:col-span-7 space-y-2 font-mono text-xs">
                {[
                  { step: "01", name: "Intent Deconstruction", spec: "Pacing envelope: Kinetic hook → Breath → Climax", status: "Resolved" },
                  { step: "02", name: "Model Routing", spec: "Routed: Seedream 4.5 · 4K 60fps bridge frames", status: "Active" },
                  { step: "03", name: "Audio Stem Separation", spec: "Vocals isolated · Music ducked -14LUFS", status: "Synchronized" },
                  { step: "04", name: "Multi-Track Assembly", spec: "14 splits locked to Track V1 & C1 RSVP", status: "Staged" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-white/30">{item.step}</span>
                      <div>
                        <div className="text-[11px] text-white font-medium">{item.name}</div>
                        <div className="text-[9px] text-white/40">{item.spec}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>Creator override: 100% Unlocked</span>
              <span>Zero hallucinated edits · AST Verified</span>
            </div>
          </div>

          <div className="h-4" />
        </div>

        {/* ========================================================================= */}
        {/* ACT 4: UNIFIED STUDIO & TIMELINE (CREATE & EDIT) */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.studio}
          className="absolute inset-0 flex flex-col items-center justify-between py-20 px-6 pointer-events-none z-10"
        >
          {/* Act 4 Text Cue */}
          <div
            ref={act4TextRef}
            className="text-center max-w-3xl mx-auto pt-6 pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                04 / Unified Studio
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Create freely. Control deeply.
            </h2>

            <p className="mt-3 text-sm sm:text-base md:text-lg text-white/55 font-normal max-w-lg mx-auto leading-relaxed text-balance">
              From the first spark to the final cut, your project lives in one unified workspace. No export roundtrips.
            </p>
          </div>

          {/* Act 4 3D Perspective Studio Workstation */}
          <div
            ref={act4StageRef}
            className="w-full max-w-5xl rounded-2xl border border-white/[0.1] bg-[#0c0c10]/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden my-auto pointer-events-auto"
          >
            {/* Window Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-black/50 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="text-[11px] text-white/70 ml-2">PROJECT / DESERT_DAWN_REELS.VCH</span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <button
                  onClick={() => setIsReelsMode(!isReelsMode)}
                  className="px-2.5 py-0.5 rounded border border-white/[0.1] hover:border-accent text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {isReelsMode ? <IconFrame916 size={11} /> : <IconFrame169 size={11} />}
                  <span>{isReelsMode ? "9:16 Vertical Safe" : "16:9 Cinema Safe"}</span>
                </button>
                <span className="text-accent flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Live Synced
                </span>
              </div>
            </div>

            {/* Video Viewport + Timeline Body */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#09090c]">
              {/* Preview Monitor */}
              <div className="md:col-span-7">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl">
                  <video
                    ref={videoRef}
                    src="/Cinematic.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/shot.jpg"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-full object-cover"
                  />

                  {/* Monitor HUD */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono text-white/80 border border-white/[0.08] flex items-center gap-1.5 z-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span>REC · 24fps · ProRes 422 HQ</span>
                  </div>

                  {/* 9:16 Crop Frame Overlay */}
                  {isReelsMode && (
                    <>
                      <div className="pointer-events-none absolute inset-0 bg-black/70 backdrop-blur-[1px] z-10" />
                      <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 aspect-[9/16] border-x-2 border-accent/70 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-20 flex flex-col justify-between p-2">
                        <span className="self-center px-2 py-0.5 rounded bg-accent/90 text-black text-[8px] font-mono font-bold">
                          9:16 Safe Frame
                        </span>
                      </div>
                    </>
                  )}

                  {/* Word-by-word RSVP Caption Overlay */}
                  <div className="absolute bottom-6 inset-x-0 flex justify-center z-30 pointer-events-none">
                    <div className="px-3 py-1 rounded bg-black/85 backdrop-blur-md text-xs sm:text-sm font-bold text-white tracking-wide uppercase shadow-lg border border-white/15 flex gap-1.5">
                      {["THE", "CREATOR", "KEEPS", "THE", "CRAFT"].map((word, idx) => (
                        <span
                          key={idx}
                          className={idx === activeWordIdx ? "text-accent drop-shadow-[0_0_8px_rgba(54,226,206,0.8)]" : "text-white/60"}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Transport Bar */}
                  <div className="absolute bottom-2 inset-x-2 h-7 px-2.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/[0.08] flex items-center justify-between z-30 text-xs font-mono">
                    <button
                      onClick={togglePlay}
                      className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
                    >
                      {isPlaying ? <IconPause size={10} /> : <IconPlay size={10} />}
                      <span className="text-white/50 text-[10px]">{timecode}</span>
                    </button>
                    <span className="text-[9px] text-white/40">3840×2160 · Master Cut</span>
                  </div>
                </div>
              </div>

              {/* Multi-track Timeline Workbench */}
              <div className="md:col-span-5 space-y-1.5 font-mono text-[9px]">
                <div className="flex items-center justify-between text-white/40 pb-1 border-b border-white/[0.06]">
                  <span>TIMELINE WORKBENCH</span>
                  <span className="text-accent">4 Tracks Active</span>
                </div>

                {/* Track V2 - Overlays */}
                <div className="h-6 rounded bg-white/[0.02] border border-white/[0.05] flex items-center px-2 gap-2">
                  <span className="text-white/40 w-5 flex items-center gap-1">
                    <IconAperture size={9} />
                    <span>V2</span>
                  </span>
                  <div className="h-4 bg-accent/[0.12] border border-accent/[0.25] rounded px-2 flex items-center text-accent text-[8px] truncate">
                    sunrise_flare.mp4 [synced]
                  </div>
                </div>

                {/* Track V1 - Master Cuts */}
                <div className="h-6 rounded bg-white/[0.02] border border-white/[0.05] flex items-center px-2 gap-2">
                  <span className="text-white/40 w-5 flex items-center gap-1">
                    <IconFilm size={9} />
                    <span>V1</span>
                  </span>
                  <div className="flex-1 flex gap-1 h-4">
                    <div className="bg-white/[0.08] border border-white/[0.12] rounded flex-1 flex items-center px-1 text-[8px] text-white/70">
                      master_partA
                    </div>
                    <div className="bg-white/[0.16] border border-white/[0.25] rounded w-20 flex items-center px-1 text-[8px] text-white font-semibold">
                      anchor_cut
                    </div>
                    <div className="bg-white/[0.08] border border-white/[0.12] rounded flex-1 flex items-center px-1 text-[8px] text-white/70">
                      master_partB
                    </div>
                  </div>
                </div>

                {/* Track C1 - Styled Captions */}
                <div className="h-6 rounded bg-white/[0.02] border border-white/[0.05] flex items-center px-2 gap-2">
                  <span className="text-white/40 w-5 flex items-center gap-1">
                    <IconTypography size={9} />
                    <span>C1</span>
                  </span>
                  <div className="flex gap-1">
                    {["THE", "CREATOR", "KEEPS", "THE", "CRAFT"].map((w, idx) => (
                      <span
                        key={idx}
                        className={`px-1 rounded text-[8px] border ${
                          idx === activeWordIdx ? "bg-accent/20 border-accent/40 text-accent font-bold" : "bg-white/[0.05] border-white/[0.08] text-white/60"
                        }`}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Track A1 - Master Audio */}
                <div className="h-6 rounded bg-white/[0.02] border border-white/[0.05] flex items-center px-2 gap-2">
                  <span className="text-white/40 w-5 flex items-center gap-1">
                    <IconWaveform size={9} />
                    <span>A1</span>
                  </span>
                  <div className="flex-1 flex items-center justify-between text-white/70 text-[8px] px-1">
                    <span>master_mix.wav</span>
                    <span className="text-accent/80">Ducked (-14LUFS)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-white/[0.06] bg-black/40 flex items-center justify-between font-mono text-[10px] text-white/40">
              <span className="flex items-center gap-2">
                <IconCheck size={11} className="text-accent" />
                <span>Zero Latency Local Cache</span>
              </span>
              <span>Export ready in ProRes & H.264</span>
            </div>
          </div>

          <div className="h-4" />
        </div>

        {/* ========================================================================= */}
        {/* ACT 5: CREATOR CONTROL & ITERATION */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.control}
          className="absolute inset-0 flex flex-col items-center justify-between py-20 px-6 pointer-events-none z-10"
        >
          {/* Act 5 Text Cue */}
          <div
            ref={act5TextRef}
            className="text-center max-w-3xl mx-auto pt-6 pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                05 / Non-Destructive Craft
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              One canvas. Infinite refinement.
            </h2>

            <p className="mt-3 text-sm sm:text-base md:text-lg text-white/55 font-normal max-w-lg mx-auto leading-relaxed text-balance">
              Every decision Chithra makes is a handle you can grab. Direct with natural language or adjust timeline split points manually.
            </p>
          </div>

          {/* Act 5 3D Version History Comparison Tree */}
          <div
            ref={act5StageRef}
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-3.5 my-auto pointer-events-auto"
          >
            {/* Version 1 */}
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0c10]/90 backdrop-blur-md flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-2">
                  <span>TURN 01</span>
                  <span>Baseline</span>
                </div>
                <div
                  className="w-full h-32 rounded-lg bg-cover bg-center mb-3 border border-white/[0.08]"
                  style={{ backgroundImage: "url('/shot.jpg')" }}
                />
                <div className="text-xs font-semibold text-white mb-1">Candidate A · Standard Wide</div>
                <p className="text-[11px] text-white/50 font-mono">Original desert landscape framing</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-white/40">
                Prompt: &ldquo;Establish scene&rdquo;
              </div>
            </div>

            {/* Version 2 (Highlighted) */}
            <div className="p-4 rounded-xl border border-accent/40 bg-[#0c0c10]/90 backdrop-blur-md flex flex-col justify-between shadow-xl shadow-accent/[0.05]">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-accent mb-2">
                  <span>TURN 02</span>
                  <span className="font-bold">Active in Timeline</span>
                </div>
                <div
                  className="w-full h-32 rounded-lg bg-cover bg-center mb-3 border border-accent/30 relative overflow-hidden"
                  style={{
                    backgroundImage: "url('/lighthouse.jpg')",
                    filter: "contrast(1.1) brightness(1.05)",
                  }}
                >
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-accent">
                    Match Flare Locked
                  </span>
                </div>
                <div className="text-xs font-semibold text-white mb-1">Candidate B · Match Flare</div>
                <p className="text-[11px] text-white/50 font-mono">Camera lowered, 110BPM flare synced</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-accent/80">
                Instruction: &ldquo;Make this tighter&rdquo;
              </div>
            </div>

            {/* Version 3 */}
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0c10]/90 backdrop-blur-md flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-2">
                  <span>TURN 03</span>
                  <span>Alternate Pass</span>
                </div>
                <div
                  className="w-full h-32 rounded-lg bg-cover bg-center mb-3 border border-white/[0.08]"
                  style={{
                    backgroundImage: "url('/vintage.jpg')",
                    filter: "sepia(0.2) saturate(1.2)",
                  }}
                />
                <div className="text-xs font-semibold text-white mb-1">Candidate C · 3200K Golden Warmth</div>
                <p className="text-[11px] text-white/50 font-mono">Analog film grade color pass</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-white/40">
                Instruction: &ldquo;Make it warmer&rdquo;
              </div>
            </div>
          </div>

          <div className="h-4" />
        </div>

        {/* ========================================================================= */}
        {/* ACT 6: THE GRAND THEATER FINALE / CLOSING CALL */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.closing}
          className="absolute inset-0 flex flex-col items-center justify-between py-16 px-6 pointer-events-none z-10"
        >
          {/* Act 6 Finale Text Cue */}
          <div
            ref={act6TextRef}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto my-auto pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-white/50 font-semibold">
                Rolling Cohorts · Early Access
              </span>
            </div>

            <h2 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-[0.98]">
              Make what you <br />
              <span className="text-white">imagined.</span>
            </h2>

            <p className="mt-6 sm:mt-8 font-sans text-base sm:text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-lg mx-auto text-balance">
              Vichith connects prompt intelligence and professional editing into one continuous project.
            </p>

            {/* Conversion Actions */}
            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a
                href={REQUEST_ACCESS_URL}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-white text-black font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:bg-accent hover:text-black active:scale-[0.97] shadow-2xl shadow-black/80 flex items-center justify-center gap-2 group"
              >
                <span>Request Early Access</span>
                <span className="text-xs transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>

              <a
                href={INVITE_CODE_URL}
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/[0.12] bg-white/[0.02] text-white/80 hover:text-white font-medium text-xs sm:text-sm transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.25] active:scale-[0.97]"
              >
                Enter Invite Code
              </a>
            </div>

            <div className="mt-8 font-mono text-[11px] text-white/35 flex items-center gap-2">
              <IconLock size={12} className="text-white/40" />
              <span>Direct communication with the builders · No credit card required</span>
            </div>
          </div>

          {/* Act 6 Stage Minimal Integrated Footer */}
          <div
            ref={act6StageRef}
            className="w-full max-w-[1240px] pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/40 pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <span className="font-display font-extrabold text-white text-xs tracking-tight">VICHITH</span>
              <span>© {new Date().getFullYear()} Vichith Inc. Built in public.</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://x.com/vichith_ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                X / Twitter
              </a>
              <a href="https://discord.gg/679D4UsTS" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Discord
              </a>
              <a href="https://www.instagram.com/vichith.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Instagram
              </a>
              <a href="/report" className="hover:text-white transition-colors">
                Report Issue
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
