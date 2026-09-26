const APP_URL = "https://app.vichith.in/login";
const logo = { url: "/favicon_io/android-chrome-192x192.png" };

const productLinks: [string, string][] = [
  ["Open Vichith", APP_URL],
  ["Pricing & credits", APP_URL],
];

const supportLinks: [string, string][] = [["Report an issue", "/report"]];

export function SiteFooter() {
  return (
    <footer className="rule-x px-6 py-16 md:px-10">
      <div className="mx-auto grid max-w-[1180px] gap-12 md:grid-cols-[1fr_auto_auto]">
        <div>
          <a href="/" className="flex items-center gap-2.5">
            <img src={logo.url} alt="Vichith" className="h-6 w-6" />
            <span className="font-display text-[15px] tracking-tight">vichith</span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-dim">
            One project, from first thought to finished frame — ideation on the web,
            deep editing on the desktop.
          </p>
        </div>

        <div>
          <div className="eyebrow mb-4">Product</div>
          <ul className="flex flex-col gap-2.5">
            {productLinks.map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  className="text-sm text-dim transition-colors duration-300 hover:text-foreground"
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-2 text-sm text-dim/60">
              Desktop app
              <span className="eyebrow rounded-full border border-line px-2 py-0.5 text-[9px]">
                Coming soon
              </span>
            </li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4">Support</div>
          <ul className="flex flex-col gap-2.5">
            {supportLinks.map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  className="text-sm text-dim transition-colors duration-300 hover:text-foreground"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-[1180px] flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <span className="text-xs text-dim">© {new Date().getFullYear()} Vichith. Built in public.</span>
        <a href={APP_URL} className="text-xs text-dim transition-colors duration-300 hover:text-foreground">
          app.vichith.in
        </a>
      </div>
    </footer>
  );
}
