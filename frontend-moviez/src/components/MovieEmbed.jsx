import React, { useState } from 'react';

const MovieEmbed = ({ imdbId, tmdbId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState('videasy'); // default player

  if (!imdbId) return <p className="text-red-500 text-center">No IMDb ID provided</p>;

  const embedUrl =
    player === 'vidsrc'
      ? `https://vidsrc.xyz/embed/movie/${imdbId}`
      : player === 'vidplus'
        ? `https://player.vidplus.to/embed/movie/${tmdbId}`
        : player === '2embed'
          ? `https://www.2embed.stream/embed/movie/${tmdbId}`
          : player === 'cinemaos'
            ? `https://cinemaos.tech/player/${tmdbId}`
            : `https://player.videasy.net/movie/${tmdbId}`;

  return (
    <>
      <div className="rounded-xl overflow-hidden shadow-xl border border-[#1c1c1c] relative group">
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

      <div className="flex p-4 m-2 items-center gap-5 rounded-lg shadow-lg opacity-100 transition-opacity duration-300">
        <p className="font-semibold text-lg">Select Server</p>
        <select
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
          className="bg-black text-white p-2 rounded-md border hover:bg-[#0c0c0c] border-gray-700 text-base cursor-pointer"
        >
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

export default MovieEmbed;
