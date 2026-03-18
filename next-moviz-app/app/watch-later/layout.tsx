import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watch Later',
  description: 'Your saved Vidoza watch list.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/watch-later',
  },
};

export default function WatchLaterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
