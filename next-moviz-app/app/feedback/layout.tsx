import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback',
  description: 'Send feedback about bugs, UX, playback, or suggestions for Vidoza.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/feedback',
  },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
