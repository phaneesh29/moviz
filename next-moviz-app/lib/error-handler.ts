import { NextResponse } from 'next/server';
import { AxiosError } from 'axios';

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function handleApiError(error: unknown) {
    // Handle TMDB / upstream API errors
    if (error instanceof AxiosError && error.response) {
        return NextResponse.json(
            {
                message: error.response.data?.status_message || "Upstream API error",
            },
            { status: error.response.status }
        );
    }

    // Handle custom ApiError
    if (error instanceof ApiError) {
        return NextResponse.json(
            { message: error.message },
            { status: error.status }
        );
    }

    // Handle standard errors
    if (error instanceof Error) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }

    // Generic error
    return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
    );
}

