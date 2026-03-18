import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '@/lib/axios';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const timeWindow = request.nextUrl.searchParams.get('time_window') === 'week' ? 'week' : 'day';
    const results = await axiosInstance.get(`/trending/tv/${timeWindow}`);
    return NextResponse.json({ results: results.data });
  } catch (error) {
    return handleApiError(error);
  }
}

