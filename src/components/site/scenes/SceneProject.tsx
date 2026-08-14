"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function SceneProject() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Add subtle perspective tilting to the grid based on mouse movement, 
      // or just a continuous slow tilt.
      gsap.to(gridRef.current, {
        rotationX: 35,
        rotationZ: -17,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      className="scene relative md:absolute inset-0 flex flex-col items-center justify-center md:preserve-3d min-h-screen py-24 md:py-0 md:[transform:translateZ(-6000px)]"
      data-z="-6000"
    >
      <div className="relative md:absolute md:top-20 md:left-20 w-full px-6 md:px-0 md:w-1/3 mb-8 md:mb-0 z-10 md:[transform:translateZ(300px)]">
         <h2 className="text-4xl md:text-5xl tracking-tighter mb-4 text-center md:text-left">
           The <span className="serif-accent">Project</span> Canvas
         </h2>
         <p className="text-muted-foreground text-lg text-center md:text-left">
           Everything generated becomes part of a unified spatial workspace. Ready for fine-tuning.
         </p>
      </div>

      {/* Isometric Grid of Assets - Scaled down for mobile */}
      <div className="w-full flex justify-center overflow-hidden md:overflow-visible">
        <div
          ref={gridRef}
          className="w-[800px] h-[600px] md:preserve-3d scale-[0.4] sm:scale-[0.6] md:scale-100 origin-center md:[transform:rotateX(30deg)_rotateZ(-15deg)]"
        >
           {/* Background Grid */}
           <div className="absolute inset-0 grid-field opacity-20 border border-line rounded-3xl"></div>
           
           {/* Storyboard Node */}
           <div className="absolute top-[10%] left-[10%] w-48 h-32 glass-panel shadow-float flex items-center justify-center text-muted-foreground eyebrow md:[transform:translateZ(80px)]">
              Scene 01 / Ref
           </div>

           {/* Generation Node 1 */}
           <div className="absolute top-[30%] left-[40%] w-64 h-40 bg-surface border border-line rounded-xl shadow-float overflow-hidden flex flex-col md:[transform:translateZ(120px)]">
              <div className="flex-1 bg-gradient-to-br from-white/5 to-transparent relative">
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent to-transparent"></div>
              </div>
              <div className="h-10 border-t border-line px-3 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-accent"></div>
                 <span className="text-xs text-muted-foreground">Generated Frame</span>
              </div>
           </div>

           {/* Generation Node 2 */}
           <div className="absolute bottom-[20%] right-[10%] w-56 h-56 glass-panel shadow-float flex items-center justify-center flex-col gap-4 md:[transform:translateZ(160px)]">
              <div className="w-24 h-24 rounded-full border border-dashed border-accent/50 flex items-center justify-center">
                 <div className="w-16 h-16 rounded-full bg-accent/20 blur-xl"></div>
              </div>
              <span className="text-xs font-mono text-accent">MODEL_READY</span>
           </div>
           
           {/* Connection Lines (SVG) */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 md:[transform:translateZ(40px)]">
              <path d="M 230 140 Q 300 200, 360 220" stroke="var(--color-line-strong)" fill="none" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M 520 300 Q 560 380, 580 400" stroke="var(--color-accent)" fill="none" strokeWidth="2" />
           </svg>
        </div>
      </div>
    </div>
  );
}
