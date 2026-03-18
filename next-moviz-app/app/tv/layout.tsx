import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TV Series',
  description: 'Browse episodes, cast, and recommendations for TV series on Vidoza.',
};

export default function TvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
