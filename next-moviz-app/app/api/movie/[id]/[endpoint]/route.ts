import { NextResponse } from 'next/server';
import axiosInstance from '@/lib/axios';
import { handleApiError, ApiError } from '@/lib/error-handler';

function isValidNum(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(Number(value));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; endpoint: string }> }
) {
  try {
    const { id, endpoint } = await params;

    if (!isValidNum(id)) {
      throw new ApiError(400, 'A valid numeric ID is required');
    }

    const endpointMap: Record<string, string> = {
      get: `/movie/${id}`,
      credits: `/movie/${id}/credits`,
      recommendations: `/movie/${id}/recommendations`,
      videos: `/movie/${id}/videos`,
    };

    const url = endpointMap[endpoint];
    if (!url) {
      throw new ApiError(404, 'Endpoint not found');
    }

    const results = await axiosInstance.get(url);
    return NextResponse.json({ results: results.data });
  } catch (error) {
    return handleApiError(error);
  }
}

