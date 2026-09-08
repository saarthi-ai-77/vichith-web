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
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest">02 / Creative Studio</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[1.08] mb-6 text-foreground">
            Describe it.<br />
            <span className="serif-accent text-accent">Watch it arrive.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
            The generation workspace. Write what you want in your own words, or build it step by step on the node canvas. Vichith picks the model, shows the cost before it spends anything, and keeps every shot in one project.
          </p>

          <div className="flex flex-col gap-4 w-full">
            <div className="p-4 rounded-xl border border-line/60 bg-surface/30 backdrop-blur-sm transition-colors hover:border-line-strong">
              <div className="text-sm font-semibold text-foreground mb-1">Say it plainly, or control every dial</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Simple Mode takes a sentence. Workflow Mode gives you a node canvas for multi-step pipelines. Same engine, two depths.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-line/60 bg-surface/30 backdrop-blur-sm transition-colors hover:border-line-strong">
              <div className="text-sm font-semibold text-foreground mb-1">The model is chosen for you</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Routed by what the shot actually needs and what it will cost — not by a dropdown you have to research first.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-line/60 bg-surface/30 backdrop-blur-sm transition-colors hover:border-line-strong">
              <div className="text-sm font-semibold text-foreground mb-1">Characters that stay themselves</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Save a character once and reuse them across shots, so the face and the wardrobe survive the cut.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: the actual Create flow — type, generate, receive.
            Mirrors app.vichith.in/studio/create rather than describing it. The
            result is one of our own frames, so nothing here is a stock lie. */}
        <div className="lg:col-span-7 relative w-full h-[460px] sm:h-[520px] md:h-[580px] flex items-center justify-center perspective-1000">
          <div
            ref={orbitRef}
            className="relative w-full max-w-[560px] preserve-3d transition-transform duration-200 ease-out"
            style={{ transform: "rotateX(0deg) rotateY(0deg)" }}
          >
            <div className="glass-panel shadow-float rounded-2xl overflow-hidden border border-line-strong">
              {/* Window chrome, matching the product's own */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-surface/60">
                <span className="w-2 h-2 rounded-full bg-accent/70" />
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                  Creative Studio · Simple
                </span>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">1 credit</span>
              </div>

              {/* The prompt, typed */}
              <div className="px-4 pt-4 pb-3">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                  Describe the shot
                </div>
                <div className="rounded-xl border border-line bg-surface/40 px-3.5 py-3 text-sm text-foreground leading-relaxed">
                  <span className="studio-typing">Tea being poured in morning light, shot on 35mm, shallow depth</span>
                  <span className="studio-caret" />
                </div>
              </div>

              {/* Generating, then the frame */}
              <div className="px-4 pb-4">
                <div className="relative rounded-xl overflow-hidden border border-line aspect-[16/10] bg-surface-2">
                  {/* The result. Ours, not stock. */}
                  <div
                    className="studio-result absolute inset-0"
                    style={{
                      backgroundImage: "url('/pouring_tea.jpg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {/* The wait, which is honest about what it is doing */}
                  <div className="studio-progress absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-2">
                    <div className="w-40 h-1 rounded-full bg-line overflow-hidden">
                      <div className="studio-bar h-full bg-accent rounded-full" />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      Seedream 4.5 · generating
                    </span>
                  </div>

                  <div className="studio-badge absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-background/85 backdrop-blur-sm border border-accent/30">
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest">
                      Added to project
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
