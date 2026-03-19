'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsLeft, ChevronsRight, ClockPlus, Film, Play, SlidersHorizontal, Sparkles, Star, Tv } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { addToWatchLater } from '@/lib/watch-later';
import { imgPosterSmall } from '@/lib/media-constants';

export const dynamic = 'force-dynamic';

type Genre = { id: number; name: string };
type DiscoverItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
};

type DiscoverPayload = {
  page: number;
  total_pages: number;
  total_results: number;
  results: DiscoverItem[];
};

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest First' },
  { value: 'primary_release_date.asc', label: 'Oldest First' },
];

export default function DiscoverPage() {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [genres, setGenres] = useState<{ movie: Genre[]; tv: Genre[] }>({ movie: [], tv: [] });
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [data, setData] = useState<DiscoverPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch('/api/discover/genres');
        const payload = (await res.json()) as { results?: { movie?: Genre[]; tv?: Genre[] } };
        if (payload.results) {
          setGenres({ movie: payload.results.movie || [], tv: payload.results.tv || [] });
        }
      } catch (err) {
        console.error('Failed to load genres', err);
      }
    };

    void fetchGenres();
  }, []);

  const fetchDiscover = useCallback(async () => {
    setIsLoading(true);
    setData(null);

    try {
      const endpoint = mediaType === 'movie' ? '/api/discover/movie' : '/api/discover/tv';
      const query = new URLSearchParams({ page: String(page), sort_by: sortBy });
      if (selectedGenre) query.set('genre', selectedGenre);

      const res = await fetch(`${endpoint}?${query.toString()}`);
      const payload = (await res.json()) as { results?: DiscoverPayload };
      if (payload.results) setData(payload.results);
    } catch (err) {
      console.error('Failed to load discover', err);
    } finally {
      setIsLoading(false);
    }
  }, [mediaType, selectedGenre, sortBy, page]);

  useEffect(() => {
    void fetchDiscover();
  }, [fetchDiscover]);

  const currentGenres = useMemo(() => genres[mediaType] || [], [genres, mediaType]);

  return (
    <div className="page-shell flex flex-col">
      <Navbar />

      <div className="page-container flex-1">
        <section className="platform-hero mb-8 p-6 md:p-8">
          <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_320px]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Curated discovery</p>
              <h1 className="mt-3 flex items-center gap-3 text-4xl md:text-6xl">
                <SlidersHorizontal size={30} className="text-[#ff8f6b]" />
                Discover
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
                Browse in a streaming-style catalog flow with stronger sorting, cleaner genre pivots, and cards that surface the right info faster.
              </p>
            </div>

            <div className="platform-toolbar p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Catalog mode</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="platform-stat p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Media lane</p>
                  <p className="mt-2 text-lg font-semibold text-white">{mediaType === 'movie' ? 'Movies' : 'TV Shows'}</p>
                </div>
                <div className="platform-stat p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Sort</p>
                  <p className="mt-2 text-lg font-semibold text-white">{SORT_OPTIONS.find((option) => option.value === sortBy)?.label}</p>
                </div>
                <div className="platform-stat p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Current page</p>
                  <p className="mt-2 text-lg font-semibold text-white">{page}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="platform-toolbar mb-8 p-5 md:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMediaType('movie');
                    setSelectedGenre('');
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    mediaType === 'movie' ? 'accent-button text-white' : 'surface-card text-gray-300 hover:text-white'
                  }`}
                >
                  <Film size={16} /> Movies
                </button>
                <button
                  onClick={() => {
                    setMediaType('tv');
                    setSelectedGenre('');
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    mediaType === 'tv' ? 'accent-button text-white' : 'surface-card text-gray-300 hover:text-white'
                  }`}
                >
                  <Tv size={16} /> TV Shows
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="surface-card rounded-full px-4 py-2.5 text-sm text-white focus:border-[#e50914] focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {currentGenres.length > 0 && (
              <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => {
                    setSelectedGenre('');
                    setPage(1);
                  }}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    !selectedGenre ? 'filter-chip-active' : 'filter-chip'
                  }`}
                >
                  All Genres
                </button>
                {currentGenres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGenre(String(g.id) === selectedGenre ? '' : String(g.id));
                      setPage(1);
                    }}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      String(g.id) === selectedGenre ? 'filter-chip-active' : 'filter-chip'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-[3px] border-[#e50914]/20 border-t-[#e50914]" />
          </div>
        )}

        {!isLoading && data && data.results.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between border-b border-white/[0.08] px-1 pb-4 text-xs uppercase tracking-[0.18em] text-gray-500">
              <span>{data.total_results?.toLocaleString()} titles</span>
              <span>
                Page {data.page} of {Math.min(data.total_pages, 500)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {data.results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/${mediaType}/${item.id}`)}
                  className="platform-grid-card cursor-card group/card"
                >
                  {item.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgPosterSmall + item.poster_path}
                      alt={item.title || item.name || 'media'}
                      className="aspect-[2/3] w-full object-cover transition-all duration-300 group-hover/card:scale-105 group-hover/card:brightness-[0.52]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] w-full items-center justify-center bg-[#1a1a1a]">
                      <Film size={28} className="text-gray-700" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                    <span className="rounded-full border border-black/20 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                      {mediaType === 'movie' ? 'Movie' : 'Series'}
                    </span>
                    {item.vote_average && item.vote_average > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-[#ffd27d]">
                        <Star size={10} fill="currentColor" />
                        {item.vote_average.toFixed(1)}
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="line-clamp-2 text-sm font-semibold text-white md:text-base">{item.title || item.name}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
                      <Sparkles size={11} />
                      <span>{(item.release_date || item.first_air_date || '').slice(0, 4) || 'Now streaming'}</span>
                    </div>
                    <div className="mt-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${mediaType}/${item.id}`);
                        }}
                        className="cursor-watch flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-2 text-xs font-bold text-black"
                      >
                        <Play size={12} fill="black" /> Open
                      </button>
                      <button
                        title="Add to Watch Later"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToWatchLater(item.id, mediaType);
                        }}
                        className="flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 text-white"
                      >
                        <ClockPlus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 mb-4 flex items-center justify-center gap-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  page <= 1 ? 'cursor-not-allowed bg-white/[0.05] text-gray-600 opacity-30' : 'surface-card text-white hover:bg-[#e50914]'
                }`}
              >
                <ChevronsLeft size={16} /> Prev
              </button>
              <span className="min-w-[80px] text-center text-sm font-mono text-gray-400">
                {data.page} / {Math.min(data.total_pages, 500)}
              </span>
              <button
                disabled={page >= Math.min(data.total_pages, 500)}
                onClick={() => setPage((p) => p + 1)}
                className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  page >= Math.min(data.total_pages, 500)
                    ? 'cursor-not-allowed bg-white/[0.05] text-gray-600 opacity-30'
                    : 'surface-card text-white hover:bg-[#e50914]'
                }`}
              >
                Next <ChevronsRight size={16} />
              </button>
            </div>
          </>
        )}

        {!isLoading && data && data.results.length === 0 && (
          <div className="platform-toolbar py-20 text-center">
            <p className="text-lg text-gray-400">No results found</p>
            <p className="mt-1 text-sm text-gray-500">Try a different genre, media lane, or sort order.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
