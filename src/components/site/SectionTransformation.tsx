"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const TRANSFORMATION_STEPS = [
  { phase: "01", title: "Fragmented", desc: "8 tools. 8 contexts. 8 workflows.", progress: 0 },
  { phase: "02", title: "Movement", desc: "What if...", progress: 0.3 },
  { phase: "03", title: "Convergence", desc: "...it was one?", progress: 0.6 },
  { phase: "04", title: "Emergence", desc: "One creative environment.", progress: 1 },
];

export function SectionTransformation() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <section
      ref={sectionRef}
      id="transformation"
      className="relative min-h-screen py-32 overflow-hidden bg-[#070809]"
      style={{ perspective: "1500px" }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle 600px at 50% 50%, rgba(131,208,190,0.05), transparent 70%)",
          opacity: useTransform(progress, [0, 0.5], [0.2, 0.8]),
        }}
      />

      {/* Central convergence */}
      <div className="relative z-10 h-screen flex flex-col items-center justify-center">
        {/* Phase indicator */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-[11px] font-mono tracking-[0.14em] text-[#52525B] uppercase">
              Transformation
            </span>
          </motion.div>
        </div>

        {/* Convergence visualization */}
        <div className="relative w-[400px] h-[400px]" style={{ transformStyle: "preserve-3d" }}>
          {/* Orbiting lines */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <motion.div
              key={angle}
              className="absolute top-1/2 left-1/2 w-[300px] h-[1px] origin-left"
              style={{
                rotate: angle,
                background: "linear-gradient(90deg, rgba(131,208,190,0.3), transparent)",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1 }}
            >
              <motion.div
                className="absolute right-0 w-2 h-2 rounded-full bg-[#83D0BE]/50"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            </motion.div>
          ))}

          {/* Central mark */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="w-40 h-40 rounded-full border border-[#83D0BE]/30 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-[60px] text-[#83D0BE]">◎</span>
            </motion.div>
          </motion.div>

          {/* Expanding ring */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-[#83D0BE]/20"
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        {/* Typography */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.h2
            className="text-[clamp(36px,5vw,64px)] font-semibold tracking-[-0.03em] text-[#F4F4F5]"
          >
            One connected
            <br />
            <span className="text-[#83D0BE]">creative environment</span>
          </motion.h2>
          <motion.p
            className="mt-6 text-[16px] text-[#71717A] max-w-md mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            Everything you need to create — unified, connected, intelligent.
          </motion.p>
        </motion.div>

        {/* Progress steps */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-8">
          {TRANSFORMATION_STEPS.map((step, i) => (
            <motion.div
              key={step.phase}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <span className="text-[10px] font-mono text-[#52525B]">
                {step.phase}
              </span>
              <div className="mt-1 text-[13px] text-[#71717A]">
                {step.title}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SectionTransformation;
