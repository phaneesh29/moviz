'use client';

import Link from 'next/link';
import Image from 'next/image';

type MediaType = 'movie' | 'tv' | 'person';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  profile_path?: string;
  vote_average?: number;
  media_type?: MediaType;
}

function getItemHref(item: MediaItem): string {
  if (item.media_type === 'person') return `/person/${item.id}`;
  if (item.media_type === 'tv') return `/tv/${item.id}`;
  if (item.media_type === 'movie') return `/movie/${item.id}`;

  // Fallback for endpoints that don't return media_type (discover/trending-specific routes)
  return item.title ? `/movie/${item.id}` : `/tv/${item.id}`;
}

export default function TrendingMovies({ movies }: { movies: MediaItem[] }) {
  if (!movies.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No movies found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {movies.slice(0, 12).map((movie) => {
        const imagePath = movie.poster_path || movie.profile_path;
        return (
          <Link key={movie.id} href={getItemHref(movie)} className="group cursor-pointer">
            <div className="surface-card relative aspect-[2/3] overflow-hidden rounded-2xl bg-gray-800">
              {imagePath && (
                <Image
                  src={`https://image.tmdb.org/t/p/w300${imagePath}`}
                  alt={movie.title || movie.name || 'Media'}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                  unoptimized
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              )}
              {!imagePath && (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition opacity-0 group-hover:opacity-100 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">Watch</span>
              </div>
              {movie.vote_average && (
                <div className="absolute top-2 right-2 rounded bg-[#00a8e1] px-2 py-1 text-xs font-bold text-white">
                  {movie.vote_average.toFixed(1)}
                </div>
              )}
            </div>
            <p className="mt-2 truncate text-sm font-medium transition group-hover:text-[#ff8f6b]">{movie.title || movie.name}</p>
          </Link>
        );
      })}
    </div>
  );
}

