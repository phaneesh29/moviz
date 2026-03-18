import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Archivo_Black, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Vidoza - Premium Streaming for Movies, TV and Live Channels",
    template: "%s | Vidoza",
  },
  description:
    "Discover trending movies, TV shows and live channels with a cinematic premium streaming experience built on Next.js.",
  keywords: [
    "movies",
    "tv shows",
    "streaming",
    "watch online",
    "live tv",
    "trending movies",
    "vidoza",
  ],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moviz.app",
    siteName: "Vidoza",
    title: "Vidoza",
    description:
      "Premium-feeling movie discovery, TV browsing and live channel streaming in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidoza",
    description:
      "Premium-feeling movie discovery, TV browsing and live channel streaming in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="canonical" href="https://moviz.app" />
      </head>
      <body
        className={`${manrope.variable} ${archivoBlack.variable} bg-black text-white antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
