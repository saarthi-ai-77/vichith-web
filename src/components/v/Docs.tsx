import { motion } from "framer-motion";
import { Section } from "./Section";

const docs: [string, string, string][] = [
  ["Join Waitlist", "Sign up for early access to the Vichith desktop creative workspace.", "#waitlist"],
  ["Chithra AI Brain", "How our Editorial Brain decomposes tasks and edits non-destructively.", "#chithra"],
  ["Discord Community", "Join creators, share feedback, and talk directly with the team.", "https://discord.gg/MSeSsbgD"],
  ["OpenTimelineIO", "Standardized non-destructive sequence format and data schema.", "https://github.com/AcademySoftwareFoundation/OpenTimelineIO"],
  ["Product Roadmap", "Explore what we are building next for creative desktop workflows.", "#workflow"],
  ["Release Notes", "Every update, performance improvement, and feature addition documented.", "https://github.com/saarthi-ai-77/vichith-updater/releases"],
  ["Product Hunt", "Check out our featured launch badge and community reviews.", "https://www.producthunt.com/products/vichith"],
  ["Founder Contact", "Connect with Nikshith on LinkedIn or X (@vichith_ai).", "https://x.com/vichith_ai"],
];

export function Docs() {
  return (
    <Section
      id="docs"
      eyebrow="Documentation & Community"
      title="Built in public with creators."
      lede="Vichith is evolving every week. We open our roadmap, release notes, and community discussions so you can help shape what comes next."
    >
      <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {docs.map(([t, d, href], i) => (
          <motion.a
            key={t}
            href={href}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="group relative bg-background p-6 transition-colors duration-500 hover:bg-surface"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-[15px] tracking-tight">{t}</span>
              <span className="text-dim transition-transform duration-500 group-hover:translate-x-1 group-hover:text-accent">
                →
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-dim">{d}</p>
          </motion.a>
        ))}
      </div>
    </Section>
  );
}