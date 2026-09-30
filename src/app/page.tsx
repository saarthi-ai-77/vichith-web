"use client";

import React from "react";
import { SpatialScene } from "@/components/site/three/SpatialScene";
import { Navbar } from "@/components/site/Navbar";
import { SectionHeroV2 } from "@/components/site/SectionHeroV2";
import { SectionFragmentationV2 } from "@/components/site/SectionFragmentationV2";
import { SectionStudioV2 } from "@/components/site/SectionStudioV2";
import { SectionChithraV2 } from "@/components/site/SectionChithraV2";
import { SectionPricingV2 } from "@/components/site/SectionPricingV2";
import { SectionFinalCTAV2 } from "@/components/site/SectionFinalCTAV2";
import { Footer } from "@/components/site/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#070809] text-[#F4F4F5] selection:bg-[#83D0BE]/25 selection:text-[#83D0BE] overflow-x-hidden">
      {/* 1. Three.js Interactive 3D Spatial Canvas (threeui.com) */}
      <SpatialScene />

      {/* 2. Floating Pill Navigation (tasteskill.dev & 21st.dev) */}
      <Navbar />

      {/* 3. Hero — Editorial Typography, HUD Telemetry, Timecode (tasteskill.dev) */}
      <SectionHeroV2 />

      {/* 4. The Fragmentation & Fusion Core (gsap.com & threeui.com) */}
      <SectionFragmentationV2 />

      {/* 5. Interactive Studio Apparatus with Live Video & Timeline (21st.dev) */}
      <SectionStudioV2 />

      {/* 6. Chithra Intelligence Layer & Living Conversation Flow */}
      <SectionChithraV2 />

      {/* 7. High-Taste Pricing Architecture (tasteskill.dev) */}
      <SectionPricingV2 />

      {/* 8. Grand Finale Launch Apparatus */}
      <SectionFinalCTAV2 />

      {/* 9. Minimal Footer */}
      <Footer />
    </main>
  );
}
