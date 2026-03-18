import { NextResponse } from 'next/server';
import axiosInstance from '@/lib/axios';
import { handleApiError } from '@/lib/error-handler';

export async function GET() {
  try {
    const [movieGenres, tvGenres] = await Promise.all([
      axiosInstance.get('/genre/movie/list'),
      axiosInstance.get('/genre/tv/list'),
    ]);

    return NextResponse.json({
      results: {
        movie: movieGenres.data.genres,
        tv: tvGenres.data.genres,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

