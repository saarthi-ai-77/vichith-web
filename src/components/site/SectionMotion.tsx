"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";

const MOTION_PRESETS = [
  {
    name: "Soft Enter",
    duration: "0.85s",
    description: "Gentle opacity + vertical rise",
    curve: "cubic-bezier(0.16, 1, 0.3, 1)",
    preview: "fade-up",
  },
  {
    name: "Stagger Words",
    duration: "1.2s",
    description: "Sequential word reveal",
    curve: "cubic-bezier(0.4, 0, 0.2, 1)",
    preview: "stagger",
  },
  {
    name: "Camera Push",
    duration: "4.5s",
    description: "Slow dolly scale 1.00 → 1.08",
    curve: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    preview: "scale",
  },
];

const CODE_PREVIEW = `// Motion definition
const animation = {
  curve: "M 0 100 C 20 0, 40 0, 100 0",
  duration: 0.85,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  properties: {
    opacity: [0, 1],
    transform: ["translateY(20px)", "translateY(0)"]
  }
}`;

// Easing curve visualization
function EasingCurve({ curve, isActive }: { curve: string; isActive: boolean }) {
  // Parse cubic-bezier values
  const match = curve.match(/cubic-bezier\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
  const [_, x1, y1, x2, y2] = match || [null, 0.16, 1, 0.3, 1];

  // Generate curve path
  const path = `M 0 100 Q ${parseFloat(x1 as string) * 100} ${100 - parseFloat(y1 as string) * 100}, 50 50 T 100 0`;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      {/* Grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#grid)" />

      {/* Axes */}
      <line x1="0" y1="100" x2="100" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <line x1="0" y1="100" x2="0" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

      {/* Curve */}
      <motion.path
        d={path}
        fill="none"
        stroke={isActive ? "#83D0BE" : "rgba(255,255,255,0.2)"}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Control points */}
      {isActive && (
        <>
          <motion.circle
            cx={parseFloat(x1 as string) * 100}
            cy={100 - parseFloat(y1 as string) * 100}
            r="3"
            fill="#83D0BE"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          />
          <motion.circle
            cx={parseFloat(x2 as string) * 100}
            cy={100 - parseFloat(y2 as string) * 100}
            r="3"
            fill="#83D0BE"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 }}
          />
        </>
      )}
    </svg>
  );
}

// Preview animation
function PreviewAnimation({ type, isActive }: { type: string; isActive: boolean }) {
  if (type === "fade-up") {
    return (
      <motion.div
        className="w-16 h-16 rounded-lg bg-[#83D0BE]/20 border border-[#83D0BE]/30"
        initial={{ opacity: 0.3, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 20 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      />
    );
  }

  if (type === "stagger") {
    return (
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded bg-[#83D0BE]/20"
            initial={{ opacity: 0, y: 10 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4, delay: i * 0.15, ease: [0.4, 0, 0.2, 1] }}
          />
        ))}
      </div>
    );
  }

  if (type === "scale") {
    return (
      <motion.div
        className="w-16 h-16 rounded-lg bg-[#83D0BE]/20 border border-[#83D0BE]/30"
        initial={{ scale: 1 }}
        animate={isActive ? { scale: 1.08 } : { scale: 1 }}
        transition={{ duration: 4.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    );
  }

  return null;
}

// Motion preset card
function MotionPreset({ preset, index, isActive, onClick }: { preset: typeof MOTION_PRESETS[0]; index: number; isActive: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
        isActive
          ? 'border-[#83D0BE]/30 bg-[#83D0BE]/5'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className={`text-sm font-medium mb-1 ${isActive ? 'text-[#83D0BE]' : 'text-zinc-200'}`}>
            {preset.name}
          </h4>
          <p className="text-xs text-zinc-500 mb-2">{preset.description}</p>
          <span className="text-[10px] font-mono text-zinc-600">{preset.duration}</span>
        </div>
        <div className="w-12 h-12 flex items-center justify-center">
          <PreviewAnimation type={preset.preview} isActive={isActive} />
        </div>
      </div>
    </motion.button>
  );
}

export function SectionMotion() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [activePreset, setActivePreset] = useState(0);

  return (
    <section
      ref={containerRef}
      id="motion"
      className="relative py-32 sm:py-40 overflow-hidden bg-[#070809]"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#83D0BE]/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="mb-16">
          <motion.span
            className="inline-block px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Motion Design
          </motion.span>

          <motion.h2
            className="text-5xl sm:text-6xl md:text-7xl font-semibold text-white tracking-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Motion.
          </motion.h2>

          <motion.p
            className="text-lg text-zinc-400 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Describe how you want it to move. Vichith generates precise easing curves, transforms, and timing from natural language.
          </motion.p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Presets & Curve */}
          <div className="space-y-6">
            {/* Motion Presets */}
            <div className="space-y-3">
              {MOTION_PRESETS.map((preset, index) => (
                <MotionPreset
                  key={preset.name}
                  preset={preset}
                  index={index}
                  isActive={activePreset === index}
                  onClick={() => setActivePreset(index)}
                />
              ))}
            </div>

            {/* Curve Visualization */}
            <motion.div
              className="rounded-xl border border-white/[0.08] bg-zinc-900/50 p-6 aspect-[2/1]"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-zinc-300">Easing Curve</span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {MOTION_PRESETS[activePreset].curve}
                </span>
              </div>
              <div className="h-full">
                <EasingCurve curve={MOTION_PRESETS[activePreset].curve} isActive={true} />
              </div>
            </motion.div>
          </div>

          {/* Right: Code Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="rounded-xl border border-white/[0.08] bg-zinc-900/50 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <span className="text-xs font-medium text-zinc-400 ml-2">motion.config</span>
              </div>

              {/* Code */}
              <div className="p-6">
                <pre className="text-xs font-mono leading-relaxed overflow-x-auto">
                  <code className="text-zinc-400">
                    {CODE_PREVIEW.split('\n').map((line, i) => (
                      <div key={i} className="flex">
                        <span className="text-zinc-600 w-6 text-right mr-4 select-none">{i + 1}</span>
                        <span>
                          {line.includes('//') ? (
                            <>
                              <span className="text-zinc-500">{line.split(':')[0]}</span>
                              <span className="text-[#83D0BE]">:</span>
                              <span className="text-zinc-300">{line.split(':').slice(1).join(':')}</span>
                            </>
                          ) : line.includes('curve') || line.includes('easing') ? (
                            <>
                              <span className="text-zinc-300">  {line.split(':')[0]}</span>
                              <span className="text-[#83D0BE]">:</span>
                              <span className="text-zinc-300">{line.split(':').slice(1).join(':')}</span>
                            </>
                          ) : (
                            <span className="text-zinc-300">{line}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>

              {/* Live preview */}
              <div className="px-4 py-4 border-t border-white/[0.06]">
                <p className="text-xs text-zinc-500 mb-3">Live Preview</p>
                <div className="h-16 flex items-center justify-center bg-black/30 rounded border border-white/[0.06]">
                  <PreviewAnimation type={MOTION_PRESETS[activePreset].preview} isActive={true} />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { label: 'Bézier Curves', value: 'Cubic' },
                { label: 'Optical Flow', value: '0.8x' },
                { label: 'GPU Accelerated', value: '60fps' },
                { label: 'Non-destructive', value: 'Editable' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm text-zinc-200 font-medium">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SectionMotion;
