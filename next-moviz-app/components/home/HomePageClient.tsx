'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Play,
  Star,
  Tv,
  Search,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { imgBackdrop, imgPosterSmall } from '@/lib/media-constants';
import { getClientPreferredProvider, withProviderInPath } from '@/lib/provider-query';

export type MediaItem = {
  id: number;
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  genre_ids?: number[];
};

export type LatestItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
};

const genreMap: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  14: 'Fantasy',
  27: 'Horror',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
  10765: 'Sci-Fi & Fantasy',
};

function getYear(item: MediaItem | LatestItem) {
  return (item.release_date || item.first_air_date || '').slice(0, 4) || 'New';
}

function HeroBanner({
  hero,
  onOpen,
}: {
  hero: MediaItem | null;
  onOpen: (type: 'movie' | 'tv', id: number) => void;
}) {
  if (!hero) {
    return (
      <div className="relative h-[70vh] min-h-[450px] w-full overflow-hidden bg-gradient-to-b from-slate-950 to-black">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  const type = hero.media_type || (hero.title ? 'movie' : 'tv');

  return (
    <div className="relative h-[82vh] min-h-[640px] w-full overflow-hidden">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgBackdrop + hero.backdrop_path}
          alt={hero.title || hero.name || 'Featured title'}
          className="h-full w-full object-cover transition-all duration-700"
        />
      </div>

      {/* Sophisticated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-end pt-36 sm:pt-40 lg:pt-44">
        <div className="w-full px-6 pb-14 sm:px-8 md:px-12 lg:px-16 lg:pb-20 xl:px-20">
          <div className="max-w-2xl">
            {/* Type badge */}
            <div className="mb-3 inline-flex">
              <Badge
                variant="outline"
                className="border-white/20 bg-white/5 text-xs font-medium text-white/80 backdrop-blur-sm"
              >
                {type === 'movie' ? 'MOVIE' : 'SERIES'}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="mb-3 max-w-[12ch] font-semibold text-4xl leading-[1.04] text-white md:text-5xl lg:text-[3.5rem] xl:text-[4rem]">
              {hero.title || hero.name}
            </h1>

            {/* Meta information */}
            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-white/70">
              {hero.vote_average && hero.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="font-medium text-white/90">{hero.vote_average.toFixed(1)}</span>
                </div>
              )}
              <span className="text-white/50">•</span>
              <span>{getYear(hero)}</span>
            </div>

            {/* Description */}
            <p className="mb-8 max-w-lg line-clamp-3 text-sm leading-relaxed text-white/80 md:text-base">
              {hero.overview || 'Watch now to start this amazing journey.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => onOpen(type, hero.id)}
                size="lg"
                className="gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-black shadow-xl transition-all hover:bg-white/90 hover:shadow-2xl md:px-8 md:py-3"
              >
                <Play size={18} fill="currentColor" />
                Play
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpen(type, hero.id)}
                size="lg"
                className="gap-2 rounded-lg border border-white/20 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/30"
              >
                <Info size={18} />
                More Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 right-6 flex gap-1 sm:gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-1 w-1.5 rounded-full bg-white/40 transition-all sm:w-2"
          />
        ))}
      </div>
    </div>
  );
}

function FeedRow({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: MediaItem[];
  onOpen: (type: 'movie' | 'tv', id: number) => void;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return;

    const checkArrows = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    };

    element.addEventListener('scroll', checkArrows);
    checkArrows();
    return () => element.removeEventListener('scroll', checkArrows);
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    const element = rowRef.current;
    if (!element) return;
    element.scrollBy({
      left: direction === 'left' ? -element.clientWidth * 0.82 : element.clientWidth * 0.82,
      behavior: 'smooth',
    });
  };

  if (!items.length) return null;

  return (
    <section className="group/row relative">
      <div className="mb-4 flex items-end justify-between px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl lg:text-2xl">{title}</h2>
        <Link href="/discover" className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300 md:text-sm">
          View all
        </Link>
      </div>

      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/3 z-20 hidden h-20 w-12 -translate-y-1/2 bg-gradient-to-r from-black via-black/60 to-transparent text-white/60 transition-all hover:text-white md:flex shadow-lg"
        >
          <ChevronLeft size={24} />
        </Button>
      )}

      <div ref={rowRef} className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2 sm:px-6 md:gap-4 md:px-8 lg:px-10 xl:px-12">
        {items.map((item) => {
          const type = item.media_type || (item.title ? 'movie' : 'tv');
          return (
            <article key={`${type}-${item.id}`} className="w-[140px] shrink-0 md:w-[160px] lg:w-[180px]">
              <button
                onClick={() => onOpen(type, item.id)}
                className="group/card block w-full text-left"
              >
                <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-900 shadow-md transition-all duration-300 group-hover/card:border-white/20 group-hover/card:shadow-2xl group-hover/card:scale-105">
                  {item.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgPosterSmall + item.poster_path}
                      alt={item.title || item.name || 'media'}
                      className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover/card:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-[2/3] w-full bg-gradient-to-br from-slate-800 to-slate-900" />
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                    <Play size={32} className="text-white" fill="white" />
                  </div>

                  {/* Rating badge */}
                  {item.vote_average && item.vote_average > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      {item.vote_average.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Card metadata */}
                <div className="mt-2.5">
                  <p className="line-clamp-2 text-sm font-medium text-white group-hover/card:text-blue-300">{item.title || item.name}</p>
                  <p className="mt-1 text-xs text-white/50">
                    {type === 'movie' ? 'Movie' : 'Series'} • {getYear(item)}
                  </p>
                </div>
              </button>
            </article>
          );
        })}
      </div>

      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/3 z-20 hidden h-20 w-12 -translate-y-1/2 bg-gradient-to-l from-black via-black/60 to-transparent text-white/60 transition-all hover:text-white md:flex shadow-lg"
        >
          <ChevronRight size={24} />
        </Button>
      )}
    </section>
  );
}

type HomePageClientProps = {
  initialTrendingMovies: MediaItem[];
  initialTrendingTV: MediaItem[];
  initialLatestMovie: LatestItem | null;
  initialLatestTV: LatestItem | null;
};

export default function HomePageClient({
  initialTrendingMovies,
  initialTrendingTV,
  initialLatestMovie,
  initialLatestTV,
}: HomePageClientProps) {
  const router = useRouter();
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>(initialTrendingMovies);
  const [trendingTV, setTrendingTV] = useState<MediaItem[]>(initialTrendingTV);
  const [latestMovie, setLatestMovie] = useState<LatestItem | null>(initialLatestMovie);
  const [latestTV, setLatestTV] = useState<LatestItem | null>(initialLatestTV);
  const [trendingWindow] = useState<'day' | 'week'>('day');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(initialTrendingMovies.length === 0 && initialTrendingTV.length === 0);

  const heroPool = useMemo(
    () => [...trendingMovies, ...trendingTV].filter((item) => item.backdrop_path).slice(0, 12),
    [trendingMovies, trendingTV],
  );
  const [heroIndex, setHeroIndex] = useState(0);
  const hero = heroPool[heroIndex] || null;

  useEffect(() => {
    if (trendingWindow === 'day' && initialTrendingMovies.length > 0 && initialTrendingTV.length > 0) {
      return;
    }

    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const [moviesRes, tvRes] = await Promise.all([
          fetch(`/api/trending/movie?time_window=${trendingWindow}`),
          fetch(`/api/trending/tv?time_window=${trendingWindow}`),
        ]);

        const moviesData = (await moviesRes.json()) as { results?: { results?: MediaItem[] } };
        const tvData = (await tvRes.json()) as { results?: { results?: MediaItem[] } };

        setTrendingMovies((moviesData.results?.results || []).map((item) => ({ ...item, media_type: 'movie' as const })));
        setTrendingTV((tvData.results?.results || []).map((item) => ({ ...item, media_type: 'tv' as const })));

        if (!latestMovie || !latestTV) {
          const [latestMovieRes, latestTVRes] = await Promise.all([fetch('/api/movie/latest'), fetch('/api/tv/latest')]);
          const latestMovieData = (await latestMovieRes.json()) as { results?: LatestItem };
          const latestTvData = (await latestTVRes.json()) as { results?: LatestItem };
          if (latestMovieData.results) setLatestMovie(latestMovieData.results);
          if (latestTvData.results) setLatestTV(latestTvData.results);
        }

        setHeroIndex(0);
      } catch (error) {
        console.error('Failed to load trending', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTrending();
  }, [initialTrendingMovies, initialTrendingTV, latestMovie, latestTV, trendingWindow]);

  useEffect(() => {
    if (heroPool.length < 2) return;
    const interval = setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroPool.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [heroPool]);

  const genreChips = useMemo(
    () =>
      [...new Set([...trendingMovies, ...trendingTV].flatMap((item) => item.genre_ids || []))]
        .filter((id) => genreMap[id])
        .map((id) => ({ id, name: genreMap[id] }))
        .sort((left, right) => left.name.localeCompare(right.name)),
    [trendingMovies, trendingTV],
  );

  const filterByGenre = (items: MediaItem[]) => {
    if (!selectedGenre) return items;
    return items.filter((item) => item.genre_ids?.includes(selectedGenre));
  };

  const openItem = (type: 'movie' | 'tv', id: number) => {
    router.push(withProviderInPath(`/${type}/${id}`, getClientPreferredProvider()));
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />

      <main className="-mt-16">
        {/* Hero Banner */}
        <HeroBanner hero={hero} onOpen={openItem} />

        {/* Content Sections */}
        <div className="relative z-10 -mt-12 space-y-12 pb-16 sm:-mt-10 sm:space-y-14 sm:pb-20">
          {/* Genre Filter Section */}
          <section className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => setSelectedGenre(null)}
                className={cn(
                  'rounded-full text-xs font-medium transition-all',
                  !selectedGenre
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-white/8 text-white/60 hover:bg-white/12 hover:text-white',
                )}
              >
                All
              </Button>
              {genreChips.slice(0, 10).map((genre) => (
                <Button
                  key={genre.id}
                  size="sm"
                  onClick={() => setSelectedGenre(genre.id === selectedGenre ? null : genre.id)}
                  className={cn(
                    'rounded-full text-xs font-medium transition-all',
                    selectedGenre === genre.id
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-white/8 text-white/60 hover:bg-white/12 hover:text-white',
                  )}
                >
                  {genre.name}
                </Button>
              ))}
            </div>
          </section>

          {!isLoading ? (
            <>
              {/* Trending Rows */}
              <FeedRow title="Trending Now" items={filterByGenre(trendingMovies)} onOpen={openItem} />
              <FeedRow title="Popular Series" items={filterByGenre(trendingTV)} onOpen={openItem} />

              {/* Featured Section */}
              {latestMovie || latestTV ? (
                <section className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl lg:text-2xl">Recently Added</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {latestMovie && (
                      <button
                        onClick={() => openItem('movie', latestMovie.id)}
                        className="group/feature flex items-start gap-4 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-4 text-left transition-all hover:border-white/20 hover:bg-gradient-to-br hover:from-slate-700/50 hover:to-slate-800/50 backdrop-blur-sm"
                      >
                        <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-900">
                          {latestMovie.poster_path ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imgPosterSmall + latestMovie.poster_path}
                              alt={latestMovie.title || 'Latest movie'}
                              className="h-full w-full object-cover group-hover/feature:scale-105 transition-transform duration-300"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Badge variant="outline" className="mb-2 border-blue-400/30 bg-blue-500/10 text-xs font-medium text-blue-300">
                            Movie
                          </Badge>
                          <p className="line-clamp-2 text-sm font-semibold text-white">{latestMovie.title}</p>
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/60">{latestMovie.overview || 'Open to view details.'}</p>
                        </div>
                      </button>
                    )}
                    {latestTV && (
                      <button
                        onClick={() => openItem('tv', latestTV.id)}
                        className="group/feature flex items-start gap-4 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-4 text-left transition-all hover:border-white/20 hover:bg-gradient-to-br hover:from-slate-700/50 hover:to-slate-800/50 backdrop-blur-sm"
                      >
                        <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-900">
                          {latestTV.poster_path ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imgPosterSmall + latestTV.poster_path}
                              alt={latestTV.name || 'Latest series'}
                              className="h-full w-full object-cover group-hover/feature:scale-105 transition-transform duration-300"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Badge variant="outline" className="mb-2 border-blue-400/30 bg-blue-500/10 text-xs font-medium text-blue-300">
                            Series
                          </Badge>
                          <p className="line-clamp-2 text-sm font-semibold text-white">{latestTV.name}</p>
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/60">{latestTV.overview || 'Open to view details.'}</p>
                        </div>
                      </button>
                    )}
                  </div>
                </section>
              ) : null}

              {/* Quick Actions CTA */}
              <section className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/30 to-slate-900/40 p-8 backdrop-blur-sm">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold tracking-tight text-white">Explore More</h2>
                      <p className="mt-1 text-sm text-white/60">Discover movies, shows, and live channels in one place.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 sm:flex-nowrap">
                      <Link
                        href="/search"
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'rounded-lg bg-white px-6 text-sm font-medium text-black hover:bg-white/90 transition-all'
                        )}
                      >
                        <Search size={16} className="mr-2" />
                        Search
                      </Link>
                      <Link
                        href="/live-tv"
                        className={cn(
                          buttonVariants({ variant: 'outline', size: 'sm' }),
                          'rounded-lg border-white/20 bg-white/8 px-6 text-sm font-medium text-white hover:bg-white/12 transition-all'
                        )}
                      >
                        <Tv size={16} className="mr-2" />
                        Live TV
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="h-6 w-32 rounded bg-white/10" />
                    <div className="flex gap-4 overflow-hidden">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="w-[140px] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-900 md:w-[160px] lg:w-[180px]">
                          <Skeleton className="aspect-[2/3] bg-white/5" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
