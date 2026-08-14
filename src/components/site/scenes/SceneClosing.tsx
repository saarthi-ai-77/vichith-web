"use client";

export function SceneClosing() {
  return (
    <div
      className="scene absolute inset-0 flex flex-col items-center justify-center preserve-3d"
      style={{ transform: "translateZ(-10000px)" }}
      data-z="-10000"
    >
      <div className="text-center">
        <h1 className="text-[10vw] leading-none tracking-tighter font-medium mb-12">
          Make what you <br />
          <span className="serif-accent text-accent">imagined.</span>
        </h1>
        <div className="flex gap-4 justify-center">
          <a 
            href="https://app.vichith.com" 
            className="px-10 py-5 bg-foreground text-background font-bold text-lg rounded-full hover:bg-accent hover:text-background transition-colors duration-300 shadow-[0_0_20px_color-mix(in_oklab,var(--color-accent)_20%,transparent)] hover:shadow-[0_0_30px_color-mix(in_oklab,var(--color-accent)_60%,transparent)]"
          >
            Start Creating
          </a>
          <button className="px-10 py-5 bg-transparent border border-line text-foreground font-medium text-lg rounded-full hover:bg-surface transition-colors duration-300">
            View the Gallery
          </button>
        </div>
      </div>
      
      {/* Footer minimal integration */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between px-12 text-sm text-muted-foreground eyebrow" style={{ transform: "translateZ(100px)" }}>
         <div>© 2026 Vichith Inc.</div>
         <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">Discord</a>
            <a href="#" className="hover:text-foreground transition-colors">Careers</a>
         </div>
      </div>
    </div>
  );
}
