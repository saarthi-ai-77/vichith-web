"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const PROJECT_SATELLITES = [
  { name: "Chithra Intelligence", desc: "Direct conversational project partner", icon: "◎" },
  { name: "Timeline NLE", desc: "Multi-track cuts and waveform sync", icon: "▣" },
  { name: "Semantic Motion", desc: "Vector easing and camera keyframing", icon: "◈" },
  { name: "Shot Manifest", desc: "Consistent 4K frame generation", icon: "◇" },
  { name: "References & Style", desc: "Moodboard lighting and character models", icon: "◉" },
  { name: "Audio & Captions", desc: "Stem-separated audio and dialogue", icon: "◎" },
  { name: "Production Nodes", desc: "Repeatable recipes chaining shots to master", icon: "✦" },
  { name: "Asset Bins", desc: "Lossless plates and typography layers", icon: "□" },
];

// Satellite card
function SatelliteCard({ satellite, index }: { satellite: typeof PROJECT_SATELLITES[0]; index: number }) {
  return (
    <motion.div
      className="group p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg text-zinc-600 group-hover:text-[#83D0BE] transition-colors">
          {satellite.icon}
        </span>
        <div>
          <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors mb-1">
            {satellite.name}
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {satellite.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function SectionOneProject() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });

  return (
    <section
      ref={containerRef}
      className="relative py-32 sm:py-40 overflow-hidden bg-[#070809]"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(131, 208, 190, 0.03) 0%, transparent 50%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            className="inline-block px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Unified Environment
          </motion.span>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Everything stays connected.
          </motion.h2>

          <motion.p
            className="text-lg text-zinc-400 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ideas, assets, edits, and decisions stay synchronized from the first thought to the final frame.
          </motion.p>
        </div>

        {/* Central Hub Visualization */}
        <div className="relative mb-16">
          {/* Central hub */}
          <motion.div
            className="relative w-48 h-48 mx-auto mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border border-white/[0.08]"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#83D0BE]/50" />
            </motion.div>

            {/* Middle ring */}
            <motion.div
              className="absolute inset-4 rounded-full border border-white/[0.06]"
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-600" />
            </motion.div>

            {/* Inner hub */}
            <div className="absolute inset-8 rounded-full bg-zinc-900/50 border border-white/[0.08] flex flex-col items-center justify-center">
              <span className="text-2xl text-[#83D0BE] mb-1">◎</span>
              <span className="text-xs font-mono text-zinc-400">PROJECT</span>
              <span className="text-[10px] text-zinc-600">hub</span>
            </div>

            {/* Connection lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-24 h-px bg-gradient-to-r from-white/[0.06] to-transparent origin-left"
                style={{ transform: `rotate(${angle}deg) translateX(96px)` }}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
              />
            ))}
          </motion.div>

          {/* Satellites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_SATELLITES.map((satellite, index) => (
              <SatelliteCard key={satellite.name} satellite={satellite} index={index} />
            ))}
          </div>
        </div>

        {/* Bottom statement */}
        <motion.p
          className="text-center text-sm text-zinc-500 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Every component talks to every other component. Change a character in one place, it updates everywhere. 
          No exports, no imports, no lost context.
        </motion.p>
      </div>
    </section>
  );
}

export default SectionOneProject;
