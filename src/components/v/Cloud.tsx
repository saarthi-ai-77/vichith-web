import { motion } from "framer-motion";
import { Section } from "./Section";

const nodes: [string, string][] = [
  ["desktop", "local non-destructive timeline"],
  ["registry", "smart model routing"],
  ["generation", "video, audio & captions"],
  ["timeline", "result streams back in track"],
];

export function Cloud() {
  return (
    <Section
      id="registry"
      eyebrow="Multi-Model Orchestration"
      title={
        <>
          Your desktop,
          <br />
          supercharged by AI.
        </>
      }
      lede="Vichith connects your local Windows timeline to state-of-the-art AI models — routed, executed, and returned to the exact frame where you need them."
    >
      <div className="glass relative overflow-hidden rounded-2xl p-6 md:p-10">
        <div className="relative grid gap-8 md:grid-cols-4">
          <svg className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" aria-hidden>
            <motion.line
              x1="12%"
              y1="26%"
              x2="88%"
              y2="26%"
              stroke="color-mix(in oklab, var(--color-accent) 35%, transparent)"
              strokeWidth="1"
              strokeDasharray="4 6"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>

          {nodes.map(([t, d], i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative mb-5 h-14 w-14">
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0, 0.35] }}
                  transition={{ duration: 3.6, repeat: Infinity, delay: i * 0.9 }}
                  className="absolute inset-0 rounded-xl border border-accent/40"
                />
                <div className="absolute inset-0 grid grid-cols-3 gap-[3px] rounded-xl border border-line bg-black/30 p-2">
                  {Array.from({ length: 9 }).map((_, k) => (
                    <motion.span
                      key={k}
                      animate={{ opacity: [0.12, 0.8, 0.12] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: (k + i * 3) * 0.14 }}
                      className="rounded-[2px] bg-accent"
                    />
                  ))}
                </div>
              </div>
              <div className="font-mono text-[11px] text-accent">0{i + 1} · {t}</div>
              <div className="mt-2 text-[14px] text-dim">{d}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          {[
            ["AI Models", "State-of-the-art"],
            ["Editing", "Non-destructive"],
            ["Workflow", "No re-importing"],
            ["Platform", "Windows 10 / 11 (64-bit)"],
          ].map(([k, v]) => (
            <div key={k} className="bg-background p-5">
              <div className="text-[13px]">{k}</div>
              <div className="mt-1 font-mono text-[11px] text-dim">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}