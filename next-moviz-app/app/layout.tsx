import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Moviz - Stream Movies & TV Shows Free",
    template: "%s | Moviz",
  },
  description: "Discover and stream thousands of movies and TV shows. Get trending content, personalized recommendations, and live TV channels.",
  keywords: ["movies", "tv shows", "streaming", "free", "trending", "watch online"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moviz.app",
    siteName: "Moviz",
  },
  twitter: {
    card: "summary_large_image",
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://moviz.app" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}

