import type { Metadata } from 'next';
import TvPageClient from '@/app/tv/[id]/TvPageClient';
import { buildMediaMetadata } from '@/lib/media-metadata';
import { getTVDetails, getTVEpisodeDetails } from '@/lib/tmdb-server';

type SeriesDetails = {
  name?: string;
  overview?: string;
  backdrop_path?: string;
};

type EpisodeDetails = {
  name?: string;
  overview?: string;
};

type TvPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
};

export async function generateMetadata({ params, searchParams }: TvPageProps): Promise<Metadata> {
  const { id } = await params;
  const search = await searchParams;
  const season = Number(search.season) || 1;
  const episode = Number(search.episode) || 1;

  try {
    const series = (await getTVDetails(id)) as SeriesDetails;
    const seriesName = series.name || `Series ${id}`;

    let title = `${seriesName} | Moviz`;
    let description = series.overview?.trim() || `Watch ${seriesName} on Moviz.`;

    try {
      const episodeDetails = (await getTVEpisodeDetails(id, season, episode)) as EpisodeDetails;
      if (episodeDetails.name) {
        title = `${seriesName} S${season}E${episode} ${episodeDetails.name} | Moviz`;
      }
      if (episodeDetails.overview?.trim()) {
        description = episodeDetails.overview.trim();
      }
    } catch {
      // Keep series-level metadata when episode-level lookup fails.
    }

    return buildMediaMetadata({
      title,
      description,
      path: `/tv/${id}?season=${season}&episode=${episode}`,
      imagePath: series.backdrop_path,
    });
  } catch {
    const fallbackTitle = `Series ${id} | Moviz`;
    return buildMediaMetadata({
      title: fallbackTitle,
      description: `Watch Series ${id} on Moviz.`,
      path: `/tv/${id}?season=${season}&episode=${episode}`,
    });
  }
}

export default async function TvPage({ params, searchParams }: TvPageProps) {
  const { id } = await params;
  const search = await searchParams;

  const initialSeason = Number(search.season) || 1;
  const initialEpisode = Number(search.episode) || 1;

  return <TvPageClient id={id} initialSeason={initialSeason} initialEpisode={initialEpisode} />;
}
