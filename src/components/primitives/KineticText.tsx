"use client";

/**
 * KineticText
 * Typography that moves with purpose.
 * Not decorative - communicates hierarchy and meaning.
 */

import React, { useRef, useEffect } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { gsap } from "gsap";

interface KineticTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  variant?: "hero" | "display" | "headline" | "body";
  animate?: "chars" | "words" | "lines" | "reveal" | "slide";
  delay?: number;
  stagger?: number;
  duration?: number;
}

// Character animation - reveals each character
export function KineticText({
  children,
  className = "",
  as: Component = "span",
  variant = "body",
  animate = "chars",
  delay = 0,
  stagger = 0.02,
  duration = 0.5,
}: KineticTextProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const text = children;
  const chars = text.split("");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const charVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      rotateX: -90,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <Component
      ref={ref as any}
      className={`inline-block ${className}`}
      style={{ perspective: "1000px" }}
    >
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="inline-block"
        style={{ transformStyle: "preserve-3d" }}
      >
        {chars.map((char, i) => (
          <motion.span
            key={i}
            variants={charVariants}
            className="inline-block"
            style={{ 
              transformStyle: "preserve-3d",
              whiteSpace: char === " " ? "pre" : undefined,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
}

// Word animation - reveals word by word
export function KineticWords({
  children,
  className = "",
  delay = 0,
  stagger = 0.1,
}: {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const words = children.split(" ");

  return (
    <span ref={ref} className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block overflow-hidden"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: delay + i * stagger, duration: 0.01 }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "100%" }}
            animate={isInView ? { y: 0 } : {}}
            transition={{
              delay: delay + i * stagger,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </motion.span>
      ))}
    </span>
  );
}

// Reveal animation - clip path reveal
export function RevealText({
  children,
  className = "",
  delay = 0,
  duration = 1.2,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: 0 } : {}}
        transition={{
          delay,
          duration,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Split headline - dramatic typography treatment
export function SplitHeadline({
  top,
  bottom,
  className = "",
}: {
  top: string;
  bottom: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className={`${className}`}>
      <div className="overflow-hidden">
        <motion.div
          initial={{ y: "100%", rotateX: -20 }}
          animate={isInView ? { y: 0, rotateX: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "bottom" }}
        >
          <span className="block text-zinc-500">{top}</span>
        </motion.div>
      </div>
      <div className="overflow-hidden">
        <motion.div
          initial={{ y: "100%", rotateX: -20 }}
          animate={isInView ? { y: 0, rotateX: 0 } : {}}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "bottom" }}
        >
          <span className="block text-[#83D0BE]">{bottom}</span>
        </motion.div>
      </div>
    </div>
  );
}

// Technical label - small mono text
export function TechLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-[0.6875rem] tracking-[0.14em] uppercase text-zinc-500 ${className}`}
    >
      {children}
    </span>
  );
}

// Line animation - draws a line
export function AnimatedLine({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        className="h-px bg-[#83D0BE]/30"
        initial={{ scaleX: 0, originX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{
          delay,
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </div>
  );
}
