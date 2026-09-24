"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { SECTION_IDS, THEATER_ACTS } from "@/lib/spatial";

const REQUEST_ACCESS_URL = "https://app.vichith.in/request-access";

// Three focused nav anchors — quality over quantity
const NAV_LINKS = [
  { label: "Chithra", href: `#${SECTION_IDS.chithra}` },
  { label: "Studio", href: `#${SECTION_IDS.studio}` },
  { label: "Access", href: `#${SECTION_IDS.closing}` },
];

export function Nav() {
  const { scrollY } = useScroll();
  // Panel materializes as you scroll past the hero
  const bg = useTransform(scrollY, [0, 100], ["rgba(7, 7, 9, 0)", "rgba(7, 7, 9, 0.88)"]);
  const border = useTransform(scrollY, [0, 100], ["rgba(255,255,255,0)", "rgba(255,255,255,0.07)"]);
  const blur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(20px)"]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const act = THEATER_ACTS.find((a) => a.id === targetId || (SECTION_IDS as Record<string, string>)[targetId] === a.id);
      if (act && typeof window !== "undefined") {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({
          top: act.progress * maxScroll,
          behavior: "smooth",
        });
      } else {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  };

  return (
    <motion.header
      style={{ backgroundColor: bg, borderColor: border, backdropFilter: blur }}
      className="fixed inset-x-0 top-0 z-50 border-b transition-[border-color] duration-300"
    >
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:px-10">
        {/* Brand — text wordmark, no image */}
        <a href="/" className="flex items-center group">
          <span className="font-display text-[16px] font-extrabold tracking-[-0.03em] text-foreground group-hover:text-white transition-colors duration-150">
            VICHITH
          </span>
        </a>

        {/* Section Links — Desktop only */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white/90 transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA — ghost style, accent on hover */}
        <a
          href={REQUEST_ACCESS_URL}
          className="
            inline-flex items-center gap-2
            px-5 py-2 rounded-full
            border border-white/[0.14] bg-transparent
            font-mono text-[11px] uppercase tracking-[0.15em] text-white/80
            hover:border-accent/50 hover:text-white hover:bg-white/[0.04]
            active:scale-[0.97]
            transition-all duration-200
          "
        >
          Early Access
          <span className="text-accent">↗</span>
        </a>
      </nav>
    </motion.header>
  );
}
