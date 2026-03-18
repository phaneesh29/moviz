'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Search, Tv } from 'lucide-react';
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
          <div className="page-hero relative overflow-hidden p-8 sm:p-10">
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-3">
                <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(229,9,20,0.18),rgba(255,106,61,0.12))] p-3.5 shadow-inner backdrop-blur-md">
                  <Tv size={36} className="text-[#ffb088]" />
                </div>
                <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-white drop-shadow-xl">
                  Live <span className="bg-gradient-to-r from-[#ff8662] to-[#ffd2a2] bg-clip-text text-transparent">TV</span>
                </h1>
              </div>
              <p className="ml-1 max-w-xl text-lg font-medium text-gray-400">Stream hundreds of premium and free global channels instantly.</p>
            </div>

            <div className="w-full md:w-96 relative z-10 group/search">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
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
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'filter-chip-active'
                    : 'filter-chip'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredChannels.length === 0 ? (
            <div className="surface-card flex flex-col items-center justify-center rounded-3xl py-32 text-center">
              <div className="p-6 bg-white/5 rounded-full mb-6 border border-white/5">
                <Tv size={56} className="text-gray-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">No channels found</h3>
              <p className="text-gray-400 max-w-md text-lg">Try adjusting your search or category filters to find what you are looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredChannels.slice(0, 150).map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => router.push(`/live-tv/${channel.id}`)}
                  className="group surface-card relative aspect-[4/3] cursor-pointer overflow-hidden rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 sm:aspect-square"
                >
                  <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#e50914]/10 via-transparent to-black/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative z-0 w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 mb-2">
                    {channel.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={channel.logo} alt={channel.name} loading="lazy" className="w-full h-full object-contain drop-shadow-2xl" />
                    ) : (
                      <div className="w-full h-full bg-black/40 rounded-2xl border border-white/10 shadow-inner flex items-center justify-center text-3xl font-black text-gray-500">
                        {channel.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="absolute z-20 flex h-12 w-12 translate-y-8 items-center justify-center rounded-full bg-gradient-to-br from-[#e50914] to-[#ff6a3d] text-white opacity-0 shadow-[0_0_20px_rgba(229,9,20,0.4)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Play size={20} className="translate-x-[2px]" fill="currentColor" />
                  </div>

                  <div className="absolute bottom-4 left-0 right-0 text-center px-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm font-bold text-white line-clamp-1 drop-shadow-md">{channel.name}</p>
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
