"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ChithraDemo } from "./ChithraDemo";

const APP_URL = "https://app.vichith.in/login";

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 120]);
  const fade = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <section id="top" className="relative min-h-screen overflow-hidden pt-32 pb-24">
      <HeroBackdrop />

      <motion.div style={{ y, opacity: fade }} className="relative mx-auto grid max-w-[1180px] gap-16 px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 flex items-center gap-3"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
            <span className="eyebrow">Live at app.vichith.in</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-[12vw] leading-[0.94] font-semibold tracking-[-0.04em] sm:text-6xl md:text-[4.6rem]"
          >
            <span className="block font-syne font-bold text-white">From a sentence</span>
            <span className="block font-display bg-gradient-to-r from-white via-white/85 to-white/40 bg-clip-text text-transparent">
              to a finished{" "}
              <span className="serif-accent text-accent">frame.</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.35 }}
            className="mt-6 max-w-lg text-lg text-dim md:text-xl"
          >
            Vichith is a creative workspace where you describe what you're making. Chithra turns
            it into a project — characters, references, storyboard, and the generations that come
            from them — and shows you the cost before it spends a credit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <a
              href={APP_URL}
              className="group relative overflow-hidden rounded-full bg-accent px-6 py-3 text-[14px] font-medium text-accent-foreground transition-transform duration-500 hover:scale-[1.03]"
            >
              Start creating
            </a>
            <a
              href="#workflow"
              className="rounded-full border border-line-strong px-6 py-3 text-[14px] transition-colors duration-500 hover:bg-white/5"
            >
              See how it works
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChithraDemo />
        </motion.div>
      </motion.div>
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
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
