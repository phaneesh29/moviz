import { createHmac } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import channelsData from '@/data/channels.json';
import { LIVETV_PROXY_SECRET } from '@/lib/constants';

export const runtime = 'nodejs';

const PROXY_URL_TTL_SECONDS = 60 * 30;

type Channel = {
  id: number;
  name: string;
  logo?: string;
  group?: string;
  url: string;
};

function loadChannels(): Channel[] {
  return channelsData as Channel[];
}

function getRequestOrigin(request: NextRequest): string {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const protocol = forwardedProto || 'https';
  const host = forwardedHost || request.headers.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
}

function getSignedProxyParams(targetUrl: string, expiresAt: number) {
  const signature = createHmac('sha256', LIVETV_PROXY_SECRET)
    .update(`${expiresAt}:${targetUrl}`)
    .digest('hex');

  return new URLSearchParams({
    url: targetUrl,
    expires: String(expiresAt),
    sig: signature,
  });
}

function buildProxyUrl(request: NextRequest, targetUrl: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + PROXY_URL_TTL_SECONDS;
  const params = getSignedProxyParams(targetUrl, expiresAt);
  return `${getRequestOrigin(request)}/api/livetv/proxy?${params.toString()}`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const channels = loadChannels();
    const channel = channels.find((item) => item.id === Number.parseInt(id, 10));

    if (!channel) {
      return NextResponse.json({ success: false, message: 'Channel not found' }, { status: 404 });
    }

    const publicChannel = { ...channel } as Omit<Channel, 'url'> & { url?: string };
    delete publicChannel.url;

    return NextResponse.json({
      success: true,
      results: {
        ...publicChannel,
        streamUrl: buildProxyUrl(request, channel.url),
      },
    });
  } catch (error) {
    console.error('Error loading channel:', error);
    return NextResponse.json({ success: false, message: 'Failed to load channel details' }, { status: 500 });
  }
}
