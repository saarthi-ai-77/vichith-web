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
  IconTerminal,
  IconSliders,
  IconFrame169,
  IconFrame916,
  IconPlayhead,
} from "@/components/site/icons/CreativeIcons";

gsap.registerPlugin(ScrollTrigger);

const REQUEST_ACCESS_URL = "https://app.vichith.in/request-access";
const INVITE_CODE_URL = "https://app.vichith.in/invite";

export function TheaterCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageViewportRef = useRef<HTMLDivElement>(null);

  // Dynamic state
  const [timecode, setTimecode] = useState("00:00:14:18");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReelsMode, setIsReelsMode] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState(2);
  const [kineticPreset, setKineticPreset] = useState<"pop" | "wave" | "jitter" | "neon">("pop");
  const videoRef = useRef<HTMLVideoElement>(null);

  // 7 Act Text & Stage Refs
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

  const act7TextRef = useRef<HTMLDivElement>(null);
  const act7StageRef = useRef<HTMLDivElement>(null);

  // Timecode live ticker
  useEffect(() => {
    let frame = 14 * 24 + 18;
    const interval = setInterval(() => {
      frame = (frame + 1) % (45 * 24);
      const sec = Math.floor(frame / 24);
      const fr = frame % 24;
      const secStr = sec < 10 ? "0" + sec : String(sec);
      const frStr = fr < 10 ? "0" + fr : String(fr);
      setTimecode(`00:00:${secStr}:${frStr}`);
    }, 41.67);
    return () => clearInterval(interval);
  }, []);

  // Word caption sync loop
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIdx((prev) => (prev + 1) % 5);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Kinetic preset cycler
  useEffect(() => {
    const presets: ("pop" | "wave" | "jitter" | "neon")[] = ["pop", "wave", "jitter", "neon"];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % presets.length;
      setKineticPreset(presets[idx]);
    }, 2200);
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
        gsap.set([act1TextRef.current, act1StageRef.current], { opacity: 1, y: 0 });
        return;
      }

      // Initial state: Act 1 is visible on stage
      gsap.set([act1TextRef.current, act1StageRef.current], { opacity: 1, y: 0, scale: 1 });

      // Acts 2 through 7 wait below in depth, ready to flow up
      const waitingTexts = [
        act2TextRef.current,
        act3TextRef.current,
        act4TextRef.current,
        act5TextRef.current,
        act6TextRef.current,
        act7TextRef.current,
      ];
      const waitingStages = [
        act2StageRef.current,
        act3StageRef.current,
        act4StageRef.current,
        act5StageRef.current,
        act6StageRef.current,
        act7StageRef.current,
      ];

      gsap.set(waitingTexts, {
        opacity: 0,
        y: 110,
        rotateX: 18,
        filter: "blur(2px)",
        transformOrigin: "center bottom",
      });

      gsap.set(waitingStages, {
        opacity: 0,
        scale: 0.88,
        y: 60,
        rotateX: 12,
        transformOrigin: "center center",
      });

      // Master 3D Theater Scroll Timeline
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // ── Helper for Act transitions (Theatrical Flow Up & Fade Out Upward) ──
      // Total duration = 120 units across 7 acts

      // ACT 1: OVERTURE (0 -> 16)
      masterTl.to(
        act1TextRef.current,
        {
          y: -100,
          rotateX: -18,
          opacity: 0,
          filter: "blur(6px)",
          duration: 5,
          ease: "power2.in",
        },
        9
      );
      masterTl.to(
        act1StageRef.current,
        {
          opacity: 0,
          scale: 1.15,
          y: -40,
          duration: 5,
          ease: "power2.in",
        },
        9
      );

      // ACT 2: RAW INTENT TO PLAN (16 -> 32)
      // Flows up into prime theater view
      masterTl.fromTo(
        act2TextRef.current,
        { y: 110, rotateX: 18, opacity: 0, filter: "blur(2px)" },
        { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)", duration: 5, ease: "power2.out" },
        16
      );
      masterTl.fromTo(
        act2StageRef.current,
        { y: 60, scale: 0.88, rotateX: 12, opacity: 0 },
        { y: 0, scale: 1, rotateX: 0, opacity: 1, duration: 5, ease: "power2.out" },
        16
      );
      // Holds 21 -> 27
      // Fades out upward
      masterTl.to(
        act2TextRef.current,
        { y: -100, rotateX: -18, opacity: 0, filter: "blur(6px)", duration: 5, ease: "power2.in" },
        27
      );
      masterTl.to(
        act2StageRef.current,
        { y: -40, scale: 1.15, opacity: 0, duration: 5, ease: "power2.in" },
        27
      );

      // ACT 3: CHITHRA ORCHESTRATION (32 -> 48)
      // Flows up
      masterTl.fromTo(
        act3TextRef.current,
        { y: 110, rotateX: 18, opacity: 0, filter: "blur(2px)" },
        { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)", duration: 5, ease: "power2.out" },
        32
      );
      masterTl.fromTo(
        act3StageRef.current,
        { y: 60, scale: 0.88, rotateX: 12, opacity: 0 },
        { y: 0, scale: 1, rotateX: 0, opacity: 1, duration: 5, ease: "power2.out" },
        32
      );
      // Holds 37 -> 43
      // Fades out upward
      masterTl.to(
        act3TextRef.current,
        { y: -100, rotateX: -18, opacity: 0, filter: "blur(6px)", duration: 5, ease: "power2.in" },
        43
      );
      masterTl.to(
        act3StageRef.current,
        { y: -40, scale: 1.15, opacity: 0, duration: 5, ease: "power2.in" },
        43
      );

      // ACT 4: EDITING & MULTI-TRACK NLE (48 -> 66)
      // Flows up
      masterTl.fromTo(
        act4TextRef.current,
        { y: 110, rotateX: 18, opacity: 0, filter: "blur(2px)" },
        { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)", duration: 5, ease: "power2.out" },
        48
      );
      masterTl.fromTo(
        act4StageRef.current,
        { y: 60, scale: 0.88, rotateX: 12, opacity: 0 },
        { y: 0, scale: 1, rotateX: 0, opacity: 1, duration: 5, ease: "power2.out" },
        48
      );
      // Holds 53 -> 61
      // Fades out upward
      masterTl.to(
        act4TextRef.current,
        { y: -100, rotateX: -18, opacity: 0, filter: "blur(6px)", duration: 5, ease: "power2.in" },
        61
      );
      masterTl.to(
        act4StageRef.current,
        { y: -40, scale: 1.15, opacity: 0, duration: 5, ease: "power2.in" },
        61
      );

      // ACT 5: KINETIC MOTION & TYPOGRAPHY (66 -> 82)
      // Flows up
      masterTl.fromTo(
        act5TextRef.current,
        { y: 110, rotateX: 18, opacity: 0, filter: "blur(2px)" },
        { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)", duration: 5, ease: "power2.out" },
        66
      );
      masterTl.fromTo(
        act5StageRef.current,
        { y: 60, scale: 0.88, rotateX: 12, opacity: 0 },
        { y: 0, scale: 1, rotateX: 0, opacity: 1, duration: 5, ease: "power2.out" },
        66
      );
      // Holds 71 -> 77
      // Fades out upward
      masterTl.to(
        act5TextRef.current,
        { y: -100, rotateX: -18, opacity: 0, filter: "blur(6px)", duration: 5, ease: "power2.in" },
        77
      );
      masterTl.to(
        act5StageRef.current,
        { y: -40, scale: 1.15, opacity: 0, duration: 5, ease: "power2.in" },
        77
      );

      // ACT 6: ONE CREATIVE SYSTEM (82 -> 98)
      // Flows up
      masterTl.fromTo(
        act6TextRef.current,
        { y: 110, rotateX: 18, opacity: 0, filter: "blur(2px)" },
        { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)", duration: 5, ease: "power2.out" },
        82
      );
      masterTl.fromTo(
        act6StageRef.current,
        { y: 60, scale: 0.88, rotateX: 12, opacity: 0 },
        { y: 0, scale: 1, rotateX: 0, opacity: 1, duration: 5, ease: "power2.out" },
        82
      );
      // Holds 87 -> 93
      // Fades out upward
      masterTl.to(
        act6TextRef.current,
        { y: -100, rotateX: -18, opacity: 0, filter: "blur(6px)", duration: 5, ease: "power2.in" },
        93
      );
      masterTl.to(
        act6StageRef.current,
        { y: -40, scale: 1.15, opacity: 0, duration: 5, ease: "power2.in" },
        93
      );

      // ACT 7: THE RESULT & EARLY ACCESS (98 -> 116)
      // Flows up into final holding state
      masterTl.fromTo(
        act7TextRef.current,
        { y: 110, rotateX: 18, opacity: 0, filter: "blur(2px)" },
        { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)", duration: 5, ease: "power2.out" },
        98
      );
      masterTl.fromTo(
        act7StageRef.current,
        { y: 60, scale: 0.9, rotateX: 10, opacity: 0 },
        { y: 0, scale: 1, rotateX: 0, opacity: 1, duration: 5, ease: "power2.out" },
        98
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#050507] text-foreground overflow-x-clip"
      style={{ height: THEATER_SCROLL_HEIGHT }}
    >
      {/* ── STICKY 3D THEATER AUDITORIUM PROSCENIUM ── */}
      <div
        ref={stageViewportRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#060608] preserve-3d perspective-1000 select-none"
      >
        {/* Theatrical Overhead Beam & Stage Spotlights */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
          {/* Top Conical Volumetric Spotlight */}
          <div
            className="absolute -top-[30%] w-[1200px] h-[800px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(54,226,206,0.18) 0%, rgba(54,226,206,0.04) 45%, transparent 75%)",
            }}
          />
          {/* Ambient Theater Stage Wash */}
          <div className="w-[1000px] h-[600px] rounded-full bg-accent/[0.035] blur-[220px]" />
          <div className="w-[800px] h-[450px] rounded-full bg-indigo-900/[0.04] blur-[180px]" />
        </div>

        {/* Ambient Cinema Grain Filter */}
        <div className="noise-overlay" aria-hidden="true" />

        {/* Perspective Stage Grid Floor (Extends deeply into theater space) */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-[65vh] opacity-20 grid-field"
          style={{
            transform: "rotateX(78deg) translateY(240px)",
            transformOrigin: "bottom center",
          }}
        />

        {/* ========================================================================= */}
        {/* ACT 1: THE OVERTURE — WHERE IDEAS BECOME PRODUCTION */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.arrival}
          className="absolute inset-0 flex flex-col items-center justify-between py-16 px-6 pointer-events-none z-10 preserve-3d"
        >
          {/* Act 1 Theatrical Text Cue */}
          <div
            ref={act1TextRef}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto my-auto pointer-events-auto preserve-3d"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] backdrop-blur-md mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-accent font-semibold">
                An AI-Native Creative Studio
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.8rem] font-extrabold tracking-tight md:tracking-[-0.035em] leading-[1.01] text-white">
              AI DOES THE WORK. <br />
              <span className="text-white">YOU KEEP THE CRAFT.</span>
            </h1>

            <p className="mt-6 sm:mt-8 font-sans text-base sm:text-lg md:text-xl text-white/55 font-light leading-relaxed max-w-2xl text-balance">
              Where creative intent becomes finished frame. <br className="hidden sm:inline" />
              Ideation, generation, editing, and motion unified into one intelligent production environment.
            </p>

            <div className="mt-8 sm:mt-10 flex items-center gap-4">
              <a
                href={REQUEST_ACCESS_URL}
                className="px-9 py-3.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:bg-accent hover:text-black active:scale-[0.97] shadow-2xl shadow-black/80 flex items-center gap-2 group"
              >
                <span>Request Early Access</span>
                <span className="text-xs transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>

          {/* Act 1 3D Stage Elements: Live Playhead + 3D Flanking Film Strips */}
          <div ref={act1StageRef} className="w-full max-w-5xl relative pointer-events-auto preserve-3d">
            {/* Vector Playhead Timeline */}
            <div className="w-full flex flex-col items-center gap-2 mb-4">
              <div className="w-full max-w-lg h-px bg-white/[0.12] relative">
                <div className="absolute -top-3.5 left-1/3 -translate-x-1/2 flex flex-col items-center">
                  <IconPlayhead size={16} className="text-accent drop-shadow-[0_0_10px_rgba(54,226,206,0.8)]" />
                  <span className="mt-2 font-mono text-[10px] text-white/40 tracking-wider">
                    {timecode} · TIMELINE LIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Scroll instruction cue */}
            <div className="flex flex-col items-center gap-1.5 opacity-40">
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/50">
                SCROLL TO ENTER THE PRODUCTION TIMELINE
              </span>
              <div className="w-px h-5 bg-gradient-to-b from-white/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACT 2: RAW INTENT TO STRUCTURED PLAN */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.context}
          className="absolute inset-0 flex flex-col items-center justify-between py-16 px-6 pointer-events-none z-10 preserve-3d"
        >
          {/* Act 2 Theatrical Title */}
          <div
            ref={act2TextRef}
            className="text-center max-w-4xl mx-auto pt-4 pointer-events-auto preserve-3d"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                02 / Intent into Structure
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Creative intent is messy. <br />
              <span className="text-white">Vichith understands.</span>
            </h2>

            <p className="mt-2.5 text-sm sm:text-base md:text-lg text-white/55 font-normal max-w-xl mx-auto leading-relaxed text-balance">
              You start with a feeling, a reference, a sentence. Vichith organizes chaotic ideas into structured scenes, characters, and shot lists.
            </p>
          </div>

          {/* Act 2 3D Curved Stage Amphitheater */}
          <div
            ref={act2StageRef}
            className="w-full max-w-5xl h-[380px] sm:h-[420px] relative preserve-3d flex items-center justify-center my-auto pointer-events-auto"
          >
            {/* Raw Prompt Directive (Floating center-top) */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl glass-panel shadow-float text-center max-w-md z-30"
              style={{ transform: "translateZ(120px)" }}
            >
              <span className="font-mono text-[9px] text-accent uppercase tracking-widest block mb-1">
                Raw Intent Input
              </span>
              <span className="font-mono text-xs sm:text-sm text-white font-medium">
                &ldquo;Make a 35mm neo-noir sunrise film with dynamic match cuts and deep vocal cadence.&rdquo;
              </span>
            </div>

            {/* Left 3D Panel: Character Identity Anchor */}
            <div
              className="absolute left-[2%] sm:left-[6%] w-56 sm:w-64 glass-panel p-3.5 shadow-float transition-all duration-300 hover:scale-105"
              style={{ transform: "rotateY(20deg) rotateX(-6deg) translateZ(50px)" }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-2">
                <span>CHARACTER SEED</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </div>
              <div
                className="w-full h-40 rounded-lg overflow-hidden relative mb-2"
                style={{
                  backgroundImage: "url('/man.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-2 left-2 font-mono text-[9px] text-white/90 bg-black/60 px-1.5 py-0.5 rounded">
                  Consistent Protagonist AST
                </span>
              </div>
              <div className="text-[10px] font-mono text-white/60">
                Face geometry & wardrobe preserved across shots
              </div>
            </div>

            {/* Right 3D Panel: Deconstructed Sequence Frames */}
            <div
              className="absolute right-[2%] sm:right-[6%] w-64 sm:w-76 glass-panel p-3.5 shadow-float transition-all duration-300 hover:scale-105"
              style={{ transform: "rotateY(-22deg) rotateZ(3deg) translateZ(40px)" }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-2">
                <span>DECONSTRUCTED SHOTS</span>
                <span className="text-accent font-mono text-[9px]">4 Cuts Mapped</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-28 rounded-lg overflow-hidden mb-2">
                <div
                  className="rounded bg-cover bg-center border border-white/10"
                  style={{ backgroundImage: "url('/shot.jpg')" }}
                />
                <div
                  className="rounded bg-cover bg-center border border-white/10"
                  style={{ backgroundImage: "url('/pouring_tea.jpg')" }}
                />
                <div
                  className="rounded bg-cover bg-center border border-white/10"
                  style={{ backgroundImage: "url('/split_pour.jpg')" }}
                />
              </div>
              <div className="text-[10px] font-mono text-white/60 flex items-center justify-between">
                <span>Pacing: 110 BPM Downbeat</span>
                <span className="text-accent">Locked</span>
              </div>
            </div>
          </div>

          <div className="h-4" />
        </div>

        {/* ========================================================================= */}
        {/* ACT 3: CHITHRA — THE CREATIVE INTELLIGENCE LAYER */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.chithra}
          className="absolute inset-0 flex flex-col items-center justify-between py-16 px-6 pointer-events-none z-10 preserve-3d"
        >
          {/* Act 3 Theatrical Title */}
          <div
            ref={act3TextRef}
            className="text-center max-w-4xl mx-auto pt-4 pointer-events-auto preserve-3d"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                03 / Creative Intelligence Layer
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Meet Chithra. <br />
              <span className="text-white">The intelligence layer.</span>
            </h2>

            <p className="mt-2.5 text-sm sm:text-base md:text-lg text-white/55 font-normal max-w-xl mx-auto leading-relaxed text-balance">
              Not a chatbot you prompt from the outside. Chithra operates inside the project — understanding your creative state and steering the production pipeline.
            </p>
          </div>

          {/* Act 3 3D Holographic Core & Pipeline Matrix */}
          <div
            ref={act3StageRef}
            className="w-full max-w-5xl rounded-2xl border border-white/[0.08] bg-[#09090d]/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] p-6 sm:p-7 overflow-hidden my-auto pointer-events-auto preserve-3d"
          >
            {/* Top Directive Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-white/70">
                  <IconTerminal size={15} />
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 block">
                    Chithra Autonomous Pipeline
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-white font-medium">
                    &ldquo;Assemble 45s sequence, match color grade, generate bridge frames on V2&rdquo;
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-white/70 bg-white/[0.04] border border-white/[0.08] px-3.5 py-1 rounded-full self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_8px_rgba(54,226,206,0.9)] animate-pulse" />
                <span>Orchestrating Project AST</span>
              </div>
            </div>

            {/* Tri-Axial Gyroscopic Core + Live Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-5">
              {/* Gyroscopic Core */}
              <div className="md:col-span-5 flex flex-col items-center justify-center relative h-52 preserve-3d">
                <div className="w-40 h-40 relative flex items-center justify-center preserve-3d">
                  <div
                    className="absolute inset-0 border border-accent/40 rounded-full animate-[spin_5s_linear_infinite]"
                    style={{ transform: "rotateX(65deg) rotateY(15deg)" }}
                  />
                  <div
                    className="absolute inset-0 border border-accent/40 rounded-full animate-[spin_8s_linear_infinite_reverse]"
                    style={{ transform: "rotateY(65deg) rotateX(15deg)" }}
                  />
                  <div
                    className="absolute inset-0 border border-white/20 rounded-full animate-[spin_6s_linear_infinite]"
                    style={{ transform: "rotateZ(45deg) rotateX(45deg)" }}
                  />
                  <div className="relative z-10 text-center bg-black/90 px-3.5 py-2 rounded-lg border border-accent/40 font-mono text-[10px] text-accent font-bold tracking-widest shadow-lg shadow-accent/10">
                    CHITHRA CORE
                  </div>
                </div>
                <span className="font-mono text-[10px] text-white/40 mt-1">Multi-Model Agent Engine</span>
              </div>

              {/* Execution Pipeline Steps */}
              <div className="md:col-span-7 space-y-2 font-mono text-xs">
                {[
                  { tag: "INTENT", title: "Pacing & Emotional Rhythm", desc: "Kinetic hook → 35mm atmosphere → Dynamic climax", badge: "Resolved" },
                  { tag: "ROUTE", title: "Model Routing & Generation", desc: "Seedream 4.5 allocated for high-frequency bridge shots", badge: "Active" },
                  { tag: "AUDIO", title: "Vocal Isolation & Auto-Ducking", desc: "Dialogue stem locked to -14LUFS over score", badge: "Synchronized" },
                  { tag: "ASSEMBLY", title: "Non-Destructive Multi-Track Stitch", desc: "14 split cuts staged on timeline with handles", badge: "Staged" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-between hover:border-white/[0.15] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40">
                        {item.tag}
                      </span>
                      <div>
                        <div className="text-[11px] text-white font-medium">{item.title}</div>
                        <div className="text-[9px] text-white/40">{item.desc}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-accent/10 border border-accent/25 text-accent font-semibold">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>Creator override: 100% Unlocked</span>
              <span>Zero isolated generations · Project-Aware</span>
            </div>
          </div>

          <div className="h-4" />
        </div>

        {/* ========================================================================= */}
        {/* ACT 4: EDITING & MULTI-TRACK NLE */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.studio}
          className="absolute inset-0 flex flex-col items-center justify-between py-16 px-6 pointer-events-none z-10 preserve-3d"
        >
          {/* Act 4 Theatrical Title */}
          <div
            ref={act4TextRef}
            className="text-center max-w-4xl mx-auto pt-4 pointer-events-auto preserve-3d"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                04 / Professional Editing
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              AI doesn&apos;t just generate. <br />
              <span className="text-white">It edits.</span>
            </h2>

            <p className="mt-2.5 text-sm sm:text-base md:text-lg text-white/55 font-normal max-w-xl mx-auto leading-relaxed text-balance">
              A real multi-track NLE where creator and machine manipulate the same timeline. Split at playhead, trim handles, ripple, and retime.
            </p>
          </div>

          {/* Act 4 3D Perspective Studio Workstation */}
          <div
            ref={act4StageRef}
            className="w-full max-w-5xl rounded-2xl border border-white/[0.1] bg-[#0c0c10]/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden my-auto pointer-events-auto preserve-3d"
          >
            {/* Top Workspace Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-black/60 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="text-[11px] text-white/70 ml-2">PROJECT / DESERT_DAWN_MASTER.VCH</span>
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
                  Timeline Active
                </span>
              </div>
            </div>

            {/* Viewport + Timeline Body */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#08080b]">
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

                  {/* 9:16 Crop Overlay */}
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

                  {/* RSVP Word Caption */}
                  <div className="absolute bottom-6 inset-x-0 flex justify-center z-30 pointer-events-none">
                    <div className="px-3 py-1 rounded bg-black/85 backdrop-blur-md text-xs sm:text-sm font-bold text-white tracking-wide uppercase shadow-lg border border-white/15 flex gap-1.5">
                      {["THE", "CREATOR", "KEEPS", "THE", "CRAFT"].map((word, idx) => (
                        <span
                          key={idx}
                          className={idx === activeWordIdx ? "text-accent drop-shadow-[0_0_8px_rgba(54,226,206,0.9)] font-extrabold" : "text-white/60"}
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

              {/* Multi-Track Timeline */}
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
              <span>Export in ProRes 422 & H.264</span>
            </div>
          </div>

          <div className="h-4" />
        </div>

        {/* ========================================================================= */}
        {/* ACT 5: KINETIC MOTION & TYPOGRAPHY */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.control}
          className="absolute inset-0 flex flex-col items-center justify-between py-16 px-6 pointer-events-none z-10 preserve-3d"
        >
          {/* Act 5 Theatrical Title */}
          <div
            ref={act5TextRef}
            className="text-center max-w-4xl mx-auto pt-4 pointer-events-auto preserve-3d"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                05 / Motion &amp; Typography
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Make it feel alive. <br />
              <span className="text-white">Semantic motion.</span>
            </h2>

            <p className="mt-2.5 text-sm sm:text-base md:text-lg text-white/55 font-normal max-w-xl mx-auto leading-relaxed text-balance">
              Motion isn&apos;t an afterthought. Kinetic typography presets, spring easing, and spatial camera paths synthesized directly from intent.
            </p>
          </div>

          {/* Act 5 Kinetic Typography Demonstrator */}
          <div
            ref={act5StageRef}
            className="w-full max-w-4xl rounded-2xl border border-white/[0.08] bg-[#09090d]/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] p-6 sm:p-8 my-auto pointer-events-auto preserve-3d text-center"
          >
            {/* Preset Selector */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {(["pop", "wave", "jitter", "neon"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setKineticPreset(p)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                    kineticPreset === p
                      ? "bg-accent text-black font-bold shadow-lg shadow-accent/20"
                      : "bg-white/[0.04] text-white/50 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Kinetic Type Arena */}
            <div className="py-8 sm:py-12 border-y border-white/[0.06] my-4 overflow-hidden">
              <div
                className={`font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white transition-all duration-500 ${
                  kineticPreset === "pop"
                    ? "scale-105 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                    : kineticPreset === "wave"
                    ? "translate-y-1 tracking-wider text-accent"
                    : kineticPreset === "jitter"
                    ? "rotate-1 text-white/90 scale-95"
                    : "text-accent drop-shadow-[0_0_30px_rgba(54,226,206,0.8)]"
                }`}
              >
                KINETIC CRAFT
              </div>
              <div className="font-mono text-xs text-white/40 mt-3">
                Preset: {kineticPreset.toUpperCase()} · Stagger: 0.08s · Cubic Bezier Easing
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-white/40 pt-2">
              <span>Per-character glyph transform engine</span>
              <span>100% Exportable to Premiere &amp; After Effects</span>
            </div>
          </div>

          <div className="h-4" />
        </div>

        {/* ========================================================================= */}
        {/* ACT 6: ONE CREATIVE STATE — EVERYTHING CONNECTED */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.future}
          className="absolute inset-0 flex flex-col items-center justify-between py-16 px-6 pointer-events-none z-10 preserve-3d"
        >
          {/* Act 6 Theatrical Title */}
          <div
            ref={act6TextRef}
            className="text-center max-w-4xl mx-auto pt-4 pointer-events-auto preserve-3d"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                06 / One Creative System
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              One shared state. <br />
              <span className="text-white">Zero export roundtrips.</span>
            </h2>

            <p className="mt-2.5 text-sm sm:text-base md:text-lg text-white/55 font-normal max-w-xl mx-auto leading-relaxed text-balance">
              Ideation, generation, editing, and motion live in a single unified project AST. Change a prompt, and the timeline reflects it. Trim a clip, and the motion adapts.
            </p>
          </div>

          {/* Act 6 Convergence Matrix */}
          <div
            ref={act6StageRef}
            className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto pointer-events-auto preserve-3d"
          >
            {[
              { title: "CHITHRA", role: "Intelligence Layer", desc: "Project reasoning & model orchestration" },
              { title: "STUDIO", role: "Creative Generation", desc: "Consistent characters & 4K bridge frames" },
              { title: "EDITOR", role: "Timeline NLE", desc: "Multi-track split cuts, ripple & handles" },
              { title: "MOTION", role: "Kinetic Synthesis", desc: "Vector RSVP captions & spring curves" },
            ].map((room, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-white/[0.08] bg-[#0a0a0e]/90 backdrop-blur-xl flex flex-col justify-between hover:border-accent/40 transition-all duration-300"
              >
                <div>
                  <span className="font-mono text-[9px] text-accent uppercase tracking-widest block mb-1">
                    0{idx + 1} // System
                  </span>
                  <div className="font-display text-lg font-bold text-white mb-1">{room.title}</div>
                  <div className="text-[11px] font-mono text-white/40 mb-2">{room.role}</div>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">{room.desc}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-white/[0.06] flex items-center justify-between font-mono text-[9px] text-accent">
                  <span>Synced</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          <div className="h-4" />
        </div>

        {/* ========================================================================= */}
        {/* ACT 7: THE PAYOFF & EARLY ACCESS PORTAL */}
        {/* ========================================================================= */}
        <div
          id={SECTION_IDS.closing}
          className="absolute inset-0 flex flex-col items-center justify-between py-16 px-6 pointer-events-none z-10 preserve-3d"
        >
          {/* Act 7 Grand Finale Text Cue */}
          <div
            ref={act7TextRef}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto my-auto pointer-events-auto preserve-3d"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white/50 font-semibold">
                Rolling Cohorts · Early Access
              </span>
            </div>

            <h2 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight text-white leading-[0.98]">
              Make what you <br />
              <span className="text-white">imagined.</span>
            </h2>

            <p className="mt-6 sm:mt-8 font-sans text-base sm:text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-xl mx-auto text-balance">
              Vichith is bringing ideation, generation, editing, and motion into one creative environment. Join the first cohort of creators.
            </p>

            {/* Direct Conversion Actions */}
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

          {/* Act 7 Stage Minimal Integrated Footer */}
          <div
            ref={act7StageRef}
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
