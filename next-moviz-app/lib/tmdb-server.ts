import { API_KEY } from '@/lib/constants';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function tmdbRequest(path: string) {
  const response = await fetch(`${TMDB_BASE_URL}${path}`, {
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

export async function getPersonDetails(id: string) {
  return tmdbRequest(`/person/${id}`);
}

export async function getPersonCredits(id: string) {
  return tmdbRequest(`/person/${id}/combined_credits`);
}
