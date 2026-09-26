"use client";

import { motion, useScroll, useTransform } from "framer-motion";

const REQUEST_ACCESS_URL = "https://app.vichith.in/request-access";
const LOGIN_URL = "https://app.vichith.in/login";
const INVITE_URL = "https://app.vichith.in/invite";
const logo = { url: "/favicon_io/android-chrome-192x192.png" };

export function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 120], ["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]);
  const border = useTransform(scrollY, [0, 120], ["rgba(255,255,255,0)", "rgba(255,255,255,0.08)"]);

  return (
    <motion.header
      style={{ backgroundColor: bg, borderColor: border }}
      className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-16 max-w-[1180px] items-center gap-8 px-6">
        <a href="/" className="flex items-center gap-2.5">
          <img src={logo.url} alt="Vichith" className="h-6 w-6" />
          <span className="font-display text-[15px] tracking-tight">vichith</span>
        </a>
        {/* V1 audit — these used to link to #workflow/#chithra/#studio, ids
         *  that only ever existed on the old sections.tsx homepage (dead,
         *  now removed). The current homepage is a single GSAP-pinned
         *  scroll-jack (SpatialCanvas, pin:true) rather than a normal
         *  in-flow page, so a native #anchor jump can't land correctly on
         *  it either -- removed rather than left pointing at nothing. */}
        <div className="ml-auto flex items-center gap-3">
          <a
            href={LOGIN_URL}
            className="hidden px-3 py-2 text-[13px] text-dim transition-colors duration-300 hover:text-foreground sm:inline-flex"
          >
            Sign in
          </a>
          <a
            href={REQUEST_ACCESS_URL}
            className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-medium text-accent-foreground transition-transform duration-500 hover:scale-[1.03]"
          >
            Request Access
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
