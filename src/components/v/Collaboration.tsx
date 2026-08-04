import { motion } from "framer-motion";
import { Section } from "./Section";

const roles: [string, string][] = [
  ["Creator", "captures the vision & prompt"],
  ["Chithra AI", "decomposes & drafts the sequence"],
  ["Timeline", "non-destructive OpenTimelineIO track"],
  ["Export", "high-bitrate MP4 / H.264 rendering"],
];

export function Collaboration() {
  return (
    <Section
      eyebrow="Creative Control"
      title={
        <>
          Your vision, your edits.
          <br />
          Always reversible.
        </>
      }
      lede="Every AI edit, generated clip, and caption change is non-destructive. Step in at any moment to refine clips, tweak timing, or override AI suggestions."
    >
      <div className="relative grid gap-4 md:grid-cols-4">
        {roles.map(([r, d], i) => (
          <motion.div
            key={r}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="panel relative overflow-hidden p-5"
          >
            <motion.div
              animate={{ opacity: [0, 0.5, 0], x: ["-100%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 1 }}
              className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-accent/10 to-transparent"
            />
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-accent/30 bg-accent/10 font-mono text-[11px] text-accent">
                {r[0]}
              </span>
              <span className="text-[14px]">{r}</span>
            </div>
            <div className="mt-3 text-[13px] text-dim">{d}</div>

            {i === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="mt-4 rounded-md border border-line bg-black/30 p-2 text-[11px] text-dim"
              >
                “adjust color and tighten cut” · 00:14
              </motion.div>
            )}
            {i === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.5, type: "spring", stiffness: 160, damping: 16 }}
                className="mt-4 inline-flex rounded-full border border-accent/40 bg-accent/12 px-2.5 py-1 font-mono text-[10px] text-accent"
              >
                sequence verified · ready to export
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}