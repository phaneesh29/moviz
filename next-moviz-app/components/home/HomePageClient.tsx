'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ClockPlus, Flame, Info, Play, Search, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { addToWatchLater } from '@/lib/watch-later';
import { imgBackdrop, imgPosterSmall } from '@/lib/media-constants';

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

function TrendingRow({
  title,
  items,
  onItemClick,
}: {
  title: string;
  items: MediaItem[];
  onItemClick: (type: 'movie' | 'tv', id: number) => void;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkArrows = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkArrows);
    checkArrows();
    return () => el.removeEventListener('scroll', checkArrows);
  }, [items]);

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.82;
    rowRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!items.length) return null;

  return (
    <section className="group/row relative mb-12">
      <div className="mb-4 flex items-center justify-between px-4 md:px-12">
        <h2 className="text-xl font-semibold tracking-wide text-white md:text-2xl">{title}</h2>
        <Link href="/discover" className="text-sm font-medium text-white/50 hover:text-white">
          Explore more
        </Link>
      </div>

      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-14 z-10 hidden h-[72%] w-14 items-center justify-center bg-gradient-to-r from-black via-black/75 to-transparent opacity-0 transition-opacity duration-300 group-hover/row:opacity-100 md:flex"
        >
          <ChevronLeft size={34} className="text-white drop-shadow-lg" />
        </button>
      )}

      <div ref={rowRef} className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-4 md:px-12">
        {items.map((item, idx) => {
          const type = item.media_type || (item.title ? 'movie' : 'tv');
          return (
            <div
              key={item.id}
              className="group/card relative w-[150px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/8 bg-white/[0.03] md:w-[220px]"
              onClick={() => onItemClick(type, item.id)}
            >
              {item.poster_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgPosterSmall + item.poster_path}
                  alt={item.title || item.name || 'media'}
                  className="aspect-[2/3] w-full object-cover group-hover/card:scale-[1.08] group-hover/card:brightness-[0.45]"
                  loading="lazy"
                />
              ) : (
                <div className="aspect-[2/3] w-full bg-[#141414]" />
              )}

              {idx < 10 && (
                <span className="pointer-events-none absolute bottom-2 left-2 select-none font-display text-6xl leading-none text-white/12 md:text-7xl">
                  {idx + 1}
                </span>
              )}

              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/55 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                <p className="truncate text-sm font-bold text-white md:text-base">{item.title || item.name}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-neutral-300">
                  <span className="flex items-center gap-1 text-[#ffd27d]">
                    <Star size={10} fill="currentColor" />
                    {item.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-white/20">|</span>
                  <span>{(item.release_date || item.first_air_date || '').slice(0, 4)}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-1 rounded-md bg-white py-2 text-xs font-bold text-black">
                    <Play size={12} fill="black" />
                    Play
                  </button>
                  <button
                    title="Add to watch later"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToWatchLater(item.id, type);
                    }}
                    className="flex items-center justify-center rounded-md border border-white/25 bg-white/10 p-2 text-white"
                  >
                    <ClockPlus size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-14 z-10 hidden h-[72%] w-14 items-center justify-center bg-gradient-to-l from-black via-black/75 to-transparent opacity-0 transition-opacity duration-300 group-hover/row:opacity-100 md:flex"
        >
          <ChevronRight size={34} className="text-white drop-shadow-lg" />
        </button>
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
  const initialHeroPool = useMemo(
    () => initialTrendingMovies.filter((item) => item.backdrop_path),
    [initialTrendingMovies],
  );
  const [hero, setHero] = useState<MediaItem | null>(initialHeroPool[0] || initialTrendingMovies[0] || null);
  const [heroPool, setHeroPool] = useState<MediaItem[]>(initialHeroPool);
  const heroIndexRef = useRef(0);
  const [isLoading, setIsLoading] = useState(initialTrendingMovies.length === 0 && initialTrendingTV.length === 0);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [trendingWindow, setTrendingWindow] = useState<'day' | 'week'>('day');

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
        const movies = moviesData.results?.results || [];
        const tv = tvData.results?.results || [];

        setTrendingMovies(movies);
        setTrendingTV(tv);

        if (!latestMovie || !latestTV) {
          const [latestMovieRes, latestTVRes] = await Promise.all([fetch('/api/movie/latest'), fetch('/api/tv/latest')]);
          const latestMovieData = (await latestMovieRes.json()) as { results?: LatestItem };
          const latestTvData = (await latestTVRes.json()) as { results?: LatestItem };
          if (latestMovieData.results) setLatestMovie(latestMovieData.results);
          if (latestTvData.results) setLatestTV(latestTvData.results);
        }

        const withBackdrop = movies.filter((m) => m.backdrop_path);
        setHeroPool(withBackdrop);
        setHero(withBackdrop[0] || movies[0] || null);
        heroIndexRef.current = 0;
      } catch (err) {
        console.error('Failed to load trending', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTrending();
  }, [trendingWindow, initialTrendingMovies, initialTrendingTV, latestMovie, latestTV]);

  useEffect(() => {
    if (heroPool.length < 2) return;
    const interval = setInterval(() => {
      heroIndexRef.current = (heroIndexRef.current + 1) % heroPool.length;
      setHero(heroPool[heroIndexRef.current]);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroPool]);

  const allGenreIds = useMemo(
    () => [...new Set([...trendingMovies, ...trendingTV].flatMap((item) => item.genre_ids || []))],
    [trendingMovies, trendingTV],
  );

  const genreMap: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
    10759: 'Action & Adventure',
    10762: 'Kids',
    10763: 'News',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'War & Politics',
  };

  const genreChips = allGenreIds
    .filter((id) => genreMap[id])
    .map((id) => ({ id, name: genreMap[id] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const filterByGenre = (items: MediaItem[]) => {
    if (!selectedGenre) return items;
    return items.filter((item) => item.genre_ids?.includes(selectedGenre));
  };

  const openItem = (type: 'movie' | 'tv', id: number) => router.push(`/${type}/${id}`);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#050505] text-[#f5f5f1]">
      <Navbar />

      <header className="relative min-h-[82vh] w-full overflow-hidden">
        {hero ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgBackdrop + hero.backdrop_path}
              alt={hero.title || hero.name}
              key={hero.id}
              className="absolute inset-0 h-full w-full scale-[1.03] object-cover object-center animate-fade-in"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.72)_36%,rgba(5,5,5,0.14)_70%,rgba(5,5,5,0.72)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22)_0%,rgba(5,5,5,0.18)_52%,#050505_100%)]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,9,20,0.22),transparent_30%),linear-gradient(180deg,#181818_0%,#050505_100%)]" />
        )}

        <div className="absolute inset-x-0 bottom-0 top-0 mx-auto flex max-w-7xl items-center px-4 pt-28 md:px-12">
          <div className="w-full">
            <div className="max-w-3xl pb-20 md:pb-24">
              {hero ? (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6a3d]/30 bg-[#250a08]/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                      <Flame size={12} />
                      Most watched now
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold text-[#ffd27d]">
                      <Star size={12} fill="currentColor" />
                      {hero.vote_average?.toFixed(1)} audience score
                    </span>
                  </div>

                  <h1 className="hero-title-balance font-display max-w-[12ch] text-5xl leading-[0.92] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:text-7xl">
                    {hero.title || hero.name}
                  </h1>
                  <p className="mt-5 min-h-[140px] max-w-[46rem] text-sm leading-7 text-neutral-300 md:min-h-[168px] md:text-base">
                    {hero.overview}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      onClick={() => openItem((hero.media_type || 'movie') as 'movie' | 'tv', hero.id)}
                      className="accent-button inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold text-white"
                    >
                      <Play size={18} fill="currentColor" />
                      Play now
                    </button>
                    <button
                      onClick={() => openItem((hero.media_type || 'movie') as 'movie' | 'tv', hero.id)}
                      className="glass-button inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white"
                    >
                      <Info size={18} />
                      More info
                    </button>
                    <button
                      onClick={() => addToWatchLater(hero.id, (hero.media_type || 'movie') as 'movie' | 'tv')}
                      className="glass-button inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold text-white"
                    >
                      <ClockPlus size={18} />
                      Add to my list
                    </button>
                  </div>
                </>
              ) : !isLoading ? (
                <>
                  <span className="inline-flex rounded-full border border-[#e50914]/25 bg-[#210406] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#ff8e8e]">
                    Premium streaming
                  </span>
                  <h1 className="font-display mt-5 text-5xl leading-[0.95] md:text-7xl">
                    Movies, series and live channels in one premium home.
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-neutral-300">
                    Search faster, browse cleaner, and jump straight into what deserves your screen time.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/search" className="accent-button inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold text-white">
                      <Search size={18} />
                      Start exploring
                    </Link>
                    <Link href="/discover" className="glass-button inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white">
                      <Info size={18} />
                      Browse categories
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#050505] to-transparent" />
      </header>

      <main className="relative z-10 pb-8 pt-2 md:pt-4">
        {!isLoading && (
          <>
            <section className="px-4 md:px-12">
              <div className="cinema-panel rounded-[28px] p-5 md:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">Curated browsing</p>
                    <h2 className="mt-2 text-2xl text-white md:text-3xl">Find your next watch with precision</h2>
                  </div>

                  <div className="flex gap-2 self-start xl:self-auto">
                    <button
                      onClick={() => setTrendingWindow('day')}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                        trendingWindow === 'day'
                          ? 'border-[#e50914] bg-[#e50914] text-white'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setTrendingWindow('week')}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                        trendingWindow === 'week'
                          ? 'border-[#e50914] bg-[#e50914] text-white'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      This week
                    </button>
                  </div>
                </div>

                {genreChips.length > 0 && (
                  <div className="scrollbar-hide mt-6 flex gap-2 overflow-x-auto pb-1">
                    <button
                      onClick={() => setSelectedGenre(null)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                        !selectedGenre
                          ? 'border-[#ff6a3d]/50 bg-[#31110a] text-white'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      All genres
                    </button>
                    {genreChips.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGenre(g.id === selectedGenre ? null : g.id)}
                        className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                          selectedGenre === g.id
                            ? 'border-[#ff6a3d]/50 bg-[#31110a] text-white'
                            : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <div className="mt-10">
              <TrendingRow
                title={`Trending Movies ${trendingWindow === 'week' ? 'This Week' : 'Today'}`}
                items={filterByGenre(trendingMovies)}
                onItemClick={openItem}
              />
              <TrendingRow
                title={`Trending Series ${trendingWindow === 'week' ? 'This Week' : 'Today'}`}
                items={filterByGenre(trendingTV)}
                onItemClick={openItem}
              />
            </div>

            {(latestMovie || latestTV) && (
              <section className="px-4 pb-4 md:px-12">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white md:text-2xl">Freshly added</h2>
                  <Link href="/discover" className="text-sm font-medium text-white/50 hover:text-white">
                    Browse catalog
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {latestMovie && (
                    <div
                      onClick={() => router.push(`/movie/${latestMovie.id}`)}
                      className="cinema-panel group flex cursor-pointer gap-4 rounded-[28px] p-5"
                    >
                      {latestMovie.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgPosterSmall + latestMovie.poster_path}
                          alt={latestMovie.title}
                          className="h-[148px] w-[100px] flex-shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-[148px] w-[100px] flex-shrink-0 rounded-xl bg-[#141414]" />
                      )}
                      <div className="min-w-0 py-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff9f6a]">
                          Latest movie
                        </span>
                        <p className="mt-3 text-xl font-semibold text-white transition group-hover:text-[#ffe1d4]">
                          {latestMovie.title}
                        </p>
                        {latestMovie.overview && (
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">
                            {latestMovie.overview}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {latestTV && (
                    <div
                      onClick={() => router.push(`/tv/${latestTV.id}`)}
                      className="cinema-panel group flex cursor-pointer gap-4 rounded-[28px] p-5"
                    >
                      {latestTV.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgPosterSmall + latestTV.poster_path}
                          alt={latestTV.name}
                          className="h-[148px] w-[100px] flex-shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-[148px] w-[100px] flex-shrink-0 rounded-xl bg-[#141414]" />
                      )}
                      <div className="min-w-0 py-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff9f6a]">
                          Latest series
                        </span>
                        <p className="mt-3 text-xl font-semibold text-white transition group-hover:text-[#ffe1d4]">
                          {latestTV.name}
                        </p>
                        {latestTV.overview && (
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">
                            {latestTV.overview}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="px-4 pt-2 md:px-12">
              <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(229,9,20,0.18),rgba(255,106,61,0.08),rgba(255,255,255,0.02))] p-6 md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#ffb088]">Designed for binge nights</p>
                    <h2 className="mt-3 text-3xl text-white md:text-4xl">
                      Premium visuals, same features, faster routes into what matters.
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-neutral-300 md:text-base">
                      Jump into search, curated discovery, live TV and saved titles without extra clutter or feature bloat.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href="/search" className="accent-button rounded-md px-6 py-3 text-sm font-bold text-white">
                      Search titles
                    </Link>
                    <Link href="/live-tv" className="glass-button rounded-md px-6 py-3 text-sm font-semibold text-white">
                      Open live TV
                    </Link>
                    <Link href="/watch-later" className="glass-button rounded-md px-6 py-3 text-sm font-semibold text-white">
                      View my list
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
