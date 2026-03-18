import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you were looking for could not be found on Vidoza.',
  openGraph: {
    title: 'Page Not Found | Vidoza',
    description: 'The page you were looking for could not be found on Vidoza.',
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Vidoza',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page Not Found | Vidoza',
    description: 'The page you were looking for could not be found on Vidoza.',
    images: [`${siteConfig.url}/twitter-image`],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-screen flex-col items-center justify-center px-4">
      <div className="cinema-panel rounded-[32px] px-8 py-10 text-center">
        <h1 className="font-display text-6xl text-[#e50914] mb-4">404</h1>
        <h2 className="mb-6 text-3xl font-bold text-white">Page Not Found</h2>
        <p className="mb-8 max-w-md text-lg text-gray-400">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="accent-button inline-block rounded-lg px-8 py-3 font-semibold text-white transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
