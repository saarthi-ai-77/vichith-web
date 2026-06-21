import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Vichith | Modern Video Workflow Platform",
  description: "A desktop-native editing environment with real-time playback, keyframe systems, and AI-assisted orchestration. Unifying editing, captions, audio, and motion.",
  icons: {
    icon: "/favicon_io/favicon-32x32.png",
    apple: "/favicon_io/apple-touch-icon.png",
  },
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
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />
      </head>
      <body className="beta-hub">
        <div className="beta-banner">
          <span className="beta-banner-strong">Vichith Beta is now available.</span>
          <span>Built with creators. Improved with creators.</span>
          <div className="beta-banner-links">
            <a href="/#download">Download Beta</a>
            <a href="https://discord.gg/MSeSsbgD" target="_blank" rel="noopener noreferrer">Join Discord</a>
            <a href="/report">Report Issue</a>
          </div>
        </div>
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
