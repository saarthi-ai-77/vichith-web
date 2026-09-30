"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const FOUNDATION_MODELS = [
  {
    id: "cinema",
    name: "Vichith Cinema-4K",
    version: "VC-DIFFUSION-v3",
    domain: "Video Synthesis",
    latency: "0.38x Real-Time",
    resolution: "4K 2.39:1 Scope",
    specs: [
      "99.8% Temporal Consistency",
      "2.39:1 Anamorphic",
      "100% Seed Persistence",
    ],
    color: "#83D0BE",
    accent: "rgba(131, 208, 190, 0.1)",
  },
  {
    id: "chithra",
    name: "Chithra Direct-1",
    version: "CHITHRA-AGENT-2.4",
    domain: "Director Agent",
    latency: "12ms Response",
    resolution: "Multimodal Intent",
    specs: [
      "Direct NLE",
      "Continuous Project Context",
      "Sub-Frame Audio-Beat Lock",
    ],
    color: "#A78BFA",
    accent: "rgba(167, 139, 250, 0.1)",
  },
  {
    id: "spline",
    name: "SplineMotion-X",
    version: "SM-KEYFRAME-v2",
    domain: "Parametric Easing",
    latency: "0ms GPU Shaders",
    resolution: "60 FPS Vectors",
    specs: [
      "Cubic Bézier",
      "0.8x Optical Flow",
      "Non-Destructive",
    ],
    color: "#FBBF24",
    accent: "rgba(251, 191, 36, 0.1)",
  },
  {
    id: "harmonic",
    name: "HarmonicStem-Audio",
    version: "HS-DSP-AUDIO-v1",
    domain: "Sound & Waveform",
    latency: "4ms Neural DSP",
    resolution: "48kHz 24-bit",
    specs: [
      "Dialogue/Score/FX Stems",
      "-3dB Auto-Duck",
      "Downbeat Markers",
    ],
    color: "#F472B6",
    accent: "rgba(244, 114, 182, 0.1)",
  },
];

// Model card
function ModelCard({ model, index, isActive, onClick }: { model: typeof FOUNDATION_MODELS[0]; index: number; isActive: boolean; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      className={`group relative p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
        isActive
          ? "border-white/[0.12] bg-white/[0.04]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.03]"
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      style={{
        borderColor: isActive ? model.color : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: model.color }}
            />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {model.domain}
            </span>
          </div>
          <h3
            className="text-base font-medium transition-colors"
            style={{ color: isActive ? model.color : undefined }}
          >
            {model.name}
          </h3>
          <span className="text-[10px] font-mono text-zinc-600">{model.version}</span>
        </div>
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: isActive ? model.color : "#3f3f46" }}
          animate={isActive ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      {/* Specs */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Latency</span>
          <span className="text-zinc-300">{model.latency}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Resolution</span>
          <span className="text-zinc-300">{model.resolution}</span>
        </div>
      </div>

      {/* Specs list */}
      <div
        className="p-3 rounded-lg border border-white/[0.06]"
        style={{ backgroundColor: model.accent }}
      >
        <ul className="space-y-1">
          {model.specs.map((spec, i) => (
            <li key={i} className="text-[10px] text-zinc-400 flex items-center gap-2">
              <span style={{ color: model.color }}>›</span>
              {spec}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// Detail view
function ModelDetail({ model }: { model: typeof FOUNDATION_MODELS[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-xl border border-white/[0.08] bg-zinc-900/50"
      style={{ borderColor: model.color }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Architecture</span>
          <p className="text-sm text-zinc-300">{model.version}</p>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Domain</span>
          <p className="text-sm text-zinc-300">{model.domain}</p>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Performance</span>
          <p className="text-sm text-zinc-300">{model.latency}</p>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Output</span>
          <p className="text-sm text-zinc-300">{model.resolution}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function SectionModels() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [activeModel, setActiveModel] = useState(0);

  return (
    <section
      ref={containerRef}
      id="models"
      className="relative py-32 sm:py-40 overflow-hidden bg-[#070809]"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#83D0BE]/[0.02] blur-[150px] rounded-full" />
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
            Foundation Models
          </motion.span>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Powered by specialized
            <br />
            <span className="text-[#83D0BE]">creative models.</span>
          </motion.h2>

          <motion.p
            className="text-lg text-zinc-400 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Not generic chatbots. Vichith runs specialized multimodal models trained directly for cinematic composition, timeline surgery, and motion physics.
          </motion.p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {FOUNDATION_MODELS.map((model, index) => (
            <ModelCard
              key={model.id}
              model={model}
              index={index}
              isActive={activeModel === index}
              onClick={() => setActiveModel(index)}
            />
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          <ModelDetail key={activeModel} model={FOUNDATION_MODELS[activeModel]} />
        </AnimatePresence>
      </div>
    </section>
  );
}

export default SectionModels;
