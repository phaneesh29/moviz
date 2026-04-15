import type { Metadata, Viewport } from 'next';
import { Analytics } from "@vercel/analytics/next"
import { Archivo_Black, Manrope } from 'next/font/google';
import { Suspense } from 'react';
import AppToaster from '@/components/AppToaster';
import RouteProgressBar from '@/components/RouteProgressBar';
import { siteConfig } from '@/lib/site';
import './globals.css';

const manrope = Manrope({
  variable: '--font-body',
  subsets: ['latin'],
});

const archivoBlack = Archivo_Black({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: 'Vidoza - Watch Trending Movies, TV Shows and Live Channels',
    template: '%s | Vidoza',
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: '/',
  },
  referrer: 'origin-when-cross-origin',
  category: 'entertainment',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'Vidoza - Watch Trending Movies, TV Shows and Live Channels',
    description: siteConfig.description,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Vidoza streaming platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vidoza - Watch Trending Movies, TV Shows and Live Channels',
    description: siteConfig.description,
    images: ['/twitter-image'],
  },
};

export const viewport: Viewport = {
  themeColor: '#050505',
  colorScheme: 'dark',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteConfig.url}/search?query={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/icon.svg`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <body
        className={`${manrope.variable} ${archivoBlack.variable} bg-black text-white antialiased`}
      >
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <AppToaster />
        <Analytics />
      </body>
    </html>
  );
}
