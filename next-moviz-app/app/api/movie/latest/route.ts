import { NextResponse } from 'next/server';
import axiosInstance from '@/lib/axios';
import { handleApiError } from '@/lib/error-handler';

export async function GET() {
  try {
    const results = await axiosInstance.get('/movie/latest');
    return NextResponse.json({ results: results.data });
  } catch (error) {
    return handleApiError(error);
  }
}

