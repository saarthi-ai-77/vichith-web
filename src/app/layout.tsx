import type { Metadata, Viewport } from "next";
import { Inter, Newsreader, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

// V1 redesign Stage B — self-hosted via next/font/google, replacing the raw
// <link> Google Fonts load (no preconnect benefit, no font-display control
// beyond the URL param). Three-tier system now identical to the app
// (app.vichith.in): Inter for UI/body, Newsreader italic for editorial
// accents, Syne for wordmark-scale moments — Outfit and Plus Jakarta Sans
// are dropped; the wordmark ("vichith" in Nav/Footer) was their only live
// usage, and Syne was already the intended wordmark face on the app side
// (see apps/app/src/app/layout.tsx's own comment) — this was a divergence
// to close, not a new decision.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", weight: ["300", "400", "500", "600", "700", "800"] });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap", weight: ["300", "400", "500", "600", "700", "800"], style: ["normal", "italic"] });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap", weight: ["600", "700", "800"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap", weight: ["400", "500"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Vichith — From a sentence to a finished frame.",
  description: "Vichith is a creative workspace where you describe what you're making. Chithra turns it into a project — characters, references, storyboard, and generations — on the web, with a desktop editor to finish the work.",
  icons: {
    icon: "/favicon_io/favicon-32x32.png",
    apple: "/favicon_io/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} ${syne.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-accent/20">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
