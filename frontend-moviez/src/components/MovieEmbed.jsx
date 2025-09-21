import React, { useState } from 'react';

const MovieEmbed = ({ imdbId, tmdbId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState('videasy'); // default player

  if (!imdbId) return <p className="text-red-500 text-center">No IMDb ID provided</p>;

  const embedUrl =
    player === 'vidsrc'
      ? `https://vidsrc.xyz/embed/movie/${imdbId}`
      : `https://player.videasy.net/movie/${tmdbId}`;

  return (
    <div className="rounded-xl overflow-hidden shadow-xl border border-[#1c1c1c] relative group">
      {/* Player Selector (absolute top-left, opacity 20 -> 100 on hover) */}
      <div className="absolute top-2 left-2 z-20 bg-[#1a1a1abe] rounded-lg shadow-lg opacity-20 group-hover:opacity-100 transition-opacity duration-300">
        <select
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
          className="bg-transparent text-white px-2 py-1 rounded-md border border-gray-700 text-sm cursor-pointer"
        >
          <option value="vidsrc">VidSrc</option>
          <option value="videasy">VideoSay</option>
        </select>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse flex items-center justify-center z-10">
          <p className="text-gray-500 text-sm">Loading player...</p>
        </div>
      )}

      <iframe
        src={embedUrl}
        autoFocus
        title="Movie Player"
        allowFullScreen
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        className="w-full h-full md:h-screen aspect-video md:aspect-auto"
      ></iframe>
    </div>
  );
};

export default MovieEmbed;
