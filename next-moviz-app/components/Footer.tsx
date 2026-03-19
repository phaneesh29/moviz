'use client';

import Link from 'next/link';
import { Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[linear-gradient(180deg,rgba(11,11,11,0.92),rgba(4,4,4,0.99))]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="max-w-md">
            <Link href="/" className="font-display text-3xl uppercase tracking-[0.18em] text-white">
              Vidoza
            </Link>
            <p className="mt-4 text-sm leading-7 text-neutral-400">
              A streaming-style home for movies, series, live channels, and saved watch sessions with faster jumps into playback.
            </p>
            <a
              href="/vidoza-v3.apk"
              download
              className="cursor-launch mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white hover:border-white/20 hover:bg-white/[0.10]"
            >
              <Smartphone size={14} />
              Get Android App
            </a>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">Browse</p>
            <div className="mt-4 space-y-3 text-sm text-neutral-400">
              <Link href="/" className="block hover:text-white">
                Home
              </Link>
              <Link href="/discover" className="block hover:text-white">
                Discover
              </Link>
              <Link href="/search" className="block hover:text-white">
                Search
              </Link>
              <Link href="/watch-later" className="block hover:text-white">
                My List
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">Watch</p>
            <div className="mt-4 space-y-3 text-sm text-neutral-400">
              <Link href="/live-tv" className="block hover:text-white">
                Live TV
              </Link>
              <Link href="/movie/550" className="block hover:text-white">
                Movies
              </Link>
              <Link href="/tv/1399" className="block hover:text-white">
                Series
              </Link>
              <Link href="/feedback" className="block hover:text-white">
                Feedback
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">Experience</p>
            <div className="mt-4 space-y-3 text-sm text-neutral-400">
              <p>Faster browsing rails</p>
              <p>Saved provider preference</p>
              <p>Watch-later continuity</p>
              <p>Live backend catalog</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.08] pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p>Vidoza delivers a premium-style browsing layer powered by live catalog data.</p>
          <p className="uppercase tracking-[0.18em] text-neutral-600">Stream. Save. Resume.</p>
        </div>
      </div>
    </footer>
  );
}
