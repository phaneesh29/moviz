import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { LIVETV_PROXY_SECRET } from '@/lib/constants';

export const runtime = 'nodejs';

const HLS_MANIFEST_CONTENT_TYPES = [
  'application/vnd.apple.mpegurl',
  'application/x-mpegurl',
  'audio/mpegurl',
  'audio/x-mpegurl',
];

function getManifestPathname(targetUrl: string) {
  try {
    return new URL(targetUrl).pathname.toLowerCase();
  } catch {
    return String(targetUrl).toLowerCase();
  }
}

function isManifestResponse(targetUrl: string, contentType = '') {
  const normalizedContentType = contentType.toLowerCase();
  const manifestPathname = getManifestPathname(targetUrl);

  return (
    manifestPathname.endsWith('.m3u8') ||
    manifestPathname.endsWith('.m3u') ||
    HLS_MANIFEST_CONTENT_TYPES.some((type) => normalizedContentType.includes(type))
  );
}

function isValidProxySignature(targetUrl: string, expiresAt: number, signature: string) {
  if (!LIVETV_PROXY_SECRET || !signature) {
    return false;
  }

  const expectedSignature = createHmac('sha256', LIVETV_PROXY_SECRET)
    .update(`${expiresAt}:${targetUrl}`)
    .digest('hex');

  if (expectedSignature.length !== signature.length) {
    return false;
  }

  try {
    return timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

function rewriteTagUris(line: string, baseUrl: string, request: NextRequest) {
  return line.replace(/URI=("[^"]+"|'[^']+')/g, (_match, quotedUrl) => {
    const rawUrl = quotedUrl.slice(1, -1);
    const resolvedUrl = new URL(rawUrl, baseUrl).toString();
    const proxiedUrl = buildProxyUrl(request, resolvedUrl);
    return `URI="${proxiedUrl}"`;
  });
}

function getRequestOrigin(request: NextRequest): string {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const protocol = forwardedProto || 'https';
  const host = forwardedHost || request.headers.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
}

function buildProxyUrl(request: NextRequest, targetUrl: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 30;
  const signature = createHmac('sha256', LIVETV_PROXY_SECRET)
    .update(`${expiresAt}:${targetUrl}`)
    .digest('hex');

  const params = new URLSearchParams({
    url: targetUrl,
    expires: String(expiresAt),
    sig: signature,
  });

  return `${getRequestOrigin(request)}/api/livetv/proxy?${params.toString()}`;
}

function rewriteManifest(manifestText: string, baseUrl: string, request: NextRequest) {
  return manifestText
    .split(/\r?\n/)
    .map((line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) return line;

      if (trimmedLine.startsWith('#')) {
        return rewriteTagUris(line, baseUrl, request);
      }

      const resolvedUrl = new URL(trimmedLine, baseUrl).toString();
      return buildProxyUrl(request, resolvedUrl);
    })
    .join('\n');
}

function getUpstreamHeaders(request: NextRequest) {
  const headers = new Headers({
    Accept: '*/*',
    'User-Agent': 'Mozilla/5.0 (compatible; MovizLiveTvProxy/1.0)',
  });

  const range = request.headers.get('range');
  if (range) {
    headers.set('Range', range);
  }

  return headers;
}

function withPassthroughHeaders(baseHeaders: Headers, upstream: Response) {
  const passThroughHeaders = [
    'accept-ranges',
    'cache-control',
    'content-length',
    'content-range',
    'content-type',
    'etag',
    'expires',
    'last-modified',
  ];

  passThroughHeaders.forEach((headerName) => {
    const value = upstream.headers.get(headerName);
    if (value) {
      baseHeaders.set(headerName, value);
    }
  });

  return baseHeaders;
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    const expires = request.nextUrl.searchParams.get('expires');
    const sig = request.nextUrl.searchParams.get('sig') || '';

    if (!url) {
      return NextResponse.json({ success: false, message: 'Missing stream URL' }, { status: 400 });
    }

    const expiresAt = Number.parseInt(expires || '', 10);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (!Number.isFinite(expiresAt) || expiresAt < nowInSeconds) {
      return NextResponse.json({ success: false, message: 'Expired stream URL' }, { status: 403 });
    }

    if (!isValidProxySignature(url, expiresAt, sig)) {
      return NextResponse.json({ success: false, message: 'Invalid stream signature' }, { status: 403 });
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid stream URL' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return NextResponse.json({ success: false, message: 'Unsupported stream protocol' }, { status: 400 });
    }

    const upstream = await fetch(targetUrl, {
      headers: getUpstreamHeaders(request),
      redirect: 'follow',
    });

    if (!upstream.ok) {
      const errorBody = await upstream.text().catch(() => '');
      return new NextResponse(errorBody || 'Failed to load upstream stream', { status: upstream.status });
    }

    const responseUrl = upstream.url || targetUrl.toString();
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

    if (isManifestResponse(responseUrl, contentType)) {
      const manifestText = await upstream.text();
      const rewrittenManifest = rewriteManifest(manifestText, responseUrl, request);
      return new NextResponse(rewrittenManifest, {
        status: 200,
        headers: {
          'content-type': 'application/vnd.apple.mpegurl; charset=utf-8',
          'cache-control': upstream.headers.get('cache-control') || 'public, max-age=60',
        },
      });
    }

    const headers = withPassthroughHeaders(new Headers(), upstream);
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error('Error proxying live TV stream:', error);
    return NextResponse.json({ success: false, message: 'Failed to proxy live TV stream' }, { status: 502 });
  }
}

