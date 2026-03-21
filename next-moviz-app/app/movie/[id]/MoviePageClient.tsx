'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, ClockPlus, Play, Share2, Star, Youtube } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoEmbed from '@/components/VideoEmbed';
import { addToWatchLater } from '@/lib/watch-later';
import { imgBackdrop, imgPosterLarge, imgPosterSmall, imgProfile } from '@/lib/media-constants';
import { parseProvider, withProviderInPath } from '@/lib/provider-query';

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

type MoviePageClientProps = {
  id: string;
};

function formatRuntime(mins?: number) {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function MoviePageClient({ id }: MoviePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<Credits>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const activeProvider = useMemo(() => parseProvider(searchParams.get('provider')), [searchParams]);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [movieRes, creditRes, recRes, videoRes] = await Promise.allSettled([
          fetch(`/api/movie/${id}/get`, { signal: controller.signal }),
          fetch(`/api/movie/${id}/credits`, { signal: controller.signal }),
          fetch(`/api/movie/${id}/recommendations`, { signal: controller.signal }),
          fetch(`/api/movie/${id}/videos`, { signal: controller.signal }),
        ]);

        if (movieRes.status === 'fulfilled' && movieRes.value.ok) {
          const data = (await movieRes.value.json()) as { results?: Movie };
          setMovie(data.results || null);
        } else {
          const tvFallback = await fetch(`/api/tv/${id}`, { signal: controller.signal });
          if (tvFallback.ok) {
            router.replace(withProviderInPath(`/tv/${id}`, activeProvider));
            return;
          }
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
          const trailer =
            videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
            videos.find((v) => v.site === 'YouTube');
          setTrailerKey(trailer?.key || null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setError('Failed to load movie');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => controller.abort();
  }, [activeProvider, id, router]);

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="size-14 animate-spin rounded-full border-[3px] border-[#e50914]/20 border-t-[#e50914]" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page-shell min-h-screen px-4 pt-24 text-white">
        <Navbar />
        <p className="text-center text-red-400">{error || 'Movie not found'}</p>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen text-white">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-10 pt-28 md:px-8 xl:px-12">
        {movie.backdrop_path && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgBackdrop + movie.backdrop_path}
              alt={movie.title}
              className="absolute inset-0 h-full w-full object-cover opacity-[0.18]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.74)_0%,rgba(5,5,5,0.92)_50%,#050505_100%)]" />
          </>
        )}

        <div className="relative mx-auto max-w-[92rem]">
          <div className="space-y-6">
            <VideoEmbed type="movie" tmdbId={movie.id} compactActions mediaTitle={movie.title} />

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#ff6a3d]/25 bg-[#2f120d] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffb08c]">
                Movie night
              </span>
              {movie.vote_average ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm font-medium text-[#ffd27d]">
                  <Star size={13} fill="currentColor" />
                  {movie.vote_average.toFixed(1)} rating
                </span>
              ) : null}
              {movie.release_date ? (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-white/65">
                  {movie.release_date.slice(0, 4)}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-6 md:flex-row md:items-end">
              {movie.poster_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgPosterLarge + movie.poster_path}
                  alt={movie.title}
                  className="surface-card hidden w-[180px] rounded-[26px] object-cover md:block"
                />
              )}

              <div className="max-w-4xl">
                <h1 className="font-display text-4xl leading-[0.92] text-white md:text-6xl">{movie.title}</h1>
                {movie.tagline ? <p className="mt-3 text-lg italic text-white/55">{movie.tagline}</p> : null}
                <p className="mt-4 max-w-4xl text-sm leading-7 text-white/70 md:text-base">{movie.overview}</p>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/60">
                  {movie.runtime ? (
                    <span className="inline-flex items-center gap-2">
                      <Clock size={14} />
                      {formatRuntime(movie.runtime)}
                    </span>
                  ) : null}
                  {movie.genres?.length ? <span>{movie.genres.map((genre) => genre.name).join(' • ')}</span> : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {trailerKey ? (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="accent-button cursor-watch inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
                    >
                      <Youtube size={16} />
                      Watch trailer
                    </button>
                  ) : null}
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(window.location.href);
                      setShareCopied(true);
                      window.setTimeout(() => setShareCopied(false), 1600);
                    }}
                    className="glass-button cursor-copy inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white"
                  >
                    <Share2 size={14} />
                    {shareCopied ? 'Link copied' : 'Share'}
                  </button>
                  <button
                    onClick={() => addToWatchLater(movie.id, 'movie')}
                    className="glass-button cursor-watch inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white"
                  >
                    <ClockPlus size={14} />
                    Watch later
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_360px]">
            <div />
            <aside className="space-y-4">
              <div className="cinema-panel rounded-[28px] p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Watch tips</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Keep playback smooth</h2>
                <div className="mt-4 space-y-3 text-sm leading-6 text-white/60">
                  <p>Start with the default provider, then use the server pills if the stream is slow.</p>
                  <p>Open the provider in a new tab if mobile playback blocks full-screen or audio.</p>
                  <p>Your preferred server is remembered for the next movie.</p>
                </div>
              </div>

              <div className="cinema-panel rounded-[28px] p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Cast highlights</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {credits.cast?.slice(0, 4).map((cast) => (
                    <Link key={cast.id} href={`/person/${cast.id}`} className="surface-card rounded-[22px] overflow-hidden">
                      {cast.profile_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgProfile + cast.profile_path} alt={cast.name} className="h-[150px] w-full object-cover" />
                      ) : (
                        <div className="flex h-[150px] w-full items-center justify-center bg-[#1a1a1a] text-3xl font-bold text-gray-600">
                          {cast.name?.[0]}
                        </div>
                      )}
                      <div className="p-3">
                        <p className="truncate text-sm font-medium text-white">{cast.name}</p>
                        <p className="truncate text-xs text-white/45">{cast.character}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8 xl:px-12">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Keep going</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">More like this</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {recommendations.slice(0, 12).map((rec) => (
              <Link
                key={rec.id}
                href={withProviderInPath(`/movie/${rec.id}`, activeProvider)}
                className="surface-card group/rec cursor-card relative overflow-hidden rounded-[24px]"
              >
                <div className="aspect-[2/3] relative">
                  {rec.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgPosterSmall + rec.poster_path}
                      alt={rec.title}
                      className="h-full w-full object-cover group-hover/rec:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#1a1a1a]" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3">
                    <p className="line-clamp-2 text-sm font-medium text-white">{rec.title}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
                      <Play size={12} fill="currentColor" />
                      Open movie
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showTrailer && trailerKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setShowTrailer(false)}
        >
          <div className="relative aspect-video w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              allowFullScreen
              allow="autoplay"
              className="h-full w-full rounded-[24px]"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
