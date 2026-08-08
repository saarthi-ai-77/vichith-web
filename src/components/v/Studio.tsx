import { motion } from "framer-motion";
import { Section } from "./Section";
import { EditorMock } from "./EditorMock";

const points: [string, string][] = [
  ["Native Windows Desktop", "GPU-aware, offline-capable timeline editing built for long creative sessions."],
  ["Non-destructive editing", "Multi-track timeline with keyframe animation, trimming, splitting, and real-time playback."],
  ["In-context AI tools", "Generate B-roll, clean dialogue silence, and apply LUTs without leaving your workspace."],
];

export function Studio() {
  return (
    <Section
      id="studio"
      eyebrow="Vichith Desktop Studio"
      title={
        <>
          A creative workspace
          <br />
          built for flow.
        </>
      }
      lede="Playhead moves, preview resolves, the AI assistant responds, and your export completes. A responsive Windows desktop environment built for creative momentum."
    >
      <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="[perspective:1400px]"
        >
          <EditorMock stage={4} caption="studio · autonomous" />
        </motion.div>

        <div className="space-y-8">
          {points.map(([t, d], i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1 w-6 rounded-full bg-accent/60" />
                <span className="font-display text-lg tracking-tight">{t}</span>
              </div>
              <p className="text-[14px] leading-relaxed text-dim">{d}</p>
            </motion.div>
          ))}
          <div className="panel p-4">
            <div className="mb-2 flex justify-between font-mono text-[11px] text-dim">
              <span>export · h.264 · 1920×1080</span>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="text-accent"
              >
                rendering
              </motion.span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="h-full bg-accent"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}