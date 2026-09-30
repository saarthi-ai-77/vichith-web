"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";

const APP_URL = "https://app.vichith.in";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 generations / month",
      "720p export",
      "Chithra (basic)",
      "Community support",
    ],
    cta: "Start creating",
    href: `${APP_URL}/signup`,
    accent: false,
  },
  {
    name: "Creator",
    price: "$29",
    period: "/ month",
    features: [
      "100 generations / month",
      "4K ProRes export",
      "Full Chithra access",
      "Priority support",
      "Commercial license",
    ],
    cta: "Start free trial",
    href: `${APP_URL}/signup`,
    accent: true,
  },
  {
    name: "Studio",
    price: "$99",
    period: "/ month",
    features: [
      "Unlimited generations",
      "8K + Raw export",
      "Team collaboration",
      "Custom AI training",
      "Dedicated support",
    ],
    cta: "Contact sales",
    href: "mailto:hello@vichith.in",
    accent: false,
  },
];

export function SectionPricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef     = useRef<HTMLDivElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out" },
      });
      tl.fromTo(headRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 })
        .fromTo(
          rowRef.current?.children ?? [],
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 },
          "-=0.3"
        );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="px-6 py-36 max-w-5xl mx-auto">
      <div ref={headRef} className="mb-20 opacity-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E9196] mb-5">Pricing</p>
        <h2 className="font-display text-[clamp(36px,4vw,56px)] font-light leading-[1.05] tracking-[-0.04em] text-[#F4F4F5]">
          Start free.<br />
          <span className="text-[#83D0BE]">Go further</span> when you&apos;re ready.
        </h2>
      </div>

      {/* Horizontal rule */}
      <div className="rule-x mb-10 opacity-20" />

      {/* Plans — row layout, not cards */}
      <div ref={rowRef} className="space-y-0">
        {PLANS.map((plan, i) => (
          <div
            key={i}
            className={`flex flex-col md:flex-row items-start md:items-center gap-6 py-8 border-b border-white/[0.06] ${
              plan.accent ? "opacity-0" : "opacity-0"
            }`}
          >
            {/* Plan name */}
            <div className="md:w-[140px] shrink-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E9196] mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-[28px] font-display font-light ${plan.accent ? "text-[#83D0BE]" : "text-[#F4F4F5]"}`}>
                  {plan.price}
                </span>
                <span className="text-[12px] text-[#8E9196]">{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex-1 flex flex-wrap gap-x-8 gap-y-2">
              {plan.features.map((f) => (
                <span key={f} className="text-[13px] text-[#8E9196]">{f}</span>
              ))}
            </div>

            {/* CTA */}
            <Link
              href={plan.href}
              className={`shrink-0 text-[13px] rounded-full px-5 py-2 transition-all duration-200 ${
                plan.accent
                  ? "bg-[#83D0BE] text-[#0A0C0C] font-medium hover:bg-[#98dec9]"
                  : "border border-white/[0.1] text-[#F4F4F5] hover:border-white/[0.2]"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-8 text-[12px] text-[#8E9196]/60 text-center">
        Need a custom solution?{" "}
        <a href="mailto:hello@vichith.in" className="text-[#83D0BE]/70 hover:text-[#83D0BE] transition-colors">
          Contact our team
        </a>
      </p>
    </section>
  );
}
