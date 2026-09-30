import type { Metadata, Viewport } from "next";
import { Inter, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Vichith — AI-native creative production",
  description:
    "Vichith is an AI-native creative production environment bringing ideation, generation, timeline editing, and motion into one connected project.",
  keywords: [
    "AI creative production",
    "AI video editor",
    "creative workflows",
    "timeline editing",
    "motion design",
    "Chithra",
    "generative video",
  ],
  authors: [{ name: "Vichith" }],
  openGraph: {
    title: "Vichith — AI-native creative production",
    description:
      "Vichith brings ideation, generation, editing, and motion into one connected creative environment.",
    url: "https://vichith.in",
    siteName: "Vichith",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vichith — AI-native creative production",
    description:
      "Vichith brings ideation, generation, editing, and motion into one connected creative environment.",
  },
  icons: {
    icon: "/favicon_io/favicon-32x32.png",
    apple: "/favicon_io/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A0C0C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable} scroll-smooth dark`}
    >
      <body className="antialiased min-h-screen bg-[#0A0C0C] text-[#F4F4F5] selection:bg-[#83D0BE]/25 selection:text-[#83D0BE]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
