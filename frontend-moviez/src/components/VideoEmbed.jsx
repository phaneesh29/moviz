import React, { useState, useEffect, useRef } from 'react';

const PLAYERS = {
  vidfast: {
    movie: (id) => `https://vidfast.pro/movie/${id}?autoPlay=true&theme=9B59B6`,
    tv: (id, s, e) => `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true&theme=9B59B6`,
  },
  videasy: {
    movie: (id) => `https://player.videasy.net/movie/${id}`,
    tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  vidsrc: {
    movie: (id) => `https://vidsrc.store/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.store/embed/tv/${id}/${s}/${e}`,
  },
  vidplus: {
    movie: (id) => `https://player.vidplus.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://player.vidplus.to/embed/tv/${id}/${s}/${e}`,
  },
  '2embed': {
    movie: (id) => `https://www.2embed.stream/embed/movie/${id}`,
    tv: (id, s, e) => `https://www.2embed.stream/embed/tv/${id}/${s}/${e}`,
  },
  cinemaos: {
    movie: (id) => `https://cinemaos.tech/player/${id}`,
    tv: (id, s, e) => `https://cinemaos.tech/player/${id}/${s}/${e}`,
  },
};

/**
 * Unified video player embed for both movies and TV episodes.
 * @param {"movie"|"tv"} type
 * @param {number|string} tmdbId
 * @param {number} [season] - required when type === "tv"
 * @param {number} [episode] - required when type === "tv"
 */
const VideoEmbed = ({ type = 'movie', tmdbId, season, episode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState(() => {
    try { return localStorage.getItem('preferredPlayer') || 'vidfast'; }
    catch { return 'vidfast'; }
  });

  const handlePlayerChange = (e) => {
    const val = e.target.value;
    setIsLoading(true);
    setPlayer(val);
    try { localStorage.setItem('preferredPlayer', val); } catch {}
  };

  const [loadError, setLoadError] = useState(false);
  const timeoutRef = useRef(null);

  // Reset loading state and start timeout when player or content changes
  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setLoadError(true);
      }
    }, 15000); // 15s timeout
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [player, tmdbId, season, episode]);

  if (!tmdbId) return <p className="text-red-500 text-center">No TMDB ID provided</p>;

  const builder = PLAYERS[player]?.[type] || PLAYERS.vidfast[type];
  const embedUrl = type === 'tv'
    ? builder(tmdbId, season, episode)
    : builder(tmdbId);

  return (
    <>
      <div className="rounded-xl overflow-hidden shadow-xl border border-[#1c1c1c] relative group">
        {isLoading && (
          <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse flex items-center justify-center z-10">
            <p className="text-gray-500 text-sm">Loading player...</p>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 bg-[#1a1a1a] flex flex-col items-center justify-center z-10 gap-3">
            <p className="text-gray-400 text-sm">Player took too long to load</p>
            <button
              onClick={() => { setLoadError(false); setIsLoading(true); }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-sm font-semibold transition text-white"
            >
              Retry
            </button>
          </div>
        )}

        <iframe
          key={`${player}-${tmdbId}-${season}-${episode}`}
          src={embedUrl}
          autoFocus
          title={type === 'tv' ? 'Series Player' : 'Movie Player'}
          allowFullScreen
          loading="lazy"
          onLoad={() => { setIsLoading(false); setLoadError(false); if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
          className="w-full aspect-video"
        />
      </div>

      <div className="flex p-4 m-2 items-center gap-5 rounded-lg shadow-lg opacity-100 transition-opacity duration-300">
        <p className="font-semibold text-lg">Select Server</p>
        <select
          value={player}
          onChange={handlePlayerChange}
          className="bg-black text-white p-2 rounded-md border hover:bg-[#0c0c0c] border-gray-700 text-base cursor-pointer"
        >
          <option value="vidfast">VidFast</option>
          <option value="videasy">Videasy</option>
          <option value="vidsrc">VidSrc</option>
          <option value="vidplus">VidPlus</option>
          <option value="2embed">2Embed</option>
          <option value="cinemaos">CinemaOS</option>
        </select>
      </div>
    </>
  );
};

export default VideoEmbed;
