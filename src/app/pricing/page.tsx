"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const REQUEST_ACCESS_URL = "https://app.vichith.in/request-access";

const TIERS = [
  {
    id: "creator",
    name: "Creator",
    badge: "Early Access",
    priceMonthly: 29,
    priceAnnual: 24,
    annualTotal: 288,
    description: "For independent filmmakers, solo directors, and visual creators.",
    features: [
      "Full Chithra creative intelligence engine",
      "Native multi-track NLE timeline & audio sync",
      "4K 2.39:1 anamorphic master rendering",
      "Bézier curve camera & motion keyframing",
      "100 GB persistent project cloud storage",
      "Email support",
    ],
    notIncluded: [],
    ctaText: "Request Access",
    color: "#83D0BE",
  },
  {
    id: "studio",
    name: "Studio",
    badge: "Recommended",
    popular: true,
    priceMonthly: 79,
    priceAnnual: 64,
    annualTotal: 768,
    description: "For production companies, boutique agencies, and creative teams.",
    features: [
      "Everything in Creator, plus:",
      "Priority H100 GPU synthesis queues",
      "Unlimited 4K ProRes master downloads",
      "Custom character seeds & persistent style LUTs",
      "Real-time multi-seat project collaboration",
      "1 TB shared production asset library",
      "Priority support with 4h response",
    ],
    notIncluded: [],
    ctaText: "Request Studio Access",
    color: "#83D0BE",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "Custom",
    priceMonthly: null,
    priceAnnual: null,
    annualTotal: null,
    description: "For studio VFX pipelines and enterprise media organizations.",
    features: [
      "Everything in Studio, plus:",
      "Dedicated GPU cluster (on-prem or private VPC)",
      "Custom fine-tuned foundation models",
      "Direct API access to timeline orchestration",
      "Enterprise SLA, SOC2 compliance & custom terms",
      "Dedicated 24/7 pipeline integration engineer",
      "Custom training & onboarding",
    ],
    notIncluded: [],
    ctaText: "Contact Sales",
    color: "#A78BFA",
  },
];

const FAQS = [
  {
    question: "What's included in the subscription?",
    answer: "All plans include full access to Chithra AI, the timeline editor, motion design tools, and all foundation models. There are no hidden fees for exports, rendering, or API calls.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at your next billing cycle.",
  },
    {
    question: "What happens to my projects if I cancel?",
    answer: "Your projects remain accessible in read-only mode for 30 days after cancellation. You can download all your assets during this period. After 30 days, projects are archived but can be restored within 6 months.",
  },
  {
    question: "Do you offer educational discounts?",
    answer: "Yes, we offer special pricing for students, educators, and academic institutions. Contact our education team for details.",
  },
  {
    question: "Is there a free trial?",
    answer: "We offer a 14-day free trial of the Studio plan with full access to all features. No credit card required to start.",
  },
];

const COMPARISON_FEATURES = [
  { name: "Chithra AI Engine", creator: true, studio: true, enterprise: true },
  { name: "4K Rendering", creator: "Limited", studio: "Unlimited", enterprise: "Unlimited" },
  { name: "GPU Queue Priority", creator: "Standard", studio: "Priority", enterprise: "Dedicated" },
  { name: "Cloud Storage", creator: "100 GB", studio: "1 TB", enterprise: "Custom" },
  { name: "Team Collaboration", creator: false, studio: true, enterprise: true },
  { name: "Custom Models", creator: false, studio: false, enterprise: true },
  { name: "API Access", creator: false, studio: "Limited", enterprise: "Full" },
  { name: "Support", creator: "Email", studio: "Priority 4h", enterprise: "24/7 Dedicated" },
];

// Billing toggle
function BillingToggle({ isAnnual, onToggle }: { isAnnual: boolean; onToggle: () => void }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full border border-white/[0.08] bg-white/[0.02]">
      <button
        onClick={() => !isAnnual && onToggle()}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          !isAnnual
            ? "bg-white/[0.1] text-white"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => isAnnual && onToggle()}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
          isAnnual
            ? "bg-[#83D0BE]/15 text-[#83D0BE]"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <span>Annual</span>
        <span className="px-1.5 py-0.5 rounded-full bg-[#83D0BE]/20 text-[#83D0BE] text-[10px] font-mono">
          Save 20%
        </span>
      </button>
    </div>
  );
}

// Pricing card
function PricingCard({ tier, index, isAnnual }: { tier: typeof TIERS[0]; index: number; isAnnual: boolean }) {
  const price = isAnnual ? tier.priceAnnual : tier.priceMonthly;
  const isNumber = typeof price === "number";
  const isCustom = tier.id === "enterprise";

  return (
    <motion.div
      className={`relative rounded-2xl border p-8 flex flex-col h-full ${
        tier.popular
          ? "border-[#83D0BE]/30 bg-gradient-to-b from-[#83D0BE]/5 to-transparent"
          : "border-white/[0.08] bg-white/[0.02]"
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 rounded-full bg-[#83D0BE] text-[#070809] text-xs font-semibold">
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
          {tier.badge && !tier.popular && (
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${
              isCustom
                ? "border-purple-500/30 text-purple-400"
                : "border-white/[0.08] text-zinc-400"
            }`}>
              {tier.badge}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-400">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          {isNumber ? (
            <>
              <AnimatePresence mode="wait">
                <motion.span
                  key={isAnnual ? "annual" : "monthly"}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-5xl font-semibold text-white tracking-tight"
                >
                  ${price}
                </motion.span>
              </AnimatePresence>
              <span className="text-zinc-500">/month</span>
            </>
          ) : (
            <span className="text-4xl font-semibold text-white tracking-tight">
              Custom
            </span>
          )}
        </div>
        {isAnnual && isNumber && (
          <p className="text-xs text-zinc-500 mt-1">
            ${tier.annualTotal} billed annually
          </p>
        )}
        {!isAnnual && isNumber && (
          <p className="text-xs text-zinc-500 mt-1">
            Billed monthly
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-3 mb-8">
        {tier.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
              feature.includes("Everything in") ? "bg-transparent" : "bg-[#83D0BE]/10"
            }`}>
              {feature.includes("Everything in") ? null : (
                <span className="text-[#83D0BE] text-xs">✓</span>
              )}
            </span>
            <span className={`text-sm ${feature.includes("Everything in") ? "text-zinc-400 font-medium" : "text-zinc-300"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={REQUEST_ACCESS_URL}
        className={`block w-full text-center py-4 rounded-xl font-medium transition-all duration-200 ${
          tier.popular
            ? "bg-[#83D0BE] text-[#070809] hover:bg-[#98dec9]"
            : isCustom
            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"
            : "bg-white/[0.06] text-white border border-white/[0.08] hover:bg-white/[0.1]"
        }`}
      >
        {tier.ctaText}
      </a>
    </motion.div>
  );
}

// FAQ item
function FAQItem({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-white/[0.06] last:border-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left"
      >
        <span className="text-base font-medium text-zinc-200">{faq.question}</span>
        <motion.span
          className="text-zinc-500 text-lg"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-zinc-400 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <main className="min-h-screen bg-[#070809] text-[#F4F4F5]">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#070809]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/[0.12] p-1">
              <img src="/favicon_io/android-chrome-192x192.png" alt="Vichith" className="w-full h-full object-contain" />
            </div>
            <span className="font-display text-[15px] font-semibold text-white">vichith</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">Product</Link>
            <Link href="/pricing" className="text-sm text-white">Pricing</Link>
            <a href={REQUEST_ACCESS_URL} className="px-4 py-2 rounded-full bg-[#83D0BE] text-[#070809] text-sm font-medium hover:bg-[#98dec9] transition-colors">
              Request Access
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            className="inline-block px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Pricing
          </motion.span>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Simple, predictable pricing.
          </motion.h1>

          <motion.p
            className="text-lg text-zinc-400 max-w-xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            One subscription for the entire pipeline. No surprise credit drains or hidden rendering surcharges.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <BillingToggle isAnnual={isAnnual} onToggle={() => setIsAnnual(!isAnnual)} />
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier, index) => (
              <PricingCard key={tier.id} tier={tier} index={index} isAnnual={isAnnual} />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Toggle */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
          >
            <span>{showComparison ? "Hide" : "View"} full comparison</span>
            <motion.span animate={{ rotate: showComparison ? 180 : 0 }}>▼</motion.span>
          </button>
        </div>
      </section>

      {/* Comparison Table */}
      <AnimatePresence>
        {showComparison && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden px-6"
          >
            <div className="max-w-4xl mx-auto pb-16">
              <div className="rounded-xl border border-white/[0.08] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="text-left p-4 text-sm font-medium text-zinc-300">Feature</th>
                      <th className="text-center p-4 text-sm font-medium text-zinc-300">Creator</th>
                      <th className="text-center p-4 text-sm font-medium text-zinc-300">Studio</th>
                      <th className="text-center p-4 text-sm font-medium text-zinc-300">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_FEATURES.map((feature, index) => (
                      <tr key={feature.name} className="border-b border-white/[0.06] last:border-0">
                        <td className="p-4 text-sm text-zinc-400">{feature.name}</td>
                        <td className="p-4 text-center">
                          {typeof feature.creator === "boolean" ? (
                            feature.creator ? (
                              <span className="text-[#83D0BE]">✓</span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )
                          ) : (
                            <span className="text-sm text-zinc-300">{feature.creator}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.studio === "boolean" ? (
                            feature.studio ? (
                              <span className="text-[#83D0BE]">✓</span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )
                          ) : (
                            <span className="text-sm text-zinc-300">{feature.studio}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.enterprise === "boolean" ? (
                            feature.enterprise ? (
                              <span className="text-[#83D0BE]">✓</span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )
                          ) : (
                            <span className="text-sm text-zinc-300">{feature.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* FAQ Section */}
      <section className="py-16 px-6 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="text-2xl font-semibold text-white text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Frequently asked questions
          </motion.h2>

          <div className="space-y-0">
            {FAQS.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-zinc-400 mb-6">
              Our team is here to help you find the right plan for your needs.
            </p>
            <a
              href={REQUEST_ACCESS_URL}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/[0.08] bg-white/[0.02] text-white font-medium hover:bg-white/[0.06] transition-colors"
            >
              Contact Sales
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-black/50 border border-white/[0.12] p-1">
              <img src="/favicon_io/android-chrome-192x192.png" alt="Vichith" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm text-zinc-500">© 2026 Vichith Inc.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">Home</Link>
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
