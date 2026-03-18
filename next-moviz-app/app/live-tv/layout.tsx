import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live TV Channels',
  description: 'Browse live TV channels and stream public IPTV feeds in a premium Vidoza interface.',
  alternates: {
    canonical: '/live-tv',
  },
};

export default function LiveTvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
