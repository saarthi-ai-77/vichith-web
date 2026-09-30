"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const EDIT_COMMANDS = [
  {
    command: 'Trim 1.2s from the head',
    response: 'Removed 1.2s, ripple-synced tracks',
    icon: '✂',
  },
  {
    command: 'Insert B-roll over dialogue',
    response: 'Added to V2, ducked audio 3dB',
    icon: '▣',
  },
  {
    command: 'Move title to safe margins',
    response: 'Repositioned Y: 72% → 84%',
    icon: '◎',
  },
];

const TRACKS = [
  { id: 'V3', name: 'V3 GRAPHICS', type: 'video', clips: [] },
  { id: 'V2', name: 'V2 B-ROLL', type: 'video', clips: [{ color: 'bg-zinc-700', width: 'w-24' }] },
  { id: 'V1', name: 'V1 VIDEO', type: 'video', clips: [{ color: 'bg-zinc-600', width: 'w-32' }, { color: 'bg-zinc-600', width: 'w-20' }, { color: 'bg-zinc-600', width: 'w-28' }] },
  { id: 'A2', name: 'A2 SCORE', type: 'audio', waveform: true },
  { id: 'A1', name: 'A1 VOICE', type: 'audio', waveform: true },
];

// Command item
function CommandItem({ cmd, index, isActive, onClick }: { cmd: typeof EDIT_COMMANDS[0]; index: number; isActive: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
        isActive
          ? 'border-[#83D0BE]/30 bg-[#83D0BE]/5'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-zinc-500 text-sm">$</span>
        <div className="flex-1">
          <p className="text-sm text-zinc-200 font-mono">{cmd.command}</p>
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 pt-2 border-t border-white/[0.06]"
              >
                <p className="text-xs text-[#83D0BE] font-mono">→ {cmd.response}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.button>
  );
}

// Timeline track
function TimelineTrack({ track, index, isExpanded }: { track: typeof TRACKS[0]; index: number; isExpanded: boolean }) {
  return (
    <motion.div
      className="flex items-center gap-2 py-1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
    >
      {/* Track label */}
      <div className="w-20 flex-shrink-0">
        <span className="text-[10px] font-mono text-zinc-500">{track.name}</span>
      </div>

      {/* Track content */}
      <div className="flex-1 h-8 rounded bg-white/[0.02] border border-white/[0.04] relative overflow-hidden">
        {track.clips && track.clips.map((clip, i) => (
          <motion.div
            key={i}
            className={`absolute top-1 bottom-1 rounded ${clip.color} border border-white/[0.1]`}
            style={{
              left: `${i * 35 + 5}%`,
              width: clip.width.replace('w-', ''),
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
          />
        ))}
        {track.waveform && (
          <div className="absolute inset-x-2 inset-y-1 flex items-center gap-px">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-zinc-600 rounded-full"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.4 + i * 0.01 }}
              />
            ))}
          </div>
        )}
        
        {/* Playhead */}
        {isExpanded && (
          <motion.div
            className="absolute top-0 bottom-0 w-px bg-[#83D0BE]"
            initial={{ left: '0%' }}
            animate={{ left: ['0%', '40%', '40%'] }}
            transition={{ duration: 2, times: [0, 0.5, 1] }}
          >
            <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 bg-[#83D0BE] rounded-full" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function SectionEdit() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [activeCommand, setActiveCommand] = useState(0);

  return (
    <section
      ref={containerRef}
      id="editor"
      className="relative py-32 sm:py-40 overflow-hidden bg-[#070809]"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#83D0BE]/[0.02] blur-[150px] rounded-full" />
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
            Timeline Editor
          </motion.span>

          <motion.h2
            className="text-5xl sm:text-6xl md:text-7xl font-semibold text-white tracking-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Edit.
          </motion.h2>

          <motion.p
            className="text-lg text-zinc-400 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            AI that operates the timeline — not just generates beside it.
          </motion.p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Commands Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="rounded-xl border border-white/[0.08] bg-zinc-900/50 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <span className="text-zinc-500 text-xs">❯</span>
                <span className="text-xs font-medium text-zinc-300">chithra-edit</span>
                <span className="text-zinc-600 text-xs">—</span>
                <span className="text-[10px] text-zinc-500 font-mono">v2.4.1</span>
              </div>

              {/* Commands */}
              <div className="p-4 space-y-3">
                {EDIT_COMMANDS.map((cmd, index) => (
                  <CommandItem
                    key={cmd.command}
                    cmd={cmd}
                    index={index}
                    isActive={activeCommand === index}
                    onClick={() => setActiveCommand(index)}
                  />
                ))}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-2">
                <span className="text-[#83D0BE] text-xs">$</span>
                <span className="text-xs text-zinc-500">Describe what you want...</span>
                <motion.span
                  className="w-px h-4 bg-zinc-500 ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { label: 'Frame-accurate', value: '1/24s' },
                { label: 'Ripple sync', value: 'Multi-track' },
                { label: 'Natural language', value: 'Commands' },
                { label: 'Context aware', value: 'Project-wide' },
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

          {/* Timeline Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="rounded-xl border border-white/[0.08] bg-zinc-900/50 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400 text-xs">▶</span>
                  <span className="text-xs font-medium text-zinc-300">Timeline</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">00:01:24:12</span>
              </div>

              {/* Timeline ruler */}
              <div className="px-4 py-2 border-b border-white/[0.06] flex items-center">
                <div className="w-20" />
                <div className="flex-1 flex">
                  {['00:00', '00:30', '01:00', '01:30', '02:00'].map((time) => (
                    <span key={time} className="flex-1 text-[9px] text-zinc-600 font-mono">
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tracks */}
              <div className="p-4 space-y-1">
                {TRACKS.map((track, index) => (
                  <TimelineTrack
                    key={track.id}
                    track={track}
                    index={index}
                    isExpanded={activeCommand >= 0}
                  />
                ))}
              </div>

              {/* Preview monitor */}
              <div className="px-4 pb-4">
                <div className="rounded bg-black aspect-video flex items-center justify-center border border-white/[0.06]">
                  <div className="text-center">
                    <span className="text-zinc-600 text-xs font-mono">PROGRAM OUT</span>
                    <p className="text-zinc-500 text-[10px] mt-1">2.39:1 · 4K</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SectionEdit;
