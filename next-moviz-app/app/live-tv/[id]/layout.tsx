import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Channel Player',
  description: 'Watch a live channel stream on Vidoza.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LiveTvPlayerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
