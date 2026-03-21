'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsLeft, ChevronsRight, ClockPlus, Film, Play, ScanSearch, Search, Star, Tv, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { addToWatchLater } from '@/lib/watch-later';
import { imgPosterSmall } from '@/lib/media-constants';
import { getClientPreferredProvider, withProviderInPath } from '@/lib/provider-query';

type SearchResult = {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  profile_path?: string;
};

type SearchPayload = {
  page: number;
  total_pages: number;
  total_results: number;
  results: SearchResult[];
};

function debounce<T extends (...args: never[]) => void>(func: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default function SearchPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [searchBar, setSearchBar] = useState('');
  const [isAdult, setIsAdult] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [data, setData] = useState<SearchPayload | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (query: string, page = 1) => {
    if (!query.trim()) return;
    setError('');
    setData(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/search?${new URLSearchParams({ query, page: String(page), adult: String(isAdult) }).toString()}`
      );
      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({ message: 'Something went wrong' }))) as { message?: string };
        throw new Error(errorBody.message || 'Something went wrong');
      }
      const result = (await response.json()) as { results?: SearchPayload };
      setData(result.results || null);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = useRef(
    debounce((query: string, page = 1) => {
      void fetchData(query, page);
    }, 600)
  ).current;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initial = new URLSearchParams(window.location.search);
    setSearchBar(initial.get('query') || '');
    setIsAdult(initial.get('adult') === 'true');
    setTypeFilter(initial.get('type') || 'all');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (searchBar.trim()) nextParams.set('query', searchBar.trim());
    if (isAdult) nextParams.set('adult', 'true');
    if (typeFilter !== 'all') nextParams.set('type', typeFilter);

    router.replace(`/search${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
  }, [searchBar, isAdult, typeFilter, router]);

  useEffect(() => {
    if (searchBar.trim()) {
      debouncedFetch(searchBar.trim(), 1);
    }
  }, [searchBar, debouncedFetch]);

  const filteredResults = useMemo(() => {
    if (!data?.results) return [];
    if (typeFilter === 'all') return data.results;
    return data.results.filter((item) => item.media_type === typeFilter);
  }, [data?.results, typeFilter]);

  const handleCardOpen = (item: SearchResult) => {
    const basePath = `/${item.media_type}/${item.id}`;
    if (item.media_type === 'movie' || item.media_type === 'tv') {
      router.push(withProviderInPath(basePath, getClientPreferredProvider()));
      return;
    }

    router.push(basePath);
  };

  const currentPage = data?.page || 1;
  const totalPages = data?.total_pages || 1;

  return (
    <div className="page-shell flex flex-col">
      <Navbar />

      <div className="page-container flex-1">
        <section className="platform-hero mb-8 p-6 md:p-8">
          <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_320px]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Universal search</p>
              <h1 className="mt-3 text-4xl md:text-6xl">Search across Vidoza</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
                Find movies, series, and people with a denser browsing layout that feels closer to a modern streaming catalog.
              </p>
            </div>

            <div className="platform-toolbar p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Search mode</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="platform-stat p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Filter</p>
                  <p className="mt-2 text-lg font-semibold text-white">{typeFilter === 'all' ? 'Everything' : typeFilter}</p>
                </div>
                <div className="platform-stat p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Adult</p>
                  <p className="mt-2 text-lg font-semibold text-white">{isAdult ? 'Included' : 'Off'}</p>
                </div>
                <div className="platform-stat p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Shortcut</p>
                  <p className="mt-2 text-lg font-semibold text-white">Press /</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <form
          className="platform-toolbar mb-8 p-5 md:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void fetchData(searchBar, 1);
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  ref={searchInputRef}
                  value={searchBar}
                  onChange={(e) => setSearchBar(e.target.value)}
                  type="text"
                  placeholder="Search for movies, TV shows, people... ( / )"
                  className="surface-card w-full rounded-2xl py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-gray-600 focus:border-[#e50914]"
                />
              </div>
              <button
                type="submit"
                disabled={!searchBar.trim()}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold transition-all ${
                  !searchBar.trim() ? 'cursor-not-allowed bg-[#1a1a1a] text-gray-500 opacity-40' : 'accent-button text-white'
                }`}
              >
                <ScanSearch size={18} />
                Search
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All', icon: null },
                  { key: 'movie', label: 'Movies', icon: <Film size={12} /> },
                  { key: 'tv', label: 'TV', icon: <Tv size={12} /> },
                  { key: 'person', label: 'People', icon: <User size={12} /> },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setTypeFilter(f.key)}
                    className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      typeFilter === f.key ? 'filter-chip-active' : 'filter-chip'
                    }`}
                  >
                    {f.icon} {f.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 select-none text-xs text-gray-400">
                <input checked={isAdult} onChange={(e) => setIsAdult(e.target.checked)} type="checkbox" className="rounded accent-[#e50914]" />
                Include Adult
              </label>
            </div>
          </div>
        </form>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-[3px] border-[#e50914]/20 border-t-[#e50914]" />
          </div>
        )}

        {data && data.results.length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-white/[0.08] px-1 pb-4 text-xs uppercase tracking-[0.18em] text-gray-500">
              <span>
                {(typeFilter === 'all' ? data.total_results : filteredResults.length).toLocaleString()} results
                {typeFilter !== 'all' ? ` (${typeFilter})` : ''}
              </span>
              <span>
                Page {data.page} of {data.total_pages}
              </span>
            </div>

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredResults.map((item) => {
                  const imagePath = item.poster_path || item.backdrop_path || item.profile_path;
                  return (
                    <div key={`${item.media_type}-${item.id}`} onClick={() => handleCardOpen(item)} className="platform-grid-card cursor-card group/card">
                      {imagePath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgPosterSmall + imagePath}
                          alt={item.title || item.name || 'media'}
                          className="aspect-[2/3] w-full object-cover transition-all duration-300 group-hover/card:scale-105 group-hover/card:brightness-[0.52]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex aspect-[2/3] w-full items-center justify-center bg-[#1a1a1a]">
                          <Film size={28} className="text-gray-700" />
                        </div>
                      )}

                      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            item.media_type === 'movie'
                              ? 'bg-[#e50914]/90 text-white'
                              : item.media_type === 'tv'
                                ? 'bg-[#ff6a3d]/90 text-white'
                                : 'bg-gray-700/90 text-white'
                          }`}
                        >
                          {item.media_type}
                        </span>
                        {item.vote_average && item.vote_average > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-[#ffd27d]">
                            <Star size={10} fill="currentColor" />
                            {item.vote_average.toFixed(1)}
                          </span>
                        ) : null}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="line-clamp-2 text-sm font-semibold text-white md:text-base">{item.title || item.name}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
                          <span>{(item.release_date || item.first_air_date || '').slice(0, 4) || 'Featured result'}</span>
                        </div>
                        <div className="mt-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardOpen(item);
                            }}
                            className="cursor-watch flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-2 text-xs font-bold text-black"
                          >
                            <Play size={12} fill="black" /> Open
                          </button>
                          {(item.media_type === 'movie' || item.media_type === 'tv') && (
                            <button
                              title="Add to Watch Later"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToWatchLater(item.id, item.media_type as 'movie' | 'tv');
                              }}
                              className="flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 text-white"
                            >
                              <ClockPlus size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="platform-toolbar py-20 text-center">
                <p className="text-lg text-gray-400">No results found{typeFilter !== 'all' ? ` for ${typeFilter}` : ''}</p>
              </div>
            )}

            <div className="mt-10 mb-4 flex items-center justify-center gap-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => void fetchData(searchBar, Math.max(1, currentPage - 1))}
                className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  currentPage <= 1 ? 'cursor-not-allowed bg-white/[0.05] text-gray-600 opacity-30' : 'surface-card text-white hover:bg-[#e50914]'
                }`}
              >
                <ChevronsLeft size={16} /> Prev
              </button>
              <span className="min-w-[60px] text-center text-sm font-mono text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => void fetchData(searchBar, Math.min(totalPages, currentPage + 1))}
                className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  currentPage >= totalPages ? 'cursor-not-allowed bg-white/[0.05] text-gray-600 opacity-30' : 'surface-card text-white hover:bg-[#e50914]'
                }`}
              >
                Next <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-4 py-12 text-center">
            <p className="text-lg font-semibold text-red-400">{error}</p>
            <button onClick={() => void fetchData(searchBar, 1)} className="accent-button rounded-full px-5 py-2.5 text-sm font-semibold text-white">
              Try Again
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
