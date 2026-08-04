import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "./Section";

type Cmd = {
  text: string;
  effect: string;
  inspector: string[];
  clips: { w: number; label: string; gen?: boolean }[];
  grade: string;
  wave: "full" | "tight";
};

const commands: Cmd[] = [
  {
    text: "Apply a cinematic black and white look.",
    effect: "grade · mono.cine",
    inspector: ["Contrast +18", "Halation 0.24", "Grain 35mm"],
    clips: [
      { w: 26, label: "hook" },
      { w: 20, label: "scene 01" },
      { w: 18, label: "scene 02" },
      { w: 22, label: "outro" },
    ],
    grade: "grayscale(1) contrast(1.15)",
    wave: "full",
  },
  {
    text: "Remove silence.",
    effect: "audio · silence.strip",
    inspector: ["-14 dB floor", "42 cuts", "Duration −1:08"],
    clips: [
      { w: 20, label: "hook" },
      { w: 16, label: "scene 01" },
      { w: 14, label: "scene 02" },
      { w: 16, label: "outro" },
    ],
    grade: "grayscale(1) contrast(1.15)",
    wave: "tight",
  },
  {
    text: "Generate B-roll for the second act.",
    effect: "generate · broll ×3",
    inspector: ["3 clips inserted", "Match cut ×2", "Captions re-synced"],
    clips: [
      { w: 16, label: "hook" },
      { w: 12, label: "scene 01" },
      { w: 12, label: "b-roll", gen: true },
      { w: 12, label: "scene 02" },
      { w: 12, label: "b-roll", gen: true },
      { w: 12, label: "b-roll", gen: true },
      { w: 14, label: "outro" },
    ],
    grade: "grayscale(0.2) saturate(1.1)",
    wave: "tight",
  },
];

const spring = { type: "spring" as const, stiffness: 130, damping: 20 };

export function Chithra() {
  const [i, setI] = useState(0);
  const [showCmd, setShowCmd] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setShowCmd(false);
      setTimeout(() => {
        setI((p) => (p + 1) % commands.length);
        setShowCmd(true);
      }, 2600);
    }, 6200);
    return () => clearInterval(cycle);
  }, []);

  const cmd = commands[i]!;

  return (
    <Section
      id="chithra"
      eyebrow="Chithra — The Editorial Brain"
      title={
        <>
          You don't chat with it.
          <br />
          You edit through it.
        </>
      }
      lede="Chithra is an intelligent command layer inside the timeline. Language goes in; the sequence, preview, and inspector change together."
    >
      <div className="glass relative overflow-hidden rounded-2xl p-4 md:p-6">
        {/* command layer */}
        <div className="relative mb-5 h-10">
          <AnimatePresence mode="wait">
            {showCmd && (
              <motion.div
                key={cmd.text}
                initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(14px)", scale: 1.02 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center gap-3"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="font-display text-lg tracking-tight md:text-2xl">{cmd.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!showCmd && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center"
              >
                <span className="rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[11px] text-accent">
                  {cmd.effect}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
          <div>
            <motion.div
              animate={{ filter: showCmd ? "grayscale(0) saturate(1)" : cmd.grade }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[16/8] overflow-hidden rounded-xl border border-line bg-black"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(110% 90% at 25% 15%, color-mix(in oklab, var(--color-accent) 26%, transparent), transparent 62%), radial-gradient(90% 80% at 80% 85%, rgba(80,120,180,0.4), transparent 60%)",
                }}
              />
              <motion.div
                animate={{ opacity: showCmd ? 0 : 1, y: showCmd ? 8 : 0 }}
                transition={spring}
                className="absolute inset-x-0 bottom-4 text-center"
              >
                <span className="rounded bg-black/60 px-2 py-1 font-mono text-[11px]">
                  captions regenerated
                </span>
              </motion.div>
            </motion.div>

            {/* timeline */}
            <div className="mt-4 rounded-xl border border-line bg-black/25 p-3">
              <div className="flex gap-1">
                <AnimatePresence mode="popLayout">
                  {cmd.clips.map((c, k) => (
                    <motion.div
                      key={`${c.label}-${k}`}
                      layout
                      initial={{ opacity: 0, scaleX: 0.3 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0.3 }}
                      transition={{ ...spring, delay: k * 0.05 }}
                      style={{ width: `${c.w}%` }}
                      className={`h-8 origin-left overflow-hidden rounded-md border px-2 pt-1.5 font-mono text-[9px] ${
                        c.gen
                          ? "border-accent/50 bg-accent/20 text-accent"
                          : "border-line bg-white/5 text-white/60"
                      }`}
                    >
                      {c.label}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="mt-2 flex h-8 items-end gap-[2px]">
                {Array.from({ length: 72 }).map((_, k) => {
                  const base = 0.2 + Math.abs(Math.sin(k * 0.55)) * 0.8;
                  const silent = k % 9 < 3;
                  return (
                    <motion.span
                      key={k}
                      animate={{
                        height:
                          cmd.wave === "tight" && silent ? "6%" : `${base * 100}%`,
                        opacity: cmd.wave === "tight" && silent ? 0.15 : 0.75,
                      }}
                      transition={{ ...spring, delay: k * 0.008 }}
                      className="flex-1 rounded-[1px] bg-accent/50"
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* inspector */}
          <div className="rounded-xl border border-line bg-black/20 p-4">
            <div className="eyebrow mb-4 text-[10px]">Inspector</div>
            <AnimatePresence mode="wait">
              <motion.div
                key={cmd.effect}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2"
              >
                <div className="rounded-md border border-accent/25 bg-accent/8 p-2.5 font-mono text-[11px] text-accent">
                  {cmd.effect}
                </div>
                {cmd.inspector.map((row, k) => (
                  <motion.div
                    key={row}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + k * 0.1, duration: 0.6 }}
                    className="flex items-center justify-between rounded-md border border-line px-2.5 py-2 text-[12px] text-dim"
                  >
                    <span>{row}</span>
                    <span className="h-1 w-1 rounded-full bg-accent/70" />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            <div className="mt-5 flex gap-1.5">
              {commands.map((c, k) => (
                <button
                  key={c.effect}
                  onClick={() => {
                    setI(k);
                    setShowCmd(true);
                  }}
                  aria-label={c.text}
                  className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                    k === i ? "bg-accent" : "bg-white/12"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}