'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsLeft, ChevronsRight, ClockPlus, Film, Play, SlidersHorizontal, Star, Tv } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { addToWatchLater } from '@/lib/watch-later';
import { imgPosterSmall } from '@/lib/media-constants';

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
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest First' },
  { value: 'primary_release_date.asc', label: 'Oldest First' },
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

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pt-24">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <SlidersHorizontal size={24} className="text-purple-400" /> Discover
          </h1>
          <p className="text-gray-500 text-sm mt-1">Browse by genre, sort by popularity or rating</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMediaType('movie');
                setSelectedGenre('');
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                mediaType === 'movie' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              <Film size={16} /> Movies
            </button>
            <button
              onClick={() => {
                setMediaType('tv');
                setSelectedGenre('');
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                mediaType === 'tv' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              <Tv size={16} /> TV Shows
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-[#141414] border border-white/10 text-white px-4 py-2 rounded-md text-sm focus:border-purple-500 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {currentGenres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedGenre('');
                  setPage(1);
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                  !selectedGenre ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'
                }`}
              >
                All Genres
              </button>
              {currentGenres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGenre(String(g.id) === selectedGenre ? '' : String(g.id));
                    setPage(1);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                    String(g.id) === selectedGenre
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="size-12 animate-spin border-[3px] border-purple-500/20 border-t-purple-500 rounded-full" />
          </div>
        )}

        {!isLoading && data && data.results.length > 0 && (
          <>
            <div className="flex justify-between items-center px-1 pb-4 text-xs text-gray-500 font-mono border-b border-white/5 mb-6">
              <span>{data.total_results?.toLocaleString()} results</span>
              <span>
                Page {data.page} of {Math.min(data.total_pages, 500)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {data.results.map((item) => (
                <div key={item.id} onClick={() => router.push(`/${mediaType}/${item.id}`)} className="relative group/card rounded-md overflow-hidden cursor-pointer bg-[#141414]">
                  {item.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgPosterSmall + item.poster_path} alt={item.title || item.name || 'media'} className="w-full aspect-[2/3] object-cover transition-all duration-300 group-hover/card:scale-105 group-hover/card:brightness-50" loading="lazy" />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-[#1a1a1a] flex items-center justify-center">
                      <Film size={28} className="text-gray-700" />
                    </div>
                  )}

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
                          router.push(`/${mediaType}/${item.id}`);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 bg-white text-black text-xs font-bold py-1.5 rounded hover:bg-white/90 transition"
                      >
                        <Play size={12} fill="black" /> View
                      </button>
                      <button
                        title="Add to Watch Later"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToWatchLater(item.id, mediaType);
                        }}
                        className="flex items-center justify-center bg-white/10 border border-white/30 hover:border-white p-1.5 rounded transition"
                      >
                        <ClockPlus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 mt-10 mb-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  page <= 1 ? 'opacity-30 cursor-not-allowed bg-white/5 text-gray-600' : 'bg-white/10 hover:bg-purple-600 text-white'
                }`}
              >
                <ChevronsLeft size={16} /> Prev
              </button>
              <span className="text-sm font-mono text-gray-400 min-w-[60px] text-center">
                {data.page} / {Math.min(data.total_pages, 500)}
              </span>
              <button
                disabled={page >= Math.min(data.total_pages, 500)}
                onClick={() => setPage((p) => p + 1)}
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  page >= Math.min(data.total_pages, 500)
                    ? 'opacity-30 cursor-not-allowed bg-white/5 text-gray-600'
                    : 'bg-white/10 hover:bg-purple-600 text-white'
                }`}
              >
                Next <ChevronsRight size={16} />
              </button>
            </div>
          </>
        )}

        {!isLoading && data && data.results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No results found</p>
            <p className="text-gray-600 text-sm mt-1">Try a different genre or filter</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
