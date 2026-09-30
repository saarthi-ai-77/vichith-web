"use client";

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const APP_URL = "https://app.vichith.in";

export function SectionPricingV2() {
  const [isAnnual, setIsAnnual] = useState(true);
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      ).fromTo(
        rowsRef.current?.children ?? [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        "-=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const tiers = [
    {
      name: "FREE TIER",
      badge: "EXPLORE",
      price: "$0",
      cadence: "forever",
      desc: "For creators experimenting with Chithra reasoning and browser generation.",
      features: [
        "5 multi-modal generations / month",
        "720p H.264 timeline export",
        "Basic Chithra visual context memory",
        "Community Discord access",
      ],
      cta: "Start Free",
      href: `${APP_URL}/signup`,
      highlight: false,
    },
    {
      name: "CREATOR",
      badge: "MOST POPULAR",
      price: isAnnual ? "$24" : "$29",
      cadence: "/ month",
      desc: "For directors, filmmakers, and digital artists building complete projects.",
      features: [
        "100 generations / month with model rollover",
        "4K Apple ProRes 4444 export",
        "Full Chithra Timeline & Grade manipulation",
        "Commercial usage rights & license",
        "Priority GPU allocation & zero queue wait",
      ],
      cta: "Claim Creator Seat",
      href: `${APP_URL}/signup`,
      highlight: true,
    },
    {
      name: "STUDIO",
      badge: "TEAM WORKFLOW",
      price: isAnnual ? "$79" : "$99",
      cadence: "/ month",
      desc: "For production studios requiring custom models, API, and unlimited throughput.",
      features: [
        "Unlimited generations with high-speed queue",
        "8K Raw sequence exports",
        "Custom style training & character LoRA upload",
        "Multi-seat team workspace collaboration",
        "Dedicated engineer & custom SLA",
      ],
      cta: "Contact Studio Team",
      href: "mailto:hello@vichith.in",
      highlight: false,
    },
  ];

  return (
    <section
      ref={containerRef}
      id="pricing"
      className="relative min-h-screen py-32 px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden z-10"
    >
      <div className="w-full max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div ref={headerRef} className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-black/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#83D0BE]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8E9196]">
              Transparent Pricing
            </span>
          </div>

          <h2 className="font-display text-[clamp(34px,5vw,60px)] font-light leading-[1.05] tracking-[-0.03em] text-[#F4F4F5]">
            Invest in your{" "}
            <span className="italic font-serif text-[#83D0BE]">vision.</span>
          </h2>

          <p className="text-[16px] text-[#8E9196] font-light leading-relaxed">
            No credit lockouts. No artificial render queues. Start free and scale
            when your project demands broadcast resolution.
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="pt-2 flex items-center justify-center gap-3 font-mono text-[11px]">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                !isAnnual
                  ? "bg-white/[0.12] text-[#F4F4F5]"
                  : "text-[#8E9196] hover:text-white"
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                isAnnual
                  ? "bg-[#83D0BE] text-[#070809] font-semibold shadow-[0_0_20px_rgba(131,208,190,0.3)]"
                  : "text-[#8E9196] hover:text-white"
              }`}
            >
              <span>ANNUAL</span>
              <span className="px-1.5 py-0.2 bg-black/20 text-[9px] rounded-full">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Rows / Table (tasteskill.dev row architecture) */}
        <div ref={rowsRef} className="space-y-4">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-300 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 ${
                tier.highlight
                  ? "border-[#83D0BE]/40 bg-[#0C1110]/80 shadow-[0_0_40px_rgba(131,208,190,0.08)]"
                  : "border-white/[0.08] bg-[#0A0C0E]/60 hover:border-white/[0.16]"
              }`}
            >
              {/* Left Column: Title & Price */}
              <div className="w-full md:w-56 shrink-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-[#8E9196]">
                    {tier.name}
                  </span>
                  <span
                    className={`font-mono text-[9px] px-2 py-0.5 rounded-full border ${
                      tier.highlight
                        ? "border-[#83D0BE]/40 text-[#83D0BE] bg-[#83D0BE]/10"
                        : "border-white/[0.1] text-white/50"
                    }`}
                  >
                    {tier.badge}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-light text-[#F4F4F5]">
                    {tier.price}
                  </span>
                  <span className="font-mono text-xs text-[#8E9196]">
                    {tier.cadence}
                  </span>
                </div>
                <p className="text-xs text-[#8E9196] leading-relaxed">
                  {tier.desc}
                </p>
              </div>

              {/* Middle Column: Features Checklist */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {tier.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px] text-[#F4F4F5]">
                    <span className="text-[#83D0BE] font-bold text-xs">✓</span>
                    <span className="text-[#8E9196]">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Right Column: Action Button */}
              <div className="w-full md:w-auto shrink-0">
                <Link
                  href={tier.href}
                  className={`w-full md:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-semibold tracking-wider font-mono transition-all duration-200 ${
                    tier.highlight
                      ? "bg-[#83D0BE] text-[#070809] hover:bg-[#99e2d1] hover:shadow-[0_0_30px_rgba(131,208,190,0.5)]"
                      : "border border-white/[0.15] bg-white/[0.02] text-[#F4F4F5] hover:bg-white/[0.08]"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
