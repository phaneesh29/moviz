'use client';

import Link from 'next/link';
import { Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[linear-gradient(180deg,rgba(11,11,11,0.92),rgba(4,4,4,0.98))]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-md">
            <Link href="/" className="font-display text-3xl uppercase tracking-[0.18em] text-[#e50914]">
              Vidoza
            </Link>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              A cinematic home for trending movies, series, live channels and watch-later sessions.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-5 text-sm text-neutral-400">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/search" className="hover:text-white">
              Search
            </Link>
            <Link href="/discover" className="hover:text-white">
              Discover
            </Link>
            <Link href="/watch-later" className="hover:text-white">
              My List
            </Link>
            <Link href="/live-tv" className="hover:text-white">
              Live TV
            </Link>
            <Link href="/feedback" className="hover:text-white">
              Feedback
            </Link>
            <a
              href="/vidoza-v3.apk"
              download
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white hover:border-white/20 hover:bg-white/10"
            >
              <Smartphone size={14} />
              <span>Get App</span>
            </a>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/8 pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p>Vidoza delivers a polished browsing experience powered by live backend data.</p>
          <p className="uppercase tracking-[0.18em] text-neutral-600">Stream. Save. Rewatch.</p>
        </div>
      </div>
    </footer>
  );
}
