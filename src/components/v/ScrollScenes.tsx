import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { EditorMock, type Stage } from "./EditorMock";

const scenes: { title: string; body: string; stage: Stage }[] = [
  { title: "An empty workspace", body: "One project. No tabs, no exports, no hand-offs between five fragmented tools.", stage: 0 },
  { title: "The idea lands", body: "Write a prompt, speak your concept, or drop your script. Research and structure resolve into an editing plan.", stage: 1 },
  { title: "A timeline appears", body: "Your plan becomes a real OpenTimelineIO sequence — scenes, pacing, placeholders, and intent.", stage: 2 },
  { title: "AI fills the gaps", body: "Missing B-roll and cutaways are generated in place, powered by integrated AI models.", stage: 3 },
  { title: "Voice and captions", body: "Auto speech-to-text captions, silence stripping, and voice tracks resolve together.", stage: 4 },
  { title: "Edit with full control", body: "Tweak clips, trim cuts, adjust color, and fine-tune audio inside a non-destructive desktop timeline.", stage: 5 },
  { title: "Export when ready", body: "Render high-bitrate MP4 and H.264. No re-importing. No re-syncing. What you see is what ships.", stage: 6 },
];

export function ScrollScenes() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(scenes.length - 1, Math.floor(v * scenes.length));
    setActive(i);
  });

  return (
    <div id="scenes" ref={ref} className="relative" style={{ height: `${scenes.length * 40}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="eyebrow mb-8">The workflow, end to end</div>
            <div className="relative h-40">
              {scenes.map((s, i) => (
                <motion.div
                  key={s.title}
                  animate={{
                    opacity: i === active ? 1 : 0,
                    y: i === active ? 0 : i < active ? -24 : 24,
                    filter: i === active ? "blur(0px)" : "blur(8px)",
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <h3 className="text-3xl leading-tight font-medium md:text-5xl">{s.title}</h3>
                  <p className="mt-4 max-w-sm text-dim">{s.body}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 flex gap-1.5">
              {scenes.map((s, i) => (
                <div key={s.title} className="h-px flex-1 overflow-hidden bg-white/10">
                  <motion.div
                    animate={{ scaleX: i <= active ? 1 : 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full origin-left bg-accent"
                  />
                </div>
              ))}
            </div>
          </div>

          <motion.div
            animate={{ scale: active === 6 ? 1.02 : 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <EditorMock stage={scenes[active]?.stage ?? 0} caption="from idea to export" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}