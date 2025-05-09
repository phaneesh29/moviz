import React, { useState } from 'react';

const MovieEmbed = ({ imdbId }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!imdbId) return <p className="text-red-500 text-center">No IMDb ID provided</p>;

  const embedUrl = `https://vidsrc.xyz/embed/movie/${imdbId}`;

  return (
    <div className="rounded-xl overflow-hidden shadow-xl border border-[#1c1c1c]">
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
