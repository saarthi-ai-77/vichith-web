"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DEPTH } from "@/lib/spatial";

// `Math.random()` in render draws a different value on the server than on
// the client's own hydration pass, so the waveform below used to trigger a
// real hydration mismatch on every homepage load. A deterministic function
// of the bar's own index looks equally "random" but produces the exact
// same value in both environments -- no seed to keep in sync, nothing
// stored, just the same pure function called with the same input twice.
function pseudoRandomHeight(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  const frac = x - Math.floor(x);
  return frac * 80 + 20;
}

export function SceneEcosystem() {
  const assetRef = useRef<HTMLDivElement>(null);
  const layerAudioRef = useRef<HTMLDivElement>(null);
  const layerMaskRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const webCoreRef = useRef<HTMLDivElement>(null);
  const webNodesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      let mm = gsap.matchMedia();

      mm.add({
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)"
      }, (context) => {
        let { isDesktop } = context.conditions as { isDesktop: boolean };
        
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });

        // 1. Web exploration phase (Fluid nodes pulse)
        tl.to(webNodesRef.current, {
          opacity: 1,
          boxShadow: "0 0 15px var(--color-accent)",
          stagger: 0.2,
          duration: 0.4,
          ease: "power2.out",
        })
        // Generation core activates
        .to(webCoreRef.current, {
          scale: 1.1,
          boxShadow: "0 0 30px var(--color-accent)",
          duration: 0.5,
          ease: "back.out(1.5)",
        }, "-=0.2")
        .to(webNodesRef.current, {
          boxShadow: "0 0 0px transparent",
          opacity: 0.4,
          stagger: 0.2,
          duration: 0.4,
        }, "-=0.2");

        // 2. Creative Asset emerges from Web core
        tl.set(assetRef.current, {
          opacity: 0,
          x: isDesktop ? -250 : 0, // Inside Web panel
          y: isDesktop ? 50 : -200,
          scale: 0.5,
          width: "8rem",
          height: "5rem",
          borderRadius: "0.5rem"
        })
        .to(assetRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.2)",
        })
        
        // 3. Asset travels to App panel
        .to(assetRef.current, {
          x: isDesktop ? 250 : 0, // Into App timeline
          y: isDesktop ? 90 : 130, // Adjusted to land perfectly on the top track
          duration: 1.5,
          ease: "power2.inOut",
        })

        // 4. Asset transforms into Timeline Layers (Fractures into deep control)
        .to(assetRef.current, {
          width: "18rem", // Stretches into a video track
          height: "1.5rem",
          borderRadius: "0.25rem",
          duration: 0.5,
          ease: "power3.out",
        })
        
        // Audio and Mask layers reveal from behind the main video track
        .set([layerAudioRef.current, layerMaskRef.current], {
           opacity: 0,
           y: -20, // Start slightly hidden behind the main track
        })
        .to(layerAudioRef.current, {
           opacity: 1,
           y: 0,
           duration: 0.4,
           ease: "power2.out",
        }, "-=0.2")
        .to(layerMaskRef.current, {
           opacity: 1,
           y: 0,
           duration: 0.4,
           ease: "power2.out",
        }, "-=0.2")

        // 5. Playhead sweeps across layers (Control & Precision)
        .set(playheadRef.current, { opacity: 1, x: -140 })
        .to(playheadRef.current, {
           x: 140,
           duration: 1.5,
           ease: "none",
        })

        // Fade out to reset loop
        .to([assetRef.current, layerAudioRef.current, layerMaskRef.current, playheadRef.current, webCoreRef.current], {
           opacity: 0,
           duration: 0.5,
        })
        .set(webCoreRef.current, { scale: 1 });

      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className="scene absolute inset-0 flex items-center justify-center preserve-3d"
      style={{ transform: `translateZ(${DEPTH.ecosystem}px)` }}
      data-z={DEPTH.ecosystem}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl flex flex-col items-center justify-center scale-[0.4] sm:scale-[0.55] md:scale-100 preserve-3d pointer-events-none">
        
        {/* Typographic Anchor */}
        <div className="text-center mb-16 md:mb-24 z-10 pointer-events-auto" style={{ transform: "translateZ(150px)" }}>
           <h2 className="text-5xl md:text-7xl font-light tracking-tight leading-tight">
             Create freely.<br />
             <span className="serif-accent text-accent">Control deeply.</span>
           </h2>
        </div>

        {/* Split Layout */}
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 preserve-3d relative pointer-events-auto">
           
           {/* LEFT: VICHITH WEB (Exploration) */}
           <div className="w-full max-w-[450px] h-[500px] glass-panel shadow-float flex flex-col p-6 md:p-8 relative" style={{ transform: "translateZ(50px) rotateY(10deg)" }}>
              <div className="flex justify-between items-center mb-12 border-b border-line pb-4">
                 <span className="font-mono text-sm tracking-widest text-muted-foreground">VICHITH WEB</span>
                 <span className="text-[10px] uppercase tracking-wider bg-surface px-2 py-1 rounded text-foreground">Available Now</span>
              </div>
              
              <div className="flex-1 relative flex items-center justify-center">
                 {/* Fluid Nodes */}
                 <div ref={el => { if (el) webNodesRef.current[0] = el; }} className="absolute top-0 left-0 px-4 py-2 bg-surface/40 rounded-full border border-line text-xs opacity-40">Idea & Context</div>
                 <div ref={el => { if (el) webNodesRef.current[1] = el; }} className="absolute top-1/4 right-0 px-4 py-2 bg-surface/40 rounded-full border border-line text-xs opacity-40">Chithra</div>
                 <div ref={el => { if (el) webNodesRef.current[2] = el; }} className="absolute bottom-1/4 left-4 px-4 py-2 bg-surface/40 rounded-full border border-line text-xs opacity-40">References</div>
                 <div ref={el => { if (el) webNodesRef.current[3] = el; }} className="absolute bottom-0 right-4 px-4 py-2 bg-surface/40 rounded-full border border-line text-xs opacity-40">Iterate</div>

                 {/* Generation Core */}
                 <div ref={webCoreRef} className="w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-transparent border border-accent/40 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(var(--color-accent),0.2)]">
                    <div className="w-12 h-12 rounded-full bg-accent/30 blur-md"></div>
                    <div className="absolute inset-0 rounded-full border border-dashed border-accent/60 animate-[spin_10s_linear_infinite]"></div>
                 </div>
              </div>
           </div>

           {/* BRIDGE ANIMATION ELEMENT (The Creative Asset) */}
           <div 
             ref={assetRef}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-accent to-accent-deep border border-accent/80 shadow-[0_0_30px_color-mix(in_oklab,var(--color-accent),transparent_60%)] z-20 flex items-center justify-center opacity-0 pointer-events-none overflow-hidden"
             style={{ transform: "translateZ(100px)" }}
           >
             <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
             {/* Abstract thumbnail detail */}
             <div className="w-1/2 h-1/2 rounded-full bg-white/30 blur-sm"></div>
           </div>

           {/* RIGHT: VICHITH DESKTOP (Precision Control) -- CONFIRMED BUG,
               FIXED (marketing audit Phase 1): this said "VICHITH APP",
               ambiguous with the real, live web app at app.vichith.in
               sitting right next to it. This panel visualizes the desktop
               editor specifically (timeline, audio/mask tracks, playhead) --
               name it as that, matching Footer.tsx's already-correct
               "Desktop app" label, which the homepage itself never rendered. */}
           <div className="w-full max-w-[450px] h-[500px] glass-panel shadow-float flex flex-col p-6 md:p-8 relative" style={{ transform: "translateZ(50px) rotateY(-10deg)" }}>
              <div className="flex justify-between items-center mb-4 border-b border-line pb-4">
                 <span className="font-mono text-sm tracking-widest text-muted-foreground">VICHITH DESKTOP</span>
                 <span className="text-[10px] uppercase tracking-wider border border-accent/50 text-accent px-2 py-1 rounded shadow-[0_0_10px_color-mix(in_oklab,var(--color-accent)_40%,transparent)]">Coming Soon</span>
              </div>

              {/* Marketing audit Phase 4: "Control deeply" previously had no
                  concrete referent in this panel -- just a wireframe mockup.
                  One line naming what deep control actually means. */}
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                Frame-accurate timeline editing, precision color and audio — for the shots that need a human&rsquo;s final touch.
              </p>

              <div className="flex-1 flex flex-col relative">
                 {/* Composition View */}
                 <div className="w-full h-40 bg-background/50 rounded-lg border border-line flex items-center justify-center mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface to-transparent"></div>
                    <span className="text-sm text-muted-foreground eyebrow z-10">Composition View</span>
                 </div>
                 
                 {/* Deep Timeline Workspace */}
                 <div className="flex-1 border border-line rounded-lg bg-surface/30 p-4 flex flex-col justify-center gap-3 relative overflow-hidden">
                    
                    {/* The Playhead */}
                    <div ref={playheadRef} className="absolute top-0 bottom-0 w-px bg-accent z-30 opacity-0 shadow-[0_0_10px_var(--color-accent)]">
                       <div className="w-2 h-2 rounded-full bg-accent absolute -top-1 -left-[3px]"></div>
                    </div>

                    {/* Timeline Tracks (Asset lands on top, these reveal below it) */}
                    <div className="h-6 w-full relative"></div> {/* Placeholder for main asset track */}
                    
                    <div ref={layerAudioRef} className="h-6 w-full bg-surface/80 rounded border border-line flex items-center px-2 opacity-0">
                       <span className="text-[10px] text-muted-foreground font-mono w-12">AUDIO</span>
                       <div className="flex-1 flex items-center gap-[2px] px-2 h-full py-1">
                          {[...Array(24)].map((_, i) => (
                            <div key={i} className="flex-1 bg-muted-foreground/40 rounded-full" style={{ height: `${pseudoRandomHeight(i)}%` }}></div>
                          ))}
                       </div>
                    </div>
                    
                    <div ref={layerMaskRef} className="h-6 w-full bg-surface/80 rounded border border-line flex items-center px-2 opacity-0">
                       <span className="text-[10px] text-muted-foreground font-mono w-12">MASK</span>
                       <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>

                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
