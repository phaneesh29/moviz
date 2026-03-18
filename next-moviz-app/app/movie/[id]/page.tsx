'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Clock, ClockPlus, Play, Share2, Star, Youtube } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoEmbed from '@/components/VideoEmbed';
import { addToWatchLater } from '@/lib/watch-later';
import { imgBackdrop, imgPosterLarge, imgPosterSmall, imgProfile } from '@/lib/media-constants';

type Genre = { id: number; name: string };
type Movie = {
  id: number;
  title: string;
  overview?: string;
  tagline?: string;
  vote_average?: number;
  release_date?: string;
  runtime?: number;
  poster_path?: string;
  backdrop_path?: string;
  genres?: Genre[];
};
type CastMember = { id: number; name: string; character?: string; profile_path?: string };
type Credits = { cast?: CastMember[] };
type Recommendation = { id: number; title?: string; vote_average?: number; release_date?: string; poster_path?: string };
type Video = { key: string; type?: string; site?: string };

function formatRuntime(mins?: number) {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function MoviePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<Credits>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [movieRes, creditRes, recRes, videoRes] = await Promise.allSettled([
          fetch(`/api/movie/${id}/get`),
          fetch(`/api/movie/${id}/credits`),
          fetch(`/api/movie/${id}/recommendations`),
          fetch(`/api/movie/${id}/videos`),
        ]);

        if (movieRes.status === 'fulfilled' && movieRes.value.ok) {
          const data = (await movieRes.value.json()) as { results?: Movie };
          setMovie(data.results || null);
        } else {
          setError('Failed to load movie');
        }

        if (creditRes.status === 'fulfilled' && creditRes.value.ok) {
          const data = (await creditRes.value.json()) as { results?: Credits };
          setCredits(data.results || {});
        }

        if (recRes.status === 'fulfilled' && recRes.value.ok) {
          const data = (await recRes.value.json()) as { results?: { results?: Recommendation[] } };
          setRecommendations(data.results?.results || []);
        }

        if (videoRes.status === 'fulfilled' && videoRes.value.ok) {
          const data = (await videoRes.value.json()) as { results?: { results?: Video[] } };
          const videos = data.results?.results || [];
          const trailer = videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') || videos.find((v) => v.site === 'YouTube');
          setTrailerKey(trailer?.key || null);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load movie');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="size-14 animate-spin rounded-full border-[3px] border-[#e50914]/20 border-t-[#e50914]" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page-shell min-h-screen text-white pt-24 px-4">
        <Navbar />
        <p className="text-center text-red-400">{error || 'Movie not found'}</p>
      </div>
    );
  }

  return (
    <div className="page-shell text-white min-h-screen">
      <Navbar />

      <div className="relative w-full h-screen bg-black shadow-2xl">
        <VideoEmbed type="movie" tmdbId={movie.id} />
      </div>

      {movie.backdrop_path && (
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden -mt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgBackdrop + movie.backdrop_path} alt={movie.title} className="absolute inset-0 w-full h-full object-cover object-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 h-full flex items-end pb-10">
            <div className="flex gap-6 items-end">
              {movie.poster_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgPosterLarge + movie.poster_path} alt={movie.title} className="hidden md:block w-[160px] rounded-lg shadow-2xl border border-white/10" />
              )}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">{movie.title}</h1>
                {movie.tagline && <p className="text-base italic text-gray-400">{movie.tagline}</p>}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                  {movie.vote_average && movie.vote_average > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                      <Star size={14} fill="currentColor" /> {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                  {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
                  {movie.runtime && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {formatRuntime(movie.runtime)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 pt-1 flex-wrap">
                  {trailerKey && (
                    <button onClick={() => setShowTrailer(true)} className="flex items-center gap-1.5 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-md text-sm font-semibold transition">
                      <Youtube size={16} /> Trailer
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(window.location.href);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm font-medium transition border border-white/10"
                  >
                    <Share2 size={14} /> Share
                  </button>
                  <button
                    onClick={() => addToWatchLater(movie.id, 'movie')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#e50914]/85 hover:bg-[#e50914] rounded-md text-sm font-semibold transition"
                  >
                    <ClockPlus size={14} /> Watch Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTrailer(false)}>
          <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} title="Trailer" allowFullScreen allow="autoplay" className="w-full h-full rounded-lg" />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-2/3 space-y-6">
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((genre) => (
                <span key={genre.id} className="rounded-full border border-[#ff6a3d]/20 bg-[#31110a] px-3 py-1 text-xs font-medium text-[#ffd0bd]">
                  {genre.name}
                </span>
              ))}
            </div>
            <p className="text-gray-300 text-base leading-relaxed">{movie.overview}</p>
          </div>

          {credits.cast && credits.cast.length > 0 && (
            <div className="lg:w-1/3 space-y-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Cast</h2>
              <div className="grid grid-cols-2 gap-3">
                {credits.cast.slice(0, 8).map((cast) => (
                  <Link key={cast.id} href={`/person/${cast.id}`} className="surface-card rounded-2xl overflow-hidden cursor-pointer group transition-all">
                    {cast.profile_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgProfile + cast.profile_path} alt={cast.name} className="w-full h-[160px] object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-[160px] bg-[#1a1a1a] flex items-center justify-center text-gray-600 text-2xl font-bold">{cast.name?.[0]}</div>
                    )}
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{cast.name}</p>
                      <p className="text-xs text-gray-500 truncate">{cast.character}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {recommendations.length > 0 && (
          <div className="mt-12">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {recommendations.slice(0, 12).map((rec) => (
                <Link key={rec.id} href={`/movie/${rec.id}`} className="group/rec surface-card relative rounded-2xl overflow-hidden cursor-pointer transition-all">
                  <div className="aspect-[2/3] relative">
                    {rec.poster_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgPosterSmall + rec.poster_path} alt={rec.title} className="w-full h-full object-cover group-hover/rec:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/rec:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                      <span className="bg-white text-black px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1">
                        <Play size={12} fill="black" /> Play
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

