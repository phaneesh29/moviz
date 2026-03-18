import { Metadata } from 'next';
import { Suspense } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import SkeletonLoader from '@/components/SkeletonLoader';
import TrendingMovies from '@/components/TrendingMovies';
import { getTrendingMovies, getTrendingTV } from '@/lib/tmdb-server';

export const metadata: Metadata = {
  title: 'Trending Movies and TV Shows',
  description: 'See the latest trending movies and TV shows on Vidoza.',
  alternates: {
    canonical: '/trending',
  },
};

export const revalidate = 3600;

interface TrendingItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
}

interface TrendingPayload {
  results?: TrendingItem[];
}

async function getTrendingMovieItems(): Promise<TrendingItem[]> {
  try {
    const data = (await getTrendingMovies('day')) as TrendingPayload;
    return data.results ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getTrendingTvItems(): Promise<TrendingItem[]> {
  try {
    const data = (await getTrendingTV('day')) as TrendingPayload;
    return data.results ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function TrendingPage() {
  const movies = await getTrendingMovieItems();
  const tvShows = await getTrendingTvItems();

  return (
    <div className="page-shell min-h-screen text-white">
      <Navbar />
      <main className="page-container pb-16">
        <div className="page-hero mb-8 p-6 md:p-8">
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">What everyone is watching</p>
            <h1 className="mt-3 text-3xl md:text-5xl">Trending on Vidoza</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
              Fresh movie and series momentum in the same premium browsing shell as the homepage.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <section className="mb-16">
            <h2 className="mb-8 text-4xl font-bold">Trending Movies</h2>
            <Suspense fallback={<SkeletonLoader count={12} />}>
              <TrendingMovies movies={movies} />
            </Suspense>
          </section>

          <section>
            <h2 className="mb-8 text-4xl font-bold">Trending TV Shows</h2>
            <Suspense fallback={<SkeletonLoader count={12} />}>
              <TrendingMovies movies={tvShows} />
            </Suspense>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
