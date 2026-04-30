'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Film, Play, Star, Trash2, Tv } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { clearWatchLater, getWatchLaterList, removeFromWatchLater, type WatchLaterType } from '@/lib/watch-later';
import { imgPosterSmall } from '@/lib/media-constants';
import { getClientPreferredProvider, withProviderInPath } from '@/lib/provider-query';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';

type MediaItem = {
  id: number;
  media_type: WatchLaterType;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  vote_average?: number;
};

const filters: Array<{ key: 'all' | 'movie' | 'tv'; label: string; icon: typeof Clock }> = [
  { key: 'all', label: 'All', icon: Clock },
  { key: 'movie', label: 'Movies', icon: Film },
  { key: 'tv', label: 'TV', icon: Tv },
];

export default function WatchLaterPage() {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    const load = async () => {
      const stored = getWatchLaterList();
      if (!stored.length) {
        setItems([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const settled = await Promise.allSettled(
          stored.map(async (item) => {
            const endpoint = item.media_type === 'movie' ? `/api/movie/${item.id}/get` : `/api/tv/${item.id}`;
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error('Failed to fetch saved item');
            const data = (await res.json()) as { results?: Record<string, unknown> };
            return {
              ...(data.results || {}),
              media_type: item.media_type,
            } as MediaItem;
          }),
        );

        setItems(settled.filter((result): result is PromiseFulfilledResult<MediaItem> => result.status === 'fulfilled').map((result) => result.value));
      } catch (err) {
        console.error(err);
        setError('Failed to fetch saved items.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filtered = useMemo(
    () => (typeFilter === 'all' ? items : items.filter((item) => item.media_type === typeFilter)),
    [items, typeFilter],
  );

  const movieCount = items.filter((item) => item.media_type === 'movie').length;
  const tvCount = items.filter((item) => item.media_type === 'tv').length;

  const openItem = (item: MediaItem) => {
    router.push(withProviderInPath(`/${item.media_type}/${item.id}`, getClientPreferredProvider()));
  };

  const removeItem = (item: MediaItem) => {
    removeFromWatchLater(item.id, item.media_type);
    setItems((prev) => prev.filter((saved) => !(saved.id === item.id && saved.media_type === item.media_type)));
    notify({
      title: 'Removed from My List',
      description: item.title || item.name || 'Title',
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />

      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8">
          <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="w-fit border-white/12 bg-white/[0.06] text-white/70">
                <Clock data-icon="inline-start" />
                My List
              </Badge>
              <h1 className="font-display text-4xl font-black tracking-normal text-white sm:text-5xl">
                Watch Later
              </h1>
            </div>
            {items.length > 0 ? (
              <p className="text-sm text-white/45">
                {filtered.length.toLocaleString()} of {items.length.toLocaleString()} saved
              </p>
            ) : null}
          </section>

          {items.length > 0 ? (
            <section className="flex flex-col gap-3 rounded-[1.35rem] border border-white/10 bg-black/45 p-3 shadow-[0_16px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-4">
              <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 md:pb-0">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  const count = filter.key === 'all' ? items.length : filter.key === 'movie' ? movieCount : tvCount;
                  return (
                    <Button
                      key={filter.key}
                      size="sm"
                      variant="ghost"
                      onClick={() => setTypeFilter(filter.key)}
                      className={cn(
                        'shrink-0 rounded-full px-4 text-xs font-semibold',
                        typeFilter === filter.key
                          ? 'bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.13)] hover:bg-white'
                          : 'bg-white/[0.055] text-white/62 hover:bg-white/[0.1] hover:text-white',
                      )}
                    >
                      <Icon data-icon="inline-start" />
                      {filter.label} ({count})
                    </Button>
                  );
                })}
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  clearWatchLater();
                  setItems([]);
                  notify({ title: 'My List cleared', description: 'All saved titles were removed.' });
                }}
                className="w-fit rounded-full bg-red-500/10 px-4 text-xs font-semibold text-red-200 hover:bg-red-500/18 hover:text-red-100"
              >
                <Trash2 data-icon="inline-start" />
                Clear all
              </Button>
            </section>
          ) : null}

          {loading ? (
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, index) => (
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

          {error ? (
            <Card className="border-white/10 bg-white/[0.035] py-12 text-center">
              <CardContent>
                <p className="text-lg font-semibold text-red-300">{error}</p>
              </CardContent>
            </Card>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <Card className="border-white/10 bg-white/[0.03] py-16 text-center backdrop-blur-xl">
              <CardContent className="flex flex-col items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                  <Clock className="text-white/42" />
                </div>
                <div className="flex flex-col gap-2">
                  <CardTitle className="text-2xl font-black text-white">Your list is empty</CardTitle>
                  <CardDescription className="max-w-md text-white/55">
                    Save movies and shows from search, discover, or title pages to find them here.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push('/discover')}
                  className="rounded-full bg-white px-5 font-semibold text-black hover:bg-white/90"
                >
                  <Film data-icon="inline-start" />
                  Browse titles
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {!loading && filtered.length > 0 ? (
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map((item) => {
                const title = item.title || item.name || 'Untitled';
                const year = item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4);

                return (
                  <Card
                    key={`${item.id}-${item.media_type}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => openItem(item)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openItem(item);
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
                            {item.media_type === 'movie' ? <Film /> : <Tv />}
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
                          <Badge className="bg-black/55 uppercase text-white/72">
                            {item.media_type === 'movie' ? 'Movie' : 'Series'}
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
                            {year || 'Saved title'}
                          </CardDescription>
                        </div>

                        <CardFooter className="gap-2 border-0 bg-transparent p-0">
                          <Button
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              openItem(item);
                            }}
                            className="flex-1 rounded-full bg-white px-3 font-semibold text-black hover:bg-white/90"
                          >
                            <Play data-icon="inline-start" fill="currentColor" />
                            Open
                          </Button>
                          <Button
                            title="Remove from My List"
                            size="icon-sm"
                            variant="ghost"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeItem(item);
                            }}
                            className="rounded-full bg-red-500/10 text-red-200 hover:bg-red-500/18 hover:text-red-100"
                          >
                            <Trash2 />
                          </Button>
                        </CardFooter>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          ) : null}

          {!loading && items.length > 0 && filtered.length === 0 ? (
            <Card className="border-white/10 bg-white/[0.035] py-16 text-center backdrop-blur-xl">
              <CardContent className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                  <Clock className="text-white/42" />
                </div>
                <CardTitle className="text-2xl font-black text-white">No saved titles here</CardTitle>
                <CardDescription className="text-white/55">
                  Try a different filter.
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
