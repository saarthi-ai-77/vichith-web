"use client";

export function SceneEcosystem() {
  return (
    <div
      className="scene absolute inset-0 flex items-center justify-center preserve-3d"
      style={{ transform: "translateZ(-8000px)" }}
      data-z="-8000"
    >
      {/* 
        The concept here is that the camera pushes 'into' the final frame, 
        which then expands to become the Desktop UI window.
      */}
      <div 
        className="w-[90vw] h-[60vh] md:h-[80vh] border border-line rounded-2xl overflow-hidden bg-background/80 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col relative"
        style={{ transform: "translateZ(100px)" }}
      >
        {/* Fake Desktop Titlebar */}
        <div className="h-10 border-b border-line flex items-center px-4 gap-4 bg-surface/50">
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-line-strong"></div>
             <div className="w-3 h-3 rounded-full bg-line-strong"></div>
             <div className="w-3 h-3 rounded-full bg-line-strong"></div>
           </div>
           <div className="text-xs font-mono text-muted-foreground mx-auto truncate px-4">Vichith Studio — project_04.vch</div>
        </div>

        {/* Desktop UI Layout */}
        <div className="flex-1 flex overflow-hidden">
           {/* Sidebar (Hidden on mobile) */}
           <div className="hidden md:flex w-64 border-r border-line p-4 flex-col gap-2">
              <div className="h-8 bg-surface rounded-md"></div>
              <div className="h-8 bg-surface rounded-md w-3/4"></div>
              <div className="h-8 bg-surface rounded-md"></div>
           </div>
           {/* Main Viewport */}
           <div className="flex-1 relative flex flex-col">
              <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                 <div className="w-full h-full border border-dashed border-line-strong rounded-xl flex items-center justify-center">
                    <span className="eyebrow text-sm md:text-xl text-center px-4">The Finished Work</span>
                 </div>
              </div>
              {/* Timeline */}
              <div className="h-32 md:h-48 border-t border-line p-4 grid gap-2">
                 <div className="h-6 bg-surface/50 rounded-sm w-full relative">
                    <div className="absolute left-[10%] w-[30%] h-full bg-accent/20 rounded-sm border border-accent/40"></div>
                 </div>
                 <div className="h-6 bg-surface/50 rounded-sm w-full relative">
                    <div className="absolute left-[20%] w-[50%] h-full bg-accent/20 rounded-sm border border-accent/40"></div>
                 </div>
              </div>
           </div>
           {/* Right Panel (Hidden on mobile) */}
           <div className="hidden md:flex w-72 border-l border-line p-4 flex-col gap-4">
              <div className="h-32 glass-panel"></div>
              <div className="h-48 glass-panel"></div>
           </div>
        </div>

        {/* Overlay Text explaining the transition */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6 md:p-0" style={{ transform: "translateZ(200px)" }}>
           <h2 className="text-4xl md:text-6xl text-white font-medium drop-shadow-2xl text-center leading-tight">
             <span className="eyebrow block mb-4 tracking-widest text-white/50 text-xs md:text-sm">THE FINISHED WORK</span>
             From Web Ideation <br />
             <span className="serif-accent text-accent">to Desktop Finishing.</span>
           </h2>
        </div>
      </div>
    </div>
  );
}
