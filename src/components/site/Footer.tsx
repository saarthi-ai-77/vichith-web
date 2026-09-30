"use client";

import Link from "next/link";

const APP_URL = "https://app.vichith.in";

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/vichith.ai" },
  { label: "X",         href: "https://x.com/vichith_ai" },
  { label: "Discord",   href: "https://discord.gg/679D4UsTS" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07]">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-[14px] font-medium text-[#F4F4F5]">vichith</Link>
          <span className="text-[#8E9196]/40 hidden md:inline">·</span>
          <Link href={APP_URL} className="text-[12px] text-[#8E9196] hover:text-[#F4F4F5] transition-colors">
            app.vichith.in
          </Link>
        </div>

        {/* Social links */}
        <div className="flex items-center gap-6">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-[#8E9196] hover:text-[#F4F4F5] transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-[#8E9196]/50">
          © {new Date().getFullYear()} Vichith. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
