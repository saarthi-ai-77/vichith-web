"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import CircularCarousel from "./CircularCarousel";
import BellToggle from "./BellToggle";
import { Magnetic } from "./Magnetic";

const HERO_ITEMS = [
  {
    src: "/vintage.jpg",
    alt: "Chithra Planning - Scene Breakdown",
    title: "Chithra Planning",
    subtitle: "Autonomous Scene Breakdown",
  },
  {
    src: "/split_pour.jpg",
    alt: "Studio Generation - In-Timeline Synthesis",
    title: "Studio Generation",
    subtitle: "Direct 4K Cinema Plates",
  },
  {
    src: "/lighthouse.jpg",
    alt: "Chithra Editing - Timeline Surgery",
    title: "Chithra Editing",
    subtitle: "Sub-Frame Ripple Sync",
  },
  {
    src: "/shot.jpg",
    alt: "Semantic Motion - Bézier Curves",
    title: "Semantic Motion",
    subtitle: "Parametric Camera Paths",
  },
  {
    src: "/man.jpg",
    alt: "Stem Separation - Neural Audio DSP",
    title: "Stem Mastering",
    subtitle: "Isolated Dialogue & Score",
  },
  {
    src: "/adshit.jpg",
    alt: "Commercial Master - High-End Color Grading",
    title: "Commercial Output",
    subtitle: "2.39:1 Anamorphic Scope",
  },
  {
    src: "/pouring_tea.jpg",
    alt: "Macro Synthesis - Photoreal Texture",
    title: "Macro Synthesis",
    subtitle: "Zero Conform Friction",
  },
  {
    src: "/images/editor-preview.png",
    alt: "Unified Timeline - Multi-Track Flow",
    title: "Unified Studio",
    subtitle: "Multi-Track Orchestration",
  },
];

const REQUEST_ACCESS_URL = "https://app.vichith.in/request-access";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(3);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center items-center py-20 overflow-hidden bg-[#070809]"
    >
      {/* Ambient background glow */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] h-[320px] bg-[#83D0BE]/[0.035] blur-[160px] pointer-events-none rounded-full"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.035, 0.05, 0.035],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Content */}
      <motion.div
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        style={{ opacity, scale }}
      >
        {/* Circular Carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl mx-auto h-[280px] sm:h-[320px] md:h-[360px] relative mb-8"
        >
          <CircularCarousel
            items={HERO_ITEMS}
            preset="cylinder"
            intro="rise"
            cardWidth={200}
            aspectRatio={1.25}
            gap={20}
            speed={11}
            captions
            fadeColor="#070809"
            innerShade={0.55}
            cornerRadius={14}
            onChange={setActiveIndex}
          />
        </motion.div>

        {/* Headline & Core Tagline */}
        <div className="mx-auto max-w-4xl text-center relative">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center justify-center mb-4">
            <motion.div
              className="pill-tag px-4 py-1.5 flex items-center gap-2 border border-[#83D0BE]/25 bg-[#83D0BE]/[0.05] rounded-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.span
                className="h-2 w-2 rounded-full bg-[#83D0BE] inline-block"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-mono text-[10px] sm:text-[11px] text-[#83D0BE] tracking-wider uppercase">
                VICHITH · AI-NATIVE CREATIVE SUITE
              </span>
            </motion.div>
          </div>

          {/* Main Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-[#F4F4F5] leading-[1.1] text-center mb-6"
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            From idea to finished frame.
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-zinc-400 font-normal leading-relaxed max-w-2xl mx-auto tracking-normal mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Vichith brings ideation, generation, editing, and motion into{" "}
            <span className="text-zinc-300">one connected creative environment</span>.
          </motion.p>

          {/* CTA Group */}
          <div className="flex flex-col items-center justify-center gap-3">
            <Magnetic>
              <BellToggle
                offLabel="Request Early Access"
                onLabel="Invite Reserved"
                size="lg"
                background="#83D0BE"
                color="#070809"
                onBackground="#101615"
                onColor="#83D0BE"
                href={REQUEST_ACCESS_URL}
              />
            </Magnetic>

            <motion.span
              className="text-xs text-zinc-500 font-normal flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#83D0BE]/60" />
              Currently opening to early creators
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-xs text-zinc-500 font-mono tracking-wider uppercase">Scroll</span>
        <motion.div
          className="w-5 h-8 border border-zinc-700 rounded-full flex justify-center p-1"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="w-1 h-2 bg-[#83D0BE] rounded-full"
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
