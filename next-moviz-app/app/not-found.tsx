import type { Metadata, Viewport } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Moviz - Stream Movies & TV Shows',
  description: 'Discover, watch, and explore thousands of movies and TV shows. Get trending content, personalized recommendations, and live TV.',
  keywords: 'movies, tv shows, streaming, trending, watch online',
  openGraph: {
    title: 'Moviz - Stream Movies & TV Shows',
    description: 'Discover, watch, and explore thousands of movies and TV shows',
    url: 'https://moviz.app',
    siteName: 'Moviz',
    images: [
      {
        url: 'https://moviz.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Moviz - Stream Movies & TV Shows',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moviz - Stream Movies & TV Shows',
    description: 'Discover, watch, and explore thousands of movies and TV shows',
    images: ['https://moviz.app/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-500 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-8">Page Not Found</h2>
        <p className="text-gray-400 mb-8 text-lg">Sorry, the page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

