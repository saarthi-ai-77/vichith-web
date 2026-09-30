"use client";

import React from "react";
import { Navbar }          from "@/components/site/Navbar";
import { SectionHero }     from "@/components/site/SectionHero";
import { SectionProblem }  from "@/components/site/SectionProblem";
import { SectionAnswer }   from "@/components/site/SectionAnswer";
import { SectionChithra }  from "@/components/site/SectionChithra";
import { SectionWorkspace } from "@/components/site/SectionWorkspace";
import { SectionPricing }  from "@/components/site/SectionPricing";
import { SectionFinalCTA } from "@/components/site/SectionFinalCTA";
import { Footer }          from "@/components/site/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#070809] text-[#F4F4F5] selection:bg-[#83D0BE]/25 selection:text-[#83D0BE] overflow-x-hidden">
      
      {/* Navbar — transparent on load, glass on scroll */}
      <Navbar />

      {/* 1. Hero — typographic statement + blurred image orbs */}
      <SectionHero />

      {/* 2. Problem — tool shards in chaos, then convergence */}
      <SectionProblem />

      {/* 3. Answer — one workspace materialises */}
      <SectionAnswer />

      {/* 4. Chithra — scroll-driven conversation replay */}
      <SectionChithra />

      {/* 5. Workspace — grid→timeline Studio transition */}
      <SectionWorkspace />

      {/* 6. Pricing — clean row table */}
      <SectionPricing />

      {/* 7. Final CTA — circular return to Hero energy */}
      <SectionFinalCTA />

      {/* 8. Footer — single minimal row */}
      <Footer />
    </main>
  );
}
