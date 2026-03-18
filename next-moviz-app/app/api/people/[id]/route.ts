import { NextResponse } from 'next/server';
import axiosInstance from '@/lib/axios';
import { handleApiError, ApiError } from '@/lib/error-handler';

function isValidNum(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(Number(value));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidNum(id)) {
      throw new ApiError(400, 'A valid numeric ID is required');
    }

    const results = await axiosInstance.get(`/person/${id}`);
    return NextResponse.json({ results: results.data });
  } catch (error) {
    return handleApiError(error);
  }
}

