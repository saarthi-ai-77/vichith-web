"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PROMPT = "Portrait of Mira, teal rim light, from her saved references.";

type Stage = "typing" | "narrating" | "proposal" | "generating" | "settled";

const spring = { type: "spring" as const, stiffness: 140, damping: 20, mass: 0.8 };

export function ChithraDemo({ className = "" }: { className?: string }) {
  const [typed, setTyped] = useState("");
  const [stage, setStage] = useState<Stage>("typing");

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setTyped(PROMPT.slice(0, i));
      if (i >= PROMPT.length) {
        clearInterval(t);
        setTimeout(() => setStage("narrating"), 500);
      }
    }, 32);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (stage !== "narrating") return;
    const t = setTimeout(() => setStage("proposal"), 1400);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "generating") return;
    const t = setTimeout(() => setStage("settled"), 1800);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <div className={`glass relative overflow-hidden rounded-xl shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] ${className}`}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <div className="h-4 w-4 rounded-full bg-accent/20" />
        <span className="font-display text-[11px] tracking-tight">Chithra</span>
        <span className="eyebrow ml-2 text-[9px]">Mira's Portraits</span>
        <span className="ml-auto font-mono text-[9px] text-dim">approval required to spend credits</span>
      </div>

      <div className="flex min-h-[280px] flex-col justify-end gap-3 p-4 sm:p-6">
        {/* user message */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-white/8 px-4 py-2.5 text-[13px] leading-relaxed">
            {typed}
            {stage === "typing" && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity }}
                className="text-accent"
              >
                |
              </motion.span>
            )}
          </div>
        </div>

        {/* narration */}
        <AnimatePresence>
          {stage !== "typing" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="flex justify-start"
            >
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-line bg-black/20 px-4 py-2.5 text-[13px] leading-relaxed text-dim">
                Found Mira in your Character Gita and her saved reference. One image, teal rim
                light, matching her canonical look.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* proposal card */}
        <AnimatePresence>
          {(stage === "proposal" || stage === "generating" || stage === "settled") && (
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={spring}
              className="panel px-4 py-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow text-[9px]">Generate image</span>
                <span className="font-mono text-[10px] text-accent">≈ 6 credits</span>
              </div>
              <div className="mt-2 text-[12.5px] text-dim">Nano Banana · 1 image · 1024×1024</div>

              {stage === "proposal" && (
                <div className="mt-3 flex gap-2">
                  <motion.button
                    onClick={() => setStage("generating")}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-full bg-accent px-3.5 py-1.5 text-[11px] font-medium text-accent-foreground"
                  >
                    Approve
                  </motion.button>
                  <span className="rounded-full border border-line px-3.5 py-1.5 text-[11px] text-dim">
                    Decline
                  </span>
                </div>
              )}

              {stage === "generating" && (
                <div className="mt-3 flex items-center gap-2 font-mono text-[10px] text-dim">
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-accent"
                  />
                  generating…
                </div>
              )}

              {stage === "settled" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-3"
                >
                  <div
                    className="h-14 w-14 shrink-0 rounded-lg border border-line"
                    style={{
                      background:
                        "radial-gradient(120% 100% at 30% 20%, color-mix(in oklab, var(--color-accent) 35%, transparent), transparent 65%), radial-gradient(100% 90% at 80% 90%, rgba(70,110,160,0.4), transparent 65%)",
                    }}
                  />
                  <div className="font-mono text-[10px] text-dim">
                    settled at <span className="text-accent">6 credits</span>
                    <br />
                    nothing charged before this
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
