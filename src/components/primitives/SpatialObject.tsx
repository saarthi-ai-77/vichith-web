"use client";

/**
 * SpatialObject
 * Creates 3D spatial elements that exist in perspective space.
 * No cards. No rounded rectangles. Just depth and position.
 */

import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface SpatialObjectProps {
  children: React.ReactNode;
  className?: string;
  x?: number;
  y?: number;
  z?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  opacity?: number;
  perspective?: number;
  interactive?: boolean;
  onHover?: (isHovered: boolean) => void;
}

export function SpatialObject({
  children,
  className = "",
  x = 0,
  y = 0,
  z = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  scale = 1,
  opacity = 1,
  perspective = 1000,
  interactive = false,
  onHover,
}: SpatialObjectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15 };
  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={ref}
      className={`${className}`}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          transformStyle: "preserve-3d",
          x,
          y,
          z,
          rotateX: interactive ? rotateXSpring : rotateX,
          rotateY: interactive ? rotateYSpring : rotateY,
          rotateZ,
          scale: isHovered && interactive ? scale * 1.02 : scale,
          opacity,
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Creative Node - floating connected elements
export function CreativeNode({
  children,
  className = "",
  delay = 0,
  float = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  float?: boolean;
}) {
  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {float && (
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay * 0.5,
          }}
        >
          {children}
        </motion.div>
      )}
      {!float && children}
    </motion.div>
  );
}

// Connection Line - SVG line that connects nodes
export function ConnectionLine({
  from,
  to,
  className = "",
  delay = 0,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  className?: string;
  delay?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const pathLength = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));

  return (
    <svg
      ref={ref}
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
      }}
    >
      <motion.line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="rgba(131, 208, 190, 0.2)"
        strokeWidth="1"
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
      />
    </svg>
  );
}

// Depth Layer - creates layered depth effect
export function DepthLayer({
  children,
  className = "",
  depth = 0,
  blur = 0,
  opacity = 1,
}: {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  blur?: number;
  opacity?: number;
}) {
  return (
    <div
      className={`${className}`}
      style={{
        transform: `translateZ(${depth}px)`,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        opacity,
      }}
    >
      {children}
    </div>
  );
}

// Fragment - scattered element that converges
export function Fragment({
  children,
  className = "",
  initialX = 0,
  initialY = 0,
  initialRotateX = 0,
  initialRotateY = 0,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  initialX?: number;
  initialY?: number;
  initialRotateX?: number;
  initialRotateY?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={`${className}`}
      style={{ transformStyle: "preserve-3d" }}
      initial={{
        x: initialX,
        y: initialY,
        rotateX: initialRotateX,
        rotateY: initialRotateY,
        opacity: 0.4,
      }}
      whileInView={{
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        opacity: 1,
      }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{
        duration: 1.2,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
