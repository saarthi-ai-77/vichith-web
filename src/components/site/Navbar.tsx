"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const APP_URL = "https://app.vichith.in";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
      <div
        className={`w-full max-w-5xl px-4 sm:px-6 h-12 rounded-full flex items-center justify-between transition-all duration-500 pointer-events-auto ${
          scrolled
            ? "border border-white/[0.08] bg-[#0A0C0E]/80 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            : "border border-transparent bg-transparent"
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-2 h-2 rounded-full bg-[#83D0BE] transition-transform duration-300 group-hover:scale-125" />
          <span className="font-display text-[15px] font-medium text-[#F4F4F5] tracking-tight">
            vichith
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#83D0BE]/30 text-[#83D0BE] bg-[#83D0BE]/10 hidden sm:inline">
            V1
          </span>
        </Link>

        {/* Navigation Anchors */}
        <nav className="hidden md:flex items-center gap-7 font-mono text-[11px] text-[#8E9196]">
          <Link
            href="#studio"
            className="hover:text-[#F4F4F5] transition-colors tracking-wider"
          >
            01 STUDIO
          </Link>
          <Link
            href="#chithra"
            className="hover:text-[#F4F4F5] transition-colors tracking-wider"
          >
            02 CHITHRA
          </Link>
          <Link
            href="#pricing"
            className="hover:text-[#F4F4F5] transition-colors tracking-wider"
          >
            03 PRICING
          </Link>
        </nav>

        {/* Right Action Trigger */}
        <div className="flex items-center gap-3">
          <Link
            href={`${APP_URL}/login`}
            className="text-[12px] font-mono text-[#8E9196] hover:text-[#F4F4F5] transition-colors hidden sm:inline"
          >
            SIGN IN
          </Link>
          <Link
            href={APP_URL}
            className="px-4 py-1.5 rounded-full bg-[#83D0BE] text-[#070809] font-mono text-[11px] font-semibold hover:bg-[#97e2d1] hover:shadow-[0_0_20px_rgba(131,208,190,0.4)] transition-all"
          >
            START CREATING
          </Link>
        </div>
      </div>
    </header>
  );
}
