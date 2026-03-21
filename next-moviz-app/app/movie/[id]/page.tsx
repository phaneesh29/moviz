import type { Metadata } from 'next';
import MoviePageClient from '@/app/movie/[id]/MoviePageClient';
import { buildMediaMetadata } from '@/lib/media-metadata';
import { getMovieDetails } from '@/lib/tmdb-server';

type MovieDetails = {
  title?: string;
  overview?: string;
  backdrop_path?: string;
};

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const movie = (await getMovieDetails(id)) as MovieDetails;
    const movieTitle = movie.title || `Movie ${id}`;
    const title = `${movieTitle} | Moviz`;
    const description = movie.overview?.trim() || `Watch ${movieTitle} on Moviz.`;

    return buildMediaMetadata({
      title,
      description,
      path: `/movie/${id}`,
      imagePath: movie.backdrop_path,
    });
  } catch {
    const fallbackTitle = `Movie ${id} | Moviz`;
    return buildMediaMetadata({
      title: fallbackTitle,
      description: `Watch Movie ${id} on Moviz.`,
      path: `/movie/${id}`,
    });
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  return <MoviePageClient id={id} />;
}
