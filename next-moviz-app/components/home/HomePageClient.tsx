'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ClockPlus,
  Flame,
  Play,
  Search,
  Star,
  Tv,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { addToWatchLater } from '@/lib/watch-later';
import { imgBackdrop, imgPosterSmall } from '@/lib/media-constants';
import { notify } from '@/lib/notify';
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
      <div className="mb-5 flex items-end justify-between px-4 md:px-8 xl:px-12">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Now trending</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-[2rem]">{title}</h2>
        </div>
        <Link href="/discover" className="text-sm font-medium text-white/55 hover:text-white">
          Explore
        </Link>
      </div>

      {showLeftArrow ? (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-12 z-10 hidden h-[72%] w-14 items-center justify-center bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/86 to-transparent md:flex"
        >
          <ChevronLeft size={28} className="text-white" />
        </button>
      ) : null}

      <div ref={rowRef} className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-3 md:gap-5 md:px-8 xl:px-12">
        {items.map((item) => {
          const type = item.media_type || (item.title ? 'movie' : 'tv');
          return (
            <article key={`${type}-${item.id}`} className="w-[220px] shrink-0 md:w-[230px]">
              <button
                onClick={() => onOpen(type, item.id)}
                className="group/card block w-full text-left"
              >
                <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#1a1a1a]">
                  {item.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgPosterSmall + item.poster_path}
                      alt={item.title || item.name || 'media'}
                      className="aspect-video w-full object-cover transition duration-300 group-hover/card:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-video w-full bg-[#1a1a1a]" />
                  )}
                </div>
                <div className="mt-3.5 flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#272727] text-xs font-semibold text-white">
                    {(item.title || item.name || 'T').slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-white md:text-[15px]">{item.title || item.name}</p>
                    <p className="mt-1 text-xs text-white/50">
                      {type === 'movie' ? 'Movie' : 'Series'} • {getYear(item)}
                    </p>
                    {item.vote_average ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#ffd27d]">
                        <Star size={11} fill="currentColor" />
                        {item.vote_average.toFixed(1)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </button>
              <div className="mt-3.5 flex gap-2">
                <button
                  onClick={() => onOpen(type, item.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-black"
                >
                  <Play size={12} fill="currentColor" />
                  Watch
                </button>
                <button
                  title="Add to watch later"
                  onClick={() => {
                    const added = addToWatchLater(item.id, type);
                    notify({
                      title: added ? 'Saved to My List' : 'Already in My List',
                      description: item.title || item.name || 'Title',
                    });
                  }}
                  className="rounded-full border border-white/12 bg-white/[0.05] px-3 text-white/75 hover:border-white/20 hover:text-white"
                >
                  <ClockPlus size={14} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {showRightArrow ? (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-12 z-10 hidden h-[72%] w-14 items-center justify-center bg-gradient-to-l from-[#0f0f0f] via-[#0f0f0f]/86 to-transparent md:flex"
        >
          <ChevronRight size={28} className="text-white" />
        </button>
      ) : null}
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
  const [trendingWindow, setTrendingWindow] = useState<'day' | 'week'>('day');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(initialTrendingMovies.length === 0 && initialTrendingTV.length === 0);

  const heroPool = useMemo(
    () => trendingMovies.filter((item) => item.backdrop_path).slice(0, 6),
    [trendingMovies],
  );
  const [heroIndex, setHeroIndex] = useState(0);
  const hero = heroPool[heroIndex] || trendingMovies[0] || trendingTV[0] || null;

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
    }, 8000);
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

  const quickRail = useMemo(
    () => [...trendingMovies.slice(0, 4), ...trendingTV.slice(0, 4)].slice(0, 6),
    [trendingMovies, trendingTV],
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0f0f] text-white">
      <Navbar />

      <main className="pt-16 md:pt-18">
        <section className="px-4 md:px-8 xl:px-12">
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
            <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#181818] shadow-[0_22px_65px_rgba(0,0,0,0.35)]">
              {hero?.backdrop_path ? (
                <div className="relative h-[310px] md:h-[500px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgBackdrop + hero.backdrop_path}
                    alt={hero.title || hero.name || 'Featured title'}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.55)_40%,rgba(0,0,0,0.16)_100%)]" />
                  <div className="absolute inset-0 flex items-end p-5 md:p-8">
                    <div className="max-w-2xl">
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#272727] px-3 py-1 text-white/80">
                          <Flame size={12} />
                          Featured
                        </span>
                        <span className="rounded-full bg-black/40 px-3 py-1 text-white/75">{(hero.media_type || 'movie') === 'movie' ? 'Movie' : 'Series'}</span>
                        <span className="rounded-full bg-black/40 px-3 py-1 text-white/75">{getYear(hero)}</span>
                        {hero.vote_average ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-[#ffd27d]">
                            <Star size={11} fill="currentColor" />
                            {hero.vote_average.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                      <h1 className="max-w-[14ch] text-4xl font-semibold leading-[0.95] tracking-[-0.03em] md:text-6xl">
                        {hero.title || hero.name}
                      </h1>
                      <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
                        {hero.overview || 'Open the title to start watching instantly.'}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          onClick={() => openItem((hero.media_type || 'movie') as 'movie' | 'tv', hero.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
                        >
                          <Play size={15} fill="currentColor" />
                          Watch now
                        </button>
                        <button
                          onClick={() => {
                            const added = addToWatchLater(hero.id, (hero.media_type || 'movie') as 'movie' | 'tv');
                            notify({
                              title: added ? 'Saved to My List' : 'Already in My List',
                              description: hero.title || hero.name || 'Title',
                            });
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#272727] px-6 py-3 text-sm font-medium text-white"
                        >
                          <ClockPlus size={15} />
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[300px] items-end bg-[linear-gradient(140deg,#1a1a1a_0%,#101010_62%,#090909_100%)] p-6 md:h-[420px] md:p-8">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Featured</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-4xl">Fresh picks are loading</p>
                    <p className="mt-3 max-w-xl text-sm text-white/65 md:text-base">Hold on for the latest movies and series tailored to your current feed.</p>
                  </div>
                </div>
              )}
            </div>

            <aside className="rounded-[30px] border border-white/10 bg-[#181818] p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Quick access</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Start fast</h2>
                </div>
                <Search size={18} className="text-white/45" />
              </div>

              <div className="mt-5 grid gap-3">
                <Link href="/search" className="rounded-[20px] border border-white/10 bg-[#242424] px-4 py-4 hover:bg-[#2d2d2d]">
                  <p className="text-sm font-medium text-white">Search anything</p>
                  <p className="mt-1 text-xs text-white/50">Jump straight to a movie or show.</p>
                </Link>
                <Link href="/live-tv" className="rounded-[20px] border border-white/10 bg-[#242424] px-4 py-4 hover:bg-[#2d2d2d]">
                  <p className="text-sm font-medium text-white">Open live TV</p>
                  <p className="mt-1 text-xs text-white/50">Watch channels with one click.</p>
                </Link>
                <Link href="/watch-later" className="rounded-[20px] border border-white/10 bg-[#242424] px-4 py-4 hover:bg-[#2d2d2d]">
                  <p className="text-sm font-medium text-white">My list</p>
                  <p className="mt-1 text-xs text-white/50">Resume saved titles anytime.</p>
                </Link>
              </div>

              {quickRail.length ? (
                <div className="mt-6">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Watch next</p>
                  <div className="mt-3 space-y-3">
                    {quickRail.map((item) => {
                      const type = item.media_type || (item.title ? 'movie' : 'tv');
                      return (
                        <button
                          key={`${type}-${item.id}`}
                          onClick={() => openItem(type, item.id)}
                          className="flex w-full items-center gap-3 rounded-[20px] border border-white/10 bg-[#242424] p-3 text-left hover:bg-[#2d2d2d]"
                        >
                          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-[14px] bg-[#111]">
                            {item.poster_path ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imgPosterSmall + item.poster_path}
                                alt={item.title || item.name || 'media'}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-medium text-white">{item.title || item.name}</p>
                            <p className="mt-1 text-xs text-white/50">
                              {type === 'movie' ? 'Movie' : 'Series'} • {getYear(item)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </section>

        {!isLoading ? (
          <>
            <section className="mt-8 px-4 md:px-8 xl:px-12">
              <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-[#181818] p-4 md:flex-row md:items-center md:justify-between md:p-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Browse</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Clean feed, fewer distractions</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTrendingWindow('day')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      trendingWindow === 'day' ? 'bg-white text-black' : 'bg-[#272727] text-white/70'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setTrendingWindow('week')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      trendingWindow === 'week' ? 'bg-white text-black' : 'bg-[#272727] text-white/70'
                    }`}
                  >
                    This week
                  </button>
                  <button
                    onClick={() => setSelectedGenre(null)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      !selectedGenre ? 'bg-[#3ea6ff] text-black' : 'bg-[#272727] text-white/70'
                    }`}
                  >
                    All
                  </button>
                  {genreChips.slice(0, 8).map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => setSelectedGenre(genre.id === selectedGenre ? null : genre.id)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold ${
                        selectedGenre === genre.id ? 'bg-[#3ea6ff] text-black' : 'bg-[#272727] text-white/70'
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="mt-8 space-y-10">
              <FeedRow title="Trending Movies" items={filterByGenre(trendingMovies)} onOpen={openItem} />
              <FeedRow title="Trending Series" items={filterByGenre(trendingTV)} onOpen={openItem} />
            </div>

            {(latestMovie || latestTV) ? (
              <section className="mt-10 px-4 md:px-8 xl:px-12">
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Just arrived</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-[2rem]">Latest drops</h2>
                  </div>
                  <Link href="/discover" className="text-sm font-medium text-white/55 hover:text-white">
                    See more
                  </Link>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {latestMovie ? (
                    <button
                      onClick={() => openItem('movie', latestMovie.id)}
                      className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-[#181818] p-4 text-left hover:bg-[#1f1f1f]"
                    >
                      <div className="h-24 w-36 shrink-0 overflow-hidden rounded-[16px] bg-[#111]">
                        {latestMovie.poster_path ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgPosterSmall + latestMovie.poster_path} alt={latestMovie.title || 'Latest movie'} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Latest movie</p>
                        <p className="mt-2 text-lg font-semibold text-white">{latestMovie.title}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-white/55">{latestMovie.overview || 'Open to view details and watch.'}</p>
                      </div>
                    </button>
                  ) : null}

                  {latestTV ? (
                    <button
                      onClick={() => openItem('tv', latestTV.id)}
                      className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-[#181818] p-4 text-left hover:bg-[#1f1f1f]"
                    >
                      <div className="h-24 w-36 shrink-0 overflow-hidden rounded-[16px] bg-[#111]">
                        {latestTV.poster_path ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgPosterSmall + latestTV.poster_path} alt={latestTV.name || 'Latest series'} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Latest series</p>
                        <p className="mt-2 text-lg font-semibold text-white">{latestTV.name}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-white/55">{latestTV.overview || 'Open to view episodes and watch.'}</p>
                      </div>
                    </button>
                  ) : null}
                </div>
              </section>
            ) : null}

            <section className="mt-10 px-4 pb-10 md:px-8 xl:px-12">
              <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Simple actions</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Search, watch, save</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/search" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
                      Search
                    </Link>
                    <Link href="/live-tv" className="rounded-full bg-[#272727] px-5 py-3 text-sm font-medium text-white">
                      <span className="inline-flex items-center gap-2"><Tv size={14} /> Live TV</span>
                    </Link>
                    <Link href="/watch-later" className="rounded-full bg-[#272727] px-5 py-3 text-sm font-medium text-white">
                      My List
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="mt-8 px-4 pb-10 md:px-8 xl:px-12">
            <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Loading feed</p>
                <div className="h-2.5 w-24 animate-pulse rounded-full bg-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-[20px] border border-white/10 bg-[#141414]">
                    <div className="aspect-video animate-pulse bg-white/[0.06]" />
                    <div className="space-y-2 p-3">
                      <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/[0.08]" />
                      <div className="h-3 w-2/5 animate-pulse rounded bg-white/[0.06]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
