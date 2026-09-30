"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const APP_URL = "https://app.vichith.in";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={ref}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-14 transition-all duration-500 ease-out ${
        scrolled
          ? "bg-[#070809]/85 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <Link href="/" className="font-display text-[15px] font-medium text-[#F4F4F5] tracking-tight select-none">
        vichith
      </Link>

      {/* Nav links — center, desktop only */}
      <nav className="hidden md:flex items-center gap-8">
        {["Studio", "Chithra", "Pricing"].map((item) => (
          <Link
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-[13px] text-[#8E9196] hover:text-[#F4F4F5] transition-colors duration-200"
          >
            {item}
          </Link>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href={`${APP_URL}/login`}
          className="hidden md:inline text-[13px] text-[#8E9196] hover:text-[#F4F4F5] transition-colors duration-200"
        >
          Sign in
        </Link>
        <Link
          href={APP_URL}
          className="pill-btn-primary text-[13px] py-[6px] px-4"
        >
          Start creating
        </Link>
      </div>
    </header>
  );
}
