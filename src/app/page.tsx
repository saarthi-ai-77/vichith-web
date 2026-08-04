'use client';

import { Nav } from "@/components/v/Nav";
import { Hero } from "@/components/v/Hero";
import { ScrollScenes } from "@/components/v/ScrollScenes";
import { Workflow } from "@/components/v/Workflow";
import { Studio } from "@/components/v/Studio";
import { Chithra } from "@/components/v/Chithra";
import { Generation } from "@/components/v/Generation";
import { Cloud } from "@/components/v/Cloud";
import { Collaboration } from "@/components/v/Collaboration";
import { MobileHandoff } from "@/components/v/MobileHandoff";
import { Docs } from "@/components/v/Docs";
import { Waitlist } from "@/components/v/Waitlist";

export default function Home() {
  return (
    <main className="relative bg-background">
      <Nav />
      <Hero />
      <ScrollScenes />
      <Workflow />
      <Studio />
      <Chithra />
      <Generation />
      <Cloud />
      <Collaboration />
      <MobileHandoff />
      <Docs />
      <Waitlist />
    </main>
  );
}
