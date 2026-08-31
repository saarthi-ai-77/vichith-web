"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DEPTH } from "@/lib/spatial";

export function SceneEcosystem() {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);
  const chithraBubbleRef = useRef<HTMLDivElement>(null);
  const clipRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
       const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
       
       // Ensure elements are centered perfectly for x/y animations
       gsap.set(clipRefs.current, { xPercent: -50, yPercent: -50 });

       // Initial Setup (Stage 1: Grid View)
       gsap.set(timelineRef.current, { y: 200, opacity: 0 });
       gsap.set(inspectorRef.current, { x: 200, opacity: 0 });
       gsap.set(canvasRef.current, { opacity: 0, scale: 0.95 });
       gsap.set(chithraBubbleRef.current, { opacity: 0, y: 10, scale: 0.8 });
       
       clipRefs.current.forEach((clip, i) => {
         const row = Math.floor(i / 2);
         const col = i % 2;
         gsap.set(clip, {
           x: col === 0 ? -140 : 140,
           y: row === 0 ? -80 : 80,
           width: 260,
           height: 150,
           borderRadius: 8,
           opacity: 1,
           filter: "hue-rotate(0deg) saturate(1) brightness(1)"
         });
       });

       // Phase 1: Generated assets are visible in the grid.
       // Hold the view so the user registers the "Create" phase.
       tl.to({}, { duration: 1.5 });

       // Phase 2: Open in Studio (Stage 3)
       // The Studio UI elements slide in to surround the assets.
       tl.to(canvasRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" })
         .to(timelineRef.current, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "<")
         .to(inspectorRef.current, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "<");

       // The key transition: assets drop from the grid into the timeline tracks
       clipRefs.current.forEach((clip, i) => {
         tl.to(clip, {
           x: -285 + (i * 190), // Spaced horizontally
           y: 155,              // Land precisely on the timeline track
           width: 180,
           height: 40,
           borderRadius: 4,
           duration: 1,
           ease: "power2.inOut"
         }, "-=0.6");
       });

       // Phase 3: Create + Edit together (Stage 4)
       // Chithra intent appears (backend manipulation)
       tl.to(chithraBubbleRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, "+=0.5")
         // The clips visibly update to reflect the new state (e.g., moodier lighting)
         .to(clipRefs.current, { filter: "hue-rotate(15deg) saturate(1.3) brightness(0.8)", stagger: 0.1, duration: 0.4 })
         // The main canvas also updates
         .to(canvasRef.current, { filter: "hue-rotate(15deg) saturate(1.3) brightness(0.8)", duration: 0.6 }, "<");
         
       // End hold to let the user register the finished edit
       tl.to({}, { duration: 2.5 });
       
       // Reset loop
       tl.to([canvasRef.current, timelineRef.current, inspectorRef.current, chithraBubbleRef.current, ...clipRefs.current], {
         opacity: 0,
         duration: 0.5
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl flex flex-col items-center justify-center scale-[0.4] sm:scale-[0.55] md:scale-100 preserve-3d pointer-events-none">
        
        {/* Typographic Anchor */}
        <div className="text-center mb-10 z-10 pointer-events-auto" style={{ transform: "translateZ(150px)" }}>
           <h2 className="text-5xl md:text-7xl font-light tracking-tight leading-tight">
             Create freely.<br />
             <span className="serif-accent text-accent">Control deeply.</span>
           </h2>
           <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-md mx-auto">
             From the first visual to the final edit, your project stays in one unified workspace.
           </p>
        </div>

        {/* Unified Workspace Canvas */}
        <div 
          ref={workspaceRef}
          className="w-full h-[550px] relative glass-panel shadow-float rounded-2xl border border-line overflow-hidden pointer-events-auto bg-surface/20"
          style={{ transform: "translateZ(50px) rotateX(2deg)" }}
        >
           {/* Top Header */}
           <div className="h-12 border-b border-line flex items-center px-4 justify-between bg-surface/80 backdrop-blur-md z-30 relative">
             <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-white/10"></div>
               <div className="w-3 h-3 rounded-full bg-white/10"></div>
               <div className="w-3 h-3 rounded-full bg-white/10"></div>
             </div>
             <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Vichith Studio V1</span>
             <div className="w-16"></div>
           </div>

           <div className="relative w-full h-[calc(100%-3rem)] flex items-center justify-center perspective-1000">
             
             {/* Studio Canvas Area */}
             <div 
               ref={canvasRef} 
               className="absolute top-6 left-6 w-[65%] h-[280px] bg-background/90 rounded-lg border border-line overflow-hidden shadow-2xl z-0"
             >
               <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
                 <img src="/lighthouse.jpg" alt="Canvas" className="w-full h-full object-cover mix-blend-overlay opacity-50" />
               </div>
               <div className="absolute top-3 left-3 bg-background/80 px-2 py-1 rounded text-[10px] font-mono text-muted-foreground uppercase border border-line">Sequence View</div>
             </div>

             {/* Studio Inspector Area */}
             <div 
               ref={inspectorRef} 
               className="absolute top-6 right-6 w-[25%] h-[280px] bg-surface/80 backdrop-blur-md rounded-lg border border-line p-5 z-10 flex flex-col gap-5"
             >
               <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Properties</span>
               <div className="w-1/2 h-2 bg-white/10 rounded"></div>
               <div className="w-full h-24 bg-background/50 rounded border border-white/5 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent"></div>
               </div>
               <div className="w-3/4 h-2 bg-white/10 rounded mt-2"></div>
               <div className="w-full h-1 bg-accent/30 rounded mt-auto overflow-hidden">
                  <div className="w-2/3 h-full bg-accent"></div>
               </div>
             </div>

             {/* The Interactive Clips (Grid -> Timeline) */}
             <div className="absolute top-1/2 left-1/2 z-20">
               {[
                 "/shot.jpg", 
                 "/pouring_tea.jpg", 
                 "/split_pour.jpg", 
                 "/vintage.jpg"
               ].map((src, i) => (
                 <div
                   key={i}
                   ref={el => { if (el) clipRefs.current[i] = el; }}
                   className="absolute bg-surface border border-line overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                   style={{ 
                     backgroundImage: `url('${src}')`, 
                     backgroundSize: 'cover', 
                     backgroundPosition: 'center',
                   }}
                 >
                   <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent mix-blend-overlay"></div>
                 </div>
               ))}
             </div>

             {/* Timeline Tracks Area */}
             <div 
               ref={timelineRef} 
               className="absolute bottom-0 left-0 w-full h-[180px] bg-surface/90 backdrop-blur-xl border-t border-line p-5 flex flex-col z-10"
             >
                <div className="flex justify-between items-center mb-4 opacity-40">
                   <div className="flex gap-8 text-xs font-mono pl-2">
                     <span>00:00:00</span><span>00:00:05</span><span>00:00:10</span><span>00:00:15</span>
                   </div>
                </div>
                {/* Main Video Track Placeholder */}
                <div className="w-full h-[40px] bg-background/60 rounded border border-white/5 mb-3 relative flex items-center px-1"></div>
                {/* Secondary Audio/Mask Track */}
                <div className="w-full h-[24px] bg-background/40 rounded border border-white/5 relative flex items-center px-2 opacity-50">
                   <div className="w-full h-1 bg-accent/20 rounded-full"></div>
                </div>
             </div>

             {/* Chithra Action Kicker */}
             <div 
               ref={chithraBubbleRef} 
               className="absolute top-[35%] left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur border border-accent/50 text-foreground px-4 py-2.5 rounded-full font-medium text-sm shadow-[0_0_30px_color-mix(in_oklab,var(--color-accent),transparent_80%)] z-40 flex items-center gap-3"
             >
                <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-[0_0_10px_var(--color-accent)]"></div>
                Make the lighting moodier
             </div>
             
           </div>
        </div>
      </div>
    </div>
  );
}
