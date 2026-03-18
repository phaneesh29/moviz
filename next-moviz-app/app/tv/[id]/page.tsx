'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ClockPlus, Play, Share2, Star, Tv, Youtube } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoEmbed from '@/components/VideoEmbed';
import { addToWatchLater } from '@/lib/watch-later';
import { imgPosterLarge, imgPosterSmall, imgProfile } from '@/lib/media-constants';

type Episode = {
  id: number;
  episode_number: number;
  name: string;
  runtime?: number;
  air_date?: string;
  still_path?: string;
  overview?: string;
  guest_stars?: { id: number; name: string; character?: string; profile_path?: string }[];
};

type Series = {
  id: number;
  name: string;
  overview?: string;
  tagline?: string;
  poster_path?: string;
  vote_average?: number;
  first_air_date?: string;
  last_air_date?: string;
  number_of_seasons?: number;
  genres?: { id: number; name: string }[];
};

type Season = { episodes?: Episode[] };

type Credits = {
  cast?: { id: number; name: string; character?: string; profile_path?: string }[];
  crew?: { id: number; name: string; job?: string; profile_path?: string }[];
};

export default function TvPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = params?.id;
  const initialSeason = Number(searchParams.get('season')) || 1;
  const initialEpisode = Number(searchParams.get('episode')) || 1;

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

  useEffect(() => {
    router.replace(`/tv/${id}?season=${selectedSeason}&episode=${selectedEpisode}`);
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

        const videosData = (await videosRes.json()) as { results?: { results?: { key: string; type?: string; site?: string }[] } };
        const videos = videosData.results?.results || [];
        const trailer = videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') || videos.find((v) => v.site === 'YouTube');
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

  if (loading && !series) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="size-14 animate-spin rounded-full border-[3px] border-[#e50914]/20 border-t-[#e50914]" />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="page-shell min-h-screen text-white pt-24 px-4">
        <Navbar />
        <p className="text-center text-red-400">{error || 'Series not found'}</p>
      </div>
    );
  }

  return (
    <div className="page-shell text-white min-h-screen">
      <Navbar />

      {episode?.id && (
        <div className="relative w-full h-screen shadow-2xl bg-black">
          <VideoEmbed type="tv" tmdbId={series.id} season={selectedSeason} episode={selectedEpisode} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 pt-24">
        <div className="flex gap-6 items-start mb-8">
          {series.poster_path && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgPosterLarge + series.poster_path} alt={series.name} className="hidden md:block w-[140px] rounded-lg shadow-xl border border-white/10" />
          )}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{series.name}</h1>
            {series.tagline && <p className="text-sm italic text-gray-500">{series.tagline}</p>}

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              {series.vote_average && series.vote_average > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <Star size={14} fill="currentColor" /> {series.vote_average.toFixed(1)}
                </span>
              )}
              <span>
                {series.first_air_date?.slice(0, 4)} - {series.last_air_date?.slice(0, 4) || 'Present'}
              </span>
              <span>{totalSeasons} Season{totalSeasons > 1 ? 's' : ''}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {series.genres?.map((g) => (
                <span key={g.id} className="rounded-full border border-[#ff6a3d]/20 bg-[#31110a] px-3 py-1 text-xs font-medium text-[#ffd0bd]">
                  {g.name}
                </span>
              ))}
            </div>

            {episode?.overview && <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{episode.overview}</p>}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm font-medium transition border border-white/10 w-fit"
              >
                <Share2 size={14} /> Share
              </button>
              {trailerKey && (
                <button onClick={() => setShowTrailer(true)} className="flex items-center gap-1.5 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-md text-sm font-semibold transition w-fit">
                  <Youtube size={16} /> Trailer
                </button>
              )}
              <button onClick={() => addToWatchLater(series.id, 'tv')} className="flex items-center gap-1.5 px-4 py-2 bg-[#e50914]/85 hover:bg-[#e50914] rounded-md text-sm font-semibold transition w-fit">
                <ClockPlus size={14} /> Watch Later
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(Number(e.target.value));
                  setSelectedEpisode(1);
                }}
                className="surface-card appearance-none rounded-xl px-4 py-2 pr-10 text-sm font-medium text-white focus:border-[#e50914] focus:outline-none cursor-pointer"
              >
                {Array.from({ length: totalSeasons }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Season {i + 1}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {season.episodes?.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setSelectedEpisode(ep.episode_number)}
                className={`relative text-left p-3 rounded-md transition-all border ${
                  ep.episode_number === selectedEpisode
                    ? 'border-[#e50914]/50 bg-[#2a090b] ring-1 ring-[#e50914]/25'
                    : 'surface-card hover:border-white/15 hover:bg-[#1a1a1a]'
                }`}
              >
                {ep.still_path && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgPosterSmall + ep.still_path} alt={ep.name} className="mb-2 aspect-video w-full rounded object-cover opacity-70" loading="lazy" />
                )}
                <p className="font-semibold text-xs truncate">
                  <span className="text-[#ff8662]">E{ep.episode_number}</span> {ep.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {credits.cast && credits.cast.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Cast</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {credits.cast.slice(0, 12).map((cast) => (
                <Link key={`${cast.id}-${cast.character}`} href={`/person/${cast.id}`} className="surface-card rounded-2xl overflow-hidden cursor-pointer group transition-all">
                  {cast.profile_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgProfile + cast.profile_path} alt={cast.name} className="w-full h-[140px] object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-[140px] bg-[#1a1a1a] flex items-center justify-center text-gray-600 text-2xl font-bold">{cast.name?.[0]}</div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{cast.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{cast.character}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {recommendations.slice(0, 12).map((rec) => (
                <Link key={rec.id} href={`/tv/${rec.id}`} className="group/rec surface-card relative rounded-2xl overflow-hidden cursor-pointer transition-all">
                  <div className="aspect-[2/3] relative">
                    {rec.poster_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgPosterSmall + rec.poster_path} alt={rec.name} className="w-full h-full object-cover group-hover/rec:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                        <Tv size={28} className="text-gray-700" />
                      </div>
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

      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTrailer(false)}>
          <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} title="Trailer" allowFullScreen allow="autoplay" className="w-full h-full rounded-lg" />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

