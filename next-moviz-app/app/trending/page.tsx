import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrendingMovies from '@/components/TrendingMovies';
import { Metadata } from 'next';
import { Suspense } from 'react';
import SkeletonLoader from '@/components/SkeletonLoader';

export const metadata: Metadata = {
  title: 'Trending',
  description: 'Trending movies and TV shows this week.',
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

interface TrendingResponse {
  results?: TrendingPayload;
}

async function getTrendingMovies(): Promise<TrendingItem[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/trending/movie`, {
      cache: 'force-cache',
    });
    if (!res.ok) throw new Error('Failed to fetch');
    const data = (await res.json()) as TrendingResponse;
    return data.results?.results ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getTrendingTV(): Promise<TrendingItem[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/trending/tv`, {
      cache: 'force-cache',
    });
    if (!res.ok) throw new Error('Failed to fetch');
    const data = (await res.json()) as TrendingResponse;
    return data.results?.results ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function TrendingPage() {
  const movies = await getTrendingMovies();
  const tvShows = await getTrendingTV();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <section className="mb-16">
            <h1 className="text-4xl font-bold mb-8">Trending Movies</h1>
            <Suspense fallback={<SkeletonLoader count={12} />}>
              <TrendingMovies movies={movies} />
            </Suspense>
          </section>

          <section>
            <h2 className="text-4xl font-bold mb-8">Trending TV Shows</h2>
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

