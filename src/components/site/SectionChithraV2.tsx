"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CONVERSATION_BEATS = [
  {
    role: "user",
    sender: "YOU",
    text: "I want a cinematic shot of a solitary lighthouse at sunset, warm golden light.",
    timestamp: "14:24:02",
  },
  {
    role: "thinking",
    sender: "CHITHRA",
    text: "Analyzing project moodboard · Referencing coastal color profiles...",
    timestamp: "14:24:03",
  },
  {
    role: "assistant",
    sender: "CHITHRA",
    text: "Should this be an isolated wide shot, or the opening frame of a camera push-in?",
    timestamp: "14:24:04",
  },
  {
    role: "user",
    sender: "YOU",
    text: "Just one held shot. Make it feel like a memory, not a postcard.",
    timestamp: "14:24:05",
  },
  {
    role: "proposal",
    sender: "MODEL ARBITER",
    model: "Seedream 4.5",
    reason: "Best held reference fidelity and low-light dynamic range.",
    cost: "4 Credits",
    timestamp: "14:24:06",
  },
  {
    role: "result",
    sender: "PROJECT TIMELINE",
    caption: "Lighthouse_Sunset_Master_01.png · 4K",
    timestamp: "14:24:08",
  },
];

export function SectionChithraV2() {
  const containerRef = useRef<HTMLElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const beatsRef = useRef<(HTMLDivElement | null)[]>([]);
  const developFrameRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(CONVERSATION_BEATS.length);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        leftContentRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }
      );

      beatsRef.current.forEach((beat, idx) => {
        if (!beat) return;
        tl.fromTo(
          beat,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
          idx * 0.12
        );
      });

      if (developFrameRef.current) {
        tl.fromTo(
          developFrameRef.current,
          { filter: "blur(16px) saturate(0.2)" },
          { filter: "blur(0px) saturate(1)", duration: 1.2, ease: "power2.inOut" },
          "-=0.4"
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="chithra"
      className="relative min-h-screen py-32 px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden z-10"
    >
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Intelligence Story (lg:col-span-5) */}
        <div ref={leftContentRef} className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#83D0BE]/30 bg-[#83D0BE]/[0.05] shadow-[0_0_20px_rgba(131,208,190,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#83D0BE]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#83D0BE]">
              Cognitive Layer
            </span>
          </div>

          <h2 className="font-display text-[clamp(34px,4.5vw,56px)] font-light leading-[1.05] tracking-[-0.03em] text-[#F4F4F5]">
            Intelligence that works with your{" "}
            <span className="italic font-serif text-[#83D0BE]">intent.</span>
          </h2>

          <p className="text-[16px] text-[#8E9196] font-light leading-relaxed">
            Chithra is not an external chatbot window. It is the intelligence
            woven directly into your project graph. It remembers your visual
            anchors, routes requests to optimal generative models, and lands
            assets straight onto your timeline.
          </p>

          {/* 3 Core Competencies Badge List */}
          <div className="space-y-4 pt-2">
            {[
              {
                title: "Contextual Continuity",
                desc: "Never re-explain your aesthetic. Chithra maintains character, lighting, and palette rules across all shots.",
              },
              {
                title: "Model Governance",
                desc: "Autonomous cost and quality routing. Recommends the right engine without trial and error.",
              },
              {
                title: "Direct Timeline Manipulation",
                desc: "Updates cuts, color grades, and mask layers directly on the timeline canvas.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-center gap-2 font-mono text-[12px] text-[#F4F4F5] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#83D0BE]" />
                  <span>{item.title}</span>
                </div>
                <p className="text-[13px] text-[#8E9196] mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Conversation Simulation (lg:col-span-7) */}
        <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#0A0C0E]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-5">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#83D0BE] animate-pulse" />
              <span className="font-mono text-xs text-[#F4F4F5] font-semibold tracking-wider">
                CHITHRA ORCHESTRATION GRAPH
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#8E9196]">
              SESSION ID: 75006-CHITHRA
            </span>
          </div>

          {/* Stream of Messages */}
          <div className="space-y-4">
            {CONVERSATION_BEATS.map((beat, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  beatsRef.current[idx] = el;
                }}
                className={`flex flex-col ${
                  beat.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* User Message */}
                {beat.role === "user" && (
                  <div className="max-w-md p-4 rounded-2xl rounded-br-sm border border-white/[0.12] bg-[#14181A] text-right space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#8E9196]">
                      {beat.sender} · {beat.timestamp}
                    </span>
                    <p className="text-sm text-[#F4F4F5] leading-relaxed">
                      {beat.text}
                    </p>
                  </div>
                )}

                {/* Thinking Indicator */}
                {beat.role === "thinking" && (
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/[0.06] bg-black/40 font-mono text-[11px] text-[#8E9196]">
                    <span className="w-2 h-2 rounded-full bg-[#83D0BE] animate-ping" />
                    <span>{beat.text}</span>
                  </div>
                )}

                {/* Assistant Message */}
                {beat.role === "assistant" && (
                  <div className="max-w-md p-4 rounded-2xl rounded-bl-sm border border-[#83D0BE]/20 bg-[#0C1211] space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#83D0BE]">
                      {beat.sender} · {beat.timestamp}
                    </span>
                    <p className="text-sm text-[#F4F4F5] leading-relaxed">
                      {beat.text}
                    </p>
                  </div>
                )}

                {/* Model Recommendation Proposal Chip */}
                {beat.role === "proposal" && (
                  <div className="w-full p-4 rounded-xl border border-white/[0.08] bg-black/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-white/[0.08] font-mono text-[10px] text-white">
                          MODEL PROPOSAL
                        </span>
                        <span className="text-sm font-semibold text-[#F4F4F5]">
                          {beat.model}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#83D0BE] font-bold">
                        {beat.cost}
                      </span>
                    </div>
                    <p className="text-xs text-[#8E9196]">{beat.reason}</p>
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/50 font-mono">
                      <span>AUTO-APPROVAL THRESHOLD: VERIFIED</span>
                      <span className="text-[#83D0BE]">✓ EXECUTING</span>
                    </div>
                  </div>
                )}

                {/* Developing Result Frame */}
                {beat.role === "result" && (
                  <div className="w-full space-y-2 pt-2">
                    <div
                      ref={developFrameRef}
                      className="w-full aspect-video rounded-xl overflow-hidden border border-[#83D0BE]/40 shadow-[0_0_35px_rgba(131,208,190,0.15)] relative"
                    >
                      <img
                        src="/lighthouse.jpg"
                        alt="Generated Lighthouse Master"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded border border-white/[0.1] font-mono text-[10px] text-[#F4F4F5]">
                        ✓ Landed onto Video Track 01
                      </div>
                    </div>
                    <p className="font-mono text-[11px] text-[#8E9196] italic text-center">
                      &ldquo;A solitary lighthouse, warm golden light&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
