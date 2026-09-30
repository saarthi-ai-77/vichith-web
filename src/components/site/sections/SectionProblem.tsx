"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SECTION_IDS } from "@/lib/spatial";

// Tools that scatter and fly in based on scroll
const SCATTERED_TOOLS = [
  { 
    id: "notes", 
    label: "IDEAS", 
    app: "Notes.app",
    startX: -200, 
    startY: -150, 
    endX: 0, 
    endY: 0,
    rotate: -15,
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
    delay: 0
  },
  { 
    id: "brainstorm", 
    label: "PLAN", 
    app: "Brainstorm",
    startX: 250, 
    startY: -200, 
    endX: 180, 
    endY: -60,
    rotate: 12,
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    delay: 0.05
  },
  { 
    id: "generator", 
    label: "GENERATE", 
    app: "Web UI",
    startX: 300, 
    startY: 100, 
    endX: 200, 
    endY: 80,
    rotate: 8,
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    delay: 0.1
  },
  { 
    id: "editor", 
    label: "EDIT", 
    app: "Premiere",
    startX: -250, 
    startY: 180, 
    endX: -120, 
    endY: 100,
    rotate: -10,
    color: "from-rose-500/20 to-red-500/20",
    borderColor: "border-rose-500/30",
    delay: 0.15
  },
  { 
    id: "captions", 
    label: "CAPTIONS", 
    app: "Sub-Tool",
    startX: 180, 
    startY: 250, 
    endX: 80, 
    endY: 140,
    rotate: 5,
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
    delay: 0.2
  },
  { 
    id: "audio", 
    label: "AUDIO", 
    app: "DAW",
    startX: -180, 
    startY: -250, 
    endX: -60, 
    endY: -100,
    rotate: -8,
    color: "from-indigo-500/20 to-violet-500/20",
    borderColor: "border-indigo-500/30",
    delay: 0.25
  },
];

// Pain points that reveal progressively
const PAIN_POINTS = [
  { id: "context", label: "Context Lost", desc: "Each tool forgets the previous step" },
  { id: "export", label: "Export Hell", desc: "Round-trips between apps" },
  { id: "files", label: "File Proliferation", desc: "Dozens of versions everywhere" },
  { id: "sync", label: "Sync Failures", desc: "References break constantly" },
];

// Connection lines between tools
const CONNECTIONS = [
  { from: 0, to: 1, curvature: 0.3 },
  { from: 1, to: 2, curvature: -0.2 },
  { from: 2, to: 3, curvature: 0.4 },
  { from: 3, to: 4, curvature: -0.3 },
  { from: 4, to: 5, curvature: 0.2 },
  { from: 5, to: 0, curvature: -0.4 },
];

export function SectionProblem() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Global progress for the entire section
  const globalProgress = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  
  // Tools fly in progress
  const toolsProgress = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);
  
  // Lines draw progress
  const linesProgress = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  
  // Pain points reveal
  const painPointsProgress = useTransform(scrollYProgress, [0.5, 0.8], [0, 1]);

  return (
    <section
      id={SECTION_IDS.problem}
      ref={containerRef}
      className="relative w-full min-h-[150vh] bg-[#070709] border-t border-white/[0.05] overflow-hidden"
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content wrapper */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 overflow-hidden">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-8 z-10"
          style={{
            opacity: useTransform(globalProgress, [0, 0.2], [0, 1]),
            y: useTransform(globalProgress, [0, 0.2], [30, 0]),
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              The Creative Bottleneck
            </span>
          </div>
          
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Your workflow is scattered
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-400">
              across seven tools.
            </span>
          </h2>
        </motion.div>

        {/* Scattered Tools Visualization */}
        <div className="relative w-full max-w-3xl h-[400px] flex items-center justify-center">
          
          {/* Connection lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
                <stop offset="50%" stopColor="rgba(249, 115, 22, 0.3)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0.3)" />
              </linearGradient>
            </defs>
            
            {CONNECTIONS.map((conn, idx) => {
              const fromTool = SCATTERED_TOOLS[conn.from];
              const toTool = SCATTERED_TOOLS[conn.to];
              
              // Calculate center positions
              const x1 = 50 + (fromTool.endX / 6); // Convert to percentage roughly
              const y1 = 50 + (fromTool.endY / 4);
              const x2 = 50 + (toTool.endX / 6);
              const y2 = 50 + (toTool.endY / 4);
              
              // Create curved path
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2 + conn.curvature * 20;
              const path = `M ${x1}% ${y1}% Q ${midX}% ${midY}% ${x2}% ${y2}%`;
              
              return (
                <motion.path
                  key={idx}
                  d={path}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  style={{
                    pathLength: useTransform(linesProgress, [0, 1], [0, 1]),
                    opacity: useTransform(linesProgress, [0, 0.5, 1], [0, 0.5, 0.3]),
                  }}
                />
              );
            })}
          </svg>

          {/* Scattered Tool Cards */}
          {SCATTERED_TOOLS.map((tool, idx) => {
            const x = useTransform(
              toolsProgress,
              [tool.delay, Math.min(1, tool.delay + 0.4)],
              [tool.startX, tool.endX]
            );
            const y = useTransform(
              toolsProgress,
              [tool.delay, Math.min(1, tool.delay + 0.4)],
              [tool.startY, tool.endY]
            );
            const rotate = useTransform(
              toolsProgress,
              [tool.delay, Math.min(1, tool.delay + 0.4)],
              [tool.rotate * 3, tool.rotate]
            );
            const scale = useTransform(
              toolsProgress,
              [tool.delay, Math.min(1, tool.delay + 0.2)],
              [0.6, 1]
            );
            const opacity = useTransform(
              toolsProgress,
              [tool.delay, Math.min(1, tool.delay + 0.2)],
              [0, 1]
            );

            return (
              <motion.div
                key={tool.id}
                className={`absolute w-28 sm:w-32 p-3 rounded-xl border ${tool.borderColor} bg-gradient-to-br ${tool.color} backdrop-blur-sm`}
                style={{
                  x,
                  y,
                  rotate,
                  scale,
                  opacity,
                  zIndex: 10,
                }}
              >
                {/* Card pattern */}
                <div className="absolute inset-0 opacity-10 rounded-xl overflow-hidden">
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                      backgroundSize: '8px 8px'
                    }}
                  />
                </div>
                
                <div className="relative">
                  <span className="text-[8px] font-mono text-white/40 block mb-1">{tool.app}</span>
                  <span className="text-xs font-mono font-semibold text-white/90 tracking-wider">{tool.label}</span>
                </div>

                {/* Corner accent */}
                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-br ${tool.color} blur-[2px]`} />
              </motion.div>
            );
          })}

          {/* Central Broken Connection Icon */}
          <motion.div
            className="absolute z-20"
            style={{
              opacity: useTransform(linesProgress, [0.5, 0.8], [0, 1]),
              scale: useTransform(linesProgress, [0.5, 0.8], [0.8, 1]),
            }}
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-400">
                <path d="M4 12H9M15 12H20M9 12L12 9M9 12L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Pain Points Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-2xl w-full">
          {PAIN_POINTS.map((point, idx) => {
            const pointProgress = useTransform(
              painPointsProgress,
              [idx * 0.2, (idx * 0.2) + 0.3],
              [0, 1]
            );

            return (
              <motion.div
                key={point.id}
                className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
                style={{
                  opacity: pointProgress,
                  y: useTransform(pointProgress, [0, 1], [20, 0]),
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                  <span className="text-[10px] font-mono text-red-400/80 uppercase tracking-wider">{point.label}</span>
                </div>
                <p className="text-[10px] text-white/40 leading-tight">{point.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Question */}
        <motion.p
          className="mt-8 text-sm text-white/30 font-mono text-center"
          style={{
            opacity: useTransform(painPointsProgress, [0.5, 1], [0, 1]),
          }}
        >
          What if everything worked as one system?
        </motion.p>
      </div>
    </section>
  );
}
