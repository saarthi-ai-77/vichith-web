"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const FRAGMENTS = [
  { label: "SCRIPT", x: -35, y: -25, z: -200, rotateX: 20, rotateY: -25 },
  { label: "STORYBOARD", x: 30, y: -20, z: 100, rotateX: -15, rotateY: 30 },
  { label: "ASSETS", x: -25, y: 15, z: -150, rotateX: 25, rotateY: -20 },
  { label: "TIMELINE", x: 35, y: 20, z: 120, rotateX: -20, rotateY: 25 },
  { label: "GENERATION", x: -30, y: 30, z: -100, rotateX: 15, rotateY: -30 },
  { label: "CHARACTER", x: 20, y: -30, z: 150, rotateX: -25, rotateY: 20 },
  { label: "SCENE", x: -20, y: -15, z: -250, rotateX: 30, rotateY: -15 },
  { label: "REFERENCE", x: 40, y: 25, z: 80, rotateX: -18, rotateY: 35 },
];

export function SectionFragmentation() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const driftX = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <section
      ref={sectionRef}
      id="fragmentation"
      className="relative min-h-screen py-32 overflow-hidden bg-[#070809]"
      style={{ perspective: "1500px" }}
    >
      {/* Title */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 mb-20">
        <motion.h2
          className="text-[clamp(32px,5vw,48px)] font-semibold tracking-[-0.02em] text-[#F4F4F5] text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Creating shouldn&apos;t mean
          <br />
          <span className="text-[#71717A]">switching between everything.</span>
        </motion.h2>
        <motion.p
          className="mt-6 text-[16px] text-[#71717A] text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          The current creative workflow is fragmented.
        </motion.p>
      </div>

      {/* Scattered fragments */}
      <div 
        className="relative h-[600px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {FRAGMENTS.map((fragment, index) => (
          <motion.div
            key={fragment.label}
            className="absolute left-1/2 top-1/2"
            style={{
              x: `${fragment.x}%`,
              y: `${fragment.y}%`,
              z: fragment.z,
              transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <motion.div
              className="relative border border-white/[0.06] px-6 py-4"
              style={{
                rotateX: fragment.rotateX,
                rotateY: fragment.rotateY,
                transformStyle: "preserve-3d",
              }}
              animate={{
                rotateX: [fragment.rotateX, fragment.rotateX + 3, fragment.rotateX],
                rotateY: [fragment.rotateY, fragment.rotateY - 3, fragment.rotateY],
              }}
              transition={{
                duration: 6 + index,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="text-[12px] font-mono tracking-[0.12em] text-white/[0.4]">
                {fragment.label}
              </span>
              
              {/* Connection lines */}
              <svg
                className="absolute top-full left-1/2 -translate-x-1/2 w-20 h-20 pointer-events-none"
                style={{ transform: "translateZ(-10px)" }}
              >
                <motion.line
                  x1="50%"
                  y1="0"
                  x2="50%"
                  y2="100%"
                  stroke="rgba(131, 208, 190, 0.1)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </svg>
            </motion.div>
          </motion.div>
        ))}

        {/* Central void */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-[#83D0BE]/10 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="text-center">
            <span className="text-[10px] font-mono tracking-[0.1em] text-white/[0.3]">
              CREATOR
            </span>
            <span className="block text-[#83D0BE] text-[14px] font-medium mt-1">
              YOU
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom transition */}
      <motion.div
        className="relative z-10 mt-20 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <p className="text-[24px] text-[#F4F4F5] font-light">
          What if all of this happened in{" "}
          <span className="text-[#83D0BE] font-medium">one place</span>?
        </p>
      </motion.div>
    </section>
  );
}

export default SectionFragmentation;
