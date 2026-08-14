import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..800;1,6..72,300..800&family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Syne:wght@600;700;800&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />

      </head>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-accent/20">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
