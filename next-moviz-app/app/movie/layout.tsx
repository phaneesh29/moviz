import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movie',
  description: 'Watch movie details, trailers, cast, and recommendations on Vidoza.',
};

export default function MovieLayout({ children }: { children: React.ReactNode }) {
  return children;
}
