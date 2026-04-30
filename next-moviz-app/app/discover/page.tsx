'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronsLeft,
  ChevronsRight,
  ClockPlus,
  Film,
  Play,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tv,
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
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { addToWatchLater } from '@/lib/watch-later';
import { imgPosterSmall } from '@/lib/media-constants';
import { notify } from '@/lib/notify';
import { getClientPreferredProvider, withProviderInPath } from '@/lib/provider-query';
import { cn } from '@/lib/utils';

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
  { value: 'popularity.desc', label: 'Popular' },
  { value: 'vote_average.desc', label: 'Top rated' },
  { value: 'primary_release_date.desc', label: 'Newest' },
  { value: 'primary_release_date.asc', label: 'Oldest' },
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
  const activeSortLabel = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === sortBy)?.label || 'Popular',
    [sortBy],
  );
  const activeGenreLabel = useMemo(() => {
    if (!selectedGenre) return 'All genres';
    return currentGenres.find((genre) => String(genre.id) === selectedGenre)?.name || 'All genres';
  }, [currentGenres, selectedGenre]);
  const totalPages = useMemo(() => Math.min(data?.total_pages || 1, 500), [data?.total_pages]);

  const openItem = (id: number) => {
    router.push(withProviderInPath(`/${mediaType}/${id}`, getClientPreferredProvider()));
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />

      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8">
          <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="w-fit border-white/12 bg-white/[0.06] text-white/70">
                <SlidersHorizontal data-icon="inline-start" />
                Discover
              </Badge>
              <h1 className="font-display text-4xl font-black tracking-normal text-white sm:text-5xl">
                Browse titles
              </h1>
            </div>
            {data ? (
              <p className="text-sm text-white/45">
                {data.total_results?.toLocaleString()} titles
              </p>
            ) : null}
          </section>

          <section className="flex flex-col gap-4 rounded-[1.35rem] border border-white/10 bg-black/45 p-3 shadow-[0_16px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex w-fit gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setMediaType('movie');
                    setSelectedGenre('');
                    setPage(1);
                  }}
                  className={cn(
                    'rounded-full px-4 text-xs font-semibold',
                    mediaType === 'movie'
                      ? 'bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.13)] hover:bg-white'
                      : 'text-white/62 hover:bg-white/[0.1] hover:text-white',
                  )}
                >
                  <Film data-icon="inline-start" />
                  Movies
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setMediaType('tv');
                    setSelectedGenre('');
                    setPage(1);
                  }}
                  className={cn(
                    'rounded-full px-4 text-xs font-semibold',
                    mediaType === 'tv'
                      ? 'bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.13)] hover:bg-white'
                      : 'text-white/62 hover:bg-white/[0.1] hover:text-white',
                  )}
                >
                  <Tv data-icon="inline-start" />
                  TV
                </Button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Sparkles className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/38" />
                  <select
                    value={sortBy}
                    onChange={(event) => {
                      setSortBy(event.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-full border border-white/10 bg-white/[0.055] pl-9 pr-4 text-sm font-semibold text-white outline-none transition-all focus:border-white/22 focus:bg-white/[0.08] sm:w-44"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Badge className="h-10 justify-center rounded-full bg-white/[0.055] px-4 text-white/62">
                  {activeGenreLabel} / {activeSortLabel}
                </Badge>
              </div>
            </div>

            {currentGenres.length > 0 ? (
              <>
                <Separator className="bg-white/10" />
                <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedGenre('');
                      setPage(1);
                    }}
                    className={cn(
                      'shrink-0 rounded-full px-4 text-xs font-semibold',
                      !selectedGenre
                        ? 'bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.13)] hover:bg-white'
                        : 'bg-white/[0.055] text-white/62 hover:bg-white/[0.1] hover:text-white',
                    )}
                  >
                    All genres
                  </Button>
                  {currentGenres.map((genre) => (
                    <Button
                      key={genre.id}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedGenre(String(genre.id) === selectedGenre ? '' : String(genre.id));
                        setPage(1);
                      }}
                      className={cn(
                        'shrink-0 rounded-full px-4 text-xs font-semibold',
                        String(genre.id) === selectedGenre
                          ? 'bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.13)] hover:bg-white'
                          : 'bg-white/[0.055] text-white/62 hover:bg-white/[0.1] hover:text-white',
                      )}
                    >
                      {genre.name}
                    </Button>
                  ))}
                </div>
              </>
            ) : null}
          </section>

          {isLoading ? (
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 18 }).map((_, index) => (
                <Card key={index} className="border-white/10 bg-white/[0.035] p-0">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-[2/3] rounded-t-xl bg-white/10" />
                    <div className="flex flex-col gap-2 p-3">
                      <Skeleton className="h-4 w-4/5 bg-white/10" />
                      <Skeleton className="h-3 w-1/2 bg-white/10" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          ) : null}

          {!isLoading && data && data.results.length > 0 ? (
            <section className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/45">
                <p>
                  Page {data.page} of {totalPages}
                </p>
                <p>{mediaType === 'movie' ? 'Movies' : 'TV'} / {activeGenreLabel}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {data.results.map((item) => {
                  const title = item.title || item.name || 'Untitled';
                  const year = (item.release_date || item.first_air_date || '').slice(0, 4);

                  return (
                    <Card
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openItem(item.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openItem(item.id);
                        }
                      }}
                      className="group cursor-pointer border-white/10 bg-white/[0.035] p-0 shadow-[0_12px_34px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-white/22 hover:bg-white/[0.065] hover:shadow-[0_18px_48px_rgba(0,0,0,0.38)]"
                    >
                      <CardContent className="relative overflow-hidden p-0">
                        <div className="relative aspect-[2/3] overflow-hidden bg-black/38">
                          {item.poster_path ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imgPosterSmall + item.poster_path}
                              alt={title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-[0.58]"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/25">
                              <Film />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
                            <Badge className="bg-black/55 text-white/72">
                              {mediaType === 'movie' ? 'Movie' : 'Series'}
                            </Badge>
                            {item.vote_average && item.vote_average > 0 ? (
                              <Badge className="bg-black/55 text-[#ffd27d]">
                                <Star data-icon="inline-start" className="fill-current" />
                                {item.vote_average.toFixed(1)}
                              </Badge>
                            ) : null}
                          </div>

                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="flex size-12 items-center justify-center rounded-full bg-white text-black shadow-[0_12px_28px_rgba(255,255,255,0.16)]">
                              <Play fill="currentColor" />
                            </div>
                          </div>
                        </div>

                        <div className="flex min-h-[7.5rem] flex-col justify-between gap-3 p-3">
                          <div>
                            <CardTitle className="line-clamp-2 text-sm font-bold text-white">
                              {title}
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs text-white/45">
                              {year || 'Now streaming'}
                            </CardDescription>
                          </div>

                          <CardFooter className="gap-2 border-0 bg-transparent p-0">
                            <Button
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                openItem(item.id);
                              }}
                              className="flex-1 rounded-full bg-white px-3 font-semibold text-black hover:bg-white/90"
                            >
                              <Play data-icon="inline-start" fill="currentColor" />
                              Open
                            </Button>
                            <Button
                              title="Add to Watch Later"
                              size="icon-sm"
                              variant="ghost"
                              onClick={(event) => {
                                event.stopPropagation();
                                const added = addToWatchLater(item.id, mediaType);
                                notify({
                                  title: added ? 'Saved to My List' : 'Already in My List',
                                  description: title,
                                });
                              }}
                              className="rounded-full bg-white/[0.07] text-white/70 hover:bg-white/[0.12] hover:text-white"
                            >
                              <ClockPlus />
                            </Button>
                          </CardFooter>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-3">
                <Button
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  variant="ghost"
                  className="rounded-full bg-white/[0.07] text-white/75 hover:bg-white/[0.12] hover:text-white"
                >
                  <ChevronsLeft data-icon="inline-start" />
                  Prev
                </Button>
                <span className="min-w-20 text-center text-sm text-white/45">
                  {data.page} / {totalPages}
                </span>
                <Button
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  variant="ghost"
                  className="rounded-full bg-white/[0.07] text-white/75 hover:bg-white/[0.12] hover:text-white"
                >
                  Next
                  <ChevronsRight data-icon="inline-end" />
                </Button>
              </div>
            </section>
          ) : null}

          {!isLoading && data && data.results.length === 0 ? (
            <Card className="border-white/10 bg-white/[0.035] py-16 text-center backdrop-blur-xl">
              <CardContent className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                  <SlidersHorizontal className="text-white/42" />
                </div>
                <CardTitle className="text-2xl font-black text-white">No results found</CardTitle>
                <CardDescription className="max-w-md text-white/55">
                  Try another genre, media lane, or sort option.
                </CardDescription>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
