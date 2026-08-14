"use client";

import { motion } from "framer-motion";

const APP_URL = "https://app.vichith.in/login";

const principles: [string, string][] = [
  [
    "Cost, before it's spent",
    "Every generation shows its credit cost and waits for your approval. Nothing is charged silently, and nothing is charged for a result you never received.",
  ],
  [
    "No fake success",
    "If a generation fails, the project says so — it doesn't pretend the work exists.",
  ],
  [
    "Your project, not a session",
    "Characters, references, and storyboard decisions stay attached to the project, not to one conversation.",
  ],
];

export function SectionPhilosophy() {
  return (
    <section className="rule-x px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1180px]">
        <span className="eyebrow">06 — How we build it</span>
        <h2 className="mt-6 max-w-3xl text-4xl font-medium leading-[1.02] md:text-6xl">
          Honest by <span className="serif-accent text-accent">default</span>.
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {principles.map(([title, copy], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="text-lg tracking-[-0.02em] text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-dim">{copy}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="start" className="rule-x px-6 py-32 md:px-10 md:py-44">
      <div className="mx-auto max-w-[1180px] text-center">
        <span className="eyebrow">No waitlist</span>
        <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-medium leading-[1.02] md:text-7xl">
          Ready when <span className="serif-accent text-accent">you</span> are.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-dim">
          Sign in and start a project — Chithra will meet you at the first sentence.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={APP_URL}
            className="rounded-full bg-accent px-7 py-3.5 text-[14px] font-medium text-accent-foreground transition-transform duration-500 hover:scale-[1.03]"
          >
            Start creating
          </a>
          <span className="flex items-center gap-2 rounded-full border border-line-strong px-7 py-3.5 text-[14px] text-dim">
            Desktop app
            <span className="eyebrow rounded-full border border-line px-2 py-0.5 text-[9px]">
              Coming soon
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
