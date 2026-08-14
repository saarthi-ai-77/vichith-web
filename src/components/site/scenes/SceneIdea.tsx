"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function SceneIdea() {
  const textRef = useRef<HTMLDivElement>(null);

  // We rely on the global camera rig for movement, but we can add micro-interactions here
  useEffect(() => {
    // Optional: Add subtle floating animation unrelated to scroll
    gsap.to(textRef.current, {
      y: "-=20",
      rotationX: 2,
      rotationY: -2,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <div
      className="scene absolute inset-0 flex flex-col items-center justify-center preserve-3d"
      style={{ transform: "translateZ(0px)" }}
      data-z="0"
    >
      <div className="flex flex-col items-center justify-center w-full select-none px-4 md:px-0" ref={textRef}>
        
        {/* Top: Where */}
        <div className="w-full md:max-w-[70vw] flex justify-center md:justify-start mb-6 md:mb-[1vw]">
          <span className="text-3xl md:text-[4.5vw] font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent/70 to-foreground/50 md:ml-[18vw]">Where</span>
        </div>
        
        {/* Middle: your IDEAs become */}
        <div className="flex flex-col md:flex-row items-center md:items-baseline justify-center text-center">
          <span className="text-3xl md:text-[4.5vw] font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent/70 to-foreground/50 md:mr-[4vw] mb-4 md:mb-0">your</span>
          
          <h1 className="leading-tight md:leading-[0.8] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/20 mix-blend-plus-lighter pb-2 md:pr-2">
            <span className="text-[25vw] md:text-[18vw]">IDEA</span>
            <span className="text-[10vw] md:text-[6vw] ml-1 md:ml-[1.5vw]">s</span>
          </h1>
          
          <span className="text-3xl md:text-[4.5vw] font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-l from-accent/70 to-foreground/50 md:ml-[5vw] mt-4 md:mt-0">become</span>
        </div>

        {/* Bottom: visuals. */}
        <div className="w-full md:max-w-[70vw] flex justify-center md:justify-end mt-12 md:mt-[-1vw]">
          <span className="text-6xl md:text-[5.5vw] font-bold tracking-tighter text-accent drop-shadow-[0_0_20px_color-mix(in_oklab,var(--color-accent)_40%,transparent)] md:mr-[18vw]">
            visuals.
          </span>
        </div>

      </div>
    </div>
  );
}
