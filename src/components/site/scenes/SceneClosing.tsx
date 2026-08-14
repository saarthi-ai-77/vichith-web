"use client";

export function SceneClosing() {
  return (
    <div
      className="scene relative md:absolute inset-0 flex flex-col items-center justify-center md:preserve-3d min-h-screen py-24 md:py-0 md:[transform:translateZ(-10000px)]"
      data-z="-10000"
    >
      <div className="text-center w-full px-6 md:px-0">
        <h1 className="text-[18vw] md:text-[10vw] leading-[1.1] md:leading-none tracking-tighter font-medium mb-12">
          Make what you <br className="hidden md:block" />
          <span className="serif-accent text-accent md:ml-4">imagined.</span>
        </h1>
        <div className="flex flex-col md:flex-row gap-4 justify-center w-full max-w-sm mx-auto md:max-w-none">
          <a 
            href="https://app.vichith.com" 
            className="w-full md:w-auto px-10 py-5 bg-foreground text-background font-bold text-lg rounded-full hover:bg-accent hover:text-background transition-colors duration-300 shadow-[0_0_20px_color-mix(in_oklab,var(--color-accent)_20%,transparent)] hover:shadow-[0_0_30px_color-mix(in_oklab,var(--color-accent)_60%,transparent)]"
          >
            Start Creating
          </a>
          <button className="w-full md:w-auto px-10 py-5 bg-transparent border border-line text-foreground font-medium text-lg rounded-full hover:bg-surface transition-colors duration-300">
            View the Gallery
          </button>
        </div>
      </div>
      
      {/* Footer minimal integration */}
      <div className="relative md:absolute mt-32 md:mt-0 bottom-8 left-0 right-0 flex flex-col md:flex-row justify-between items-center px-6 md:px-12 text-sm text-muted-foreground eyebrow gap-8 md:gap-0 md:[transform:translateZ(100px)]">
         <div>© 2026 Vichith Inc.</div>
         <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">Discord</a>
            <a href="#" className="hover:text-foreground transition-colors">Careers</a>
         </div>
      </div>
    </div>
  );
}
