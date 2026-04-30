'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClockPlus, Play, Share2, Star, Youtube } from 'lucide-react';
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

type Episode = {
  id: number;
  episode_number: number;
  name: string;
  runtime?: number;
  air_date?: string;
  still_path?: string;
  overview?: string;
};

type Series = {
  id: number;
  name: string;
  overview?: string;
  tagline?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  first_air_date?: string;
  last_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  original_language?: string;
  spoken_languages?: { english_name?: string; name?: string }[];
  genres?: { id: number; name: string }[];
  created_by?: { id: number; name: string }[];
  networks?: { id: number; name: string }[];
  production_companies?: { id: number; name: string }[];
};

type Season = { episodes?: Episode[] };

type SeriesCastMember = {
  id: number;
  name: string;
  character?: string;
  roles?: { character?: string; episode_count?: number }[];
  profile_path?: string;
  order?: number;
  total_episode_count?: number;
};

type Credits = {
  cast?: SeriesCastMember[];
};

type Recommendation = {
  id: number;
  name?: string;
  overview?: string;
  vote_average?: number;
  first_air_date?: string;
  poster_path?: string;
};

type TvPageClientProps = {
  id: string;
  initialSeason: number;
  initialEpisode: number;
};

function joinList(values: (string | undefined)[], limit = 5) {
  return values.filter(Boolean).slice(0, limit).join(', ');
}

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function getYear(value?: string) {
  return value?.slice(0, 4) || null;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

export default function TvPageClient({ id, initialSeason, initialEpisode }: TvPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [series, setSeries] = useState<Series | null>(null);
  const [season, setSeason] = useState<Season>({});
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [credits, setCredits] = useState<Credits>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showAllCast, setShowAllCast] = useState(false);

  const activeProvider = useMemo(() => parseProvider(searchParams.get('provider')), [searchParams]);

  useEffect(() => {
    if (!id) return;

    const nextParams = new URLSearchParams();
    nextParams.set('season', String(selectedSeason));
    nextParams.set('episode', String(selectedEpisode));
    if (activeProvider) {
      nextParams.set('provider', activeProvider);
    }

    const nextQuery = nextParams.toString();
    const currentQuery = new URLSearchParams(window.location.search).toString();

    if (nextQuery === currentQuery) return;
    router.replace(`/tv/${id}?${nextQuery}`);
  }, [activeProvider, id, selectedEpisode, selectedSeason, router]);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchStaticData = async () => {
      setLoading(true);
      setError('');

      try {
        const [seriesRes, creditsRes, recRes, videosRes] = await Promise.all([
          fetch(`/api/tv/${id}`, { signal: controller.signal }),
          fetch(`/api/tv/${id}/credits`, { signal: controller.signal }),
          fetch(`/api/tv/${id}/recommendations`, { signal: controller.signal }),
          fetch(`/api/tv/${id}/videos`, { signal: controller.signal }),
        ]);

        if (!seriesRes.ok) {
          const movieFallback = await fetch(`/api/movie/${id}/get`, { signal: controller.signal });
          if (movieFallback.ok) {
            router.replace(withProviderInPath(`/movie/${id}`, activeProvider));
            return;
          }
          throw new Error('Failed to load series');
        }

        const seriesData = (await seriesRes.json()) as { results?: Series };
        setSeries(seriesData.results || null);

        if (creditsRes.ok) {
          const creditsData = (await creditsRes.json()) as { results?: Credits };
          setCredits(creditsData.results || {});
        }

        if (recRes.ok) {
          const recData = (await recRes.json()) as { results?: { results?: Recommendation[] } };
          setRecommendations(recData.results?.results || []);
        }

        if (videosRes.ok) {
          const videosData = (await videosRes.json()) as {
            results?: { results?: { key: string; type?: string; site?: string }[] };
          };
          const videos = videosData.results?.results || [];
          const trailer =
            videos.find((item) => item.type === 'Trailer' && item.site === 'YouTube') ||
            videos.find((item) => item.site === 'YouTube');
          setTrailerKey(trailer?.key || null);
        }
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        console.error(fetchError);
        setError('Failed to load TV series data');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchStaticData();

    return () => controller.abort();
  }, [activeProvider, id, router]);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchEpisodeData = async () => {
      try {
        const [seasonRes, episodeRes] = await Promise.all([
          fetch(`/api/tv/${id}/season/${selectedSeason}`, { signal: controller.signal }),
          fetch(`/api/tv/${id}/season/${selectedSeason}/episode/${selectedEpisode}`, { signal: controller.signal }),
        ]);

        if (seasonRes.ok) {
          const seasonData = (await seasonRes.json()) as { results?: Season };
          setSeason(seasonData.results || {});
        }

        if (episodeRes.ok) {
          const episodeData = (await episodeRes.json()) as { results?: Episode };
          setEpisode(episodeData.results || null);
        }
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        console.error(fetchError);
        setError('Failed to load episode data');
      }
    };

    void fetchEpisodeData();

    return () => controller.abort();
  }, [id, selectedEpisode, selectedSeason]);

  const totalSeasons = useMemo(() => Math.max(1, series?.number_of_seasons || 1), [series?.number_of_seasons]);
  const episodes = useMemo(() => season.episodes ?? [], [season.episodes]);
  const activeEpisodeIndex = useMemo(
    () => episodes.findIndex((item) => item.episode_number === selectedEpisode),
    [episodes, selectedEpisode],
  );
  const hasPreviousEpisode = activeEpisodeIndex > 0;
  const hasNextEpisode = activeEpisodeIndex >= 0 && activeEpisodeIndex < episodes.length - 1;
  const activeMediaTitle = episode?.name ? `${series?.name || 'Series'} S${selectedSeason}E${selectedEpisode} ${episode.name}` : series?.name || 'Series';
  const fullCastList = useMemo(
    () =>
      [...(credits.cast || [])]
        .sort((left, right) => (left.order ?? 9999) - (right.order ?? 9999))
        .map((member) => ({
          ...member,
          character: member.roles?.[0]?.character || member.character,
        })),
    [credits.cast],
  );
  const visibleCastList = useMemo(() => (showAllCast ? fullCastList : fullCastList.slice(0, 12)), [fullCastList, showAllCast]);
  const suggestionList = useMemo(() => recommendations.filter((item) => item.poster_path).slice(0, 14), [recommendations]);
  const infoCards = useMemo(
    () => {
      const cards = [
        { label: 'Season', value: `S${selectedSeason}` },
        { label: 'Episode', value: `E${selectedEpisode}` },
        { label: 'Aired', value: episode?.air_date || 'Unknown' },
        { label: 'Runtime', value: episode?.runtime ? `${episode.runtime} min` : 'Unknown' },
      ];
      if (series?.first_air_date) {
        cards.push({ label: 'Premiered', value: series.first_air_date });
      }
      return cards;
    },
    [episode?.air_date, episode?.runtime, selectedEpisode, selectedSeason, series?.first_air_date],
  );

  const goToPreviousEpisode = () => {
    if (!hasPreviousEpisode) return;
    const previous = episodes[activeEpisodeIndex - 1];
    if (!previous) return;
    setSelectedEpisode(previous.episode_number);
  };

  const goToNextEpisode = () => {
    if (!hasNextEpisode) return;
    const next = episodes[activeEpisodeIndex + 1];
    if (!next) return;
    setSelectedEpisode(next.episode_number);
  };

  const copyShareLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    notify({
      title: 'Link copied',
      description: series?.name || 'Series page link copied to clipboard.',
    });
    window.setTimeout(() => setShareCopied(false), 1600);
  }, [series?.name]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      if (event.key === 'ArrowLeft') {
        if (!hasPreviousEpisode) return;
        event.preventDefault();
        const previous = episodes[activeEpisodeIndex - 1];
        if (previous) {
          setSelectedEpisode(previous.episode_number);
        }
        return;
      }

      if (event.key === 'ArrowRight') {
        if (!hasNextEpisode) return;
        event.preventDefault();
        const next = episodes[activeEpisodeIndex + 1];
        if (next) {
          setSelectedEpisode(next.episode_number);
        }
        return;
      }

      if (event.key === 't' || event.key === 'T') {
        if (!trailerKey) return;
        event.preventDefault();
        setShowTrailer(true);
        return;
      }

      if (event.key === 'w' || event.key === 'W') {
        if (!series?.id) return;
        event.preventDefault();
        const added = addToWatchLater(series.id, 'tv');
        notify({
          title: added ? 'Saved to My List' : 'Already in My List',
          description: series.name,
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
  }, [activeEpisodeIndex, copyShareLink, episodes, hasNextEpisode, hasPreviousEpisode, series?.id, series?.name, trailerKey]);

  if (loading && !series) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
        <Navbar />
        <main className="px-4 pb-12 pt-28 md:px-8 xl:px-12">
          <div className="mx-auto grid max-w-[96rem] gap-8 xl:grid-cols-[minmax(0,1040px)_380px]">
            <div className="flex flex-col gap-6">
              <Skeleton className="aspect-video min-h-[320px] rounded-[30px] bg-white/10 md:min-h-[520px]" />
              <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 md:p-6">
                <div className="flex gap-4">
                  <Skeleton className="hidden h-48 w-[130px] shrink-0 rounded-[18px] bg-white/10 md:block" />
                  <div className="flex flex-1 flex-col gap-3">
                    <Skeleton className="h-10 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                    <Skeleton className="h-20 w-full bg-white/10" />
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-16 rounded-2xl bg-white/10" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden flex-col gap-4 xl:flex">
              <Skeleton className="h-48 rounded-[22px] bg-white/10" />
              <Skeleton className="h-80 rounded-[22px] bg-white/10" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="page-shell min-h-screen px-4 pt-24 text-white">
        <Navbar />
        <p className="text-center text-red-400">{error || 'Series not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 text-white">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-14 pt-8 md:px-8 md:pt-10 xl:px-12">
        {series.backdrop_path ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgBackdrop + series.backdrop_path} alt={series.name} className="absolute inset-0 h-full w-full object-cover opacity-[0.14]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.96)_38%,#020617_100%)]" />
          </>
        ) : null}

        <div className="relative mx-auto max-w-[96rem]">
          <div className="grid auto-rows-[minmax(110px,auto)] gap-4 xl:grid-cols-12">
            <div className="xl:col-span-12 min-h-[calc(100vh-5.25rem)] rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-2.5 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.75)] backdrop-blur-xl md:min-h-[calc(100vh-5.5rem)] md:p-3">
              <VideoEmbed type="tv" tmdbId={series.id} season={selectedSeason} episode={selectedEpisode} compactActions viewportFit mediaTitle={activeMediaTitle} />
            </div>

            <Card className="border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.025] backdrop-blur-xl xl:col-span-8 xl:row-span-2">
              <CardHeader className="border-b border-white/10 px-5 pb-4 pt-5 md:px-6">
                <CardTitle className="text-white">Series Details</CardTitle>
                <CardDescription>{series.tagline || 'Cast, metadata and production details.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-5 pb-5 pt-4 md:px-6">
                <div className="flex gap-4">
                  {series.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgPosterLarge + series.poster_path} alt={series.name} className="hidden w-[120px] shrink-0 rounded-[16px] object-cover sm:block" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                      <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">TV Series</Badge>
                      {series.number_of_seasons ? <Badge variant="outline" className="border-white/15 bg-white/5 text-white/70">{series.number_of_seasons} season{series.number_of_seasons > 1 ? 's' : ''}</Badge> : null}
                      {series.vote_average ? (
                        <Badge variant="outline" className="border-amber-400/25 bg-amber-400/10 text-amber-300">
                          <Star size={11} className="fill-amber-300 text-amber-300" />
                          {series.vote_average.toFixed(1)}
                        </Badge>
                      ) : null}
                    </div>

                    <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight md:text-3xl">{series.name}</h1>
                    <p className="mt-3 text-sm leading-6 text-white/75">{series.overview || 'No overview available.'}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {trailerKey ? (
                        <Button
                          onClick={() => setShowTrailer(true)}
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
                          const added = addToWatchLater(series.id, 'tv');
                          notify({
                            title: added ? 'Saved to My List' : 'Already in My List',
                            description: series.name,
                          });
                        }}
                        className="gap-2 rounded-full border-white/15 bg-white/5 px-4 text-xs font-medium text-white hover:bg-white/10"
                      >
                        <ClockPlus size={13} />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Genres</p>
                    <p className="mt-2 text-sm text-white/85">{series.genres?.map((g) => g.name).join(', ') || 'N/A'}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Networks</p>
                    <p className="mt-2 text-sm text-white/85">{series.networks?.map((n) => n.name).join(', ') || 'N/A'}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Language</p>
                    <p className="mt-2 text-sm text-white/85">{series.original_language?.toUpperCase() || 'N/A'}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Episodes</p>
                    <p className="mt-2 text-sm text-white/85">{series.number_of_episodes || 0}</p>
                  </div>
                </div>

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
                <CardTitle className="text-white">Episodes</CardTitle>
                <CardDescription>Navigate through available episodes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2">Season</label>
                  <select
                    value={selectedSeason}
                    onChange={(event) => {
                      setSelectedSeason(Number(event.target.value));
                      setSelectedEpisode(1);
                    }}
                    className="w-full rounded-[12px] border border-white/10 bg-black/20 px-3 py-2 text-sm text-white hover:border-white/20 focus:border-white/30 focus:outline-none"
                  >
                    {Array.from({ length: totalSeasons }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        Season {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={goToPreviousEpisode}
                    disabled={!hasPreviousEpisode}
                    variant="outline"
                    className="flex-1 rounded-full border-white/15 bg-white/5 text-xs hover:bg-white/10 disabled:opacity-40"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={goToNextEpisode}
                    disabled={!hasNextEpisode}
                    className="flex-1 rounded-full bg-white px-3 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-40"
                  >
                    Next
                  </Button>
                </div>

                <div className="max-h-[240px] space-y-2 overflow-y-auto pr-2">
                  {episodes.slice(0, 8).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedEpisode(item.episode_number)}
                      className={`w-full rounded-[12px] border p-2.5 text-left text-xs transition-all ${
                        item.episode_number === selectedEpisode
                          ? 'border-white/30 bg-white/10'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <p className="font-semibold text-white">E{item.episode_number}: {item.name}</p>
                      {item.runtime ? <p className="mt-1 text-white/50">{item.runtime} min</p> : null}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] backdrop-blur-xl xl:col-span-4">
              <CardHeader className="border-b border-white/10 px-5 pb-4 pt-5">
                <CardTitle className="text-white">At a glance</CardTitle>
                <CardDescription>Core series metrics and episode info.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[16px] border border-white/15 bg-black/25 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Rating</p>
                    <p className="mt-2 text-lg font-semibold text-white">{series.vote_average ? series.vote_average.toFixed(1) : 'N/A'}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/15 bg-black/25 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Votes</p>
                    <p className="mt-2 text-lg font-semibold text-white">{series.vote_count?.toLocaleString() || 'N/A'}</p>
                  </div>
                  {series.first_air_date ? (
                    <div className="rounded-[16px] border border-white/15 bg-black/25 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Premiered</p>
                      <p className="mt-2 text-lg font-semibold text-white">{formatDate(series.first_air_date) || 'N/A'}</p>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[16px] border border-white/15 bg-black/25 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-100/70">Current Episode</p>
                  <p className="mt-2 text-sm font-medium text-white">S{selectedSeason}E{selectedEpisode}</p>
                  <p className="mt-1 text-xs text-white/60">
                    {episode?.name || 'Episode data loading...'}
                  </p>
                  {episode?.air_date ? (
                    <p className="mt-1 text-xs text-white/50">{formatDate(episode.air_date)}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] backdrop-blur-xl xl:col-span-4">
              <CardHeader className="border-b border-white/10 px-5 pb-4 pt-5">
                <CardTitle className="text-white">Recommendations</CardTitle>
                <CardDescription>Discover similar series.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 px-5 pb-5 pt-4">
                {suggestionList.slice(0, 5).map((rec) => (
                  <Link
                    key={rec.id}
                    href={withProviderInPath(`/tv/${rec.id}`, activeProvider)}
                    className="flex gap-3 rounded-[14px] border border-white/10 bg-black/20 p-2.5 transition-colors hover:bg-white/[0.06]"
                  >
                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-[10px] bg-[#111]">
                      {rec.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgPosterSmall + rec.poster_path} alt={rec.name || 'Recommended series'} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/30">
                          <Play size={14} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium text-white">{rec.name || 'Untitled series'}</p>
                      <p className="mt-1 text-xs text-white/50">{getYear(rec.first_air_date) || 'Upcoming'}</p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {showTrailer && trailerKey ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Series trailer</p>
                <h3 className="text-base font-semibold text-white">{series.name}</h3>
              </div>
              <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">
                Trailer
              </Badge>
            </div>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              allowFullScreen
              allow="autoplay"
              className="aspect-video h-full w-full"
            />
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}
