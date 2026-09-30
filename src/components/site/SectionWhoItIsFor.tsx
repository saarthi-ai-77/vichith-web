"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const REQUEST_ACCESS_URL = "https://app.vichith.in/request-access";

const DISCIPLINES = [
  "Filmmakers",
  "Creators",
  "Designers",
  "Directors",
  "Content Teams",
  "Creative Studios",
];

// Discipline pill
function DisciplinePill({ discipline, index }: { discipline: string; index: number }) {
  return (
    <motion.span
      className="inline-block px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] text-sm text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all duration-300 cursor-default"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
    >
      {discipline}
    </motion.span>
  );
}

export function SectionWhoItIsFor() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });

  return (
    <section
      ref={containerRef}
      className="relative py-32 sm:py-40 overflow-hidden bg-[#070809]"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            className="inline-block px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            For Creators
          </motion.span>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            For people who
            <br />
            <span className="text-[#83D0BE]">make things.</span>
          </motion.h2>

          {/* Disciplines */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {DISCIPLINES.map((discipline, index) => (
              <DisciplinePill key={discipline} discipline={discipline} index={index} />
            ))}
          </motion.div>
        </div>

        {/* Bottom statement */}
        <motion.p
          className="text-center text-base text-zinc-500 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Whether you&apos;re building one scene or an entire production, Vichith keeps the creative process connected.
        </motion.p>
      </div>
    </section>
  );
}

export default SectionWhoItIsFor;
