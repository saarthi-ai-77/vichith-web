"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SECTION_IDS } from "@/lib/spatial";

export function SceneContext() {
  const sectionRef = useRef<HTMLElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || !orbitRef.current) return;

    const ctx = gsap.context(() => {
      // Cursor tilt for the 3D card constellation
      const xTo = gsap.quickTo(orbitRef.current, "rotationY", { duration: 0.8, ease: "power2.out" });
      const yTo = gsap.quickTo(orbitRef.current, "rotationX", { duration: 0.8, ease: "power2.out" });

      const onMouseMove = (e: MouseEvent) => {
        if (!orbitRef.current) return;
        const rect = orbitRef.current.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        xTo(Math.max(-15, Math.min(15, normX * 12)));
        yTo(Math.max(-15, Math.min(15, -normY * 10)));
      };

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      return () => window.removeEventListener("mousemove", onMouseMove);
    }, sectionRef);

    return () => ctx.revert();
  }, [isInView]);

  return (
    <section
      id={SECTION_IDS.context}
      ref={sectionRef}
      className="relative w-full py-24 md:py-36 px-6 md:px-12 lg:px-20 border-t border-line/40 bg-background/50 overflow-hidden"
    >
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Editorial Narrative (High Legibility & Hierarchy) */}
        <div className="lg:col-span-5 flex flex-col items-start z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-surface/60 backdrop-blur-md mb-6">
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest">01 / Continuity</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[1.08] mb-6 text-foreground">
            Gathering the <br />
            <span className="serif-accent text-accent">Thread.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
            Context isn't lost. Characters, references, and storyboards wrap around your idea, holding everything in place across every shot you make.
          </p>

          <div className="flex flex-col gap-4 w-full">
            <div className="p-4 rounded-xl border border-line/60 bg-surface/30 backdrop-blur-sm transition-colors hover:border-line-strong">
              <div className="text-sm font-semibold text-foreground mb-1">Persistent Character Identity</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Retain wardrobe, facial likeness, and lighting atmosphere across cuts without tedious re-prompting.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-line/60 bg-surface/30 backdrop-blur-sm transition-colors hover:border-line-strong">
              <div className="text-sm font-semibold text-foreground mb-1">Storyboard Sequence Linking</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect multiple scene angles directly to their visual references in a spatial constellation.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-line/60 bg-surface/30 backdrop-blur-sm transition-colors hover:border-line-strong">
              <div className="text-sm font-semibold text-foreground mb-1">Style Target Lock</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enforce consistent grain, lens depth, and color palettes so your video feels like one film.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Spatial Constellation */}
        <div className="lg:col-span-7 relative w-full h-[460px] sm:h-[520px] md:h-[580px] flex items-center justify-center preserve-3d perspective-1000">
          <div
            ref={orbitRef}
            className="relative w-full max-w-[560px] h-[440px] preserve-3d transition-transform duration-200 ease-out"
            style={{ transform: "rotateX(0deg) rotateY(0deg)" }}
          >
            {/* Card 1: Character Reference (Top Left) */}
            <div
              className="absolute top-2 left-2 sm:left-4 w-48 sm:w-56 h-64 sm:h-72 glass-panel shadow-float p-3 flex flex-col justify-between hover:border-accent/50 transition-colors"
              style={{ transform: "translateZ(60px) rotateY(6deg) rotateX(-3deg)" }}
            >
              <div
                className="w-full h-44 sm:h-52 rounded-lg overflow-hidden relative bg-surface-2"
                style={{ backgroundImage: "url('/man.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-background/80 text-[10px] font-mono text-accent">
                  ACTIVE REF
                </span>
              </div>
              <div className="px-1 pt-1 flex items-center justify-between">
                <span className="text-xs font-semibold">Character 01</span>
                <span className="text-[10px] font-mono text-muted-foreground">Identity Locked</span>
              </div>
            </div>

            {/* Card 2: Storyboard Sequence (Bottom Right) */}
            <div
              className="absolute bottom-2 right-2 sm:right-4 w-64 sm:w-80 h-44 sm:h-48 glass-panel shadow-float p-3 flex flex-col justify-between hover:border-accent/50 transition-colors"
              style={{ transform: "translateZ(100px) rotateY(-8deg) rotateZ(2deg)" }}
            >
              <div className="w-full h-28 sm:h-32 grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden p-1 bg-surface/50 border border-line">
                <div
                  className="rounded h-full overflow-hidden relative"
                  style={{ backgroundImage: "url('/pouring_tea.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
                />
                <div
                  className="rounded h-full overflow-hidden relative"
                  style={{ backgroundImage: "url('/split_pour.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
                />
                <div
                  className="rounded h-full overflow-hidden relative"
                  style={{ backgroundImage: "url('/shot.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
                />
              </div>
              <div className="px-1 flex items-center justify-between">
                <span className="text-xs font-semibold">Storyboard Sequence</span>
                <span className="text-[10px] font-mono text-accent">3 Shots</span>
              </div>
            </div>

            {/* Card 3: Cinematic Prompt Chip (Top Right) */}
            <div
              className="absolute top-8 right-6 sm:right-10 w-48 sm:w-56 glass-panel shadow-float p-3.5 flex flex-col gap-1.5 hover:border-accent/40 transition-colors"
              style={{ transform: "translateZ(120px) rotateX(6deg) rotateY(-4deg)" }}
            >
              <div className="eyebrow text-[9px] text-accent">Style Descriptor</div>
              <p className="serif-accent text-sm text-foreground leading-snug">
                &ldquo;Cinematic golden light, anamorphic blur, soft grain&rdquo;
              </p>
            </div>

            {/* Card 4: Target Match Meter (Bottom Left) */}
            <div
              className="absolute bottom-8 left-4 sm:left-12 w-44 sm:w-52 glass-panel shadow-float p-3 flex flex-col gap-2 hover:border-accent/40 transition-colors"
              style={{ transform: "translateZ(40px) rotateY(4deg)" }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>STYLE MATCH</span>
                <span className="text-accent font-semibold">94%</span>
              </div>
              <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                <div className="w-[94%] h-full bg-accent rounded-full" />
              </div>
            </div>

            {/* Subtle SVG Depth Connectors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" aria-hidden="true">
              <path d="M 180 180 Q 280 220 380 280" stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
              <path d="M 280 120 Q 320 180 340 260" stroke="var(--color-line-strong)" strokeWidth="1" fill="none" />
            </svg>
          </div>
        </div>

      </div>
    </section>
  );
}
