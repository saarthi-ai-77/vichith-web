"use client";

import { SECTION_IDS } from "@/lib/spatial";

export function SceneClosing() {
  return (
    <section
      id={SECTION_IDS.closing}
      className="relative w-full min-h-[90vh] flex flex-col justify-between py-20 md:py-28 px-6 md:px-12 lg:px-20 border-t border-line/40 bg-background overflow-hidden"
    >
      {/* Background Volumetric Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[800px] h-[500px] rounded-full bg-accent/8 blur-[160px] mix-blend-screen" />
        <div className="w-[500px] h-[300px] rounded-full bg-surface-2/60 blur-[120px]" />
      </div>

      {/* Main Closing Headline & CTA */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto my-auto z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-surface/60 backdrop-blur-md mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Early Access Phase 1</span>
        </div>

        <h2 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl leading-[1.02] tracking-tighter font-medium mb-8 text-foreground">
          Bring an idea. <br className="hidden sm:block" />
          <span className="serif-accent text-accent sm:ml-4">Leave with the film.</span>
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Plan it, generate it, cut it, caption it, and fix the thumbnail — in one project, in any language, without a second tool. Every part of it is free to do by hand.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a
            href="https://app.vichith.in/request-access"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-foreground text-background font-bold text-base transition-all duration-150 hover:bg-accent hover:text-background active:scale-[0.97] shadow-xl shadow-black/40"
          >
            Request Early Access
          </a>
          <a
            href="https://app.vichith.in/invite"
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-line bg-surface/40 text-foreground font-semibold text-base transition-all duration-150 hover:bg-surface hover:border-line-strong active:scale-[0.97]"
          >
            Enter Invite Code
          </a>
        </div>
      </div>

      {/* Semantic Polish Footer */}
      <div className="w-full max-w-[1240px] mx-auto pt-16 border-t border-line/50 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="font-display font-semibold text-foreground tracking-tight">vichith</span>
          <span>© 2026 Vichith Inc. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>All Systems Operational</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://x.com/vichith_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-150"
          >
            X (Twitter)
          </a>
          <a
            href="https://discord.gg/679D4UsTS"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-150"
          >
            Discord
          </a>
          <a
            href="https://www.instagram.com/vichith.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-150"
          >
            Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
