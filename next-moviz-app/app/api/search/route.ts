import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '@/lib/axios';
import { handleApiError, ApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('query');
        const page = searchParams.get('page');
        const adult = searchParams.get('adult');

        if (!query) {
            throw new ApiError(400, "Query is required");
        }
        if (query.length < 2) {
            throw new ApiError(400, "Query must be at least 2 characters");
        }

        const params = {
            query,
            page: Math.max(1, Number(page) || 1),
            include_adult: adult === "true",
        };

        const results = await axiosInstance.get("/search/multi", { params });
        return NextResponse.json({ results: results.data });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, page, adult } = body;

        if (!query) {
            throw new ApiError(400, "Query is required");
        }
        if (query.length < 2) {
            throw new ApiError(400, "Query must be at least 2 characters");
        }

        const params = {
            query,
            page: Math.max(1, Number(page) || 1),
            include_adult: adult === true,
        };

        const results = await axiosInstance.get("/search/multi", { params });
        return NextResponse.json({ results: results.data });
    } catch (error) {
        return handleApiError(error);
    }
}

