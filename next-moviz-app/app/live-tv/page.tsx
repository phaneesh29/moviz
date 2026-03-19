'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Search, Sparkles, Tv } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
    () => ['All', ...new Set(channels.map((c) => c.group || ''))].filter((c) => c.trim() !== '').sort(),
    [channels]
  );

  const filteredChannels = channels.filter((channel) => {
    const matchesSearch = channel.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || channel.group === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="size-14 animate-spin rounded-full border-[3px] border-[#e50914]/20 border-t-[#e50914]" />
      </div>
    );
  }

  return (
    <div className="page-shell flex min-h-screen flex-col">
      <Navbar />

      <main className="page-container flex-1">
        <div className="space-y-10">
          <section className="platform-hero p-8 sm:p-10">
            <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_360px]">
              <div>
                <div className="mb-3 flex items-center gap-4">
                  <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(229,9,20,0.18),rgba(255,106,61,0.12))] p-3.5 shadow-inner backdrop-blur-md">
                    <Tv size={36} className="text-[#ffb088]" />
                  </div>
                  <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-xl sm:text-6xl">
                    Live <span className="bg-gradient-to-r from-[#ff8662] to-[#ffd2a2] bg-clip-text text-transparent">TV</span>
                  </h1>
                </div>
                <p className="ml-1 max-w-2xl text-base text-gray-400 sm:text-lg">
                  Browse channels in a layout closer to a real streaming hub, with faster category pivots and stronger channel cards.
                </p>
              </div>

              <div className="platform-toolbar p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Channel guide</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="platform-stat p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">Visible channels</p>
                    <p className="mt-2 text-lg font-semibold text-white">{filteredChannels.length}</p>
                  </div>
                  <div className="platform-stat p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">Categories</p>
                    <p className="mt-2 text-lg font-semibold text-white">{categories.length - 1}</p>
                  </div>
                  <div className="platform-stat p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">Current lane</p>
                    <p className="mt-2 text-lg font-semibold text-white">{selectedCategory}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="platform-toolbar p-5 md:p-6">
            <div className="flex flex-col gap-4">
              <div className="group/search relative">
                <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
                  <Search size={20} className="text-gray-400 transition-colors group-focus-within/search:text-[#ff8662]" />
                </div>
                <input
                  type="text"
                  placeholder="Find channels, news, sports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="surface-card w-full rounded-2xl py-4 pl-14 pr-6 text-sm font-medium shadow-inner transition-all placeholder:text-gray-500 focus:border-[#e50914] focus:outline-none"
                />
              </div>

              <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                      selectedCategory === category ? 'filter-chip-active' : 'filter-chip'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {filteredChannels.length === 0 ? (
            <div className="platform-toolbar flex flex-col items-center justify-center rounded-3xl py-32 text-center">
              <div className="mb-6 rounded-full border border-white/5 bg-white/[0.05] p-6">
                <Tv size={56} className="text-gray-500" />
              </div>
              <h3 className="mb-3 text-2xl font-black tracking-tight text-white">No channels found</h3>
              <p className="max-w-md text-lg text-gray-400">Try adjusting your search or category filters to find what you are looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredChannels.slice(0, 150).map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => router.push(`/live-tv/${channel.id}`)}
                  className="platform-grid-card cursor-card group relative aspect-[4/3] p-5 transition-all duration-300 sm:aspect-square"
                >
                  <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#e50914]/10 via-transparent to-black/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative z-0 mb-3 flex h-16 w-16 items-center justify-center transition-transform duration-500 group-hover:scale-110 sm:h-24 sm:w-24">
                    {channel.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={channel.logo} alt={channel.name} loading="lazy" className="h-full w-full object-contain drop-shadow-2xl" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-3xl font-black text-gray-500 shadow-inner">
                        {channel.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 z-20 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white/65">
                    <Sparkles size={10} />
                    Live
                  </div>

                  <div className="absolute z-20 flex h-12 w-12 translate-y-8 items-center justify-center rounded-full bg-gradient-to-br from-[#e50914] to-[#ff6a3d] text-white opacity-0 shadow-[0_0_20px_rgba(229,9,20,0.4)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Play size={20} className="translate-x-[2px]" fill="currentColor" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-20 p-4">
                    <p className="line-clamp-2 text-sm font-bold text-white drop-shadow-md">{channel.name}</p>
                    {channel.group ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">{channel.group}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
