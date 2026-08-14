"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function SceneContext() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subtle floating for the context elements
    const elements = containerRef.current?.querySelectorAll(".floating-panel");
    if (elements) {
      elements.forEach((el, i) => {
        gsap.to(el, {
          y: () => (i % 2 === 0 ? "-=30" : "+=30"),
          x: () => (i % 3 === 0 ? "+=20" : "-=20"),
          rotationX: () => Math.random() * 10 - 5,
          rotationY: () => Math.random() * 10 - 5,
          duration: 4 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * -5,
        });
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="scene relative md:absolute inset-0 flex flex-col items-center justify-center md:block md:preserve-3d min-h-screen py-24 md:py-0 md:[transform:translateZ(-2000px)]"
      data-z="-2000"
    >
      <div className="relative md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 text-center w-full max-w-2xl px-6 md:px-0 mb-16 md:mb-0 z-10">
        <h2 className="text-4xl md:text-5xl font-light mb-6">
          Gathering the <span className="serif-accent">Thread</span>
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground">
          Context isn't lost. Characters, references, and storyboards wrap around your idea, holding everything in place.
        </p>
      </div>

      {/* Floating panels stacked on mobile, scattered in 3D space on desktop */}
      <div className="flex flex-col items-center gap-8 md:block w-full px-4">
        <div
          className="floating-panel relative md:absolute md:top-1/4 md:left-[10%] w-full max-w-[16rem] h-80 glass-panel shadow-float flex flex-col justify-end p-4 md:[transform:translateZ(300px)_rotateY(15deg)_rotateX(-5deg)]"
        >
          <div className="w-full h-3/4 bg-white/5 rounded-md mb-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent mix-blend-overlay"></div>
          </div>
          <div className="eyebrow">Character Ref: 01</div>
        </div>

        <div
          className="floating-panel relative md:absolute md:bottom-1/4 md:right-[10%] w-full max-w-[18rem] h-48 glass-panel shadow-float flex flex-col justify-end p-4 md:[transform:translateZ(500px)_rotateY(-20deg)_rotateZ(5deg)]"
        >
          <div className="w-full h-full bg-white/5 rounded-md relative grid grid-cols-3 gap-2 p-2">
             <div className="bg-white/10 rounded-sm h-full"></div>
             <div className="bg-white/10 rounded-sm h-full"></div>
             <div className="bg-white/10 rounded-sm h-full"></div>
          </div>
          <div className="eyebrow mt-3">Storyboard Sequence</div>
        </div>

        <div
          className="floating-panel relative md:absolute md:top-[15%] md:right-[20%] w-full max-w-[12rem] h-48 glass-panel shadow-float p-4 flex items-center justify-center text-center md:[transform:translateZ(-200px)_rotateX(10deg)]"
        >
          <span className="serif-accent text-xl">"Cinematic lighting, neon accents, depth of field"</span>
        </div>

        <div
          className="floating-panel relative md:absolute md:bottom-[15%] md:left-[25%] w-full max-w-[14rem] h-32 glass-panel shadow-float p-4 flex flex-col justify-between md:[transform:translateZ(100px)_rotateY(10deg)]"
        >
          <div className="eyebrow">Style Target</div>
          <div className="w-full h-2 bg-accent/20 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-accent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
