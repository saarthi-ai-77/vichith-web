const REQUEST_ACCESS_URL = "https://app.vichith.in/request-access";
const logo = { url: "/favicon_io/android-chrome-192x192.png" };

export function SiteFooter() {
  return (
    <footer className="w-full px-6 py-16 md:px-12 bg-[#060608] border-t border-white/[0.06] text-xs font-mono text-muted-foreground">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2 space-y-4">
          <a href="/" className="flex items-center gap-2.5">
            <img src={logo.url} alt="Vichith" className="h-6 w-6 rounded" />
            <span className="font-display text-[15px] font-bold tracking-tight text-foreground">
              vichith
            </span>
          </a>
          <p className="max-w-sm text-xs font-sans text-muted-foreground leading-relaxed">
            Where AI does the creative work and the creator keeps the craft.
            Connecting intent, intelligence, and editing into one project.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Early Access Phase 1 Active</span>
          </div>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground font-semibold block mb-3">
            Workflow
          </span>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#chithra" className="hover:text-foreground transition-colors">
                Chithra Intelligence
              </a>
            </li>
            <li>
              <a href="#intent" className="hover:text-foreground transition-colors">
                Intent to Video
              </a>
            </li>
            <li>
              <a href="#control" className="hover:text-foreground transition-colors">
                Creator Control
              </a>
            </li>
            <li>
              <a href="#canvas" className="hover:text-foreground transition-colors">
                Unified Canvas
              </a>
            </li>
          </ul>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground font-semibold block mb-3">
            Ecosystem
          </span>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href={REQUEST_ACCESS_URL}
                className="text-accent hover:underline font-medium"
              >
                Request Early Access →
              </a>
            </li>
            <li>
              <a
                href="https://x.com/vichith_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Twitter / X
              </a>
            </li>
            <li>
              <a
                href="https://discord.gg/679D4UsTS"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Discord Community
              </a>
            </li>
            <li>
              <a href="/report" className="hover:text-foreground transition-colors">
                Report an Issue
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-12 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground/60">
        <span>© {new Date().getFullYear()} Vichith Inc. Built in public.</span>
        <span>AI handles the heavy work. You keep the craft.</span>
      </div>
    </footer>
  );
}

