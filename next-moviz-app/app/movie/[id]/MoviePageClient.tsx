'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ClockPlus,
  ExternalLink,
  Play,
  Share2,
  Star,
  Youtube,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoEmbed from '@/components/VideoEmbed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
type Video = {
  key: string;
  type?: string;
  site?: string;
  name?: string;
  official?: boolean;
  published_at?: string;
  size?: number;
};

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
  homepage?: string;
  original_language?: string;
  imdb_id?: string;
  spoken_languages?: { english_name?: string; name?: string }[];
  poster_path?: string;
  backdrop_path?: string;
  genres?: Genre[];
  production_companies?: { id: number; name: string }[];
  production_countries?: { iso_3166_1?: string; name?: string }[];
  belongs_to_collection?: { id?: number; name?: string };
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

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
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
  const [videos, setVideos] = useState<Video[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [showAllCast, setShowAllCast] = useState(false);

  const activeProvider = useMemo(() => parseProvider(searchParams.get('provider')), [searchParams]);
  const fullCastList = useMemo(
    () => [...(credits.cast || [])].sort((left, right) => (left.order ?? 9999) - (right.order ?? 9999)),
    [credits.cast],
  );
  const visibleCastList = showAllCast ? fullCastList : fullCastList.slice(0, 12);
  const suggestionList = useMemo(() => recommendations.filter((item) => item.poster_path).slice(0, 12), [recommendations]);
  const featuredVideo = useMemo(
    () =>
      videos.find((item) => item.site === 'YouTube' && item.type === 'Trailer' && item.official) ||
      videos.find((item) => item.site === 'YouTube' && item.type === 'Trailer') ||
      videos.find((item) => item.site === 'YouTube') ||
      null,
    [videos],
  );
  const primaryVideos = useMemo(
    () => videos.filter((item) => item.site === 'YouTube').slice(0, 6),
    [videos],
  );
  const releaseYear = getYear(movie?.release_date);
  const runtimeLabel = formatRuntime(movie?.runtime);
  const genreLabel = joinList(movie?.genres?.map((genre) => genre.name) || [], 5) || 'Unavailable';
  const languageLabel = movie?.spoken_languages?.[0]?.english_name || movie?.original_language?.toUpperCase() || 'Unavailable';
  const studioLabel = joinList(movie?.production_companies?.map((company) => company.name) || [], 3) || 'Unavailable';
  const countryLabel = joinList(movie?.production_countries?.map((country) => country.name) || [], 3) || 'Unavailable';
  const collectionLabel = movie?.belongs_to_collection?.name;

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
          setVideos(data.results?.results || []);
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

      if ((event.key === 't' || event.key === 'T') && featuredVideo) {
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
  }, [copyShareLink, featuredVideo, movie?.id, movie?.title]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
        <Navbar />
        <main className="px-4 pb-12 pt-28 md:px-8 xl:px-12">
          <div className="mx-auto grid max-w-[96rem] gap-6 xl:grid-cols-[minmax(0,1040px)_370px]">
            <div className="flex flex-col gap-5">
              <Skeleton className="aspect-video min-h-[320px] rounded-[30px] bg-white/10 md:min-h-[520px]" />
              <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-5 md:p-6">
                <div className="flex gap-4">
                  <Skeleton className="hidden h-48 w-[130px] shrink-0 rounded-[18px] bg-white/10 md:block" />
                  <div className="flex flex-1 flex-col gap-3">
                    <Skeleton className="h-10 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                    <Skeleton className="h-20 w-full bg-white/10" />
                    <Skeleton className="h-10 w-40 rounded-full bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden flex-col gap-4 xl:flex">
              <Skeleton className="h-40 rounded-[22px] bg-white/10" />
              <Skeleton className="h-72 rounded-[22px] bg-white/10" />
            </div>
          </div>
        </main>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 text-white">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-14 pt-8 md:px-8 md:pt-10 xl:px-12">
        {movie.backdrop_path ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgBackdrop + movie.backdrop_path} alt={movie.title} className="absolute inset-0 h-full w-full object-cover opacity-[0.14]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.96)_38%,#020617_100%)]" />
          </>
        ) : null}

        <div className="relative mx-auto max-w-[96rem]">
          <div className="grid auto-rows-[minmax(110px,auto)] gap-4 xl:grid-cols-12">
            <div className="xl:col-span-12 min-h-[calc(100vh-5.25rem)] rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-2.5 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.75)] backdrop-blur-xl md:min-h-[calc(100vh-5.5rem)] md:p-3">
              <VideoEmbed type="movie" tmdbId={movie.id} compactActions viewportFit mediaTitle={movie.title} />
            </div>

            <Card className="border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.025] backdrop-blur-xl xl:col-span-8 xl:row-span-2">
              <CardHeader className="border-b border-white/10 px-5 pb-4 pt-5 md:px-6">
                <CardTitle className="text-white">Movie Details</CardTitle>
                <CardDescription>{movie.tagline || 'Cast, metadata and production details.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-5 pb-5 pt-4 md:px-6">
                <div className="flex gap-4">
                  {movie.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgPosterLarge + movie.poster_path} alt={movie.title} className="hidden w-[120px] shrink-0 rounded-[16px] object-cover sm:block" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                      <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">Movie</Badge>
                      {releaseYear ? <Badge variant="outline" className="border-white/15 bg-white/5 text-white/70">{releaseYear}</Badge> : null}
                      {runtimeLabel ? <Badge variant="outline" className="border-white/15 bg-white/5 text-white/70">{runtimeLabel}</Badge> : null}
                      {movie.vote_average ? (
                        <Badge variant="outline" className="border-amber-400/25 bg-amber-400/10 text-amber-300">
                          <Star size={11} className="fill-amber-300 text-amber-300" />
                          {movie.vote_average.toFixed(1)}
                        </Badge>
                      ) : null}
                    </div>

                    <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight md:text-3xl">{movie.title}</h1>
                    <p className="mt-3 text-sm leading-6 text-white/75">{movie.overview || 'No overview available.'}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {featuredVideo ? (
                        <Button
                          onClick={() => {
                            setActiveVideoKey(featuredVideo.key);
                            setShowTrailer(true);
                          }}
                          className="gap-2 rounded-full bg-white px-4 text-xs font-semibold text-black hover:bg-white/90"
                        >
                          <Youtube size={14} />
                          Trailer
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        onClick={() => void copyShareLink()}
                        className="gap-2 rounded-full border-white/15 bg-white/5 px-4 text-xs font-medium text-white hover:bg-white/10"
                      >
                        <Share2 size={13} />
                        {shareCopied ? 'Copied' : 'Share'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const added = addToWatchLater(movie.id, 'movie');
                          notify({
                            title: added ? 'Saved to My List' : 'Already in My List',
                            description: movie.title,
                          });
                        }}
                        className="gap-2 rounded-full border-white/15 bg-white/5 px-4 text-xs font-medium text-white hover:bg-white/10"
                      >
                        <ClockPlus size={13} />
                        Save
                      </Button>
                      {movie.homepage ? (
                        <Button
                          variant="ghost"
                          onClick={() => window.open(movie.homepage, '_blank', 'noopener,noreferrer')}
                          className="gap-2 rounded-full px-4 text-xs font-medium text-blue-300 hover:bg-blue-500/10 hover:text-blue-200"
                        >
                          <ExternalLink size={13} />
                          Official site
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Genres</p>
                    <p className="mt-2 text-sm text-white/85">{genreLabel}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Language</p>
                    <p className="mt-2 text-sm text-white/85">{languageLabel}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Studio</p>
                    <p className="mt-2 text-sm text-white/85">{studioLabel}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Country</p>
                    <p className="mt-2 text-sm text-white/85">{countryLabel}</p>
                  </div>
                </div>

                {collectionLabel ? (
                  <div className="rounded-[16px] border border-blue-400/20 bg-blue-500/10 p-3 text-sm text-blue-100/90">
                    Part of the {collectionLabel} collection.
                  </div>
                ) : null}

                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h2 className="text-base font-semibold text-white">Cast</h2>
                    {fullCastList.length > 12 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllCast((value) => !value)}
                        className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                      >
                        {showAllCast ? 'Show less' : `Show more (${fullCastList.length})`}
                      </Button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {visibleCastList.map((cast) => (
                      <Link
                        key={`${cast.id}-${cast.character || 'cast'}`}
                        href={`/person/${cast.id}`}
                        className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-black/20 p-3 transition-colors hover:bg-white/[0.06]"
                      >
                        {cast.profile_path ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgProfile + cast.profile_path} alt={cast.name} className="h-14 w-14 rounded-[12px] object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-white/10 text-base font-semibold text-white/40">
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
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] backdrop-blur-xl xl:col-span-4">
              <CardHeader className="border-b border-white/10 px-5 pb-4 pt-5">
                <CardTitle className="text-white">At a glance</CardTitle>
                <CardDescription>Core movie metrics and highlight trailer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[16px] border border-white/15 bg-black/25 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Rating</p>
                    <p className="mt-2 text-lg font-semibold text-white">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/15 bg-black/25 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Votes</p>
                    <p className="mt-2 text-lg font-semibold text-white">{movie.vote_count?.toLocaleString() || 'N/A'}</p>
                  </div>
                  {movie.release_date ? (
                    <div className="rounded-[16px] border border-white/15 bg-black/25 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Released</p>
                      <p className="mt-2 text-lg font-semibold text-white">{formatDate(movie.release_date)}</p>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[16px] border border-white/15 bg-black/25 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-100/70">Featured Video</p>
                  <p className="mt-2 text-sm font-medium text-white">{featuredVideo?.name || 'No trailer found yet.'}</p>
                  <p className="mt-1 text-xs text-white/60">
                    {featuredVideo ? `${featuredVideo.type || 'Video'} • ${formatDate(featuredVideo.published_at) || 'Recent'}` : 'TMDB video data will appear here.'}
                  </p>
                  {featuredVideo ? (
                    <Button
                      onClick={() => {
                        setActiveVideoKey(featuredVideo.key);
                        setShowTrailer(true);
                      }}
                      className="mt-3 w-full rounded-full bg-white text-black hover:bg-white/90"
                    >
                      Play now
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] backdrop-blur-xl xl:col-span-4 xl:row-span-2">
              <CardHeader className="border-b border-white/10 px-5 pb-4 pt-5">
                <CardTitle className="text-white">Recommendations & Videos</CardTitle>
                <CardDescription>Useful highlights from TMDB video and recommendation data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Videos</p>
                    <p className="mt-2 text-lg font-semibold text-white">{videos.length}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Recs</p>
                    <p className="mt-2 text-lg font-semibold text-white">{suggestionList.length}</p>
                  </div>
                </div>

                <div className="rounded-[16px] border border-blue-400/20 bg-blue-500/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/80">Featured Video</p>
                  <p className="mt-2 text-sm font-medium text-blue-50">{featuredVideo?.name || 'No trailer found yet.'}</p>
                  <p className="mt-1 text-xs text-blue-100/70">
                    {featuredVideo ? `${featuredVideo.type || 'Video'} • ${formatDate(featuredVideo.published_at) || 'Recent'} • ${featuredVideo.official ? 'Official' : 'Community'}` : 'TMDB video data will appear here.'}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">Top videos</p>
                  <div className="space-y-2">
                    {primaryVideos.slice(0, 4).map((video) => (
                      <button
                        key={video.key}
                        onClick={() => {
                          setActiveVideoKey(video.key);
                          setShowTrailer(true);
                        }}
                        className="w-full rounded-[14px] border border-white/10 bg-black/20 p-3 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <p className="line-clamp-1 text-sm font-medium text-white">{video.name || 'Untitled clip'}</p>
                        <p className="mt-1 text-xs text-white/50">{video.type || 'Video'} • {formatDate(video.published_at) || 'Recent'}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">Recommended titles</p>
                  <div className="space-y-2">
                    {suggestionList.slice(0, 5).map((rec) => (
                      <Link
                        key={rec.id}
                        href={withProviderInPath(`/movie/${rec.id}`, activeProvider)}
                        className="flex gap-3 rounded-[14px] border border-white/10 bg-black/20 p-2.5 transition-colors hover:bg-white/[0.06]"
                      >
                        <div className="h-16 w-12 shrink-0 overflow-hidden rounded-[10px] bg-[#111]">
                          {rec.poster_path ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgPosterSmall + rec.poster_path} alt={rec.title || 'Recommended movie'} className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/30">
                              <Play size={14} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-medium text-white">{rec.title || 'Untitled movie'}</p>
                          <p className="mt-1 text-xs text-white/50">{getYear(rec.release_date) || 'Upcoming'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {showTrailer && (featuredVideo || activeVideoKey) ? (
        (() => {
          const currentVideo = videos.find((video) => video.key === activeVideoKey) || featuredVideo;
          if (!currentVideo) return null;
          return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => {
            setShowTrailer(false);
            setActiveVideoKey(null);
          }}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Featured video</p>
                <h3 className="text-base font-semibold text-white">{currentVideo.name || 'Trailer'}</h3>
              </div>
              <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">
                {currentVideo.type || 'Video'}
              </Badge>
            </div>
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.key}?autoplay=1`}
              title="Trailer"
              allowFullScreen
              allow="autoplay"
              className="aspect-video h-full w-full"
            />
          </div>
        </div>
          );
        })()
      ) : null}

      <Footer />
    </div>
  );
}
