import { motion } from "framer-motion";
import { Section } from "./Section";

const caps: [string, string][] = [
  ["Video Generation", "Text & image to motion directly in-track"],
  ["Auto-Captions", "Speech-to-text with animated styles"],
  ["Audio & SFX", "Background score, sound effects & ambience"],
  ["Silence Removal", "Clean dialogue gaps and optimize pacing"],
  ["Color & LUTs", "Cinematic color grading & look presets"],
  ["B-Roll Insertion", "Context-aware insert cuts & cutaways"],
  ["Voice & VO", "Narration, voiceovers & audio leveling"],
  ["Keyframe Animation", "Smooth transformations & automation"],
  ["OpenTimelineIO", "Standardized non-destructive sequence"],
];

export function Generation() {
  return (
    <Section
      id="generation"
      eyebrow="AI Tool Registry"
      title={
        <>
          Capabilities,
          <br />
          not a model list.
        </>
      }
      lede="AI models change every month. What stays is what you can make — and where it lands: directly on your timeline."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {caps.map(([name, desc], i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 34, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{
              duration: 0.9,
              delay: (i % 3) * 0.08 + Math.floor(i / 3) * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -6 }}
            className="glass group relative overflow-hidden rounded-xl p-6"
          >
            <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-accent/8 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />
            <div className="font-mono text-[10px] text-accent/70">0{i + 1}</div>
            <div className="mt-4 font-display text-xl tracking-tight">{name}</div>
            <div className="mt-1.5 text-[13px] text-dim">{desc}</div>
            <div className="mt-7 flex h-8 items-end gap-[3px]">
              {Array.from({ length: 28 }).map((_, k) => (
                <motion.span
                  key={k}
                  animate={{
                    height: [
                      `${18 + ((k * 7 + i * 5) % 60)}%`,
                      `${30 + ((k * 13 + i * 9) % 70)}%`,
                      `${18 + ((k * 7 + i * 5) % 60)}%`,
                    ],
                    opacity: [0.25, 0.65, 0.25],
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: k * 0.06 + i * 0.2, ease: "easeInOut" }}
                  className="w-full flex-1 rounded-[1px] bg-accent/45"
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}