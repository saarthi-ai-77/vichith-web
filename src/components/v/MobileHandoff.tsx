import { motion } from "framer-motion";
import { Section } from "./Section";

export function MobileHandoff() {
  return (
    <Section
      eyebrow="Instant Initialization"
      title={
        <>
          Describe your video.
          <br />
          See your timeline.
        </>
      }
      lede="Type a concept or paste your notes. Vichith structures your raw ideas into a coherent editing sequence with pacing, scenes, and placeholders."
    >
      <div className="relative flex flex-col items-center gap-10 md:flex-row md:justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="glass w-[190px] shrink-0 rounded-[28px] p-3"
        >
          <div className="mb-2 h-1 w-10 rounded-full bg-white/15 mx-auto" />
          <div className="rounded-2xl border border-line bg-black/40 p-3">
            <div className="eyebrow mb-3 text-[9px]">creative prompt</div>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-[12px] leading-relaxed"
            >
              “create a 60s product teaser with upbeat audio and punchy captions”
            </motion.div>
            <div className="mt-4 flex h-8 items-end gap-[2px]">
              {Array.from({ length: 22 }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ height: [`${20 + (i % 5) * 12}%`, `${60 + (i % 4) * 10}%`, `${20 + (i % 5) * 12}%`] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.05 }}
                  className="flex-1 rounded-[1px] bg-accent/60"
                />
              ))}
            </div>
          </div>
        </motion.div>

        <div className="relative h-24 w-full max-w-xs md:h-px md:w-40">
          <div className="absolute inset-0 m-auto h-full w-px bg-line md:h-px md:w-full" />
          <motion.span
            animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent md:hidden"
          />
          <motion.span
            animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-accent md:block"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="glass w-full max-w-lg rounded-xl p-3"
        >
          <div className="mb-3 flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-accent/60" />
          </div>
          <div className="rounded-lg border border-line bg-black/40 p-4">
            <div className="eyebrow mb-3 text-[9px]">timeline · structured</div>
            <div className="space-y-2">
              {["hook scene (0-5s)", "feature demo (5-45s)", "outro CTA (45-60s)"].map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + i * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-between rounded-md border border-line bg-white/[0.03] px-3 py-2 text-[12px]"
                >
                  <span>{t}</span>
                  <span className="font-mono text-[10px] text-accent/70">queued</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}