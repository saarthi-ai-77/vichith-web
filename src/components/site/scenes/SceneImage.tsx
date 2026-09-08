"use client";

import { SECTION_IDS } from "@/lib/spatial";

/**
 * Scene 05 — the Image Editor.
 *
 * The fourth workspace, and the one nobody expects a video tool to have. It
 * exists for a specific, verifiable reason: image models cannot reliably render
 * text, so a generated thumbnail arrives with malformed lettering and is
 * unusable until someone covers it and retypes it.
 *
 * The visual is that job, staged rather than described — a generated frame with
 * broken type, a plate laid over it, and real type on top. Built from the same
 * glass-panel and depth vocabulary as every other scene so it belongs to the
 * page rather than announcing itself as an addition.
 */
export function SceneImage() {
  return (
    <section
      id={SECTION_IDS.image}
      className="relative w-full py-24 md:py-36 px-6 md:px-12 lg:px-20 border-t border-line/40 bg-background overflow-hidden"
    >
      {/* Ambient depth, matching the other scenes' volumetric treatment */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[720px] h-[420px] rounded-full bg-accent/6 blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left: the argument */}
        <div className="lg:col-span-5 flex flex-col items-start z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-surface/60 backdrop-blur-md mb-6">
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest">04 / Image Editor</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[1.08] mb-6 text-foreground">
            Every model gets<br />
            <span className="serif-accent text-accent">the text wrong.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
            Ask any image model for a thumbnail with a headline on it and the lettering comes back broken. So Vichith gives you a canvas: cover the bad type with a shape, set real type on top, move it where you want, and export it. The thumbnail never leaves the project.
          </p>

          <div className="flex flex-col gap-4 w-full">
            <div className="p-4 rounded-xl border border-line/60 bg-surface/30 backdrop-blur-sm transition-colors hover:border-line-strong">
              <div className="text-sm font-semibold text-foreground mb-1">Real type, not generated type</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Text you can select, restyle and re-read. Outlined by default so it holds against any picture underneath it.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-line/60 bg-surface/30 backdrop-blur-sm transition-colors hover:border-line-strong">
              <div className="text-sm font-semibold text-foreground mb-1">Every script, correctly shaped</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Latin, Devanagari, Telugu, Tamil, Bengali and more — conjuncts formed properly, not squares where letters should be.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-line/60 bg-surface/30 backdrop-blur-sm transition-colors hover:border-line-strong">
              <div className="text-sm font-semibold text-foreground mb-1">What you see is what exports</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The preview and the PNG are drawn by the same renderer, so the file is never a surprise.
              </p>
            </div>
          </div>
        </div>

        {/* Right: the job, staged */}
        <div className="lg:col-span-7 relative w-full flex items-center justify-center perspective-1000">
          <div
            className="relative w-full max-w-[560px] aspect-[16/10] rounded-2xl overflow-hidden border border-line-strong shadow-float bg-surface"
            style={{ transform: "rotateY(-6deg) rotateX(3deg)" }}
          >
            {/* The generated frame underneath */}
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage: "url('/shot.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-transparent" />

            {/* What the model produced — deliberately wrong */}
            <div className="absolute top-7 left-7 right-7">
              <div className="text-[11px] font-mono text-muted-foreground/70 uppercase tracking-widest mb-1.5">
                Generated
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/25 line-through decoration-accent/40 decoration-2">
                THE FRIST EPISODE
              </div>
            </div>

            {/* The plate, and the real type on it */}
            <div className="absolute bottom-8 left-7 right-7">
              <div className="inline-block rounded-md bg-background/90 backdrop-blur-sm px-4 py-3 border border-accent/25">
                <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-1">
                  Shape + text layer
                </div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  THE FIRST EPISODE
                </div>
              </div>
            </div>

            {/* Selection chrome — the same language the editor itself uses */}
            <div className="pointer-events-none absolute bottom-6 left-5 right-5 h-[92px] rounded-md border border-accent/50">
              <span className="absolute -top-1 -left-1 w-2 h-2 bg-accent rounded-[1px]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-[1px]" />
              <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-accent rounded-[1px]" />
              <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-accent rounded-[1px]" />
            </div>

            <div className="absolute top-4 right-4 px-2 py-0.5 rounded bg-background/80 border border-line text-[10px] font-mono text-muted-foreground">
              1080 × 1080
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
