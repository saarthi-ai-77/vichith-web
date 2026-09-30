"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const WORKFLOW_NODES = [
  {
    id: "ref",
    step: "01",
    title: "Reference",
    role: "Visual Archetype",
    detail: "Moodboard images, color palette, actor consistency seed, aspect ratio standard.",
    output: "Scene Manifest (.json)",
  },
  {
    id: "shot",
    step: "02",
    title: "Shot Breakdown",
    role: "Director Notes",
    detail: "Scene prompt broken into camera angles, lens lengths, movement types, and beats.",
    output: "Beat Sheet & Prompts",
  },
  {
    id: "gen",
    step: "03",
    title: "Generate",
    role: "Asset Synthesis",
    detail: "Parallel video generation anchored by project seeds and style constraints.",
    output: "4K Master Plates",
  },
  {
    id: "edit",
    step: "04",
    title: "Edit NLE",
    role: "Timeline Conform",
    detail: "Automatic rough cut Assembly onto multi-track timeline with ripple alignment.",
    output: "Synchronized Sequence",
  },
  {
    id: "motion",
    step: "05",
    title: "Motion",
    role: "Semantic Easing",
    detail: "Vector typography entrance, dynamic titles, camera micro-pushes, and transitions.",
    output: "Composited Layers",
  },
  {
    id: "review",
    step: "06",
    title: "Review & Conform",
    role: "Director Sign-off",
    detail: "Iterate with Chithra on pacing, audio crossfades, and master color profile.",
    output: "ProRes 4444 Master",
  },
];

// Node component
function WorkflowNode({ node, index, isSelected, onClick }: { node: typeof WORKFLOW_NODES[0]; index: number; isSelected: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className={`group relative flex flex-col p-4 rounded-xl border text-left transition-all duration-300 ${
        isSelected
          ? "border-[#83D0BE]/50 bg-[#83D0BE]/[0.05]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true }}
    >
      {/* Step number */}
      <span className="text-[10px] font-mono text-zinc-600 mb-2">{node.step}</span>

      {/* Title */}
      <h4 className={`text-sm font-medium mb-1 transition-colors ${isSelected ? "text-[#83D0BE]" : "text-zinc-200 group-hover:text-white"}`}>
        {node.title}
      </h4>

      {/* Role */}
      <span className="text-[10px] text-zinc-500">{node.role}</span>

      {/* Active indicator */}
      <div className="absolute top-4 right-4">
        <motion.div
          className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-[#83D0BE]" : "bg-zinc-700"}`}
          animate={isSelected ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    </motion.button>
  );
}

// Detail panel
function DetailPanel({ node }: { node: typeof WORKFLOW_NODES[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-white/[0.08] bg-zinc-900/50 p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono text-[#83D0BE] uppercase tracking-wider">
              Node {node.step}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-[10px] text-zinc-500">{node.title}</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-xl">
            {node.detail}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-[10px] text-zinc-500 block mb-1">Output Artifact</span>
          <span className="inline-block px-2 py-1 rounded border border-white/[0.08] bg-white/[0.03] text-[11px] text-zinc-300 font-mono">
            {node.output}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function SectionWorkflows() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [selectedNode, setSelectedNode] = useState(2); // Default to Generate

  return (
    <section
      ref={containerRef}
      id="workflows"
      className="relative py-32 sm:py-40 overflow-hidden bg-[#070809]"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            className="inline-block px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Production Pipeline
          </motion.span>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Turn creative work into a system.
          </motion.h2>

          <motion.p
            className="text-lg text-zinc-400 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Build repeatable production workflows without losing creative control.
          </motion.p>
        </div>

        {/* Workflow Container */}
        <motion.div
          className="rounded-2xl border border-white/[0.08] bg-zinc-900/30 p-6 sm:p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Pipeline visualization */}
          <div className="relative mb-8">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            {/* Nodes */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 relative z-10">
              {WORKFLOW_NODES.map((node, index) => (
                <WorkflowNode
                  key={node.id}
                  node={node}
                  index={index}
                  isSelected={index === selectedNode}
                  onClick={() => setSelectedNode(index)}
                />
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <AnimatePresence mode="wait">
            <DetailPanel key={selectedNode} node={WORKFLOW_NODES[selectedNode]} />
          </AnimatePresence>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          className="text-center mt-8 text-sm text-zinc-500"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Chain references, generation, editing, and motion into a seamless pipeline.
        </motion.p>
      </div>
    </section>
  );
}

export default SectionWorkflows;
