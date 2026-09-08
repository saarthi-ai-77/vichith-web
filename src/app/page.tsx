import { Nav } from "@/components/site/Nav";
import { SceneIdea } from "@/components/site/scenes/SceneIdea";
import { SceneContext } from "@/components/site/scenes/SceneContext";
import { SceneConversation } from "@/components/site/scenes/SceneConversation";
import { SceneProject } from "@/components/site/scenes/SceneProject";
import { SceneEcosystem } from "@/components/site/scenes/SceneEcosystem";
import { SceneImage } from "@/components/site/scenes/SceneImage";
import { SceneClosing } from "@/components/site/scenes/SceneClosing";

export default function Home() {
  return (
    <main className="relative bg-background text-foreground selection:bg-accent/30 selection:text-foreground">
      <Nav />
      <SceneIdea />
      <SceneContext />
      <SceneConversation />
      <SceneProject />
      <SceneEcosystem />
      <SceneImage />
      <SceneClosing />
    </main>
  );
}
