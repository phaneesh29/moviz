'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Film, Play, Star, Trash2, Tv } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { clearWatchLater, getWatchLaterList, removeFromWatchLater, type WatchLaterType } from '@/lib/watch-later';
import { imgPosterSmall } from '@/lib/media-constants';

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
          })
        );

        setItems(settled.filter((r): r is PromiseFulfilledResult<MediaItem> => r.status === 'fulfilled').map((r) => r.value));
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
    [items, typeFilter]
  );

  const movieCount = items.filter((item) => item.media_type === 'movie').length;
  const tvCount = items.filter((item) => item.media_type === 'tv').length;

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full pt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-purple-400" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Watch Later</h1>
            {items.length > 0 && <span className="text-sm text-gray-500 ml-1">{items.length} saved</span>}
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                clearWatchLater();
                setItems([]);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/20 hover:border-red-500/40 rounded-md text-sm text-red-400 font-medium transition-all w-fit"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex gap-2 mb-6">
            {[
              { key: 'all', label: `All (${items.length})` },
              { key: 'movie', label: `Movies (${movieCount})` },
              { key: 'tv', label: `TV (${tvCount})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key as 'all' | 'movie' | 'tv')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                  typeFilter === f.key
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="size-14 animate-spin border-[3px] border-purple-500/20 border-t-purple-500 rounded-full" />
          </div>
        )}

        {error && <p className="text-red-400 text-center text-lg font-semibold py-10">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <Clock size={48} className="mx-auto text-gray-700" />
            <p className="text-gray-500 text-lg">Your watch list is empty</p>
            <button onClick={() => router.push('/search')} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-semibold transition">
              Browse content
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((item) => (
              <div key={`${item.id}-${item.media_type}`} className="group relative rounded-lg overflow-hidden bg-[#141414] border border-white/5 cursor-pointer">
                <div className="aspect-[2/3] relative" onClick={() => router.push(`/${item.media_type}/${item.id}`)}>
                  {item.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgPosterSmall + item.poster_path} alt={item.title || item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                      {item.media_type === 'movie' ? <Film size={36} className="text-gray-700" /> : <Tv size={36} className="text-gray-700" />}
                    </div>
                  )}

                  <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.media_type === 'movie' ? 'bg-purple-600' : 'bg-pink-600'}`}>
                    {item.media_type}
                  </span>

                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${item.media_type}/${item.id}`);
                      }}
                      className="bg-white text-black px-5 py-2 rounded-md text-sm font-bold flex items-center gap-1.5 hover:bg-gray-200 transition"
                    >
                      <Play size={14} fill="black" /> Play
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchLater(item.id, item.media_type);
                        setItems((prev) => prev.filter((m) => !(m.id === item.id && m.media_type === item.media_type)));
                      }}
                      className="bg-red-600/80 hover:bg-red-600 px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>

                <div className="p-2.5">
                  <p className="text-sm font-medium truncate">{item.title || item.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || ''}</span>
                    {item.vote_average && item.vote_average > 0 && (
                      <span className="flex items-center gap-0.5 text-yellow-400">
                        <Star size={10} fill="currentColor" /> {item.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}



