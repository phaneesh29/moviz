import { API_KEY, TMDB_LANGUAGE } from '@/lib/constants';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function tmdbRequest(path: string) {
  const [pathname, search = ''] = path.split('?');
  const query = new URLSearchParams(search);
  query.set('language', TMDB_LANGUAGE);

  const response = await fetch(`${TMDB_BASE_URL}${pathname}?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    },
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'day') {
  return tmdbRequest(`/trending/movie/${timeWindow}`);
}

export async function getTrendingTV(timeWindow: 'day' | 'week' = 'day') {
  return tmdbRequest(`/trending/tv/${timeWindow}`);
}

export async function getLatestMovie() {
  return tmdbRequest('/movie/latest');
}

export async function getLatestTV() {
  return tmdbRequest('/tv/latest');
}

export async function getMovieDetails(id: string) {
  return tmdbRequest(`/movie/${id}`);
}

export async function getTVDetails(id: string) {
  return tmdbRequest(`/tv/${id}`);
}

export async function getTVEpisodeDetails(id: string, season: number, episode: number) {
  return tmdbRequest(`/tv/${id}/season/${season}/episode/${episode}`);
}

export async function getPersonDetails(id: string) {
  return tmdbRequest(`/person/${id}`);
}

export async function getPersonCredits(id: string) {
  return tmdbRequest(`/person/${id}/combined_credits`);
}
