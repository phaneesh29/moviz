'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Clock3, ClockPlus, Share2, Star, Tv, Users, Youtube } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoEmbed from '@/components/VideoEmbed';
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

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

function getYear(value?: string) {
  return value?.slice(0, 4) || null;
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
    () => [
      { label: 'Season', value: `S${selectedSeason}` },
      { label: 'Episode', value: `E${selectedEpisode}` },
      { label: 'Aired', value: episode?.air_date || 'Unknown' },
      { label: 'Runtime', value: episode?.runtime ? `${episode.runtime} min` : 'Unknown' },
    ],
    [episode?.air_date, episode?.runtime, selectedEpisode, selectedSeason],
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
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="size-14 animate-spin rounded-full border-[3px] border-[#e50914]/20 border-t-[#e50914]" />
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
    <div className="page-shell min-h-screen text-white">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-12 pt-18 md:px-8 md:pt-20 xl:px-12">
        {series.backdrop_path ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgBackdrop + series.backdrop_path} alt={series.name} className="absolute inset-0 h-full w-full object-cover opacity-[0.18]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.62)_0%,rgba(6,6,6,0.9)_35%,#050505_100%)]" />
          </>
        ) : null}

        <div className="relative mx-auto max-w-[96rem]">
          <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1040px)_380px] xl:justify-between">
            <div className="space-y-6">
              {episode?.id ? (
                <VideoEmbed
                  type="tv"
                  tmdbId={series.id}
                  season={selectedSeason}
                  episode={selectedEpisode}
                  compactActions
                  mediaTitle={activeMediaTitle}
                />
              ) : null}

              <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.92),rgba(9,9,9,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-6 xl:hidden">
                <div className="flex flex-col gap-5 lg:flex-row">
                  <div className="flex gap-4 md:gap-5">
                    {series.poster_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgPosterLarge + series.poster_path} alt={series.name} className="hidden w-[150px] shrink-0 rounded-[24px] object-cover md:block" />
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
                        <span className="rounded-full border border-[#ff6a3d]/25 bg-[#2f120d] px-3 py-1 text-[#ffb08c]">TV series</span>
                        {series.vote_average ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[#ffd27d]">
                            <Star size={12} fill="currentColor" />
                            {series.vote_average.toFixed(1)}
                          </span>
                        ) : null}
                        {series.number_of_seasons ? (
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-white/65">
                            {series.number_of_seasons} season{series.number_of_seasons > 1 ? 's' : ''}
                          </span>
                        ) : null}
                      </div>

                      <h1 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-5xl">{series.name}</h1>
                      {series.tagline ? <p className="mt-2 text-base italic text-white/55 md:text-lg">{series.tagline}</p> : null}

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
                        <span className="inline-flex items-center gap-2">
                          <Clock3 size={14} />
                          {episode?.runtime ? `${episode.runtime} min episode` : `${series.number_of_episodes || 0} total episodes`}
                        </span>
                        <span>{series.first_air_date || 'Unknown'} {series.last_air_date ? `to ${series.last_air_date}` : ''}</span>
                        {series.genres?.length ? <span>{series.genres.map((genre) => genre.name).join(' / ')}</span> : null}
                      </div>

                      <p className="mt-5 text-sm leading-7 text-white/75 md:text-[15px]">
                        {episode?.overview || series.overview || 'No overview available.'}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        {trailerKey ? (
                          <button
                            onClick={() => setShowTrailer(true)}
                            className="accent-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
                          >
                            <Youtube size={16} />
                            Watch trailer
                          </button>
                        ) : null}
                        <button
                          onClick={() => void copyShareLink()}
                          className="glass-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white"
                        >
                          <Share2 size={14} />
                          {shareCopied ? 'Link copied' : 'Share'}
                        </button>
                      <button
                        onClick={() => {
                          const added = addToWatchLater(series.id, 'tv');
                          notify({
                            title: added ? 'Saved to My List' : 'Already in My List',
                            description: series.name,
                          });
                        }}
                        className="glass-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white"
                      >
                          <ClockPlus size={14} />
                          Watch later
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {infoCards.map((card) => (
                    <div key={card.label} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{card.label}</p>
                      <p className="mt-2 text-sm font-medium text-white">{card.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 lg:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#ffb08c]">From the API</p>
                    <div className="mt-3 grid gap-3 text-sm text-white/70 md:grid-cols-2">
                      <div>
                        <p className="text-white/40">Networks</p>
                        <p className="mt-1">{joinList(series.networks?.map((network) => network.name) || [], 6) || 'Unavailable'}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Created by</p>
                        <p className="mt-1">{joinList(series.created_by?.map((creator) => creator.name) || [], 5) || 'Unavailable'}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Production companies</p>
                        <p className="mt-1">{joinList(series.production_companies?.map((company) => company.name) || [], 6) || 'Unavailable'}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Spoken languages</p>
                        <p className="mt-1">
                          {joinList(series.spoken_languages?.map((language) => language.english_name || language.name) || [], 5) ||
                            series.original_language?.toUpperCase() ||
                            'Unavailable'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#ffb08c]">Watch shortcuts</p>
                    <div className="mt-3 space-y-2 text-sm text-white/70">
                      <p><span className="text-white">Left / Right</span> changes episode</p>
                      <p><span className="text-white">T</span> opens trailer</p>
                      <p><span className="text-white">S</span> copies this page</p>
                      <p><span className="text-white">W</span> saves to watch later</p>
                      <p><span className="text-white">[ ]</span> switches servers</p>
                      <p><span className="text-white">R</span> reloads the current server</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.92),rgba(9,9,9,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-6 xl:block">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Suggestions</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Recommended series</h2>
                  </div>
                  <p className="text-sm text-white/45">{suggestionList.length} picks</p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {suggestionList.map((rec) => (
                    <Link
                      key={rec.id}
                      href={withProviderInPath(`/tv/${rec.id}`, activeProvider)}
                      className="surface-card flex gap-3 rounded-[22px] p-3 hover:border-white/20 hover:bg-white/[0.08]"
                    >
                      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-[16px] bg-[#111]">
                        {rec.poster_path ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgPosterSmall + rec.poster_path} alt={rec.name || 'Recommended series'} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/30">
                            <Tv size={20} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold text-white">{rec.name || 'Untitled series'}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/50">
                          {rec.vote_average ? (
                            <span className="inline-flex items-center gap-1 text-[#ffd27d]">
                              <Star size={11} fill="currentColor" />
                              {rec.vote_average.toFixed(1)}
                            </span>
                          ) : null}
                          {getYear(rec.first_air_date) ? <span>{getYear(rec.first_air_date)}</span> : null}
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">{rec.overview || 'Open this recommendation to keep watching.'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.92),rgba(9,9,9,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Full cast</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Series cast below the video and description</h2>
                  </div>
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

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleCastList.map((cast) => (
                    <Link
                      key={`${cast.id}-${cast.character || 'cast'}`}
                      href={`/person/${cast.id}`}
                      className="surface-card flex items-center gap-3 rounded-[22px] p-3 hover:border-white/20 hover:bg-white/[0.08]"
                    >
                      {cast.profile_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgProfile + cast.profile_path} alt={cast.name} className="h-20 w-16 rounded-[16px] object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-20 w-16 items-center justify-center rounded-[16px] bg-[#1a1a1a] text-xl font-semibold text-white/35">
                          {cast.name?.[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{cast.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-white/55">{cast.character || 'Cast member'}</p>
                        {cast.total_episode_count ? <p className="mt-1 text-[11px] text-white/35">{cast.total_episode_count} episodes</p> : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.94),rgba(9,9,9,0.98))] p-5">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Episode navigator</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Episodes</h2>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <select
                        value={selectedSeason}
                        onChange={(event) => {
                          setSelectedSeason(Number(event.target.value));
                          setSelectedEpisode(1);
                        }}
                        className="surface-card appearance-none rounded-full px-4 py-2.5 pr-10 text-sm font-medium text-white focus:border-[#e50914] focus:outline-none"
                      >
                        {Array.from({ length: totalSeasons }, (_, index) => (
                          <option key={index + 1} value={index + 1}>
                            Season {index + 1}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45" />
                    </div>

                    <button
                      onClick={goToPreviousEpisode}
                      disabled={!hasPreviousEpisode}
                      className="rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={goToNextEpisode}
                      disabled={!hasNextEpisode}
                      className="rounded-full bg-[linear-gradient(135deg,#e50914_0%,#ff6a3d_100%)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Next
                    </button>
                  </div>

                  <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
                    {episodes.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedEpisode(item.episode_number)}
                        className={`cursor-card w-full overflow-hidden rounded-[20px] border text-left transition-all ${
                          item.episode_number === selectedEpisode
                            ? 'border-[#ff6a3d]/35 bg-[#29100c] shadow-[0_16px_36px_rgba(229,9,20,0.14)]'
                            : 'surface-card hover:border-white/20 hover:bg-white/[0.08]'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white">Episode {item.episode_number}</p>
                            {item.runtime ? <span className="text-xs text-white/45">{item.runtime}m</span> : null}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-white/70">{item.name}</p>
                          {item.air_date ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">{item.air_date}</p> : null}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.94),rgba(9,9,9,0.98))] p-5 xl:hidden">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Suggestions</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Recommended series</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Recommendations now live in the suggestion rail, closer to the layout you asked for, instead of being pushed to a separate bottom block.
                </p>
              </div>

              <div className="space-y-3 xl:hidden">
                {suggestionList.map((rec) => (
                  <Link
                    key={rec.id}
                    href={withProviderInPath(`/tv/${rec.id}`, activeProvider)}
                    className="surface-card flex gap-3 rounded-[22px] p-3 hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-[16px] bg-[#111]">
                      {rec.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgPosterSmall + rec.poster_path} alt={rec.name || 'Recommended series'} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/30">
                          <Tv size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-white">{rec.name || 'Untitled series'}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/50">
                        {rec.vote_average ? (
                          <span className="inline-flex items-center gap-1 text-[#ffd27d]">
                            <Star size={11} fill="currentColor" />
                            {rec.vote_average.toFixed(1)}
                          </span>
                        ) : null}
                        {getYear(rec.first_air_date) ? <span>{getYear(rec.first_air_date)}</span> : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">{rec.overview || 'Open this recommendation to keep watching.'}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.94),rgba(9,9,9,0.98))] p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Now playing</p>
                <div className="mt-3 space-y-3 text-sm leading-6 text-white/65">
                  <p className="inline-flex items-center gap-2 text-white">
                    <Users size={14} />
                    {episode?.name ? episode.name : `Season ${selectedSeason}, Episode ${selectedEpisode}`}
                  </p>
                  <p>{episode?.overview || 'Episode description will appear here as soon as TMDB returns it.'}</p>
                  <p>Left and right arrow keys move through the current season without a full reload.</p>
                  <p>The provider stays in the URL, so opening a suggested title keeps the same playback source preference.</p>
                </div>
              </div>
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
