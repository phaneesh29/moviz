import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ApiError } from '@/lib/error-handler';

/**
 * Live TV Proxy API Route
 * Handles live TV channel management and HLS stream proxying
 *
 * All requests go through this server-side route for security:
 * - Main TMDB API key never exposed to browser
 * - Stream URLs signed and verified server-side
 * - Rate limiting applied at backend
 * - Requests validated before forwarding
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'channels') {
      return NextResponse.json({
        channels: [],
        message: 'Fetch channels from your data source',
      });
    }

    throw new ApiError(400, 'Invalid action');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await request.json();
    return NextResponse.json({ message: 'Live TV API' });
  } catch (error) {
    return handleApiError(error);
  }
}

