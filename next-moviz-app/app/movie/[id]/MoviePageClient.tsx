'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock3, ClockPlus, Play, Share2, Star, Youtube } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoEmbed from '@/components/VideoEmbed';
import { addToWatchLater } from '@/lib/watch-later';
import { imgBackdrop, imgPosterLarge, imgPosterSmall, imgProfile } from '@/lib/media-constants';
import { notify } from '@/lib/notify';
import { parseProvider, withProviderInPath } from '@/lib/provider-query';

type Genre = { id: number; name: string };
type CastMember = { id: number; name: string; character?: string; profile_path?: string; order?: number };
type Credits = { cast?: CastMember[] };
type Recommendation = {
  id: number;
  title?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  poster_path?: string;
};
type Video = { key: string; type?: string; site?: string };

type Movie = {
  id: number;
  title: string;
  overview?: string;
  tagline?: string;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  runtime?: number;
  status?: string;
  original_language?: string;
  spoken_languages?: { english_name?: string; name?: string }[];
  poster_path?: string;
  backdrop_path?: string;
  genres?: Genre[];
  production_companies?: { id: number; name: string }[];
};

type MoviePageClientProps = {
  id: string;
};

function formatRuntime(mins?: number) {
  if (!mins) return null;
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}h ${minutes}m`;
}

function getYear(value?: string) {
  return value?.slice(0, 4) || null;
}

function joinList(values: (string | undefined)[], limit = 4) {
  return values.filter(Boolean).slice(0, limit).join(', ');
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
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
  const [showAllCast, setShowAllCast] = useState(false);

  const activeProvider = useMemo(() => parseProvider(searchParams.get('provider')), [searchParams]);
  const fullCastList = useMemo(
    () => [...(credits.cast || [])].sort((left, right) => (left.order ?? 9999) - (right.order ?? 9999)),
    [credits.cast],
  );
  const visibleCastList = showAllCast ? fullCastList : fullCastList.slice(0, 12);
  const suggestionList = useMemo(() => recommendations.filter((item) => item.poster_path).slice(0, 12), [recommendations]);

  const copyShareLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    notify({
      title: 'Link copied',
      description: movie?.title || 'Movie page link copied to clipboard.',
    });
    window.setTimeout(() => setShareCopied(false), 1600);
  }, [movie?.title]);

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
            videos.find((item) => item.type === 'Trailer' && item.site === 'YouTube') ||
            videos.find((item) => item.site === 'YouTube');
          setTrailerKey(trailer?.key || null);
        }
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        console.error(fetchError);
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      if ((event.key === 't' || event.key === 'T') && trailerKey) {
        event.preventDefault();
        setShowTrailer(true);
        return;
      }

      if ((event.key === 'w' || event.key === 'W') && movie?.id) {
        event.preventDefault();
        const added = addToWatchLater(movie.id, 'movie');
        notify({
          title: added ? 'Saved to My List' : 'Already in My List',
          description: movie.title,
        });
        return;
      }

      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        void copyShareLink();
        return;
      }

      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        window.dispatchEvent(new Event('moviz-player-reload'));
        return;
      }

      if (event.key === ']') {
        event.preventDefault();
        window.dispatchEvent(new Event('moviz-player-next-provider'));
        return;
      }

      if (event.key === '[') {
        event.preventDefault();
        window.dispatchEvent(new Event('moviz-player-previous-provider'));
        return;
      }

      if (event.key === 'Escape') {
        setShowTrailer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copyShareLink, movie?.id, movie?.title, trailerKey]);

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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />

      <section className="relative px-4 pb-12 pt-22 md:px-8 md:pt-24 xl:px-12">
        {movie.backdrop_path ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgBackdrop + movie.backdrop_path} alt={movie.title} className="absolute inset-0 h-full w-full object-cover opacity-[0.14]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,15,0.82)_0%,rgba(15,15,15,0.95)_35%,#0f0f0f_100%)]" />
          </>
        ) : null}

        <div className="relative mx-auto max-w-[96rem]">
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1040px)_370px] xl:justify-between">
            <div className="space-y-5">
              <VideoEmbed type="movie" tmdbId={movie.id} compactActions mediaTitle={movie.title} />

              <div className="rounded-[22px] border border-white/10 bg-[#181818] p-5 md:p-6">
                <div className="flex gap-4">
                  {movie.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgPosterLarge + movie.poster_path} alt={movie.title} className="hidden w-[130px] shrink-0 rounded-[18px] object-cover md:block" />
                  ) : null}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
                      <span className="rounded-full bg-[#272727] px-3 py-1 text-white">Movie</span>
                      {getYear(movie.release_date) ? <span>{getYear(movie.release_date)}</span> : null}
                      {movie.vote_average ? (
                        <span className="inline-flex items-center gap-1 text-[#ffd27d]">
                          <Star size={11} fill="currentColor" />
                          {movie.vote_average.toFixed(1)}
                        </span>
                      ) : null}
                      {movie.runtime ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={12} />
                          {formatRuntime(movie.runtime)}
                        </span>
                      ) : null}
                    </div>

                    <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">{movie.title}</h1>
                    {movie.tagline ? <p className="mt-2 text-sm text-white/55">{movie.tagline}</p> : null}
                    <p className="mt-4 text-sm leading-7 text-white/74">{movie.overview || 'No overview available.'}</p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {trailerKey ? (
                        <button
                          onClick={() => setShowTrailer(true)}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
                        >
                          <Youtube size={15} />
                          Trailer
                        </button>
                      ) : null}
                      <button
                        onClick={() => void copyShareLink()}
                        className="inline-flex items-center gap-2 rounded-full bg-[#272727] px-5 py-3 text-sm font-medium text-white"
                      >
                        <Share2 size={14} />
                        {shareCopied ? 'Copied' : 'Share'}
                      </button>
                      <button
                        onClick={() => {
                          const added = addToWatchLater(movie.id, 'movie');
                          notify({
                            title: added ? 'Saved to My List' : 'Already in My List',
                            description: movie.title,
                          });
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#272727] px-5 py-3 text-sm font-medium text-white"
                      >
                        <ClockPlus size={14} />
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[18px] bg-[#222] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Genres</p>
                    <p className="mt-2 text-sm text-white">{joinList(movie.genres?.map((genre) => genre.name) || [], 5) || 'Unavailable'}</p>
                  </div>
                  <div className="rounded-[18px] bg-[#222] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Language</p>
                    <p className="mt-2 text-sm text-white">
                      {movie.spoken_languages?.[0]?.english_name || movie.original_language?.toUpperCase() || 'Unavailable'}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-[#222] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Studio</p>
                    <p className="mt-2 text-sm text-white">{joinList(movie.production_companies?.map((company) => company.name) || [], 3) || 'Unavailable'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-[#181818] p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Cast</h2>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-white/45">{visibleCastList.length} shown</p>
                    {fullCastList.length > 12 ? (
                      <button
                        onClick={() => setShowAllCast((value) => !value)}
                        className="rounded-full bg-[#272727] px-4 py-2 text-xs font-medium text-white"
                      >
                        {showAllCast ? 'Show less' : `Show more (${fullCastList.length})`}
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleCastList.map((cast) => (
                    <Link
                      key={`${cast.id}-${cast.character || 'cast'}`}
                      href={`/person/${cast.id}`}
                      className="flex items-center gap-3 rounded-[18px] bg-[#222] p-3 hover:bg-[#2a2a2a]"
                    >
                      {cast.profile_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgProfile + cast.profile_path} alt={cast.name} className="h-16 w-16 rounded-[14px] object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-[#303030] text-lg font-semibold text-white/40">
                          {cast.name?.[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{cast.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-white/50">{cast.character || 'Cast'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-3">
              <div className="rounded-[22px] border border-white/10 bg-[#181818] p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Watch next</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Recommendations</h2>
              </div>

              {suggestionList.map((rec) => (
                <Link
                  key={rec.id}
                  href={withProviderInPath(`/movie/${rec.id}`, activeProvider)}
                  className="flex gap-3 rounded-[18px] border border-white/10 bg-[#181818] p-3 hover:bg-[#202020]"
                >
                  <div className="h-20 w-36 shrink-0 overflow-hidden rounded-[14px] bg-[#111]">
                    {rec.poster_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgPosterSmall + rec.poster_path} alt={rec.title || 'Recommended movie'} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/30">
                        <Play size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium text-white">{rec.title || 'Untitled movie'}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
                      {rec.vote_average ? (
                        <span className="inline-flex items-center gap-1 text-[#ffd27d]">
                          <Star size={11} fill="currentColor" />
                          {rec.vote_average.toFixed(1)}
                        </span>
                      ) : null}
                      {getYear(rec.release_date) ? <span>{getYear(rec.release_date)}</span> : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/50">
                      {rec.overview || 'Open this title to keep watching.'}
                    </p>
                  </div>
                </Link>
              ))}
            </aside>
          </div>
        </div>
      </section>

      {showTrailer && trailerKey ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setShowTrailer(false)}>
          <div className="relative aspect-video w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              allowFullScreen
              allow="autoplay"
              className="h-full w-full rounded-[24px]"
            />
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}
