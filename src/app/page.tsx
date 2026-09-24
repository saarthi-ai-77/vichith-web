import { Nav } from "@/components/site/Nav";
import { TheaterCanvas } from "@/components/site/theater/TheaterCanvas";

export default function Home() {
  return (
    <main className="relative bg-[#070709] text-foreground selection:bg-accent/30 selection:text-foreground overflow-x-clip">
      <Nav />
      {/* 3D Theater Scroll Experience */}
      <TheaterCanvas />
    </main>
  );
}
