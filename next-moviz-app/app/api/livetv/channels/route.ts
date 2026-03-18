import { NextResponse } from 'next/server';
import channelsData from '@/data/channels.json';

export const runtime = 'nodejs';

type Channel = {
  id: number;
  name: string;
  logo?: string;
  group?: string;
  url: string;
};

function toPublicChannel(channel: Channel) {
  const publicChannel = { ...channel } as Omit<Channel, 'url'> & { url?: string };
  delete publicChannel.url;
  return publicChannel;
}

function loadChannels(): Channel[] {
  return channelsData as Channel[];
}

export async function GET() {
  try {
    const channels = loadChannels();
    return NextResponse.json({
      success: true,
      results: channels.map(toPublicChannel),
    });
  } catch (error) {
    console.error('Error loading channels:', error);
    return NextResponse.json({ success: false, message: 'Failed to load channels' }, { status: 500 });
  }
}
