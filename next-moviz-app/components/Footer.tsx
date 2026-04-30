'use client';

import Link from 'next/link';
import { Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const browseLinks = [
  { href: '/', label: 'Home' },
  { href: '/discover', label: 'Discover' },
  { href: '/search', label: 'Search' },
  { href: '/watch-later', label: 'My List' },
];

const watchLinks = [
  { href: '/live-tv', label: 'Live TV' },
  { href: '/movie/550', label: 'Movies' },
  { href: '/tv/1399', label: 'Series' },
  { href: '/feedback', label: 'Feedback' },
];

const experienceHighlights = [
  'Faster browsing rails',
  'Saved provider preference',
  'Watch-later continuity',
  'Live backend catalog',
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-black">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link href="/" className="font-display text-2xl uppercase tracking-[0.12em] text-white">
              Vidoza
            </Link>
            <p className="mt-3 text-sm leading-6 text-white/50">
              Your streaming companion for movies, series, and live TV with instant playback.
            </p>
            <a
              href="/vidoza-v3.apk"
              download
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'mt-4 cursor-launch rounded-full border-white/10 bg-white/5 px-4 text-white hover:border-white/20 hover:bg-white/10 hover:text-white',
              )}
            >
              <Smartphone data-icon="inline-start" />
              Get Android App
            </a>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Browse</p>
            <div className="mt-3 flex flex-col gap-2.5 text-sm text-white/50">
              {browseLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Watch</p>
            <div className="mt-3 flex flex-col gap-2.5 text-sm text-white/50">
              {watchLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Features</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/50">
              {experienceHighlights.map((item) => (
                <Badge key={item} variant="secondary" className="bg-white/5 text-white/60">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator className="mt-8 bg-white/[0.06]" />

        <div className="mt-5 flex flex-col gap-1.5 text-xs text-white/30 md:flex-row md:items-center md:justify-between">
          <p>Vidoza streaming platform</p>
          <p className="uppercase tracking-[0.12em]">Stream. Watch. Repeat.</p>
        </div>
      </div>
    </footer>
  );
}
