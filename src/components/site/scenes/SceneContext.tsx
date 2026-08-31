"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DEPTH } from "@/lib/spatial";

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
      className="scene absolute inset-0 preserve-3d"
      style={{ transform: `translateZ(${DEPTH.context}px)` }}
      data-z={DEPTH.context}
    >
      {/* Centered, scaled container for mobile to preserve the scattered layout */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] scale-[0.4] sm:scale-[0.6] md:scale-100 preserve-3d pointer-events-none">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-2xl px-6 md:px-0 z-10 pointer-events-auto">
          <h2 className="text-6xl font-light mb-6">
            Gathering the <span className="serif-accent">Thread</span>
          </h2>
          <p className="text-2xl text-muted-foreground">
            Context isn't lost. Characters, references, and storyboards wrap around your idea, holding everything in place.
          </p>
        </div>

        {/* Floating panels scattered in 3D space */}
        <div
          className="floating-panel absolute top-[10%] left-[5%] w-64 h-80 glass-panel shadow-float flex flex-col justify-end p-4 pointer-events-auto"
          style={{ transform: "translateZ(300px) rotateY(15deg) rotateX(-5deg)" }}
        >
          <div 
            className="w-full h-3/4 bg-white/5 rounded-md mb-4 overflow-hidden relative"
            style={{ backgroundImage: "url('/man.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
          </div>
          <div className="eyebrow">Character Ref: 01</div>
        </div>

        <div
          className="floating-panel absolute bottom-[10%] right-[5%] w-72 h-48 glass-panel shadow-float flex flex-col justify-end p-4 pointer-events-auto"
          style={{ transform: "translateZ(500px) rotateY(-20deg) rotateZ(5deg)" }}
        >
          <div className="w-full h-full bg-white/5 rounded-md relative grid grid-cols-3 gap-2 p-2">
             <div className="bg-white/10 rounded-sm h-full overflow-hidden relative" style={{ backgroundImage: "url('/pouring_tea.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
             <div className="bg-white/10 rounded-sm h-full overflow-hidden relative" style={{ backgroundImage: "url('/split_pour.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
             <div className="bg-white/10 rounded-sm h-full overflow-hidden relative" style={{ backgroundImage: "url('/shot.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          </div>
          <div className="eyebrow mt-3">Storyboard Sequence</div>
        </div>

        <div
          className="floating-panel absolute top-[20%] right-[15%] w-48 h-48 glass-panel shadow-float p-4 flex items-center justify-center text-center pointer-events-auto"
          style={{ transform: "translateZ(-200px) rotateX(10deg)" }}
        >
          <span className="serif-accent text-xl">"Cinematic lighting, neon accents, depth of field"</span>
        </div>

        <div
          className="floating-panel absolute bottom-[20%] left-[20%] w-56 h-32 glass-panel shadow-float p-4 flex flex-col justify-between pointer-events-auto"
          style={{ transform: "translateZ(100px) rotateY(10deg)" }}
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
