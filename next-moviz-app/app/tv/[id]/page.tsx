'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ClockPlus, Play, Share2, Star, Tv, Youtube } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoEmbed from '@/components/VideoEmbed';
import { addToWatchLater } from '@/lib/watch-later';
import { imgBackdrop, imgPosterLarge, imgPosterSmall, imgProfile } from '@/lib/media-constants';

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
  first_air_date?: string;
  last_air_date?: string;
  number_of_seasons?: number;
  genres?: { id: number; name: string }[];
};

type Season = { episodes?: Episode[] };

type Credits = {
  cast?: { id: number; name: string; character?: string; profile_path?: string }[];
};

export default function TvPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = params?.id;
  const initialSeason = Number(searchParams.get('season')) || 1;
  const initialEpisode = Number(searchParams.get('episode')) || 1;
  const providerQueryRef = useRef(searchParams.get('provider'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [series, setSeries] = useState<Series | null>(null);
  const [season, setSeason] = useState<Season>({});
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [credits, setCredits] = useState<Credits>({});
  const [recommendations, setRecommendations] = useState<Series[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('season', String(selectedSeason));
    params.set('episode', String(selectedEpisode));
    if (providerQueryRef.current) {
      params.set('provider', providerQueryRef.current);
    }
    router.replace(`/tv/${id}?${params.toString()}`);
  }, [id, selectedSeason, selectedEpisode, router]);

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      setLoading(true);
      setError('');

      try {
        const [seriesRes, seasonRes, episodeRes, creditsRes, recRes, videosRes] = await Promise.all([
          fetch(`/api/tv/${id}`),
          fetch(`/api/tv/${id}/season/${selectedSeason}`),
          fetch(`/api/tv/${id}/season/${selectedSeason}/episode/${selectedEpisode}`),
          fetch(`/api/tv/${id}/season/${selectedSeason}/episode/${selectedEpisode}/credits`),
          fetch(`/api/tv/${id}/recommendations`),
          fetch(`/api/tv/${id}/videos`),
        ]);

        if (!seriesRes.ok) throw new Error('Failed to load series');
        const seriesData = (await seriesRes.json()) as { results?: Series };
        setSeries(seriesData.results || null);

        const seasonData = (await seasonRes.json()) as { results?: Season };
        setSeason(seasonData.results || {});

        const episodeData = (await episodeRes.json()) as { results?: Episode };
        setEpisode(episodeData.results || null);

        const creditsData = (await creditsRes.json()) as { results?: Credits };
        setCredits(creditsData.results || {});

        const recData = (await recRes.json()) as { results?: { results?: Series[] } };
        setRecommendations(recData.results?.results || []);

        const videosData = (await videosRes.json()) as {
          results?: { results?: { key: string; type?: string; site?: string }[] };
        };
        const videos = videosData.results?.results || [];
        const trailer =
          videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
          videos.find((v) => v.site === 'YouTube');
        setTrailerKey(trailer?.key || null);
      } catch (err) {
        console.error(err);
        setError('Failed to load TV series data');
      } finally {
        setLoading(false);
      }
    };

    void fetchAll();
  }, [id, selectedSeason, selectedEpisode]);

  const totalSeasons = useMemo(() => Math.max(1, series?.number_of_seasons || 1), [series?.number_of_seasons]);
  const episodes = season.episodes || [];
  const activeEpisodeIndex = useMemo(
    () => episodes.findIndex((ep) => ep.episode_number === selectedEpisode),
    [episodes, selectedEpisode],
  );
  const hasPreviousEpisode = activeEpisodeIndex > 0;
  const hasNextEpisode = activeEpisodeIndex >= 0 && activeEpisodeIndex < episodes.length - 1;

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

      <section className="relative overflow-hidden px-4 pb-10 pt-28 md:px-8 xl:px-12">
        {series.backdrop_path && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgBackdrop + series.backdrop_path} alt={series.name} className="absolute inset-0 h-full w-full object-cover opacity-[0.18]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.74)_0%,rgba(5,5,5,0.92)_50%,#050505_100%)]" />
          </>
        )}

        <div className="relative mx-auto max-w-[92rem]">
          <div className="space-y-6">
            {episode?.id ? (
              <>
                <VideoEmbed type="tv" tmdbId={series.id} season={selectedSeason} episode={selectedEpisode} compactActions />
                <div className="mt-4 flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#ffb08c]">Episode controls</p>
                    <p className="mt-1 text-sm text-white/70">
                      {episode?.name ? `Now playing: ${episode.name}` : 'Now playing this episode'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={goToPreviousEpisode}
                      disabled={!hasPreviousEpisode}
                      className="rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous episode
                    </button>
                    <button
                      onClick={goToNextEpisode}
                      disabled={!hasNextEpisode}
                      className="rounded-full bg-[linear-gradient(135deg,#e50914_0%,#ff6a3d_100%)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Next episode
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#ff6a3d]/25 bg-[#2f120d] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffb08c]">
                Series mode
              </span>
              {series.vote_average ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm font-medium text-[#ffd27d]">
                  <Star size={13} fill="currentColor" />
                  {series.vote_average.toFixed(1)} rating
                </span>
              ) : null}
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-white/65">
                {totalSeasons} season{totalSeasons > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex flex-col gap-6 md:flex-row md:items-end">
              {series.poster_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgPosterLarge + series.poster_path} alt={series.name} className="surface-card hidden w-[180px] rounded-[26px] object-cover md:block" />
              )}

              <div className="max-w-4xl">
                <h1 className="font-display text-4xl leading-[0.92] text-white md:text-6xl">{series.name}</h1>
                {series.tagline ? <p className="mt-3 text-lg italic text-white/55">{series.tagline}</p> : null}
                <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
                  {episode?.overview || series.overview}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/60">
                  <span>
                    {series.first_air_date?.slice(0, 4)} - {series.last_air_date?.slice(0, 4) || 'Present'}
                  </span>
                  {series.genres?.length ? <span>{series.genres.map((genre) => genre.name).join(' • ')}</span> : null}
                  {episode?.runtime ? <span>{episode.runtime} min episode</span> : null}
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
                    onClick={() => addToWatchLater(series.id, 'tv')}
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
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Now playing</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  S{selectedSeason} • E{selectedEpisode}
                </h2>
                <p className="mt-2 text-sm text-white/70">{episode?.name || 'Episode details loading'}</p>
                <p className="mt-4 text-sm leading-6 text-white/55">
                  Change season or episode below and the player will update without a full page reload.
                </p>
              </div>

              <div className="cinema-panel rounded-[28px] p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Featured cast</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {credits.cast?.slice(0, 4).map((cast) => (
                    <Link key={`${cast.id}-${cast.character}`} href={`/person/${cast.id}`} className="surface-card overflow-hidden rounded-[22px]">
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

          <div className="mt-10 cinema-panel rounded-[30px] p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Episode navigator</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Move through the season quickly</h2>
              </div>

              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(Number(e.target.value));
                    setSelectedEpisode(1);
                  }}
                  className="surface-card appearance-none rounded-full px-4 py-2.5 pr-10 text-sm font-medium text-white focus:border-[#e50914] focus:outline-none"
                >
                  {Array.from({ length: totalSeasons }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Season {i + 1}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEpisode(ep.episode_number)}
                  className={`cursor-card overflow-hidden rounded-[24px] border text-left transition-all ${
                    ep.episode_number === selectedEpisode
                      ? 'border-[#ff6a3d]/35 bg-[#29100c] shadow-[0_16px_36px_rgba(229,9,20,0.14)]'
                      : 'surface-card hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  {ep.still_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgPosterSmall + ep.still_path} alt={ep.name} className="aspect-video w-full object-cover opacity-80" loading="lazy" />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-[#151515] text-white/35">
                      <Tv size={26} />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">Episode {ep.episode_number}</p>
                      {ep.runtime ? <span className="text-xs text-white/45">{ep.runtime}m</span> : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-white/70">{ep.name}</p>
                    {ep.air_date ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">{ep.air_date}</p> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8 xl:px-12">
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#ffb08c]">Queue next</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">More series like this</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {recommendations.slice(0, 12).map((rec) => (
              <Link key={rec.id} href={`/tv/${rec.id}`} className="surface-card group/rec cursor-card relative overflow-hidden rounded-[24px]">
                <div className="aspect-[2/3] relative">
                  {rec.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgPosterSmall + rec.poster_path} alt={rec.name} className="h-full w-full object-cover group-hover/rec:scale-105" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#151515] text-white/35">
                      <Tv size={28} />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3">
                    <p className="line-clamp-2 text-sm font-medium text-white">{rec.name}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
                      <Play size={12} fill="currentColor" />
                      Open series
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setShowTrailer(false)}>
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
