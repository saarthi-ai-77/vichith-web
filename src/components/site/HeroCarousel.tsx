"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, type PanInfo, useMotionValue } from "framer-motion";
import {
  IconChithraNode,
  IconAnamorphic,
  IconSplice,
  IconMotionCurve,
  IconHarmonicWave,
} from "./icons/VichithIcons";

export interface HeroCarouselSlide {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  videoUrl?: string;
  icon: React.ReactNode;
  specs: string[];
}

const CAROUSEL_SLIDES: HeroCarouselSlide[] = [
  {
    id: "chithra-planning",
    category: "01 · CHITHRA PLANNING",
    title: "Agentic Scene Breakdown",
    subtitle: "Conversational premise expanded into a structured multi-shot storyboard with character and lens continuity.",
    badge: "DIRECTOR AGENT",
    image: "/vintage.jpg",
    icon: <IconChithraNode size={14} className="text-[#83D0BE]" />,
    specs: ["Shot Breakdown", "Seed Locked", "35mm Anamorphic"],
  },
  {
    id: "studio-generation",
    category: "02 · STUDIO GENERATION",
    title: "Direct 4K Plate Synthesis",
    subtitle: "Generates native 2.39:1 cinematic footage directly into project track V1 with zero orphan downloads or re-imports.",
    badge: "CINEMA DIFFUSION",
    image: "/split_pour.jpg",
    icon: <IconAnamorphic size={14} className="text-[#83D0BE]" />,
    specs: ["4K Scope", "In-Timeline", "0s Conform"],
  },
  {
    id: "chithra-editing",
    category: "03 · CHITHRA EDITING",
    title: "Timeline Surgery & Ripple Sync",
    subtitle: "AI operates the actual timeline—trims heads and tails, ducks audio under dialogue, and inserts cutaways on downbeats.",
    badge: "DIRECT NLE MUTATION",
    image: "/lighthouse.jpg",
    icon: <IconSplice size={14} className="text-[#83D0BE]" />,
    specs: ["Sub-Frame Trims", "Audio Ducked", "Ripple Shift"],
  },
  {
    id: "semantic-motion",
    category: "04 · SEMANTIC MOTION",
    title: "Parametric Bézier Curves",
    subtitle: "Natural camera motion push-ins, optical flow retiming (0.8x), and typography easing designed on live splines.",
    badge: "SPLINE ENGINE",
    image: "/shot.jpg",
    icon: <IconMotionCurve size={14} className="text-[#83D0BE]" />,
    specs: ["Cubic Bézier", "0.8x Optical Flow", "Audio Synced"],
  },
  {
    id: "harmonic-sound",
    category: "05 · STEM MASTERING",
    title: "Neural Audio Separation",
    subtitle: "Isolates dialogue, synthesizes room tone, and synchronizes atmospheric music tracks to visual cut markers.",
    badge: "SOUNDSCAPE DSP",
    image: "/man.jpg",
    icon: <IconHarmonicWave size={14} className="text-[#83D0BE]" />,
    specs: ["Stem Isolation", "Beat Markers", "48kHz 24-Bit"],
  },
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1);

  // Autoplay timer
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setActiveIndex((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % CAROUSEL_SLIDES.length;
      }
      return (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length;
    });
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -40) {
      paginate(1);
    } else if (info.offset.x > 40) {
      paginate(-1);
    }
  };

  const activeSlide = CAROUSEL_SLIDES[activeIndex];

  return (
    <div
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Top Navigation Bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#83D0BE] animate-pulse" />
          <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest font-semibold">
            Vichith Studio Reel
          </span>
          <span className="pill-tag text-[9px] text-[#83D0BE] border-[#83D0BE]/30 bg-[#83D0BE]/10 py-0.5 px-2 ml-1">
            {activeIndex + 1} / {CAROUSEL_SLIDES.length}
          </span>
        </div>

        {/* Slide Category Quick Selector Pills */}
        <div className="hidden md:flex items-center gap-1.5">
          {CAROUSEL_SLIDES.map((slide, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => {
                  setDirection(idx > activeIndex ? 1 : -1);
                  setActiveIndex(idx);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? "bg-[#83D0BE]/15 text-[#83D0BE] border border-[#83D0BE]/40 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                {slide.category.split(" · ")[1]}
              </button>
            );
          })}
        </div>

        {/* Prev / Next Arrow Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => paginate(-1)}
            aria-label="Previous slide"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-zinc-300 hover:text-white hover:border-white/20 transition-all cursor-pointer active:scale-95"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Next slide"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-zinc-300 hover:text-white hover:border-white/20 transition-all cursor-pointer active:scale-95"
          >
            →
          </button>
        </div>
      </div>

      {/* Main Wide Cinema Carousel Stage with 3D Motion */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#0A0C0E] overflow-hidden shadow-[0_25px_70px_-20px_rgba(0,0,0,0.85)] group">
        {/* Subtle glowing edge line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#83D0BE]/50 to-transparent z-20 pointer-events-none" />

        <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.4/1] w-full overflow-hidden flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeSlide.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 80, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -direction * 80, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing flex flex-col justify-between p-4 sm:p-7 md:p-9"
            >
              {/* Slide Background Image / Future Video Media */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {activeSlide.videoUrl ? (
                  <video
                    src={activeSlide.videoUrl}
                    poster={activeSlide.image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 contrast-105"
                  />
                )}
                {/* Cinema Gradient Overlays for High Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070809] via-black/40 to-black/70" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/50" />
              </div>

              {/* Anamorphic Scope Letterbox Lines */}
              <div className="absolute inset-x-0 top-0 h-[6%] bg-black/80 border-b border-white/10 pointer-events-none z-10" />
              <div className="absolute inset-x-0 bottom-0 h-[6%] bg-black/80 border-t border-white/10 pointer-events-none z-10" />

              {/* Top HUD Row */}
              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/80 border border-white/15 text-white backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                    {activeSlide.icon}
                    <span className="font-semibold">{activeSlide.category}</span>
                  </span>
                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-black/75 border border-[#83D0BE]/30 text-[#83D0BE] backdrop-blur-md">
                    {activeSlide.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/75 border border-white/10 text-zinc-300 backdrop-blur-md flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    REC · LIVE PREVIEW
                  </span>
                </div>
              </div>

              {/* Bottom Content Row */}
              <div className="relative z-10 max-w-2xl text-left">
                <h3 className="text-xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-white leading-tight drop-shadow-md">
                  {activeSlide.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm md:text-base text-zinc-300 font-normal leading-relaxed line-clamp-2 drop-shadow">
                  {activeSlide.subtitle}
                </p>

                {/* Technical Specs Tags */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {activeSlide.specs.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md bg-black/70 border border-white/10 text-[10px] font-mono text-zinc-300 backdrop-blur-md"
                    >
                      {spec}
                    </span>
                  ))}
                  <span className="text-[10px] font-mono text-[#83D0BE] hidden sm:inline ml-1">
                    ✓ In-Project Sync
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Carousel Progress Track Indicator */}
        <div className="relative z-20 flex items-center justify-between px-6 py-2.5 bg-[#0C0E10]/95 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDirection(idx > activeIndex ? 1 : -1);
                  setActiveIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeIndex
                    ? "w-8 bg-[#83D0BE] shadow-[0_0_10px_#83D0BE]"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          <span className="text-[11px] font-mono text-zinc-500">
            Drag or use arrows to explore outputs
          </span>
        </div>
      </div>
    </div>
  );
}

export default HeroCarousel;
