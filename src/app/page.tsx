import { Nav } from "@/components/site/Nav";
import { SpatialCanvas } from "@/components/site/SpatialCanvas";
import { SceneIdea } from "@/components/site/scenes/SceneIdea";
import { SceneContext } from "@/components/site/scenes/SceneContext";
import { SceneConversation } from "@/components/site/scenes/SceneConversation";
import { SceneProject } from "@/components/site/scenes/SceneProject";
import { SceneEcosystem } from "@/components/site/scenes/SceneEcosystem";
import { SceneClosing } from "@/components/site/scenes/SceneClosing";
import { GlobalMatrix } from "@/components/site/GlobalMatrix";

export default function Home() {
  return (
    <main className="relative bg-background">
      <Nav />
      {/*
        The SpatialCanvas handles the global GSAP ScrollTrigger timeline.
        It pins the view and moves the camera along the Z-axis.
      */}
      <SpatialCanvas>
        <GlobalMatrix />
        <SceneIdea />
        <SceneContext />
        {/* SceneChithra (one static "meet the orchestrator" moment) replaced
            by SceneConversation -- a real 8-beat exchange, scroll-driven,
            occupying a wider Z band (see src/lib/spatial.ts DEPTH). */}
        <SceneConversation />
        <SceneProject />
        <SceneEcosystem />
        <SceneClosing />
      </SpatialCanvas>
    </main>
  );
}
