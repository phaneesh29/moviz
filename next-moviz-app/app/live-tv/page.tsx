'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  RadioTower,
  Search,
  Signal,
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

export default function LiveTvPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const categories = useMemo(
    () => ['All', ...new Set(channels.map((channel) => channel.group || ''))]
      .filter((category) => category.trim() !== '')
      .sort(),
    [channels],
  );

  const filteredChannels = useMemo(
    () =>
      channels.filter((channel) => {
        const matchesSearch = channel.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || channel.group === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [channels, search, selectedCategory],
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />

      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8">
          <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <Badge
                variant="outline"
                className="w-fit border-white/12 bg-white/[0.06] text-white/70"
              >
                <Signal data-icon="inline-start" />
                Live guide
              </Badge>
              <h1 className="font-display text-4xl font-black tracking-normal text-white sm:text-5xl">
                Live TV
              </h1>
            </div>
            {!loading ? (
              <p className="text-sm text-white/45">
                {filteredChannels.length.toLocaleString()} channels
              </p>
            ) : null}
          </section>

          <section className="flex flex-col gap-4 rounded-[1.35rem] border border-white/10 bg-black/45 p-3 shadow-[0_16px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-4">
            <div className="group/search relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <Search className="text-white/38 transition-colors group-focus-within/search:text-white/72" />
              </div>
              <input
                type="text"
                placeholder="Find channels, sports, news..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.055] pl-12 pr-4 text-sm font-medium text-white shadow-inner shadow-white/[0.03] outline-none transition-all placeholder:text-white/32 focus:border-white/22 focus:bg-white/[0.08]"
              />
            </div>

            <Separator className="bg-white/10" />

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
                      ? 'bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.13)] hover:bg-white'
                      : 'bg-white/[0.055] text-white/62 hover:bg-white/[0.1] hover:text-white',
                  )}
                >
                  {category}
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
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredChannels.slice(0, 150).map((channel) => (
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
                  className="group relative cursor-pointer border-white/10 bg-white/[0.035] p-0 shadow-[0_12px_34px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-white/22 hover:bg-white/[0.065] hover:shadow-[0_18px_48px_rgba(0,0,0,0.38)]"
                >
                  <CardContent className="relative flex aspect-square flex-col items-center justify-center gap-4 p-4">
                    <Badge className="absolute right-3 top-3 bg-black/55 text-white/72 backdrop-blur-md">
                      <Signal data-icon="inline-start" />
                      Live
                    </Badge>

                    <div className="flex size-20 items-center justify-center rounded-[1.35rem] border border-white/10 bg-black/38 p-3 shadow-inner shadow-white/[0.03] transition-transform duration-300 group-hover:scale-105 sm:size-24">
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
                          {channel.group}
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
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
