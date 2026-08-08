import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { EditorMock, type Stage } from "./EditorMock";

const PHRASE = "Create a 60-second product teaser with B-roll and upbeat audio.";

export function Hero() {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "zoom">("typing");
  const [stage, setStage] = useState<Stage>(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 120]);
  const fade = useTransform(scrollY, [0, 600], [1, 0]);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setTyped(PHRASE.slice(0, i));
      if (i >= PHRASE.length) {
        clearInterval(t);
        setTimeout(() => setPhase("zoom"), 900);
      }
    }, 55);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (phase !== "zoom") return;
    const steps: [Stage, number][] = [
      [1, 400],
      [2, 1400],
      [3, 2600],
      [4, 3900],
      [5, 5200],
    ];
    const ids = steps.map(([s, d]) => setTimeout(() => setStage(s), d));
    return () => ids.forEach(clearTimeout);
  }, [phase]);

  return (
    <section id="top" className="relative min-h-screen overflow-hidden pt-32 pb-24">
      <HeroBackdrop />

      <motion.div style={{ y, opacity: fade }} className="relative mx-auto max-w-[1180px] px-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 flex items-center justify-center gap-3 sm:justify-start"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
          <span className="eyebrow">Early Access Waitlist</span>
        </motion.div>

        <div className="mt-8 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-[11vw] leading-[0.92] font-semibold tracking-[-0.04em] sm:text-6xl md:text-[5.4rem]"
          >
            <span className="block font-syne font-bold text-white tracking-[-0.045em]">
              One workflow.
            </span>
            <span className="block font-display bg-gradient-to-r from-white via-white/85 to-white/40 bg-clip-text text-transparent tracking-[-0.03em]">
              Every creative tool.
            </span>
            <span className="mt-2 block font-editorial italic font-normal tracking-normal text-dim/95">
              Powered by{" "}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-4 py-0.5 text-[0.78em] font-mono not-italic font-semibold tracking-wide text-accent shadow-[0_0_25px_rgba(0,229,160,0.25)] backdrop-blur-md align-middle">
                AI.
              </span>
            </span>
          </motion.h1>

          <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-2">

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.35 }}
              className="text-lg text-dim md:text-xl"
            >
              Unifying timeline editing, AI generation, auto-captions, and audio in one desktop workspace. Built in public with creators.
            </motion.p>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="eyebrow"
            >
              AI Powered
            </motion.span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <a
              href="#waitlist"
              className="group relative overflow-hidden rounded-full bg-accent px-6 py-3 text-[14px] font-medium text-accent-foreground transition-transform duration-500 hover:scale-[1.03]"
            >
              Join Waitlist
            </a>
            <a
              href="#scenes"
              className="rounded-full border border-line-strong px-6 py-3 text-[14px] transition-colors duration-500 hover:bg-white/5"
            >
              Watch the workflow
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* command → interface */}
      <div className="relative mx-auto mt-20 max-w-[1080px] px-6 [perspective:1600px]">
        <AnimatePresence>
          {phase === "typing" && (
            <motion.div
              key="cmd"
              exit={{ opacity: 0, filter: "blur(12px)", y: -12 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-6 top-16 z-10 text-center"
            >
              <span className="font-display text-xl tracking-tight md:text-3xl">
                “{typed}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  className="text-accent"
                >
                  |
                </motion.span>
                ”
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0.15, scale: 0.86, rotateX: 14, y: 60, filter: "blur(14px)" }}
          animate={
            phase === "zoom"
              ? { opacity: 1, scale: 1, rotateX: 0, y: 0, filter: "blur(0px)" }
              : { opacity: 0.18, scale: 0.86, rotateX: 14, y: 60, filter: "blur(14px)" }
          }
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <EditorMock stage={stage} caption="a 60-second product teaser" />
        </motion.div>
      </div>
    </section>
  );
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid-field" />
      <motion.div
        animate={{ x: ["-12%", "12%", "-12%"], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 left-1/4 h-[46rem] w-[46rem] rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 18%, transparent), transparent 65%)",
        }}
      />
      <motion.div
        animate={{ x: ["8%", "-10%", "8%"], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 46, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 right-0 h-[38rem] w-[38rem] rounded-full blur-[150px]"
        style={{ background: "radial-gradient(circle, rgba(70,110,170,0.28), transparent 65%)" }}
      />
      {/* slow light rays */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0, 0.18, 0], y: ["-10%", "10%"] }}
          transition={{ duration: 18 + i * 7, repeat: Infinity, ease: "easeInOut", delay: i * 4 }}
          className="absolute top-0 h-[120%] w-[240px] -rotate-12 bg-gradient-to-b from-accent/25 to-transparent blur-3xl"
          style={{ left: `${18 + i * 28}%` }}
        />
      ))}
      {/* drifting timeline ticks */}
      <motion.div
        animate={{ x: [0, -160] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-10 flex w-[200%] gap-4 opacity-[0.14]"
      >
        {Array.from({ length: 120 }).map((_, i) => (
          <span key={i} className={`w-px bg-white ${i % 5 === 0 ? "h-5" : "h-2"}`} />
        ))}
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}