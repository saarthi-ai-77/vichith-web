"use client";

import { motion, useScroll, useTransform } from "framer-motion";

const REQUEST_ACCESS_URL = "https://app.vichith.in/request-access";
const LOGIN_URL = "https://app.vichith.in/login";
const INVITE_URL = "https://app.vichith.in/invite";
const logo = { url: "/favicon_io/android-chrome-192x192.png" };

const links = [
  ["Workflow", "#workflow"],
  ["Chithra", "#chithra"],
  ["Studio", "#studio"],
] as const;

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
        <div className="ml-4 hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[13px] text-dim transition-colors duration-300 hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </div>
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
