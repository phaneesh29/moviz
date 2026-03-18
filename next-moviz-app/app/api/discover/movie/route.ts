import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '@/lib/axios';
import { handleApiError } from '@/lib/error-handler';

interface DiscoverMovieParams {
  page: number;
  sort_by: string;
  include_adult: boolean;
  with_genres?: string;
  primary_release_year?: string;
}

export async function GET(request: NextRequest) {
  try {
    const genre = request.nextUrl.searchParams.get('genre');
    const page = request.nextUrl.searchParams.get('page') || '1';
    const sortBy = request.nextUrl.searchParams.get('sort_by') || 'popularity.desc';
    const year = request.nextUrl.searchParams.get('year');

    const params: DiscoverMovieParams = {
      page: Math.max(1, Number(page)),
      sort_by: sortBy,
      include_adult: false,
    };

    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = year;

    const results = await axiosInstance.get('/discover/movie', { params });
    return NextResponse.json({ results: results.data });
  } catch (error) {
    return handleApiError(error);
  }
}

