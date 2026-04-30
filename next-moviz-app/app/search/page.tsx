'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronsLeft,
  ChevronsRight,
  ClockPlus,
  Film,
  Play,
  Search,
  Star,
  Tv,
  User,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { addToWatchLater } from '@/lib/watch-later';
import { imgPosterSmall } from '@/lib/media-constants';
import { notify } from '@/lib/notify';
import { getClientPreferredProvider, withProviderInPath } from '@/lib/provider-query';
import { cn } from '@/lib/utils';

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

const typeFilters = [
  { key: 'all', label: 'All', icon: Search },
  { key: 'movie', label: 'Movies', icon: Film },
  { key: 'tv', label: 'TV', icon: Tv },
  { key: 'person', label: 'People', icon: User },
];

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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />

      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8">
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="w-fit border-white/12 bg-white/[0.06] text-white/70">
                  <Search data-icon="inline-start" />
                  Search
                </Badge>
                <h1 className="font-display text-4xl font-black tracking-normal text-white sm:text-5xl">
                  Find anything
                </h1>
              </div>
              {data ? (
                <p className="text-sm text-white/45">
                  {(typeFilter === 'all' ? data.total_results : filteredResults.length).toLocaleString()} results
                </p>
              ) : null}
            </div>

            <Card className="border-white/10 bg-black/45 p-3 shadow-[0_16px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-4">
              <CardContent className="flex flex-col gap-4 p-0">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void fetchData(searchBar, 1);
                  }}
                  className="flex flex-col gap-3 lg:flex-row"
                >
                  <div className="group/search relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                      <Search className="text-white/38 transition-colors group-focus-within/search:text-white/72" />
                    </div>
                    <input
                      ref={searchInputRef}
                      value={searchBar}
                      onChange={(event) => setSearchBar(event.target.value)}
                      type="text"
                      placeholder="Search movies, series, people..."
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.055] pl-12 pr-4 text-sm font-medium text-white shadow-inner shadow-white/[0.03] outline-none transition-all placeholder:text-white/32 focus:border-white/22 focus:bg-white/[0.08]"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!searchBar.trim()}
                    className="h-12 rounded-2xl bg-white px-6 font-semibold text-black hover:bg-white/90 disabled:bg-white/[0.08] disabled:text-white/30"
                  >
                    <Search data-icon="inline-start" />
                    Search
                  </Button>
                </form>

                <Separator className="bg-white/10" />

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {typeFilters.map((filter) => {
                      const Icon = filter.icon;
                      return (
                        <Button
                          key={filter.key}
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setTypeFilter(filter.key)}
                          className={cn(
                            'rounded-full px-4 text-xs font-semibold',
                            typeFilter === filter.key
                              ? 'bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.13)] hover:bg-white'
                              : 'bg-white/[0.055] text-white/62 hover:bg-white/[0.1] hover:text-white',
                          )}
                        >
                          <Icon data-icon="inline-start" />
                          {filter.label}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAdult((current) => !current)}
                    className={cn(
                      'w-fit rounded-full px-4 text-xs font-semibold',
                      isAdult
                        ? 'bg-white text-black hover:bg-white'
                        : 'bg-white/[0.055] text-white/55 hover:bg-white/[0.1] hover:text-white',
                    )}
                    aria-pressed={isAdult}
                  >
                    Adult results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {isLoading ? (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <Card key={index} className="border-white/10 bg-white/[0.035] p-3">
                  <CardContent className="flex gap-4 p-0">
                    <Skeleton className="h-28 w-20 shrink-0 rounded-xl bg-white/10" />
                    <div className="flex flex-1 flex-col gap-3 py-2">
                      <Skeleton className="h-4 w-1/2 bg-white/10" />
                      <Skeleton className="h-5 w-5/6 bg-white/10" />
                      <Skeleton className="h-8 w-28 rounded-full bg-white/10" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          ) : null}

          {!isLoading && data && data.results.length > 0 ? (
            <section className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/45">
                <p>
                  Page {data.page} of {data.total_pages}
                </p>
                {typeFilter !== 'all' ? <p>Filtered by {typeFilter}</p> : null}
              </div>

              {filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredResults.map((item) => {
                    const imagePath = item.poster_path || item.backdrop_path || item.profile_path;
                    const title = item.title || item.name || 'Untitled';
                    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                    const isWatchable = item.media_type === 'movie' || item.media_type === 'tv';

                    return (
                      <Card
                        key={`${item.media_type}-${item.id}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleCardOpen(item)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleCardOpen(item);
                          }
                        }}
                        className="group cursor-pointer border-white/10 bg-white/[0.035] p-0 shadow-[0_12px_34px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-white/22 hover:bg-white/[0.065]"
                      >
                        <CardContent className="flex gap-4 p-3">
                          <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/38 sm:h-32 sm:w-24">
                            {imagePath ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imgPosterSmall + imagePath}
                                alt={title}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-white/25">
                                {item.media_type === 'person' ? <User /> : <Film />}
                              </div>
                            )}
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 py-1">
                            <CardHeader className="p-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-black/55 uppercase text-white/72">
                                  {item.media_type}
                                </Badge>
                                {year ? <span className="text-xs text-white/42">{year}</span> : null}
                                {item.vote_average && item.vote_average > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#ffd27d]">
                                    <Star className="size-3 fill-current" />
                                    {item.vote_average.toFixed(1)}
                                  </span>
                                ) : null}
                              </div>
                              <CardTitle className="line-clamp-2 text-lg font-bold text-white">
                                {title}
                              </CardTitle>
                              <CardDescription className="text-sm text-white/45">
                                {item.media_type === 'person' ? 'Person profile' : 'Ready to open'}
                              </CardDescription>
                            </CardHeader>

                            <CardFooter className="gap-2 border-0 bg-transparent p-0">
                              <Button
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleCardOpen(item);
                                }}
                                className="rounded-full bg-white px-4 font-semibold text-black hover:bg-white/90"
                              >
                                <Play data-icon="inline-start" fill="currentColor" />
                                Open
                              </Button>
                              {isWatchable ? (
                                <Button
                                  title="Add to Watch Later"
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    const added = addToWatchLater(item.id, item.media_type as 'movie' | 'tv');
                                    notify({
                                      title: added ? 'Saved to My List' : 'Already in My List',
                                      description: title,
                                    });
                                  }}
                                  className="rounded-full bg-white/[0.07] text-white/70 hover:bg-white/[0.12] hover:text-white"
                                >
                                  <ClockPlus />
                                </Button>
                              ) : null}
                            </CardFooter>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-white/10 bg-white/[0.035] py-16 text-center">
                  <CardContent className="text-white/55">
                    No results found{typeFilter !== 'all' ? ` for ${typeFilter}` : ''}.
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-center gap-3">
                <Button
                  disabled={currentPage <= 1}
                  onClick={() => void fetchData(searchBar, Math.max(1, currentPage - 1))}
                  variant="ghost"
                  className="rounded-full bg-white/[0.07] text-white/75 hover:bg-white/[0.12] hover:text-white"
                >
                  <ChevronsLeft data-icon="inline-start" />
                  Prev
                </Button>
                <span className="min-w-20 text-center text-sm text-white/45">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  disabled={currentPage >= totalPages}
                  onClick={() => void fetchData(searchBar, Math.min(totalPages, currentPage + 1))}
                  variant="ghost"
                  className="rounded-full bg-white/[0.07] text-white/75 hover:bg-white/[0.12] hover:text-white"
                >
                  Next
                  <ChevronsRight data-icon="inline-end" />
                </Button>
              </div>
            </section>
          ) : null}

          {!isLoading && !data && !error ? (
            <Card className="border-white/10 bg-white/[0.03] py-16 text-center backdrop-blur-xl">
              <CardContent className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                  <Search className="text-white/42" />
                </div>
                <CardTitle className="text-2xl font-black text-white">Start searching</CardTitle>
                <CardDescription className="max-w-md text-white/55">
                  Type a title, series, or person name to browse results.
                </CardDescription>
              </CardContent>
            </Card>
          ) : null}

          {error ? (
            <Card className="border-white/10 bg-white/[0.035] py-12 text-center">
              <CardContent className="flex flex-col items-center gap-4">
                <p className="text-lg font-semibold text-red-300">{error}</p>
                <Button onClick={() => void fetchData(searchBar, 1)} className="rounded-full bg-white px-5 font-semibold text-black hover:bg-white/90">
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
