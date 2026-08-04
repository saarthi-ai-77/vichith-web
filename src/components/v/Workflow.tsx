import { motion } from "framer-motion";
import { Section } from "./Section";

const stages = [
  "Idea",
  "Research",
  "Assets",
  "AI Generation",
  "Timeline Editing",
  "Voice",
  "Captions",
  "Refine",
  "Export",
];

export function Workflow() {
  return (
    <Section
      id="workflow"
      eyebrow="Workflow, not fragmentation"
      title={
        <>
          Nine stages.
          <br />
          One continuous surface.
        </>
      }
      lede="Creators live inside five broken tools. Vichith unifies AI generation, timeline editing, captions, and audio — state, media, and context carry forward without a single export."
    >
      <div className="relative">
        <div className="absolute top-6 left-0 hidden h-px w-full overflow-hidden bg-line md:block">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full origin-left bg-gradient-to-r from-accent/70 to-accent/0"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-9 md:gap-x-2">
          {stages.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
            >
              <motion.div
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 3.4, repeat: Infinity, delay: i * 0.35 }}
                className="mb-5 h-3 w-3 rounded-full border border-accent/50 bg-accent/25"
              />
              <div className="font-mono text-[10px] text-dim">0{i + 1}</div>
              <div className="mt-1.5 text-[13px] leading-snug transition-colors duration-500 group-hover:text-accent">
                {s}
              </div>
              <motion.div
                className="mt-4 h-16 rounded-md border border-line bg-white/[0.02]"
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <motion.div
                  animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  className="mx-auto mt-4 h-8 w-px origin-bottom bg-accent/40"
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}