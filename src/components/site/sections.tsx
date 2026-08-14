"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

/* ---------------- 01 · Workflow ---------------- */

const flow = ["idea", "research", "references", "characters", "storyboard", "generation", "edit"];

export function SectionWorkflow() {
  return (
    <section id="workflow" className="rule-x px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1180px]">
        <span className="eyebrow">01 — The workflow</span>
        <h2 className="mt-6 max-w-3xl text-4xl font-medium leading-[1.02] md:text-6xl">
          An idea moves through <span className="serif-accent text-accent">one</span> place, not
          ten tools.
        </h2>

        <ol className="mt-16 md:mt-24">
          {flow.map((step, i) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="group grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-6 border-t border-line py-4 md:gap-10 md:py-6"
              style={{ paddingLeft: `min(${i * 2.4}vw, 11rem)` }}
            >
              <span className="eyebrow shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span
                className={`text-[clamp(1.4rem,4.4vw,3rem)] tracking-[-0.03em] transition-colors duration-500 ${
                  i === flow.length - 1
                    ? "serif-accent text-foreground"
                    : "text-dim group-hover:text-foreground"
                }`}
              >
                {step}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- 02 · Chithra ---------------- */

const briefs: { prompt: string; reads: [string, string][] }[] = [
  {
    prompt: "A lone astronaut character for my sci-fi short — generate her first portrait.",
    reads: [
      ["Character Gita", "Mira — visor reflection, worn suit"],
      ["Reference board", "0 saved · none needed yet"],
      ["Storyboard", "unaffected"],
      ["Estimated cost", "≈ 6 credits, before you approve"],
    ],
  },
  {
    prompt: "Save this photo as a lighting reference and match it in the next shot.",
    reads: [
      ["Character Gita", "unaffected"],
      ["Reference board", "1 saved · teal rim light"],
      ["Storyboard", "next shot flagged for the match"],
      ["Estimated cost", "≈ 6 credits, before you approve"],
    ],
  },
  {
    prompt: "Turn this beat sheet into a storyboard for a 6-part ceramics campaign.",
    reads: [
      ["Character Gita", "unaffected"],
      ["Reference board", "unaffected"],
      ["Storyboard", "6 shots drafted, ready to review"],
      ["Estimated cost", "0 credits — drafting a plan is free"],
    ],
  },
];

export function SectionChithra() {
  const [active, setActive] = useState(0);
  const brief = briefs[active] ?? briefs[0]!;

  return (
    <section id="chithra" className="rule-x px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1180px]">
        <span className="eyebrow">02 — Chithra</span>
        <h2 className="mt-6 max-w-3xl text-4xl font-medium leading-[1.02] md:text-6xl">
          Say what you're <span className="serif-accent text-accent">making</span>.
        </h2>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <span className="eyebrow">Say it plainly</span>
            <div className="mt-5 flex flex-col gap-3">
              {briefs.map((b, i) => (
                <button
                  key={b.prompt}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={`rounded-2xl border px-5 py-4 text-left text-[0.95rem] leading-relaxed transition-all duration-400 ${
                    active === i
                      ? "border-accent/40 bg-accent/8 text-foreground"
                      : "border-line text-dim hover:text-foreground"
                  }`}
                >
                  &ldquo;{b.prompt}&rdquo;
                </button>
              ))}
            </div>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-dim">
              No prompt syntax, no model picker. Chithra reads intent, updates the parts of your
              project that changed, and tells you exactly what the next step will cost before it
              spends anything.
            </p>
          </div>

          <div className="border-t border-line pt-6">
            <span className="eyebrow">What changes in your project</span>
            <dl className="mt-4">
              {brief.reads.map(([k, v], i) => (
                <motion.div
                  key={k + active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] items-baseline gap-6 border-b border-line py-4"
                >
                  <dt className="eyebrow text-[10px]">{k}</dt>
                  <dd
                    className={`text-[1.02rem] tracking-[-0.01em] ${
                      k === "Estimated cost" ? "font-mono text-accent" : "text-foreground"
                    }`}
                  >
                    {v}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 03 · The thread ---------------- */

const thread = ["Character", "Reference", "Storyboard", "Research", "Generation", "Final asset"];

export function SectionThread() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 40%"] });
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="rule-x px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
          <div>
            <span className="eyebrow">03 — Continuity</span>
            <h2 className="mt-6 text-4xl font-medium leading-[1.02] md:text-6xl">
              Your project <span className="serif-accent text-accent">remembers</span>.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-dim">
            Not a folder of exports — a project that carries its characters, references, and plan
            forward, so a generation next week still knows what came before it.
          </p>
        </div>

        <div ref={ref} className="relative mt-20 pl-10 md:mt-28 md:pl-24">
          <div className="absolute bottom-3 left-[3px] top-3 w-px bg-line md:left-[calc(1.5rem+3px)]" />
          <motion.div
            style={{ height }}
            className="absolute left-[3px] top-3 w-px origin-top bg-accent md:left-[calc(1.5rem+3px)]"
          />
          {thread.map((node, i) => (
            <motion.div
              key={node}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative py-4 md:py-6"
            >
              <span className="absolute -left-10 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent md:-left-24 md:translate-x-[1.5rem]" />
              <span className="text-[clamp(1.3rem,3.6vw,2.6rem)] tracking-[-0.03em]">{node}</span>
              {i === thread.length - 1 && (
                <span className="eyebrow ml-4 text-[10px]">still linked to the first thought</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 04 · Creation ---------------- */

const crafts: [string, string][] = [
  ["Image", "Stills, portraits, and references — consistent with a project's characters."],
  ["Video", "Shots generated with the storyboard and prior scenes already in context."],
  ["Audio", "Voice and narration, matched to the project you're already inside."],
];

export function SectionCreation() {
  return (
    <section id="studio" className="rule-x px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1180px]">
        <span className="eyebrow">04 — Creation</span>
        <h2 className="mt-6 max-w-3xl text-4xl font-medium leading-[1.02] md:text-6xl">
          The right tool for the <span className="serif-accent text-accent">work</span>.
        </h2>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-dim">
          Vichith selects and orchestrates the generation call from your intent. The models are
          infrastructure. The creative workflow is the product.
        </p>

        <div className="mt-16 grid gap-px overflow-hidden border-y border-line md:grid-cols-3">
          {crafts.map(([title, copy]) => (
            <div
              key={title}
              className="group border-b border-line py-10 pr-8 transition-colors duration-500 md:border-b-0 md:border-r md:pl-8 md:last:border-r-0 md:first:pl-0"
            >
              <h3 className="text-[clamp(1.6rem,3.6vw,2.6rem)] tracking-[-0.03em] transition-colors duration-500 group-hover:text-accent">
                {title}
              </h3>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-dim">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 05 · Web + Desktop ---------------- */

const web = ["Chithra", "Research", "Storyboard", "References", "Character Gita", "Generations"];
const desktop = ["Timeline edit", "Compositing", "Captions", "Audio", "Export"];

export function SectionSurfaces() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const dotY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="rule-x px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1180px]">
        <span className="eyebrow">05 — Two surfaces, one project</span>
        <h2 className="mt-6 max-w-3xl text-4xl font-medium leading-[1.02] md:text-6xl">
          Ideate on the web. <span className="serif-accent text-accent">Finish</span> on the
          desktop.
        </h2>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-dim">
          Most AI creative tools stop at generation. Vichith carries the same project into a real
          non-destructive timeline editor for the work a browser tab can't do.
        </p>

        <div ref={ref} className="mt-16 grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
          <SurfacePanel kind="Web · app.vichith.in" title="Vichith Web" items={web} />
          <div className="relative flex items-center justify-center py-4 md:w-20 md:py-0">
            <div className="h-px w-full bg-line md:h-full md:w-px" />
            <motion.span
              style={{ top: dotY }}
              className="absolute h-2 w-2 rounded-full bg-accent shadow-[0_0_20px_var(--color-accent)]"
            />
          </div>
          <SurfacePanel kind="Desktop" title="Vichith Editor" items={desktop} comingSoon />
        </div>
      </div>
    </section>
  );
}

function SurfacePanel({
  kind,
  title,
  items,
  comingSoon = false,
}: {
  kind: string;
  title: string;
  items: string[];
  comingSoon?: boolean;
}) {
  return (
    <div className={`panel p-8 md:p-10 ${comingSoon ? "opacity-80" : ""}`}>
      <div className="flex items-center gap-2">
        <span className="eyebrow">{kind}</span>
        {comingSoon && (
          <span className="eyebrow rounded-full border border-line px-2 py-0.5 text-[9px] text-accent">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="mt-4 text-[clamp(1.4rem,2.6vw,2rem)] tracking-[-0.03em]">{title}</h3>
      <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
        {items.map((i) => (
          <li key={i} className="text-sm text-dim transition-colors hover:text-foreground">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
