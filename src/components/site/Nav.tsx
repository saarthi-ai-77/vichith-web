"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { SECTION_IDS } from "@/lib/spatial";

const REQUEST_ACCESS_URL = "https://app.vichith.in/request-access";
const logo = { url: "/favicon_io/android-chrome-192x192.png" };

const NAV_LINKS = [
  { label: "Chithra", href: `#${SECTION_IDS.chithra}` },
  { label: "Workflow", href: `#${SECTION_IDS.intent}` },
  { label: "Control", href: `#${SECTION_IDS.control}` },
  { label: "Canvas", href: `#${SECTION_IDS.canvas}` },
  { label: "Horizons", href: `#${SECTION_IDS.future}` },
];

export function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(8, 8, 10, 0)", "rgba(8, 8, 10, 0.85)"]);
  const border = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,0.08)"]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <motion.header
      style={{ backgroundColor: bg, borderColor: border }}
      className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-[border-color,background-color] duration-200"
    >
      <nav className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-6">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2.5 group">
          <img src={logo.url} alt="Vichith" className="h-6 w-6 rounded transition-transform duration-200 group-hover:scale-105" />
          <span className="font-display text-[15px] font-bold tracking-tight text-foreground">
            vichith
          </span>
        </a>

        {/* Section Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 relative py-1"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action: Exclusively Early Access */}
        <div className="flex items-center gap-3">
          <a
            href={REQUEST_ACCESS_URL}
            className="rounded-full bg-white text-black px-4 py-1.5 text-[12px] sm:text-[13px] font-semibold transition-all duration-150 hover:bg-accent active:scale-[0.97] shadow-sm"
          >
            Request Early Access
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
