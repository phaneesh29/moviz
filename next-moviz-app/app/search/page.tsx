'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsLeft, ChevronsRight, ClockPlus, Film, Play, Search, Star, Tv, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { addToWatchLater } from '@/lib/watch-later';
import { imgPosterSmall } from '@/lib/media-constants';
import { notify } from '@/lib/notify';
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
    }, 500),
  ).current;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initial = new URLSearchParams(window.location.search);
    setSearchBar(initial.get('query') || '');
    setIsAdult(initial.get('adult') === 'true');
    setTypeFilter(initial.get('type') || 'all');
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
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
  }, [isAdult, router, searchBar, typeFilter]);

  useEffect(() => {
    if (searchBar.trim()) {
      debouncedFetch(searchBar.trim(), 1);
    }
  }, [debouncedFetch, searchBar]);

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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-28 md:px-8">
        <section className="rounded-[24px] border border-white/10 bg-[#181818] p-5 md:p-6">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Search</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Find movies, series and people</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/60">Cleaner layout, faster scanning, same filters and keyboard shortcut. Press `/` to focus search.</p>

          <form
            className="mt-5"
            onSubmit={(event) => {
              event.preventDefault();
              void fetchData(searchBar, 1);
            }}
          >
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  ref={searchInputRef}
                  value={searchBar}
                  onChange={(event) => setSearchBar(event.target.value)}
                  type="text"
                  placeholder="Search for a movie, show, or person"
                  className="w-full rounded-[18px] border border-white/10 bg-[#222] py-3.5 pl-11 pr-4 text-white outline-none placeholder:text-white/30 focus:border-white/25"
                />
              </div>
              <button
                type="submit"
                disabled={!searchBar.trim()}
                className={`rounded-full px-5 py-3 text-sm font-semibold ${
                  !searchBar.trim() ? 'cursor-not-allowed bg-[#232323] text-white/35' : 'bg-white text-black'
                }`}
              >
                Search
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All', icon: null },
                  { key: 'movie', label: 'Movies', icon: <Film size={12} /> },
                  { key: 'tv', label: 'TV', icon: <Tv size={12} /> },
                  { key: 'person', label: 'People', icon: <User size={12} /> },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setTypeFilter(filter.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${
                      typeFilter === filter.key ? 'bg-white text-black' : 'bg-[#242424] text-white/70'
                    }`}
                  >
                    {filter.icon}
                    {filter.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs text-white/55">
                <input checked={isAdult} onChange={(event) => setIsAdult(event.target.checked)} type="checkbox" className="rounded accent-white" />
                Include adult
              </label>
            </div>
          </form>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-[3px] border-white/15 border-t-white" />
          </div>
        ) : null}

        {data && data.results.length > 0 ? (
          <section className="mt-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-white/45">
              <p>
                {(typeFilter === 'all' ? data.total_results : filteredResults.length).toLocaleString()} results
                {typeFilter !== 'all' ? ` in ${typeFilter}` : ''}
              </p>
              <p>Page {data.page} of {data.total_pages}</p>
            </div>

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredResults.map((item) => {
                  const imagePath = item.poster_path || item.backdrop_path || item.profile_path;
                  const title = item.title || item.name || 'Untitled';
                  const year = (item.release_date || item.first_air_date || '').slice(0, 4);

                  return (
                    <article
                      key={`${item.media_type}-${item.id}`}
                      onClick={() => handleCardOpen(item)}
                      className="group cursor-pointer rounded-[20px] border border-white/10 bg-[#181818] p-3 hover:bg-[#1f1f1f]"
                    >
                      <div className="flex gap-4">
                        <div className="h-24 w-40 shrink-0 overflow-hidden rounded-[16px] bg-[#111]">
                          {imagePath ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgPosterSmall + imagePath} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" loading="lazy" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/25">
                              {item.media_type === 'person' ? <User size={24} /> : <Film size={24} />}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-white/45">
                            <span className="rounded-full bg-[#272727] px-2.5 py-1 uppercase">{item.media_type}</span>
                            {year ? <span>{year}</span> : null}
                            {item.vote_average && item.vote_average > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[#ffd27d]">
                                <Star size={11} fill="currentColor" />
                                {item.vote_average.toFixed(1)}
                              </span>
                            ) : null}
                          </div>

                          <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-white">{title}</h2>

                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCardOpen(item);
                              }}
                              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
                            >
                              <Play size={12} fill="currentColor" />
                              Open
                            </button>
                            {(item.media_type === 'movie' || item.media_type === 'tv') ? (
                              <button
                                title="Add to Watch Later"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  const added = addToWatchLater(item.id, item.media_type as 'movie' | 'tv');
                                  notify({
                                    title: added ? 'Saved to My List' : 'Already in My List',
                                    description: title,
                                  });
                                }}
                                className="rounded-full bg-[#272727] px-3 text-white/75 hover:text-white"
                              >
                                <ClockPlus size={14} />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[22px] border border-white/10 bg-[#181818] py-16 text-center text-white/55">
                No results found{typeFilter !== 'all' ? ` for ${typeFilter}` : ''}.
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => void fetchData(searchBar, Math.max(1, currentPage - 1))}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                  currentPage <= 1 ? 'cursor-not-allowed bg-[#232323] text-white/30' : 'bg-[#242424] text-white'
                }`}
              >
                <ChevronsLeft size={16} />
                Prev
              </button>
              <span className="min-w-[80px] text-center text-sm text-white/50">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => void fetchData(searchBar, Math.min(totalPages, currentPage + 1))}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                  currentPage >= totalPages ? 'cursor-not-allowed bg-[#232323] text-white/30' : 'bg-[#242424] text-white'
                }`}
              >
                Next
                <ChevronsRight size={16} />
              </button>
            </div>
          </section>
        ) : null}

        {error ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-red-400">{error}</p>
            <button onClick={() => void fetchData(searchBar, 1)} className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
              Try again
            </button>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
