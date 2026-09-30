"use client";

import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform, useSpring } from "framer-motion";

const CREATIVE_STEPS = [
  { id: "idea", number: "01", title: "Idea", subtitle: "Premise", desc: "Voice intent & moodboard seed" },
  { id: "create", number: "02", title: "Create", subtitle: "Synthesis", desc: "Synthesizing 4K visual frames" },
  { id: "edit", number: "03", title: "Edit", subtitle: "Rough Cut", desc: "Timeline cutting & ripple sync" },
  { id: "move", number: "04", title: "Move", subtitle: "Motion Pass", desc: "Natural easing & camera motion" },
  { id: "review", number: "05", title: "Review", subtitle: "Color & Sound", desc: "Full-speed playback preview" },
  { id: "iterate", number: "06", title: "Iterate", subtitle: "Director Iteration", desc: "Refining with Chithra in loop" },
];

// Step item
function CreativeStep({ step, index }: { step: typeof CREATIVE_STEPS[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      className="relative flex items-start gap-6 group"
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Step indicator */}
      <div className="relative flex flex-col items-center">
        <div className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center group-hover:border-[#83D0BE]/30 group-hover:bg-[#83D0BE]/5 transition-all duration-300">
          <span className="text-xs font-mono text-zinc-500 group-hover:text-[#83D0BE] transition-colors">
            {step.number}
          </span>
        </div>
        {index < CREATIVE_STEPS.length - 1 && (
          <div className="w-px h-12 bg-white/[0.06]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-2 pb-12">
        <div className="flex items-baseline gap-2 mb-1">
          <h4 className="text-base font-medium text-zinc-200 group-hover:text-white transition-colors">
            {step.title}
          </h4>
          <span className="text-[10px] text-zinc-600 font-mono">{step.subtitle}</span>
        </div>
        <p className="text-sm text-zinc-500">{step.desc}</p>
      </div>
    </motion.div>
  );
}

export function SectionCreativeLoop() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });

  return (
    <section
      ref={containerRef}
      className="relative py-32 sm:py-40 overflow-hidden bg-[#070809]"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Header */}
          <div>
            <motion.span
              className="inline-block px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              Iteration
            </motion.span>

            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Creation doesn&apos;t
              <br />
              happen once.
            </motion.h2>

            <motion.p
              className="text-lg text-zinc-400 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Build. See it. Change it. Keep going.
            </motion.p>

            {/* Quote */}
            <motion.blockquote
              className="border-l-2 border-[#83D0BE]/30 pl-4"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-base text-zinc-400 italic">
                &ldquo;The loop is where the magic happens. Not in the first try, but in the hundredth refinement.&rdquo;
              </p>
            </motion.blockquote>
          </div>

          {/* Right: Steps */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Loop visualization */}
            <div className="relative mb-8">
              <div className="flex items-center justify-center">
                <motion.div
                  className="w-32 h-32 rounded-full border border-white/[0.08] flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <motion.div
                    className="absolute w-3 h-3 rounded-full bg-[#83D0BE]/50"
                    style={{ top: '-6px', left: '50%', marginLeft: '-6px' }}
                  />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl text-[#83D0BE]">↻</span>
                </div>
              </div>
            </div>

            {/* Steps list */}
            <div className="space-y-0">
              {CREATIVE_STEPS.map((step, index) => (
                <CreativeStep key={step.id} step={step} index={index} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SectionCreativeLoop;
