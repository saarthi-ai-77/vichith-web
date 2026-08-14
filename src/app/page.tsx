import { Nav } from "@/components/site/Nav";
import { SpatialCanvas } from "@/components/site/SpatialCanvas";
import { SceneIdea } from "@/components/site/scenes/SceneIdea";
import { SceneContext } from "@/components/site/scenes/SceneContext";
import { SceneChithra } from "@/components/site/scenes/SceneChithra";
import { SceneProject } from "@/components/site/scenes/SceneProject";
import { SceneEcosystem } from "@/components/site/scenes/SceneEcosystem";
import { SceneClosing } from "@/components/site/scenes/SceneClosing";

export default function Home() {
  return (
    <main className="relative bg-background">
      <Nav />
      {/* 
        The SpatialCanvas handles the global GSAP ScrollTrigger timeline.
        It pins the view and moves the camera along the Z-axis.
      */}
      <SpatialCanvas>
        <SceneIdea />
        <SceneContext />
        <SceneChithra />
        <SceneProject />
        <SceneEcosystem />
        <SceneClosing />
      </SpatialCanvas>
    </main>
  );
}
