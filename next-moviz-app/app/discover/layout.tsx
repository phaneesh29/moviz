import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discover Movies and TV Shows',
  description: 'Explore movies and TV shows by genre, popularity, and release order on Vidoza.',
  alternates: {
    canonical: '/discover',
  },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
