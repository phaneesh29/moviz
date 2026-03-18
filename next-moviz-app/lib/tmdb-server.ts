import axiosInstance from '@/lib/axios';

export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'day') {
  const response = await axiosInstance.get(`/trending/movie/${timeWindow}`);
  return response.data;
}

export async function getTrendingTV(timeWindow: 'day' | 'week' = 'day') {
  const response = await axiosInstance.get(`/trending/tv/${timeWindow}`);
  return response.data;
}

export async function getLatestMovie() {
  const response = await axiosInstance.get('/movie/latest');
  return response.data;
}

export async function getLatestTV() {
  const response = await axiosInstance.get('/tv/latest');
  return response.data;
}

export async function getPersonDetails(id: string) {
  const response = await axiosInstance.get(`/person/${id}`);
  return response.data;
}

export async function getPersonCredits(id: string) {
  const response = await axiosInstance.get(`/person/${id}/combined_credits`);
  return response.data;
}
