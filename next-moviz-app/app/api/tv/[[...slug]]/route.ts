import { NextResponse } from 'next/server';
import axiosInstance from '@/lib/axios';
import { handleApiError, ApiError } from '@/lib/error-handler';

function isValidNum(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(Number(value));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  try {
    const { slug = [] } = await params;

    if (slug.length === 0) {
      throw new ApiError(400, 'TV endpoint is required');
    }

    if (slug.length === 1 && slug[0] === 'latest') {
      const results = await axiosInstance.get('/tv/latest');
      return NextResponse.json({ results: results.data });
    }

    const [seriesId, segment1, segment2, segment3, segment4, segment5] = slug;

    if (slug.length === 1) {
      if (!isValidNum(seriesId)) {
        throw new ApiError(400, 'A valid numeric ID is required');
      }
      const results = await axiosInstance.get(`/tv/${seriesId}`);
      return NextResponse.json({ results: results.data });
    }

    if (slug.length === 2 && segment1 === 'recommendations') {
      if (!isValidNum(seriesId)) {
        throw new ApiError(400, 'A valid numeric ID is required');
      }
      const results = await axiosInstance.get(`/tv/${seriesId}/recommendations`);
      return NextResponse.json({ results: results.data });
    }

    if (slug.length === 2 && segment1 === 'videos') {
      if (!isValidNum(seriesId)) {
        throw new ApiError(400, 'A valid numeric ID is required');
      }
      const results = await axiosInstance.get(`/tv/${seriesId}/videos`);
      return NextResponse.json({ results: results.data });
    }

    if (slug.length === 3 && segment1 === 'season') {
      const seasonNum = segment2;
      if (!isValidNum(seriesId) || !isValidNum(seasonNum)) {
        throw new ApiError(400, 'Valid Series ID and Season Number are required');
      }
      const results = await axiosInstance.get(`/tv/${seriesId}/season/${seasonNum}`);
      return NextResponse.json({ results: results.data });
    }

    if (slug.length === 5 && segment1 === 'season' && segment3 === 'episode') {
      const seasonNum = segment2;
      const episodeNum = segment4;
      if (!isValidNum(seriesId) || !isValidNum(seasonNum) || !isValidNum(episodeNum)) {
        throw new ApiError(400, 'Valid Series ID, Season Number and Episode Number are required');
      }
      const results = await axiosInstance.get(`/tv/${seriesId}/season/${seasonNum}/episode/${episodeNum}`);
      return NextResponse.json({ results: results.data });
    }

    if (slug.length === 6 && segment1 === 'season' && segment3 === 'episode' && segment5 === 'credits') {
      const seasonNum = segment2;
      const episodeNum = segment4;
      if (!isValidNum(seriesId) || !isValidNum(seasonNum) || !isValidNum(episodeNum)) {
        throw new ApiError(400, 'Valid Series ID, Season Number and Episode Number are required');
      }
      const results = await axiosInstance.get(`/tv/${seriesId}/season/${seasonNum}/episode/${episodeNum}/credits`);
      return NextResponse.json({ results: results.data });
    }

    throw new ApiError(404, 'Endpoint not found');
  } catch (error) {
    return handleApiError(error);
  }
}

