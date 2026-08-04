import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
const logo = { url: "/favicon_io/android-chrome-192x192.png" };

export type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const clipSets: Record<number, { w: number; tone: number; label: string }[]> = {
  0: [],
  1: [],
  2: [
    { w: 26, tone: 0.9, label: "hook" },
    { w: 18, tone: 0.6, label: "b-roll" },
    { w: 30, tone: 0.75, label: "scene 01" },
  ],
  3: [
    { w: 22, tone: 0.95, label: "hook" },
    { w: 14, tone: 0.55, label: "b-roll" },
    { w: 20, tone: 0.8, label: "scene 01" },
    { w: 18, tone: 0.65, label: "gen.clip" },
    { w: 16, tone: 0.85, label: "logo" },
  ],
  4: [
    { w: 20, tone: 0.95, label: "hook" },
    { w: 12, tone: 0.55, label: "b-roll" },
    { w: 18, tone: 0.8, label: "scene 01" },
    { w: 16, tone: 0.65, label: "gen.clip" },
    { w: 14, tone: 0.7, label: "voice" },
    { w: 14, tone: 0.9, label: "logo" },
  ],
  5: [
    { w: 20, tone: 0.95, label: "hook" },
    { w: 12, tone: 0.55, label: "b-roll" },
    { w: 18, tone: 0.8, label: "scene 01" },
    { w: 16, tone: 0.65, label: "gen.clip" },
    { w: 14, tone: 0.7, label: "voice" },
    { w: 14, tone: 0.9, label: "logo" },
  ],
  6: [
    { w: 20, tone: 0.95, label: "hook" },
    { w: 12, tone: 0.55, label: "b-roll" },
    { w: 18, tone: 0.8, label: "scene 01" },
    { w: 16, tone: 0.65, label: "gen.clip" },
    { w: 14, tone: 0.7, label: "voice" },
    { w: 14, tone: 0.9, label: "logo" },
  ],
};

const spring = { type: "spring" as const, stiffness: 120, damping: 22, mass: 0.9 };

export function EditorMock({
  stage,
  className = "",
  caption,
}: {
  stage: Stage;
  className?: string;
  caption?: string;
}) {
  const clips = clipSets[stage] ?? [];
  const assets = stage >= 2 ? (stage >= 3 ? 6 : 3) : 0;
  const waveform = useMemo(
    () => Array.from({ length: 56 }, (_, i) => 0.25 + Math.abs(Math.sin(i * 0.7)) * 0.75),
    [],
  );

  return (
    <div
      className={`glass relative overflow-hidden rounded-xl shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] ${className}`}
    >
      {/* title bar */}
      <div className="flex items-center gap-3 border-b border-line px-3 py-2">
        <img src={logo.url} alt="" className="h-4 w-4 opacity-90" />
        <span className="font-display text-[11px] tracking-tight">Vichith</span>
        <div className="ml-2 hidden gap-3 text-[10px] text-dim sm:flex">
          <span>File</span>
          <span>Timeline</span>
          <span>Effects</span>
          <span>AI</span>
        </div>
        <div className="mx-auto flex items-center gap-1 rounded-full border border-line bg-black/30 p-0.5 text-[10px]">
          {["Editor", "Research", "Studio"].map((t, i) => (
            <span
              key={t}
              className={`rounded-full px-2 py-0.5 ${i === 0 ? "bg-accent/15 text-accent" : "text-dim"}`}
            >
              {t}
            </span>
          ))}
        </div>
        <motion.span
          animate={
            stage >= 5
              ? { opacity: 1, boxShadow: "0 0 0 1px color-mix(in oklab, var(--color-accent) 60%, transparent)" }
              : { opacity: 0.5 }
          }
          className="rounded-md bg-accent/15 px-2 py-1 text-[10px] text-accent"
        >
          Export
        </motion.span>
      </div>

      <div className="grid grid-cols-[34px_1fr] sm:grid-cols-[34px_150px_1fr_130px]">
        {/* rail */}
        <div className="flex flex-col items-center gap-3 border-r border-line py-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-3.5 w-3.5 rounded-[4px] ${i === 0 ? "bg-accent/40" : "bg-white/8"}`}
            />
          ))}
        </div>

        {/* media */}
        <div className="hidden min-h-[150px] border-r border-line p-2 sm:block">
          <div className="mb-2 h-5 rounded-md border border-line bg-black/20" />
          {assets === 0 ? (
            <div className="mt-8 text-center text-[10px] text-dim">No media yet.</div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              <AnimatePresence>
                {Array.from({ length: assets }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.85, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ ...spring, delay: i * 0.06 }}
                    className="aspect-video rounded-[5px] border border-line bg-gradient-to-br from-white/8 to-transparent"
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* preview */}
        <div className="p-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-black">
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: stage >= 2 ? 1 : 0,
                filter: stage === 4 ? "saturate(0)" : "saturate(1)",
              }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background:
                  "radial-gradient(120% 90% at 20% 10%, color-mix(in oklab, var(--color-accent) 22%, transparent), transparent 60%), radial-gradient(100% 80% at 85% 90%, rgba(70,110,160,0.35), transparent 65%)",
              }}
            />
            <AnimatePresence>
              {stage >= 4 && caption && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className="absolute inset-x-0 bottom-3 text-center"
                >
                  <span className="rounded bg-black/60 px-2 py-1 font-mono text-[10px] tracking-wide">
                    {caption}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {stage === 6 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 grid place-items-center bg-black/45"
                >
                  <div className="w-1/2">
                    <div className="mb-1.5 font-mono text-[10px] text-accent">Publishing…</div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.2, ease: "easeInOut" }}
                        className="h-full bg-accent"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* timeline */}
          <div className="mt-3 rounded-lg border border-line bg-black/25 p-2">
            <div className="relative">
              <div className="mb-1.5 flex gap-1">
                <AnimatePresence mode="popLayout">
                  {clips.map((c) => (
                    <motion.div
                      key={c.label}
                      layout
                      initial={{ opacity: 0, scaleX: 0.4 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0.4 }}
                      transition={spring}
                      style={{
                        width: `${c.w}%`,
                        background: `linear-gradient(120deg, color-mix(in oklab, var(--color-accent) ${
                          c.tone * 30
                        }%, transparent), rgba(255,255,255,0.04))`,
                      }}
                      className="h-6 origin-left overflow-hidden rounded-[5px] border border-line px-1.5 pt-1 font-mono text-[8px] text-white/70"
                    >
                      {c.label}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {clips.length === 0 && (
                  <div className="h-6 w-full rounded-[5px] border border-dashed border-line" />
                )}
              </div>
              <div className="flex h-5 items-end gap-[2px]">
                {waveform.map((h, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      height: stage >= 4 ? `${h * 100}%` : stage >= 2 ? `${h * 55}%` : "8%",
                      opacity: stage >= 2 ? 0.8 : 0.25,
                    }}
                    transition={{ ...spring, delay: i * 0.006 }}
                    className="flex-1 rounded-[1px] bg-accent/50"
                  />
                ))}
              </div>
              {stage >= 2 && (
                <motion.div
                  initial={{ left: "0%" }}
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                  className="pointer-events-none absolute top-0 h-full w-px bg-accent"
                />
              )}
            </div>
          </div>
        </div>

        {/* inspector */}
        <div className="hidden border-l border-line p-2 sm:block">
          <div className="eyebrow mb-2 text-[9px]">Project</div>
          {[
            ["Resolution", "1920×1080"],
            ["FPS", "30"],
            ["Sequences", "1"],
            ["Media", assets ? String(assets) : "0"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1 text-[9px]">
              <span className="text-dim">{k}</span>
              <span className="font-mono">{v}</span>
            </div>
          ))}
          <AnimatePresence>
            {stage >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                className="mt-3 rounded-md border border-accent/25 bg-accent/8 p-2"
              >
                <div className="font-mono text-[9px] text-accent">chithra · active</div>
                <div className="mt-1 text-[9px] leading-relaxed text-dim">
                  {stage >= 5 ? "Review complete" : "Composing sequence"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}