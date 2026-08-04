import { motion, useScroll, useTransform } from "framer-motion";
const logo = { url: "/favicon_io/android-chrome-192x192.png" };

const links = [
  ["Workflow", "#workflow"],
  ["Studio", "#studio"],
  ["Chithra AI", "#chithra"],
  ["AI Registry", "#registry"],
  ["Docs", "#docs"],
];

export function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 120], ["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]);
  const border = useTransform(scrollY, [0, 120], ["rgba(255,255,255,0)", "rgba(255,255,255,0.08)"]);

  return (
    <motion.header
      style={{ backgroundColor: bg, borderColor: border }}
      className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-16 max-w-[1180px] items-center gap-8 px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <img src={logo.url} alt="Vichith" className="h-6 w-6" />
          <span className="font-display text-[15px] tracking-tight">vichith</span>
        </a>
        <div className="ml-4 hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[13px] text-dim transition-colors duration-300 hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </div>
        <a
          href="#waitlist"
          className="ml-auto rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-[13px] text-accent transition-all duration-500 hover:bg-accent/20"
        >
          Join Waitlist
        </a>
      </nav>
    </motion.header>
  );
}