"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SECTION_IDS, STAGE_SCROLL } from "@/lib/spatial";

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  { id: 0, label: "01 Ask", name: "What you want" },
  { id: 1, label: "02 Reason", name: "What it can do" },
  { id: 2, label: "03 Propose", name: "Model and cost" },
  { id: 3, label: "04 Act", name: "Into your project" },
];

export function SceneConversation() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeBeat, setActiveBeat] = useState(0);

  // References for beat elements
  const beat0Ref = useRef<HTMLDivElement>(null);
  const beat1Ref = useRef<HTMLDivElement>(null);
  const beat2Ref = useRef<HTMLDivElement>(null);
  const beat3Ref = useRef<HTMLDivElement>(null);
  const developImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const pinTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${STAGE_SCROLL.chithra}`,
        pin: pinRef.current,
        scrub: 0.8,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);

          // Calculate active beat: 0..0.25 (0), 0.25..0.50 (1), 0.50..0.75 (2), 0.75..1.0 (3)
          const beatIndex = Math.min(3, Math.floor(p * 4));
          setActiveBeat(beatIndex);

          // Smoothly animate beat containers
          // Beat 0: 0 -> 0.25
          if (beat0Ref.current) {
            const b0 = Math.max(0, Math.min(1, p * 4));
            const fadeOut0 = p > 0.25 ? Math.max(0, 1 - (p - 0.25) * 6) : 1;
            beat0Ref.current.style.opacity = String(b0 * fadeOut0);
            beat0Ref.current.style.transform = `translateY(${(1 - b0) * 20}px)`;
          }

          // Beat 1: 0.22 -> 0.50
          if (beat1Ref.current) {
            const b1 = Math.max(0, Math.min(1, (p - 0.22) * 4));
            const fadeOut1 = p > 0.50 ? Math.max(0, 1 - (p - 0.50) * 6) : 1;
            beat1Ref.current.style.opacity = String(b1 * fadeOut1);
            beat1Ref.current.style.transform = `translateY(${(1 - b1) * 20}px)`;
          }

          // Beat 2: 0.48 -> 0.75
          if (beat2Ref.current) {
            const b2 = Math.max(0, Math.min(1, (p - 0.48) * 4));
            const fadeOut2 = p > 0.75 ? Math.max(0, 1 - (p - 0.75) * 6) : 1;
            beat2Ref.current.style.opacity = String(b2 * fadeOut2);
            beat2Ref.current.style.transform = `translateY(${(1 - b2) * 20}px)`;
          }

          // Beat 3: 0.72 -> 1.0
          if (beat3Ref.current) {
            const b3 = Math.max(0, Math.min(1, (p - 0.72) * 4));
            beat3Ref.current.style.opacity = String(b3);
            beat3Ref.current.style.transform = `translateY(${(1 - b3) * 20}px)`;

            // Developing photograph: blur and saturation transition
            if (developImgRef.current) {
              const devProgress = Math.max(0, Math.min(1, (p - 0.75) * 4));
              const blur = (1 - devProgress) * 16;
              const sat = 0.2 + devProgress * 0.9;
              developImgRef.current.style.filter = `blur(${blur.toFixed(1)}px) saturate(${sat.toFixed(2)})`;
            }
          }
        },
      });

      return () => pinTrigger.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const jumpToBeat = (index: number) => {
    const trigger = ScrollTrigger.getAll().find(st => st.trigger === sectionRef.current);
    if (trigger) {
      const targetScroll = trigger.start + (index * 0.25 + 0.05) * STAGE_SCROLL.chithra;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  return (
    <section
      id={SECTION_IDS.chithra}
      ref={sectionRef}
      className="relative w-full border-t border-line/40 bg-background"
      style={{ height: `calc(100vh + ${STAGE_SCROLL.chithra}px)` }}
    >
      <div
        ref={pinRef}
        className="w-full h-screen sticky top-0 flex flex-col items-center justify-between py-20 md:py-24 px-6 md:px-12 overflow-hidden"
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[700px] h-[400px] rounded-full bg-accent/5 blur-[120px] mix-blend-screen" />
        </div>

        {/* Header & Narrative Anchor */}
        <div className="flex flex-col items-center text-center max-w-3xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-surface/60 backdrop-blur-md mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest">01 / Chithra</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-tight mb-3">
            The AI that tells you <span className="serif-accent text-accent">what it can't do.</span>
          </h2>

          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Chithra knows its own reach. Before it plans anything it is told exactly which tools exist — so it builds what it can and says the rest out loud, instead of describing a video it cannot make.
          </p>

          {/* Interactive Step Navigator */}
          <div className="mt-6 inline-flex items-center gap-1.5 p-1 rounded-full border border-line bg-surface/50 backdrop-blur-md">
            {STAGES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => jumpToBeat(idx)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-200 ${
                  activeBeat === idx
                    ? "bg-foreground text-background font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center Stage: The 4 Creative Beats */}
        <div className="relative w-full max-w-2xl h-[340px] flex items-center justify-center z-20">
          
          {/* Beat 0: User Prompt */}
          <div
            ref={beat0Ref}
            className="absolute inset-0 flex flex-col justify-center items-end pointer-events-auto transition-opacity duration-150"
            style={{ opacity: 1 }}
          >
            <div className="w-full max-w-lg glass-panel shadow-float p-6 rounded-2xl border border-line-strong">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Director</span>
                <span className="text-[11px] font-mono text-accent">Beat 01</span>
              </div>
              <p className="text-lg sm:text-xl font-light text-foreground leading-relaxed">
                &ldquo;Cut this interview down to 45 seconds, caption it for Reels, and grade it warm.&rdquo;
              </p>
            </div>
          </div>

          {/* Beat 1: Directorial Clarification */}
          <div
            ref={beat1Ref}
            className="absolute inset-0 flex flex-col justify-center gap-4 pointer-events-auto transition-opacity duration-150"
            style={{ opacity: 0 }}
          >
            <div className="w-full max-w-md glass-panel shadow-float p-5 rounded-2xl border border-accent/40 mr-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-mono text-accent uppercase tracking-widest">Chithra</span>
              </div>
              <p className="text-base sm:text-lg font-normal text-foreground">
                I can cut it against the transcript and caption it word by word. I can't grade footage yet — I'll build it without that, and tell you when I can.
              </p>
            </div>

            <div className="w-full max-w-md glass-panel shadow-float p-5 rounded-2xl border border-line-strong ml-auto">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 text-right">Director</div>
              <p className="text-base sm:text-lg font-light text-foreground text-right">
                Do it. Ping me when grading lands.
              </p>
            </div>
          </div>

          {/* Beat 2: Model & Cost Proposal */}
          <div
            ref={beat2Ref}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto transition-opacity duration-150"
            style={{ opacity: 0 }}
          >
            <div className="w-full max-w-lg glass-panel shadow-float p-6 rounded-2xl border border-line-strong">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-xs font-mono text-accent uppercase tracking-widest">Model Recommendation</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/30 text-xs font-mono text-accent font-semibold">
                  4 credits
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h4 className="text-xl font-semibold text-foreground">Seedream 4.5</h4>
                <span className="text-xs text-muted-foreground">Cinematic Engine</span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Strongest model at held reference light, atmospheric haze, and soft anamorphic lens flares.
              </p>

              <div className="pt-4 border-t border-line flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Nothing renders until you approve
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Approved
                </div>
              </div>
            </div>
          </div>

          {/* Beat 3: Developing Shot & Landed */}
          <div
            ref={beat3Ref}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto transition-opacity duration-150"
            style={{ opacity: 0 }}
          >
            <div className="w-full max-w-lg glass-panel shadow-float p-4 rounded-2xl border border-accent/40 flex flex-col items-center gap-3">
              <div
                ref={developImgRef}
                className="w-full aspect-video rounded-xl overflow-hidden relative bg-surface-2 shadow-2xl transition-all"
                style={{
                  backgroundImage: "url('/lighthouse.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(0px) saturate(1.1)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-md text-[10px] font-mono text-accent border border-line">
                  4K MASTER · GENERATED
                </div>
              </div>

              <div className="w-full flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                  <span className="text-xs font-medium text-foreground">Added to Project Canvas & Timeline</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">Track V1</span>
              </div>
            </div>
          </div>

        </div>

        {/* Scrub progress line */}
        <div className="w-full max-w-md flex flex-col items-center gap-2 z-10">
          <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-75"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            Scroll to scrub creative dialogue ({Math.round(progress * 100)}%)
          </span>
        </div>

      </div>
    </section>
  );
}
