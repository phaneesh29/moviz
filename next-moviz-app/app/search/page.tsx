'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsLeft, ChevronsRight, ClockPlus, Film, Play, ScanSearch, Search, Star, Tv, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { addToWatchLater } from '@/lib/watch-later';
import { imgPosterSmall } from '@/lib/media-constants';

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
      const response = await fetch(`/api/search?${new URLSearchParams({ query, page: String(page), adult: String(isAdult) }).toString()}`);
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
    router.push(`/${item.media_type}/${item.id}`);
  };

  const currentPage = data?.page || 1;
  const totalPages = data?.total_pages || 1;

  return (
    <div className="page-shell flex flex-col">
      <Navbar />

      <div className="page-container flex-1">
        <div className="page-hero mb-8 p-6 md:p-8">
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Universal search</p>
            <h1 className="mt-3 text-3xl md:text-5xl">Search across Vidoza</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
              Find movies, series, and people with faster filtering and steadier page layout.
            </p>
          </div>
        </div>

        <form
          className="mb-8 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void fetchData(searchBar, 1);
          }}
        >
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                ref={searchInputRef}
                value={searchBar}
                onChange={(e) => setSearchBar(e.target.value)}
                type="text"
                placeholder="Search for movies, TV shows, people... ( / )"
                className="surface-card w-full rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all placeholder:text-gray-600 focus:border-[#e50914]"
              />
            </div>
            <button
              type="submit"
              disabled={!searchBar.trim()}
              className={`px-5 py-3 rounded-md font-semibold flex items-center gap-2 transition-all ${
                !searchBar.trim() ? 'cursor-not-allowed opacity-40 bg-[#1a1a1a] text-gray-500' : 'accent-button text-white'
              }`}
            >
              <ScanSearch size={18} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          <div className="flex justify-between items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
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
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                    typeFilter === f.key ? 'filter-chip-active' : 'filter-chip'
                  }`}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input checked={isAdult} onChange={(e) => setIsAdult(e.target.checked)} type="checkbox" className="rounded accent-[#e50914]" />
              <span className="text-xs text-gray-500 group-hover:text-gray-300 transition">Include Adult</span>
            </label>
          </div>
        </form>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="size-12 animate-spin border-[3px] border-purple-500/20 border-t-purple-500 rounded-full" />
          </div>
        )}

        {data && data.results.length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-white/8 px-1 pb-4 text-xs font-mono text-gray-500">
              <span>
                {(typeFilter === 'all' ? data.total_results : filteredResults.length).toLocaleString()} results{typeFilter !== 'all' ? ` (${typeFilter})` : ''}
              </span>
              <span>
                Page {data.page} of {data.total_pages}
              </span>
            </div>

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {filteredResults.map((item) => {
                  const imagePath = item.poster_path || item.backdrop_path || item.profile_path;
                  return (
                    <div key={`${item.media_type}-${item.id}`} onClick={() => handleCardOpen(item)} className="group/card surface-card relative overflow-hidden rounded-2xl cursor-pointer">
                      {imagePath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgPosterSmall + imagePath} alt={item.title || item.name || 'media'} className="w-full aspect-[2/3] object-cover transition-all duration-300 group-hover/card:scale-105 group-hover/card:brightness-50" loading="lazy" />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-[#1a1a1a] flex items-center justify-center">
                          <Film size={28} className="text-gray-700" />
                        </div>
                      )}

                      <span
                        className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          item.media_type === 'movie' ? 'bg-[#e50914]/90' : item.media_type === 'tv' ? 'bg-[#ff6a3d]/90' : 'bg-gray-600/90'
                        }`}
                      >
                        {item.media_type}
                      </span>

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                        <p className="text-sm font-bold truncate">{item.title || item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                          {item.vote_average && item.vote_average > 0 && (
                            <span className="flex items-center gap-0.5 text-yellow-400">
                              <Star size={10} fill="currentColor" /> {item.vote_average.toFixed(1)}
                            </span>
                          )}
                          {(item.release_date || item.first_air_date) && <span>{(item.release_date || item.first_air_date || '').slice(0, 4)}</span>}
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardOpen(item);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 bg-white text-black text-xs font-bold py-1.5 rounded hover:bg-white/90 transition"
                          >
                            <Play size={12} fill="black" /> View
                          </button>
                          {(item.media_type === 'movie' || item.media_type === 'tv') && (
                            <button
                              title="Add to Watch Later"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToWatchLater(item.id, item.media_type as 'movie' | 'tv');
                              }}
                              className="flex items-center justify-center bg-white/10 border border-white/30 hover:border-white p-1.5 rounded transition"
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
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No results found{typeFilter !== 'all' ? ` for ${typeFilter}` : ''}</p>
              </div>
            )}

            <div className="flex justify-center items-center gap-4 mt-10 mb-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => void fetchData(searchBar, Math.max(1, currentPage - 1))}
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currentPage <= 1 ? 'opacity-30 cursor-not-allowed bg-white/5 text-gray-600' : 'surface-card hover:bg-[#e50914] text-white'
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
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currentPage >= totalPages ? 'opacity-30 cursor-not-allowed bg-white/5 text-gray-600' : 'surface-card hover:bg-[#e50914] text-white'
                }`}
              >
                Next <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12 space-y-4">
            <p className="text-red-400 text-lg font-semibold">{error}</p>
            <button onClick={() => void fetchData(searchBar, 1)} className="accent-button rounded-md px-5 py-2.5 text-sm font-semibold text-white transition">
              Try Again
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}




