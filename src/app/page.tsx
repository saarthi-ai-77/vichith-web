import { Nav } from "@/components/site/Nav";
import { Section01Arrival } from "@/components/site/sections/Section01Arrival";
import { Section02Fragmentation } from "@/components/site/sections/Section02Fragmentation";
import { Section03Chithra } from "@/components/site/sections/Section03Chithra";
import { Section04IntentToVideo } from "@/components/site/sections/Section04IntentToVideo";
import { Section05CreatorControl } from "@/components/site/sections/Section05CreatorControl";
import { Section06Canvas } from "@/components/site/sections/Section06Canvas";
import { Section07Iteration } from "@/components/site/sections/Section07Iteration";
import { Section08Loop } from "@/components/site/sections/Section08Loop";
import { Section09Future } from "@/components/site/sections/Section09Future";
import { Section10EarlyAccess } from "@/components/site/sections/Section10EarlyAccess";
import { SiteFooter } from "@/components/site/Footer";

export default function Home() {
  return (
    <main className="relative bg-[#070709] text-foreground selection:bg-accent/30 selection:text-foreground overflow-x-clip">
      <Nav />
      <Section01Arrival />
      <Section02Fragmentation />
      <Section03Chithra />
      <Section04IntentToVideo />
      <Section05CreatorControl />
      <Section06Canvas />
      <Section07Iteration />
      <Section08Loop />
      <Section09Future />
      <Section10EarlyAccess />
      <SiteFooter />
    </main>
  );
}

