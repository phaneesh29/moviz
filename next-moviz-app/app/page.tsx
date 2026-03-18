import type { Metadata } from 'next';
import HomePageClient, { type LatestItem, type MediaItem } from '@/components/home/HomePageClient';
import { absoluteUrl, siteConfig } from '@/lib/site';
import { getLatestMovie, getLatestTV, getTrendingMovies, getTrendingTV } from '@/lib/tmdb-server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Vidoza - Watch Trending Movies, TV Shows and Live Channels',
  description: siteConfig.description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Vidoza - Watch Trending Movies, TV Shows and Live Channels',
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    title: 'Vidoza - Watch Trending Movies, TV Shows and Live Channels',
    description: siteConfig.description,
  },
};

export default async function HomePage() {
  const [moviesData, tvData, latestMovie, latestTV] = await Promise.all([
    getTrendingMovies('day'),
    getTrendingTV('day'),
    getLatestMovie().catch(() => null),
    getLatestTV().catch(() => null),
  ]);

  const trendingMovies = ((moviesData?.results as MediaItem[] | undefined) || []).map((item) => ({
    ...item,
    media_type: item.media_type || 'movie',
  }));
  const trendingTV = ((tvData?.results as MediaItem[] | undefined) || []).map((item) => ({
    ...item,
    media_type: item.media_type || 'tv',
  }));

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Vidoza Home',
    url: siteConfig.url,
    description: siteConfig.description,
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    about: ['Movies', 'TV Shows', 'Live TV'],
    primaryImageOfPage: absoluteUrl('/opengraph-image'),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomePageClient
        initialTrendingMovies={trendingMovies}
        initialTrendingTV={trendingTV}
        initialLatestMovie={(latestMovie as LatestItem | null) || null}
        initialLatestTV={(latestTV as LatestItem | null) || null}
      />
    </>
  );
}
