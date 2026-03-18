'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ClockPlus, Info, Play, Search, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { addToWatchLater } from '@/lib/watch-later';
import { imgBackdrop, imgPosterSmall } from '@/lib/media-constants';

type MediaItem = {
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

type LatestItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
};

function TrendingRow({ title, items, onItemClick }: { title: string; items: MediaItem[]; onItemClick: (type: 'movie' | 'tv', id: number) => void }) {
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
    const amount = rowRef.current.clientWidth * 0.8;
    rowRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (!items?.length) return null;

  return (
    <section className="relative group/row mb-10">
      <h2 className="text-lg md:text-xl font-semibold mb-3 px-4 md:px-12 text-white/90 tracking-wide">{title}</h2>

      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-12 bottom-0 z-10 w-12 items-center justify-center bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeft size={32} className="text-white drop-shadow-lg" />
        </button>
      )}

      <div ref={rowRef} className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide px-4 md:px-12 pb-4">
        {items.map((item, idx) => {
          const type = item.media_type || (item.title ? 'movie' : 'tv');
          return (
            <div
              key={item.id}
              className="relative flex-shrink-0 w-[130px] md:w-[200px] cursor-pointer group/card rounded-md overflow-hidden"
              onClick={() => onItemClick(type, item.id)}
            >
              {item.poster_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgPosterSmall + item.poster_path} alt={item.title || item.name || 'media'} className="w-full aspect-[2/3] object-cover transition-all duration-300 group-hover/card:scale-110 group-hover/card:brightness-50" loading="lazy" />
              ) : null}

              {idx < 10 && (
                <span className="absolute bottom-1 left-1 text-6xl md:text-7xl font-black text-white/10 leading-none select-none pointer-events-none" style={{ textShadow: '2px 2px 0 rgba(139,92,246,0.15)' }}>
                  {idx + 1}
                </span>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                <p className="text-sm font-bold truncate text-white">{item.title || item.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                  <span className="flex items-center gap-0.5 text-yellow-400">
                    <Star size={10} fill="currentColor" /> {item.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-gray-500">|</span>
                  <span>{(item.release_date || item.first_air_date || '').slice(0, 4)}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button className="flex-1 flex items-center justify-center gap-1 bg-white text-black text-xs font-bold py-1.5 rounded hover:bg-white/90 transition">
                    <Play size={12} fill="black" /> Play
                  </button>
                  <button
                    title="Watch Later"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToWatchLater(item.id, type);
                    }}
                    className="flex items-center justify-center bg-white/10 border border-white/30 hover:border-white p-1.5 rounded transition"
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
          className="hidden md:flex absolute right-0 top-12 bottom-0 z-10 w-12 items-center justify-center bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <ChevronRight size={32} className="text-white drop-shadow-lg" />
        </button>
      )}
    </section>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [trendingTV, setTrendingTV] = useState<MediaItem[]>([]);
  const [latestMovie, setLatestMovie] = useState<LatestItem | null>(null);
  const [latestTV, setLatestTV] = useState<LatestItem | null>(null);
  const [hero, setHero] = useState<MediaItem | null>(null);
  const [heroPool, setHeroPool] = useState<MediaItem[]>([]);
  const heroIndexRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [trendingWindow, setTrendingWindow] = useState<'day' | 'week'>('day');

  useEffect(() => {
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

        const [latestMovieRes, latestTVRes] = await Promise.all([fetch('/api/movie/latest'), fetch('/api/tv/latest')]);
        const latestMovieData = (await latestMovieRes.json()) as { results?: LatestItem };
        const latestTvData = (await latestTVRes.json()) as { results?: LatestItem };
        if (latestMovieData.results) setLatestMovie(latestMovieData.results);
        if (latestTvData.results) setLatestTV(latestTvData.results);

        const withBackdrop = movies.filter((m) => m.backdrop_path);
        if (withBackdrop.length) {
          setHeroPool(withBackdrop);
          const idx = Math.floor(Math.random() * withBackdrop.length);
          heroIndexRef.current = idx;
          setHero(withBackdrop[idx]);
        }
      } catch (err) {
        console.error('Failed to load trending', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTrending();
  }, [trendingWindow]);

  useEffect(() => {
    if (heroPool.length < 2) return;
    const interval = setInterval(() => {
      heroIndexRef.current = (heroIndexRef.current + 1) % heroPool.length;
      setHero(heroPool[heroIndexRef.current]);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroPool]);

  const allGenreIds = useMemo(() => [...new Set([...trendingMovies, ...trendingTV].flatMap((item) => item.genre_ids || []))], [trendingMovies, trendingTV]);

  const GENRE_MAP: Record<number, string> = {
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

  const genreChips = allGenreIds.filter((id) => GENRE_MAP[id]).map((id) => ({ id, name: GENRE_MAP[id] })).sort((a, b) => a.name.localeCompare(b.name));

  const filterByGenre = (items: MediaItem[]) => {
    if (!selectedGenre) return items;
    return items.filter((item) => item.genre_ids?.includes(selectedGenre));
  };

  const openItem = (type: 'movie' | 'tv', id: number) => router.push(`/${type}/${id}`);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-200">
      <Navbar />

      <header className="relative w-full h-[75vh] md:h-[90vh] overflow-hidden">
        {hero ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgBackdrop + hero.backdrop_path} alt={hero.title || hero.name} key={hero.id} className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02] animate-fade-in" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-[#0a0a0a]/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-[#0a0a0a]" />
        )}

        <div className="absolute bottom-20 md:bottom-28 left-4 md:left-12 max-w-lg z-10 space-y-4">
          {hero ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-purple-600/90 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Trending</span>
                <span className="flex items-center gap-1 text-sm text-yellow-400">
                  <Star size={14} fill="currentColor" /> {hero.vote_average?.toFixed(1)}
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight drop-shadow-2xl">{hero.title || hero.name}</h2>
              <p className="text-sm md:text-base text-gray-300 line-clamp-3 leading-relaxed max-w-md">{hero.overview}</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => openItem((hero.media_type || 'movie') as 'movie' | 'tv', hero.id)} className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-md font-bold text-sm hover:bg-white/90 transition-all duration-200 shadow-xl">
                  <Play size={18} fill="black" /> Play
                </button>
                <button onClick={() => openItem((hero.media_type || 'movie') as 'movie' | 'tv', hero.id)} className="flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm rounded-md font-semibold text-sm hover:bg-white/30 transition-all duration-200 border border-white/10">
                  <Info size={18} /> More Info
                </button>
              </div>
            </>
          ) : !isLoading ? (
            <>
              <p className="uppercase tracking-[0.3em] text-xs text-purple-400/70 font-semibold">Stream smart · Stream safe</p>
              <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">Welcome to Vidoza</h2>
              <p className="text-base text-gray-400 max-w-md">Discover trending titles, build your watch-later list, and dive into cinematic worlds.</p>
              <Link href="/search" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-500 transition font-bold text-white shadow-lg shadow-purple-600/30">
                <Search size={18} /> Start Searching
              </Link>
            </>
          ) : null}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </header>

      <main className="-mt-20 relative z-10 pb-6">
        {!isLoading && (
          <>
            {genreChips.length > 0 && (
              <div className="px-4 md:px-12 mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGenre(null)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                    !selectedGenre
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'
                  }`}
                >
                  All
                </button>
                {genreChips.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGenre(g.id === selectedGenre ? null : g.id)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                      selectedGenre === g.id
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}

            <div className="px-4 md:px-12 mb-6 flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium mr-1">Trending:</span>
              <button
                onClick={() => setTrendingWindow('day')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                  trendingWindow === 'day' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTrendingWindow('week')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                  trendingWindow === 'week' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'
                }`}
              >
                This Week
              </button>
            </div>

            <TrendingRow title={`Trending Movies ${trendingWindow === 'week' ? 'This Week' : 'Today'}`} items={filterByGenre(trendingMovies)} onItemClick={openItem} />
            <TrendingRow title={`Trending TV Shows ${trendingWindow === 'week' ? 'This Week' : 'Today'}`} items={filterByGenre(trendingTV)} onItemClick={openItem} />

            {(latestMovie || latestTV) && (
              <section className="px-4 md:px-12 mb-10">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-white/90 tracking-wide">Just Added</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {latestMovie && (
                    <div onClick={() => router.push(`/movie/${latestMovie.id}`)} className="flex gap-4 bg-white/5 border border-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 hover:border-purple-500/20 transition-all group">
                      {latestMovie.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgPosterSmall + latestMovie.poster_path} alt={latestMovie.title} className="w-[80px] h-[120px] object-cover rounded-md flex-shrink-0" />
                      ) : (
                        <div className="w-[80px] h-[120px] bg-[#1a1a1a] rounded-md" />
                      )}
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1">Latest Movie</span>
                        <p className="font-semibold truncate">{latestMovie.title}</p>
                        {latestMovie.overview && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{latestMovie.overview}</p>}
                      </div>
                    </div>
                  )}

                  {latestTV && (
                    <div onClick={() => router.push(`/tv/${latestTV.id}`)} className="flex gap-4 bg-white/5 border border-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 hover:border-pink-500/20 transition-all group">
                      {latestTV.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgPosterSmall + latestTV.poster_path} alt={latestTV.name} className="w-[80px] h-[120px] object-cover rounded-md flex-shrink-0" />
                      ) : (
                        <div className="w-[80px] h-[120px] bg-[#1a1a1a] rounded-md" />
                      )}
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1">Latest TV Show</span>
                        <p className="font-semibold truncate">{latestTV.name}</p>
                        {latestTV.overview && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{latestTV.overview}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <div className="flex flex-wrap justify-center gap-3 px-6 pt-8 pb-4">
              <Link href="/discover" className="px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-500 transition font-semibold text-white text-sm shadow-lg shadow-purple-600/20">
                Discover by Genre
              </Link>
              <Link href="/search" className="px-6 py-3 rounded-md border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition font-semibold text-sm">
                Search All Titles
              </Link>
              <Link href="/about" className="px-6 py-3 rounded-md border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition font-semibold text-sm">
                About Vidoza
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
