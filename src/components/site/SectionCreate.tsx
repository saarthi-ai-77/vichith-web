"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion";

const GENERATION_STEPS = [
  { id: "intent", title: "Intent", subtitle: "Your vision", number: "01" },
  { id: "context", title: "Context", subtitle: "Project memory", number: "02" },
  { id: "synthesis", title: "Synthesis", subtitle: "AI generation", number: "03" },
  { id: "placement", title: "Placement", subtitle: "Timeline ready", number: "04" },
];

const FEATURES = [
  { title: "Context-aware generation", desc: "Chithra remembers your project style, characters, and continuity" },
  { title: "Multiple variations", desc: "Generate options, compare, iterate without leaving your timeline" },
  { title: "Direct placement", desc: "Assets arrive in your project ready to edit — no import, no conversion" },
];

// Step indicator
function StepIndicator({ step, index, isActive }: { step: typeof GENERATION_STEPS[0]; index: number; isActive: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Number circle */}
      <motion.div
        className={`w-10 h-10 rounded-full border flex items-center justify-center mb-2 ${
          isActive
            ? "border-[#83D0BE]/50 bg-[#83D0BE]/10 text-[#83D0BE]"
            : "border-white/[0.1] bg-white/[0.02] text-zinc-500"
        }`}
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs font-mono">{step.number}</span>
      </motion.div>

      {/* Label */}
      <span className={`text-xs font-medium ${isActive ? "text-white" : "text-zinc-500"}`}>
        {step.title}
      </span>
      <span className="text-[10px] text-zinc-600">{step.subtitle}</span>

      {/* Connector */}
      {index < GENERATION_STEPS.length - 1 && (
        <div className="absolute top-5 left-full w-full h-px">
          <div className="absolute inset-0 bg-white/[0.06]" />
          {isActive && (
            <motion.div
              className="absolute inset-y-0 left-0 bg-[#83D0BE]/30"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Generation canvas demo
function GenerationCanvas() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setShowResult(false);
    setProgress(0);

    // Simulate generation
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setShowResult(true);
          return 100;
        }
        return p + 2;
      });
    }, 30);
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#83D0BE]">✦</span>
          <span className="text-xs font-medium text-zinc-300">Generate</span>
        </div>
        <div className="flex gap-2">
          <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-zinc-500 font-mono">
            3840×2160
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-zinc-500 font-mono">
            ProRes
          </span>
        </div>
      </div>

      {/* Preview Area */}
      <div className="relative aspect-video bg-black">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {isGenerating ? (
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                      />
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#83D0BE"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={175}
                        strokeDashoffset={175 - (175 * progress) / 100}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-[#83D0BE]">
                      {progress}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">Synthesizing...</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-zinc-500 mb-4">Ready to generate</p>
                  <button
                    onClick={handleGenerate}
                    className="px-4 py-2 rounded-full bg-[#83D0BE] text-[#070809] text-xs font-medium hover:bg-[#98dec9] transition-colors"
                  >
                    Generate
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0"
            >
              <img
                src="/split_pour.jpg"
                alt="Generated"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-emerald-400">Generated</span>
              </div>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleGenerate}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-xs text-white hover:bg-white/20 transition-colors"
              >
                Regenerate
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-800 overflow-hidden">
            <img src="/vintage.jpg" alt="Ref" className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] text-zinc-500">Style ref attached</span>
        </div>
        <span className="text-[10px] text-zinc-600 font-mono">v3.2 • VC-DIFFUSION</span>
      </div>
    </div>
  );
}

export function SectionCreate() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-20%" });
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (v) => {
      const step = Math.floor(v * GENERATION_STEPS.length);
      setActiveStep(Math.min(step, GENERATION_STEPS.length - 1));
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  return (
    <section
      ref={containerRef}
      id="create"
      className="relative py-32 sm:py-40 overflow-hidden bg-[#070809]"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#83D0BE]/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div ref={titleRef} className="mb-16">
          <motion.span
            className="inline-block px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Generation
          </motion.span>

          <motion.h2
            className="text-5xl sm:text-6xl md:text-7xl font-semibold text-white tracking-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Create.
          </motion.h2>

          <motion.p
            className="text-lg text-zinc-400 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Turn ideas into production-ready assets. Generation happens directly inside your project, with full continuity.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="mb-12">
          <div className="flex items-start justify-between max-w-2xl">
            {GENERATION_STEPS.map((step, index) => (
              <StepIndicator
                key={step.id}
                step={step}
                index={index}
                isActive={index <= activeStep}
              />
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Canvas */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <GenerationCanvas />
          </motion.div>

          {/* Features */}
          <div className="space-y-6">
            <motion.h3
              className="text-2xl font-semibold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Native AI, native workflow
            </motion.h3>

            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-sm font-medium text-zinc-200 mb-1 group-hover:text-[#83D0BE] transition-colors">
                  {feature.title}
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionCreate;
