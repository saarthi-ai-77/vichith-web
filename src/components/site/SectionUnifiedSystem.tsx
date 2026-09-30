"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FLOW_STEPS = [
  { id: "script", title: "Script", subtitle: "THE SPARK", number: "01", angle: 0 },
  { id: "scenes", title: "Scenes", subtitle: "THE VISION", number: "02", angle: 51.4 },
  { id: "shots", title: "Shots", subtitle: "THE PLAN", number: "03", angle: 102.8 },
  { id: "generate", title: "Generate", subtitle: "THE MAGIC", number: "04", angle: 154.2 },
  { id: "edit", title: "Edit", subtitle: "THE CRAFT", number: "05", angle: 205.6 },
  { id: "motion", title: "Motion", subtitle: "THE SOUL", number: "06", angle: 257 },
  { id: "complete", title: "Complete", subtitle: "THE FRAME", number: "07", angle: 308.4 },
];

const FEATURES = [
  { title: "Seamless Context", desc: "Chithra remembers every decision across the entire project", icon: "◎" },
  { title: "Native AI Integration", desc: "Generation happens in your timeline, not in separate tabs", icon: "◈" },
  { title: "Professional Output", desc: "Industry-standard codecs ready for any distribution", icon: "◉" },
];

export function SectionUnifiedSystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Scroll-triggered circular progress
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        onUpdate: (self) => {
          const prog = self.progress;
          setProgress(prog);
          const stepIndex = Math.min(Math.floor(prog * FLOW_STEPS.length), FLOW_STEPS.length - 1);
          setActiveStep(stepIndex);
        },
      });

      // Animate features on scroll
      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0, rotateX: 10 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Title animation
      gsap.fromTo(
        ".unified-title",
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".unified-title",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const radius = 220;

  return (
    <section
      ref={sectionRef}
      id="unified-system"
      className="relative py-32 sm:py-40 overflow-hidden bg-[#070809]"
      style={{ perspective: "1500px" }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-[#83D0BE]/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-6">
            The Solution
          </span>

          <h2 className="unified-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight mb-4">
            One connected
            <br />
            <span className="text-[#83D0BE]">creative environment</span>
          </h2>

          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            From first idea to final frame — everything in one intelligent system
          </p>
        </div>

        {/* 3D Circular Flow Visualization */}
        <div
          ref={containerRef}
          className="relative h-[600px] mb-20"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Central hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              {/* Rotating rings */}
              <motion.div
                className="absolute inset-0 rounded-full border border-[#83D0BE]/10"
                style={{ width: 160, height: 160, margin: -20 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-white/[0.05]"
                style={{ width: 200, height: 200, margin: -40 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />

              {/* Center */}
              <div className="w-24 h-24 rounded-full border border-[#83D0BE]/30 bg-[#070809]/90 flex flex-col items-center justify-center">
                <span className="text-2xl text-[#83D0BE]">◎</span>
                <span className="text-[10px] font-mono text-zinc-500 mt-1">VICHITH</span>
              </div>
            </div>
          </div>

          {/* Circular progress track */}
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
            viewBox="0 0 500 500"
          >
            {/* Background track */}
            <circle
              cx="250"
              cy="250"
              r="220"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
            {/* Progress track */}
            <motion.circle
              cx="250"
              cy="250"
              r="220"
              fill="none"
              stroke="#83D0BE"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                strokeDasharray: 1382,
                strokeDashoffset: 1382 - (1382 * progress),
                transformOrigin: "center",
                transform: "rotate(-90deg)",
              }}
            />
          </svg>

          {/* Steps positioned on circle */}
          {FLOW_STEPS.map((step, index) => {
            const angle = (step.angle - 90) * (Math.PI / 180);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isActive = index <= activeStep;
            const isCurrent = index === activeStep;

            return (
              <motion.div
                key={step.id}
                className="absolute left-1/2 top-1/2"
                style={{
                  x,
                  y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <motion.div
                  className={`relative p-4 rounded-xl border transition-all duration-500 ${
                    isCurrent
                      ? "border-[#83D0BE]/50 bg-[#83D0BE]/5 scale-110"
                      : isActive
                      ? "border-white/[0.08] bg-white/[0.02]"
                      : "border-white/[0.04] bg-white/[0.01] opacity-50"
                  }`}
                  style={{
                    boxShadow: isCurrent
                      ? "0 25px 50px -12px rgba(131, 208, 190, 0.15)"
                      : "none",
                    transform: `translateZ(${isCurrent ? 50 : 0}px)`,
                  }}
                  whileHover={{ scale: 1.05, z: 30 }}
                >
                  {/* Step number */}
                  <span className="text-[10px] font-mono text-zinc-600 block mb-1">
                    {step.number}
                  </span>

                  {/* Title */}
                  <h3
                    className={`text-sm font-medium mb-1 ${
                      isCurrent ? "text-[#83D0BE]" : "text-zinc-300"
                    }`}
                  >
                    {step.title}
                  </h3>

                  {/* Subtitle */}
                  <span
                    className={`text-[9px] uppercase tracking-widest ${
                      isCurrent ? "text-[#83D0BE]/70" : "text-zinc-600"
                    }`}
                  >
                    {step.subtitle}
                  </span>

                  {/* Active indicator */}
                  {isCurrent && (
                    <motion.div
                      className="absolute -inset-px rounded-xl border border-[#83D0BE]/30"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Features Grid with 3D cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="feature-card group relative p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
              style={{
                transformStyle: "preserve-3d",
                transform: "perspective(1000px)",
              }}
            >
              {/* Icon */}
              <div className="text-3xl text-zinc-700 group-hover:text-[#83D0BE]/20 transition-colors mb-4">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-base font-medium text-zinc-200 mb-2 group-hover:text-[#83D0BE] transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {feature.desc}
              </p>

              {/* Hover line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#83D0BE]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))}
        </div>

        {/* Bottom summary */}
        <div className="text-center mt-16">
          <p className="text-sm font-mono text-zinc-600 tracking-wide">
            Script → Scenes → Shots → Generate → Edit → Motion → Complete
          </p>
        </div>
      </div>
    </section>
  );
}

export default SectionUnifiedSystem;
