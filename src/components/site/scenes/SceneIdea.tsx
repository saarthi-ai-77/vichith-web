"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SECTION_IDS } from "@/lib/spatial";

// Curated peripheral depth cards for the Hero spatial field
const HERO_CARDS = [
  {
    src: "/shot.jpg",
    title: "Chithra",
    tag: "Plans the work",
    className: "hidden lg:block top-[18%] left-[6%] w-52 h-64 rotate-[-6deg]",
    z: 90,
  },
  {
    src: "/pouring_tea.jpg",
    title: "Creative Studio",
    tag: "Generates the shots",
    className: "hidden md:block top-[22%] right-[7%] w-60 h-44 rotate-[5deg]",
    z: 110,
  },
  {
    src: "/man.jpg",
    title: "Editor",
    tag: "Cuts and captions",
    className: "hidden xl:block bottom-[16%] left-[8%] w-56 h-72 rotate-[4deg]",
    z: 130,
  },
  {
    src: "/lighthouse.jpg",
    title: "Image Editor",
    tag: "Fixes the thumbnail",
    className: "hidden md:block bottom-[18%] right-[8%] w-64 h-48 rotate-[-4deg]",
    z: 100,
  },
];

export function SceneIdea() {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const spatialFieldRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const ctx = gsap.context(() => {
      // Subtle organic floating for text
      gsap.to(textRef.current, {
        y: -12,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Smooth mouse parallax for spatial field (zero layout thrashing)
      const xTo = gsap.quickTo(spatialFieldRef.current, "rotationY", { duration: 0.8, ease: "power2.out" });
      const yTo = gsap.quickTo(spatialFieldRef.current, "rotationX", { duration: 0.8, ease: "power2.out" });

      const onMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const normX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
        const normY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
        xTo(normX * 8); // subtle tilt
        yTo(-normY * 6);
      };

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      return () => window.removeEventListener("mousemove", onMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleScrollDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(`#${SECTION_IDS.context}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id={SECTION_IDS.hero}
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center pt-24 pb-16 px-4 md:px-8 overflow-hidden preserve-3d"
    >
      {/* Background ambient radial gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[800px] h-[500px] rounded-full bg-accent/5 blur-[140px] mix-blend-screen" />
        <div className="w-[500px] h-[350px] rounded-full bg-surface-2/40 blur-[100px]" />
      </div>

      {/* Selective 3D Spatial Field (Peripheral Ambient Elements) */}
      <div
        ref={spatialFieldRef}
        className="pointer-events-none absolute inset-0 preserve-3d perspective-1000 will-change-transform"
        style={{ transform: "rotateX(0deg) rotateY(0deg)" }}
      >
        {HERO_CARDS.map((card, i) => (
          <div
            key={i}
            className={`absolute ${card.className} glass-panel shadow-float rounded-xl overflow-hidden p-2.5 transition-opacity duration-700 pointer-events-auto cursor-default hover:border-accent/40`}
            style={{
              transform: `translateZ(${card.z}px)`,
              opacity: mounted ? 0.85 : 0,
            }}
          >
            <div
              className="w-full h-[78%] rounded-lg overflow-hidden relative bg-surface-2"
              style={{
                backgroundImage: `url('${card.src}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
            </div>
            <div className="pt-2 flex items-center justify-between px-1">
              <span className="text-xs font-medium text-foreground">{card.title}</span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">{card.tag}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2D Core Editorial Typography & Hero Content */}
      <div
        ref={textRef}
        className="relative z-10 flex flex-col items-center justify-center text-center max-w-5xl select-none"
      >
        {/* Display Typography */}
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-[760px] flex justify-start mb-2">
            <span className="text-2xl sm:text-3xl md:text-5xl font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent/80 to-foreground/60">
              Where
            </span>
          </div>

          <div className="flex items-baseline justify-center">
            <span className="text-2xl sm:text-3xl md:text-5xl font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent/80 to-foreground/60 mr-4 md:mr-8">
              your
            </span>
            <h1 className="leading-[0.85] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-foreground/20 mix-blend-plus-lighter">
              <span className="text-[19vw] sm:text-[16vw] md:text-[14vw]">IDEA</span>
              <span className="text-[9vw] sm:text-[7vw] md:text-[5vw] ml-1">s</span>
            </h1>
            <span className="text-2xl sm:text-3xl md:text-5xl font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-l from-accent/80 to-foreground/60 ml-4 md:ml-8">
              become
            </span>
          </div>

          <div className="w-full max-w-[760px] flex justify-end mt-2 md:mt-[-1vw]">
            <span className="text-5xl sm:text-6xl md:text-[6vw] font-bold tracking-tighter text-accent drop-shadow-[0_0_30px_color-mix(in_oklab,var(--color-accent)_45%,transparent)]">
              video.
            </span>
          </div>
        </div>

        {/* The thesis. Stated, not captioned. */}
        <p className="mt-10 md:mt-14 max-w-[24ch] font-display text-2xl sm:text-3xl md:text-[2.6rem] font-medium leading-[1.14] tracking-tight text-foreground px-4 text-balance">
          Every AI tool splits your process into pieces.
          <span className="text-accent"> Vichith keeps it connected.</span>
        </p>

        {/* The four workspaces, named under the promise they deliver. */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4">
          {["Chithra · plan", "Creative Studio · generate", "Editor · cut", "Image Editor · finish"].map((w) => (
            <span
              key={w}
              className="px-3 py-1 rounded-full border border-line bg-surface/40 backdrop-blur-md text-[11px] font-mono text-muted-foreground tracking-wider"
            >
              {w}
            </span>
          ))}
        </div>

        {/* Interactive CTA Group */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href={`#${SECTION_IDS.context}`}
            onClick={handleScrollDown}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-foreground text-background font-semibold text-sm transition-all duration-150 hover:bg-accent hover:text-background active:scale-[0.97] shadow-lg shadow-black/30"
          >
            Explore the Workspace
          </a>
          <a
            href="https://app.vichith.in/request-access"
            className="w-full sm:w-auto px-7 py-3 rounded-full border border-line bg-surface/30 text-foreground font-medium text-sm transition-all duration-150 hover:bg-surface hover:border-line-strong active:scale-[0.97]"
          >
            Request Access
          </a>
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity duration-200">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Scroll to explore</span>
        <div className="w-px h-6 bg-gradient-to-b from-accent to-transparent animate-pulse" />
      </div>
    </section>
  );
}
