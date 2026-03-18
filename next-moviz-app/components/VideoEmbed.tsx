/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';

const PLAYERS = {
  vidfast: {
    movie: (id: number | string) => `https://vidfast.pro/movie/${id}?autoPlay=true&theme=9B59B6`,
    tv: (id: number | string, s: number, e: number) => `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true&theme=9B59B6`,
  },
  videasy: {
    movie: (id: number | string) => `https://player.videasy.net/movie/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  vidsrc: {
    movie: (id: number | string) => `https://vidsrc.store/embed/movie/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://vidsrc.store/embed/tv/${id}/${s}/${e}`,
  },
  vidplus: {
    movie: (id: number | string) => `https://player.vidplus.to/embed/movie/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://player.vidplus.to/embed/tv/${id}/${s}/${e}`,
  },
  '2embed': {
    movie: (id: number | string) => `https://www.2embed.stream/embed/movie/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://www.2embed.stream/embed/tv/${id}/${s}/${e}`,
  },
  cinemaos: {
    movie: (id: number | string) => `https://cinemaos.tech/player/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://cinemaos.tech/player/${id}/${s}/${e}`,
  },
  vidrock: {
    movie: (id: number | string) => `https://vidrock.net/movie/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://vidrock.net/tv/${id}/${s}/${e}`,
  },
} as const;

type PlayerName = keyof typeof PLAYERS;

type Props = {
  type?: 'movie' | 'tv';
  tmdbId: number | string;
  season?: number;
  episode?: number;
};

export default function VideoEmbed({ type = 'movie', tmdbId, season = 1, episode = 1 }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [player, setPlayer] = useState<PlayerName>(() => {
    try {
      const saved = window.localStorage.getItem('preferredPlayer') as PlayerName | null;
      if (saved && PLAYERS[saved]) return saved;
    } catch {
      // no-op
    }
    return 'vidfast';
  });

  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setLoadError(true);
    }, 15000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [player, tmdbId, season, episode]);

  if (!tmdbId) {
    return <p className="text-red-500 text-center">No TMDB ID provided</p>;
  }

  const embedUrl = type === 'tv' ? PLAYERS[player].tv(tmdbId, season, episode) : PLAYERS[player].movie(tmdbId);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-xl border border-[#1c1c1c] relative group">
      {isLoading && (
        <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse flex items-center justify-center z-10">
          <p className="text-gray-500 text-sm">Loading player...</p>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 bg-[#1a1a1a] flex flex-col items-center justify-center z-10 gap-3">
          <p className="text-gray-400 text-sm">Player took too long to load</p>
          <button
            onClick={() => {
              setLoadError(false);
              setIsLoading(true);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-sm font-semibold transition text-white"
          >
            Retry
          </button>
        </div>
      )}

      <iframe
        key={`${player}-${tmdbId}-${season}-${episode}`}
        src={embedUrl}
        title={type === 'tv' ? 'Series Player' : 'Movie Player'}
        allowFullScreen
        loading="lazy"
        onLoad={() => {
          setIsLoading(false);
          setLoadError(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        className="w-full h-full"
      />

      <div className="absolute bottom-4 left-4 z-40 flex items-center gap-3 p-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="font-medium text-sm text-gray-200 hidden sm:block">Server:</p>
        <select
          value={player}
          onChange={(e) => {
            const next = e.target.value as PlayerName;
            setPlayer(next);
            setIsLoading(true);
            try {
              window.localStorage.setItem('preferredPlayer', next);
            } catch {
              // no-op
            }
          }}
          className="bg-[#1a1a1a]/80 text-white px-3 py-1.5 rounded border border-white/10 hover:bg-[#2a2a2a]/80 text-sm cursor-pointer outline-none focus:ring-1 focus:ring-purple-500 transition-all font-medium"
        >
          <option value="vidfast">VidFast</option>
          <option value="videasy">Videasy</option>
          <option value="vidrock">VidRock</option>
          <option value="cinemaos">CinemaOS</option>
          <option value="vidplus">VidPlus</option>
          <option value="2embed">2Embed</option>
          <option value="vidsrc">VidSrc</option>
        </select>
      </div>
    </div>
  );
}
