"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SECTION_IDS } from "@/lib/spatial";

export function SceneProject() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || !gridRef.current) return;

    const ctx = gsap.context(() => {
      // Smooth cursor parallax tilt for the isometric canvas
      const xTo = gsap.quickTo(gridRef.current, "rotationY", { duration: 0.8, ease: "power2.out" });
      const yTo = gsap.quickTo(gridRef.current, "rotationX", { duration: 0.8, ease: "power2.out" });

      const onMouseMove = (e: MouseEvent) => {
        if (!gridRef.current) return;
        const rect = gridRef.current.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        xTo(-10 + normX * 8);
        yTo(24 - normY * 6);
      };

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      return () => window.removeEventListener("mousemove", onMouseMove);
    }, sectionRef);

    return () => ctx.revert();
  }, [isInView]);

  return (
    <section
      id={SECTION_IDS.canvas}
      ref={sectionRef}
      className="relative w-full py-24 md:py-36 px-6 md:px-12 border-t border-line/40 bg-background overflow-hidden"
    >
      <div className="max-w-[1240px] mx-auto flex flex-col items-center">
        
        {/* Editorial Section Header */}
        <div className="text-center max-w-3xl mb-12 md:mb-16 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-surface/60 backdrop-blur-md mb-4">
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest">03 / One Project</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-tight mb-4 text-foreground">
            Four rooms. <span className="serif-accent text-accent">One project.</span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Chithra plans it. Creative Studio generates it. The Editor cuts it. The Image Editor fixes the thumbnail. Nothing is re-uploaded, nothing is exported halfway, and every step remembers the one before it.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 rounded-full border border-line/80 bg-surface/40 text-xs font-mono text-muted-foreground">
              Chithra · plan
            </span>
            <span className="px-3 py-1 rounded-full border border-line/80 bg-surface/40 text-xs font-mono text-muted-foreground">
              Studio · generate
            </span>
            <span className="px-3 py-1 rounded-full border border-line/80 bg-surface/40 text-xs font-mono text-muted-foreground">
              Editor · cut &amp; caption
            </span>
          </div>
        </div>

        {/* 3D Isometric Node Canvas Viewport */}
        <div className="relative w-full max-w-5xl h-[440px] sm:h-[500px] md:h-[560px] flex items-center justify-center preserve-3d perspective-1000">
          <div
            ref={gridRef}
            className="relative w-full max-w-[840px] h-[400px] sm:h-[440px] rounded-2xl border border-line/80 bg-surface/20 backdrop-blur-sm grid-field preserve-3d transition-transform duration-200"
            style={{ transform: "rotateX(24deg) rotateY(-10deg) rotateZ(2deg)" }}
          >
            {/* SVG Connector Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
              <defs>
                <linearGradient id="edgeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-line-strong)" />
                  <stop offset="100%" stopColor="var(--color-accent)" />
                </linearGradient>
                <linearGradient id="edgeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-accent)" />
                  <stop offset="100%" stopColor="var(--color-line-strong)" />
                </linearGradient>
              </defs>

              {/* Node 1 to Node 2 */}
              <path
                d="M 160 140 C 240 140, 260 210, 360 210"
                stroke="url(#edgeGrad1)"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
              />
              {/* Node 2 to Node 3 */}
              <path
                d="M 480 210 C 560 210, 580 130, 660 130"
                stroke="var(--color-accent)"
                strokeWidth="2"
                fill="none"
              />
              {/* Node 3 to Node 4 */}
              <path
                d="M 680 190 C 680 270, 540 310, 480 320"
                stroke="url(#edgeGrad2)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />
            </svg>

            {/* Node 1: Storyboard Ref (Top Left) */}
            <div
              onMouseEnter={() => setActiveNode("ref")}
              onMouseLeave={() => setActiveNode(null)}
              className={`absolute top-[16%] left-[6%] sm:left-[8%] w-44 sm:w-52 glass-panel p-3 rounded-xl shadow-float transition-all duration-200 cursor-pointer ${
                activeNode === "ref" ? "border-accent shadow-[0_0_25px_var(--color-accent)]" : "border-line"
              }`}
              style={{ transform: "translateZ(80px)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Input Ref</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </div>
              <div
                className="w-full h-20 rounded-md overflow-hidden bg-surface-2 mb-2"
                style={{ backgroundImage: "url('/shot.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
              />
              <div className="text-xs font-medium text-foreground">Scene 01 / Lighting</div>
            </div>

            {/* Node 2: Generative Model Engine (Center) */}
            <div
              onMouseEnter={() => setActiveNode("model")}
              onMouseLeave={() => setActiveNode(null)}
              className={`absolute top-[36%] left-[34%] sm:left-[38%] w-48 sm:w-56 glass-panel p-4 rounded-xl shadow-float transition-all duration-200 cursor-pointer ${
                activeNode === "model" ? "border-accent shadow-[0_0_25px_var(--color-accent)]" : "border-line"
              }`}
              style={{ transform: "translateZ(120px)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-mono text-accent uppercase">Generation Engine</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">4 cr</span>
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">Seedream 4.5</div>
              <p className="text-[11px] text-muted-foreground">Hold light & atmospheric haze</p>
            </div>

            {/* Node 3: Generated Output Frame (Top Right) */}
            <div
              onMouseEnter={() => setActiveNode("output")}
              onMouseLeave={() => setActiveNode(null)}
              className={`absolute top-[12%] right-[6%] sm:right-[10%] w-48 sm:w-56 glass-panel p-3 rounded-xl shadow-float transition-all duration-200 cursor-pointer ${
                activeNode === "output" ? "border-accent shadow-[0_0_25px_var(--color-accent)]" : "border-line"
              }`}
              style={{ transform: "translateZ(140px)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-accent uppercase">Master Output</span>
                <span className="px-1.5 py-0.5 rounded bg-accent/20 text-[9px] font-mono text-accent">READY</span>
              </div>
              <div
                className="w-full h-24 rounded-md overflow-hidden bg-surface-2 mb-2 relative"
                style={{ backgroundImage: "url('/lighthouse.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                  4K · 16:9
                </div>
              </div>
              <div className="text-xs font-medium text-foreground">Lighthouse_Sunset_01</div>
            </div>

            {/* Node 4: Timeline Destination Anchor (Bottom Center) */}
            <div
              onMouseEnter={() => setActiveNode("timeline")}
              onMouseLeave={() => setActiveNode(null)}
              className={`absolute bottom-[10%] left-[28%] sm:left-[35%] w-52 sm:w-60 glass-panel p-3 rounded-xl shadow-float transition-all duration-200 cursor-pointer ${
                activeNode === "timeline" ? "border-accent shadow-[0_0_25px_var(--color-accent)]" : "border-line"
              }`}
              style={{ transform: "translateZ(90px)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Timeline Target</span>
                <span className="text-[10px] font-mono text-accent">00:04:12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Track V1 · Cut 03</span>
                <span className="text-[10px] font-mono text-muted-foreground">Speed 1.0x</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
