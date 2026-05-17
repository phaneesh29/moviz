'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Globe2,
  ListFilter,
  Play,
  RadioTower,
  RefreshCcw,
  Search,
  Signal,
  Tv2,
  Zap,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Channel = {
  id: number;
  name: string;
  logo?: string;
  group?: string;
};

const INITIAL_VISIBLE_CHANNELS = 96;
const CHANNELS_PER_PAGE = 72;
const FEATURED_GROUPS = ['News', 'Sports', 'Entertainment', 'Movies', 'Music', 'Kids'];

function getChannelGroups(channel: Channel) {
  return (channel.group || 'Undefined')
    .split(';')
    .map((group) => group.trim())
    .filter(Boolean);
}

export default function LiveTvPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_CHANNELS);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get('q') || '');
      setSelectedCategory(params.get('category') || 'All');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    router.replace(`/live-tv${params.toString() ? `?${params.toString()}` : ''}`);
    setVisibleCount(INITIAL_VISIBLE_CHANNELS);
  }, [search, selectedCategory, router]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch('/api/livetv/channels');
        const data = (await res.json()) as { success?: boolean; results?: Channel[] };
        if (data.success) {
          setChannels(data.results || []);
        }
      } catch (error) {
        console.error('Failed to fetch Live TV channels:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchChannels();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    channels.forEach((channel) => {
      getChannelGroups(channel).forEach((group) => {
        counts.set(group, (counts.get(group) || 0) + 1);
      });
    });
    return counts;
  }, [channels]);

  const categories = useMemo(() => {
    const sortedCategories = [...categoryCounts.keys()]
      .filter((category) => category.trim() !== '')
      .sort((left, right) => {
        const leftFeatured = FEATURED_GROUPS.includes(left);
        const rightFeatured = FEATURED_GROUPS.includes(right);
        if (leftFeatured !== rightFeatured) return leftFeatured ? -1 : 1;
        return left.localeCompare(right);
      });

    return ['All', ...sortedCategories];
  }, [categoryCounts]);

  const filteredChannels = useMemo(
    () =>
      channels.filter((channel) => {
        const matchesSearch = channel.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || getChannelGroups(channel).includes(selectedCategory);
        return matchesSearch && matchesCategory;
      }),
    [channels, search, selectedCategory],
  );

  const featuredChannels = useMemo(() => {
    const preferred = channels.filter((channel) => {
      const groups = getChannelGroups(channel);
      return channel.logo && groups.some((group) => FEATURED_GROUPS.includes(group));
    });

    return preferred.slice(0, 8);
  }, [channels]);

  const visibleChannels = filteredChannels.slice(0, visibleCount);
  const hasMoreChannels = visibleCount < filteredChannels.length;
  const logoCount = channels.filter((channel) => channel.logo).length;

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_20%_0%,rgba(0,168,225,0.16),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.10),transparent_24%),linear-gradient(180deg,#020202_0%,#071013_42%,#000_100%)] text-white">
      <Navbar />

      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto flex w-full max-w-[104rem] flex-col gap-8">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div className="flex flex-col gap-4">
              <Badge
                variant="outline"
                className="w-fit border-cyan-300/20 bg-cyan-300/8 text-cyan-100"
              >
                <Signal data-icon="inline-start" />
                Live guide online
              </Badge>
              <h1 className="max-w-3xl font-display text-4xl font-black tracking-normal text-white sm:text-5xl lg:text-6xl">
                Live TV
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/58 sm:text-base">
                Browse public IPTV channels by category, jump into a stream, and keep the guide moving fast even with a huge channel list.
              </p>
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-white/10 bg-black/42 shadow-[0_18px_58px_rgba(0,0,0,0.34)] backdrop-blur-xl">
              <div className="border-r border-white/10 p-4">
                <Tv2 className="mb-3 text-cyan-300" size={18} />
                <p className="text-2xl font-black text-white">{channels.length.toLocaleString()}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase text-white/42">Channels</p>
              </div>
              <div className="border-r border-white/10 p-4">
                <Globe2 className="mb-3 text-amber-300" size={18} />
                <p className="text-2xl font-black text-white">{Math.max(0, categories.length - 1).toLocaleString()}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase text-white/42">Groups</p>
              </div>
              <div className="p-4">
                <Zap className="mb-3 text-emerald-300" size={18} />
                <p className="text-2xl font-black text-white">{logoCount.toLocaleString()}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase text-white/42">With logos</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-black/52 p-3 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="group/search relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Search className="text-white/38 transition-colors group-focus-within/search:text-cyan-200" />
                </div>
                <input
                  type="text"
                  placeholder="Find channels, sports, news..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.055] pl-12 pr-4 text-sm font-medium text-white shadow-inner shadow-white/[0.03] outline-none transition-all placeholder:text-white/32 focus:border-cyan-200/38 focus:bg-white/[0.08]"
                />
              </div>

              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="h-12 justify-center rounded-lg border-white/10 bg-white/[0.055] px-4 text-white/70 hover:bg-white/[0.1] hover:text-white"
              >
                <RefreshCcw size={16} />
                Reset
              </Button>
            </div>

            <Separator className="my-4 bg-white/10" />

            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-white/42">
              <ListFilter size={14} />
              Categories
            </div>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'shrink-0 rounded-full px-4 text-xs font-semibold',
                    selectedCategory === category
                      ? 'bg-cyan-200 text-black shadow-[0_10px_24px_rgba(103,232,249,0.13)] hover:bg-cyan-100'
                      : 'bg-white/[0.055] text-white/62 hover:bg-white/[0.1] hover:text-white',
                  )}
                >
                  {category}
                  <span className={cn('ml-2 text-[10px]', selectedCategory === category ? 'text-black/55' : 'text-white/35')}>
                    {category === 'All' ? channels.length.toLocaleString() : (categoryCounts.get(category) || 0).toLocaleString()}
                  </span>
                </Button>
              ))}
            </div>
          </section>

          {loading ? (
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 18 }).map((_, index) => (
                <Card key={index} className="border-white/10 bg-white/[0.035] p-4">
                  <CardContent className="flex aspect-square flex-col items-center justify-center gap-4 p-0">
                    <Skeleton className="size-20 rounded-2xl bg-white/10" />
                    <div className="flex w-full flex-col gap-2">
                      <Skeleton className="mx-auto h-4 w-4/5 bg-white/10" />
                      <Skeleton className="mx-auto h-3 w-1/2 bg-white/10" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          ) : filteredChannels.length === 0 ? (
            <Card className="border-white/10 bg-white/[0.035] py-16 text-center backdrop-blur-xl">
              <CardContent className="flex flex-col items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                  <RadioTower className="text-white/42" />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black tracking-normal text-white">No channels found</h2>
                  <p className="max-w-md text-sm leading-6 text-white/55">
                    Try another search term or switch back to all categories.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('All');
                  }}
                  className="rounded-full bg-white px-5 font-semibold text-black hover:bg-white/90"
                >
                  Reset filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {featuredChannels.length > 0 && !search && selectedCategory === 'All' ? (
                <section className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase text-cyan-200/70">Quick start</p>
                      <h2 className="mt-1 text-xl font-black text-white">Featured live channels</h2>
                    </div>
                    <p className="hidden text-sm text-white/42 sm:block">Fresh picks from high-signal groups</p>
                  </div>
                  <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
                    {featuredChannels.map((channel) => (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => router.push(`/live-tv/${channel.id}`)}
                        className="group/featured flex w-[260px] shrink-0 items-center gap-4 rounded-xl border border-white/10 bg-white/[0.045] p-3 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-white/[0.075]"
                      >
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/45 p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={channel.logo} alt={channel.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{channel.name}</p>
                          <p className="mt-1 truncate text-xs text-white/42">{getChannelGroups(channel).join(' / ')}</p>
                        </div>
                        <ArrowRight className="text-white/28 transition group-hover/featured:text-cyan-200" size={18} />
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-white/42">Channel grid</p>
                    <h2 className="mt-1 text-xl font-black text-white">
                      {filteredChannels.length.toLocaleString()} channels found
                    </h2>
                  </div>
                  <p className="text-sm text-white/42">
                    Showing {visibleChannels.length.toLocaleString()} of {filteredChannels.length.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                  {visibleChannels.map((channel) => (
                <Card
                  key={channel.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/live-tv/${channel.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(`/live-tv/${channel.id}`);
                    }
                  }}
                  className="group relative cursor-pointer rounded-lg border-white/10 bg-white/[0.035] p-0 shadow-[0_12px_34px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/26 hover:bg-white/[0.065] hover:shadow-[0_18px_48px_rgba(0,0,0,0.38)]"
                >
                  <CardContent className="relative flex aspect-square flex-col items-center justify-center gap-3 p-3">
                    <Badge className="absolute right-2 top-2 bg-black/55 text-white/72 backdrop-blur-md">
                      <Signal data-icon="inline-start" />
                      Live
                    </Badge>

                    <div className="flex size-20 items-center justify-center rounded-lg border border-white/10 bg-black/38 p-3 shadow-inner shadow-white/[0.03] transition-transform duration-300 group-hover:scale-105 sm:size-24">
                      {channel.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain drop-shadow-2xl"
                        />
                      ) : (
                        <span className="font-display text-3xl font-black uppercase text-white/42">
                          {channel.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex min-h-[3.25rem] w-full flex-col items-center justify-end gap-1 text-center">
                      <CardTitle className="line-clamp-2 text-sm font-bold text-white">
                        {channel.name}
                      </CardTitle>
                      {channel.group ? (
                        <CardDescription className="max-w-full truncate text-[10px] font-semibold uppercase tracking-normal text-white/42">
                          {getChannelGroups(channel).slice(0, 2).join(' / ')}
                        </CardDescription>
                      ) : null}
                    </div>

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="flex size-12 items-center justify-center rounded-full bg-white text-black shadow-[0_12px_28px_rgba(255,255,255,0.16)]">
                        <Play fill="currentColor" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  ))}
                </div>

                {hasMoreChannels ? (
                  <div className="flex justify-center pt-2">
                    <Button
                      size="lg"
                      onClick={() => setVisibleCount((count) => count + CHANNELS_PER_PAGE)}
                      className="rounded-lg bg-white px-6 font-semibold text-black hover:bg-white/90"
                    >
                      Load more channels
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                ) : null}
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
