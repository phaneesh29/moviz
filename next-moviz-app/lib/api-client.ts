/**
 * Frontend API Client
 * All API requests from frontend must go through Next.js API routes
 * This ensures:
 * - API keys never exposed to client
 * - CORS handled by backend
 * - Consistent error handling
 * - Secure data fetching
 */

export class APIClient {
  private baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | null | undefined>
  ): Promise<T> {
    const url = new URL(
      `${this.baseUrl}/api${endpoint}`,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      const errorPayload = await res.json().catch(() => ({}) as { message?: string });
      throw new Error(errorPayload.message || `API Error: ${res.status}`);
    }
    return res.json();
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const url = new URL(
      `${this.baseUrl}/api${endpoint}`,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    );

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorPayload = await res.json().catch(() => ({}) as { message?: string });
      throw new Error(errorPayload.message || `API Error: ${res.status}`);
    }
    return res.json();
  }
}

export const apiClient = new APIClient();

