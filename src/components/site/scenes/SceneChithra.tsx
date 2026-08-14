"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function SceneChithra() {
  const lineRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement[]>([]);
  
  const intentWords = '"I want a cinematic product film"'.split(" ");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Typewriter Effect (Word by word fade in)
      gsap.to(".intent-word", {
        opacity: 1,
        stagger: 0.15,
        duration: 0.1,
        repeat: -1,
        repeatDelay: 3,
        yoyo: true,
      });

      // 2. Flowing Line Animation
      if (lineRef.current) {
        gsap.to(lineRef.current, {
          backgroundPosition: "-200% 0",
          duration: 2,
          ease: "none",
          repeat: -1,
        });
      }

      // 3. Execution Plan Sequence
      if (stepsRef.current.length > 0) {
        const tl = gsap.timeline({ repeat: -1 });
        stepsRef.current.forEach((step) => {
          tl.to(step, { opacity: 1, color: "var(--color-accent)", duration: 0.2 })
            .to(step, { opacity: 0.3, color: "var(--color-muted-foreground)", duration: 0.2 }, "+=0.8");
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className="scene relative md:absolute inset-0 flex flex-col items-center justify-center md:preserve-3d min-h-screen py-24 md:py-0 md:[transform:translateZ(-4000px)]"
      data-z="-4000"
    >
      <div className="text-center w-full max-w-3xl mb-16 px-6 md:px-0 md:[transform:translateZ(200px)]">
        <h2 className="text-5xl md:text-6xl font-medium tracking-tighter mb-4">
          Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-deep">Chithra</span>
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Not a chatbot. An <span className="serif-accent">orchestrator.</span>
        </p>
      </div>

      {/* Chithra's 'Interface' representation */}
      <div className="relative w-full max-w-4xl min-h-96 md:grid-field border-t border-b border-line flex flex-col md:flex-row items-center justify-between px-6 py-12 md:px-12 md:py-0 md:preserve-3d">
        
        {/* Input Intent */}
        <div className="w-full max-w-[16rem] glass-panel p-6 shadow-float mb-12 md:mb-0 md:[transform:translateZ(150px)_rotateY(10deg)]">
          <div className="eyebrow mb-3">Intent</div>
          <div className="text-sm font-medium leading-relaxed">
            {intentWords.map((word, i) => (
              <span key={i} className="intent-word opacity-0 inline-block mr-1">
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* The orchestrator engine (Chithra) */}
        <div className="relative w-32 h-32 flex items-center justify-center md:preserve-3d mb-12 md:mb-0 md:[transform:translateZ(50px)]">
           {/* Abstract rotating rings */}
           <div className="absolute inset-0 border border-accent/40 rounded-full animate-[spin_4s_linear_infinite]" style={{ transform: "rotateX(70deg)" }}></div>
           <div className="absolute inset-0 border border-accent/40 rounded-full animate-[spin_6s_linear_infinite_reverse]" style={{ transform: "rotateY(70deg)" }}></div>
           <div className="absolute inset-0 border border-accent/40 rounded-full animate-[spin_5s_linear_infinite]" style={{ transform: "rotateZ(45deg) rotateX(45deg)" }}></div>
           <div className="font-mono text-accent text-sm tracking-widest relative z-10 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-sm">ORCHESTRATING</div>
        </div>

        {/* Output Generation */}
        <div className="w-full max-w-[16rem] glass-panel p-6 shadow-float flex flex-col gap-4 md:[transform:translateZ(150px)_rotateY(-10deg)]">
          <div className="eyebrow">Execution Plan</div>
          <div className="flex flex-col gap-3">
            {["Generate Storyboard", "Select Diffusion Model", "Render Sequence"].map((text, i) => (
              <div 
                key={i} 
                ref={el => { if (el) stepsRef.current[i] = el; }} 
                className="flex items-center gap-2 text-xs text-muted-foreground opacity-30"
              >
                 <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"></div>
                 {text}
              </div>
            ))}
          </div>
        </div>

        {/* Connecting Flow Line (Desktop Only) */}
        <div 
          className="hidden md:block absolute top-1/2 left-[17rem] right-[17rem] h-[2px] -translate-y-1/2 overflow-hidden md:[transform:translateZ(-50px)]"
        >
           <div 
             ref={lineRef} 
             className="w-full h-full" 
             style={{ 
               background: "linear-gradient(90deg, transparent 0%, var(--color-accent) 50%, transparent 100%)",
               backgroundSize: "200% 100%",
               backgroundPosition: "100% 0",
               boxShadow: "0 0 8px 1px var(--color-accent)"
             }} 
           />
        </div>
      </div>
    </div>
  );
}
