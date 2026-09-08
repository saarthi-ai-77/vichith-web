"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { SECTION_IDS } from "@/lib/spatial";

const REQUEST_ACCESS_URL = "https://app.vichith.in/request-access";
const LOGIN_URL = "https://app.vichith.in/login";
const logo = { url: "/favicon_io/android-chrome-192x192.png" };

const NAV_LINKS = [
  // The four workspaces, named the way they are named inside the product —
  // a visitor who clicks "Editor" here should land on the scene about the
  // Editor and then find something called the Editor when they sign in.
  { label: "Chithra", href: `#${SECTION_IDS.chithra}` },
  { label: "Studio", href: `#${SECTION_IDS.context}` },
  { label: "Editor", href: `#${SECTION_IDS.studio}` },
  { label: "Images", href: `#${SECTION_IDS.image}` },
];

export function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(16, 17, 20, 0)", "rgba(16, 17, 20, 0.75)"]);
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
          <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
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

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href={LOGIN_URL}
            className="hidden px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground sm:inline-flex"
          >
            Sign in
          </a>
          <a
            href={REQUEST_ACCESS_URL}
            className="rounded-full bg-foreground px-4 py-1.5 text-[13px] font-semibold text-background transition-all duration-150 hover:bg-accent hover:text-background active:scale-[0.97] shadow-sm"
          >
            Request Access
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
