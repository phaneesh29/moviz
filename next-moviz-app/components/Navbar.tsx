'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ClockPlus, Home, Info, Menu, MessageSquare, Search, SlidersHorizontal, Tv, X } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home', icon: <Home size={18} /> },
  { to: '/live-tv', label: 'Live TV', icon: <Tv size={18} /> },
  { to: '/search', label: 'Search', icon: <Search size={18} /> },
  { to: '/discover', label: 'Discover', icon: <SlidersHorizontal size={18} /> },
  { to: '/watch-later', label: 'My List', icon: <ClockPlus size={18} /> },
  { to: '/about', label: 'About', icon: <Info size={18} /> },
  { to: '/feedback', label: 'Feedback', icon: <MessageSquare size={18} /> },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
    const inactivityDelay = 1400;

    const clearHideTimer = () => {
      if (hideTimeoutId) clearTimeout(hideTimeoutId);
    };

    const queueHide = () => {
      clearHideTimer();
      if (mobileOpen) return;
      hideTimeoutId = setTimeout(() => {
        setIsVisible(false);
      }, inactivityDelay);
    };

    const reveal = () => {
      setIsVisible(true);
      queueHide();
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
      reveal();
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientY <= 90) {
        setIsVisible(true);
        clearHideTimer();
        return;
      }

      queueHide();
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    queueHide();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearHideTimer();
    };
  }, [mobileOpen]);

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 transition-all duration-500 md:px-6 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-[125%] opacity-0'
        }`}
      >
        <nav
          className={`pointer-events-auto w-full max-w-7xl rounded-[28px] border transition-all duration-300 ${
            scrolled
              ? 'border-white/12 bg-[rgba(7,7,7,0.86)] shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-3xl'
              : 'border-white/[0.08] bg-[rgba(10,10,10,0.66)] backdrop-blur-2xl'
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
            <button onClick={() => router.push('/')} className="flex min-w-0 items-center gap-3 text-left">
              <div className="spotlight-ring flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d0a0d,#120707)]">
                <span className="font-display text-lg uppercase text-white">V</span>
              </div>
              <div className="min-w-0">
                <p className="font-display truncate text-lg uppercase tracking-[0.18em] text-white">Vidoza</p>
                <p className="truncate text-[11px] uppercase tracking-[0.28em] text-white/45">
                  Watch with less friction
                </p>
              </div>
            </button>

            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.to;
                return (
                  <button
                    key={link.to}
                    onClick={() => router.push(link.to)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[linear-gradient(135deg,#e50914_0%,#ff6a3d_100%)] text-white shadow-[0_12px_30px_rgba(229,9,20,0.28)]'
                        : 'text-white/65 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => router.push('/search')}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/80 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                <Search size={15} />
                Search anything
              </button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => router.push('/search')}
                className="rounded-full border border-white/10 bg-white/[0.05] p-2.5 text-white/80 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                aria-label="Open search"
              >
                <Search size={17} />
              </button>
              <button
                onClick={() => {
                  setIsVisible(true);
                  setMobileOpen(true);
                }}
                className="rounded-full border border-white/10 bg-white/[0.05] p-2.5 text-white/80 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileOpen(false)} />

          <div className="animate-slide-in-right absolute right-0 top-0 flex h-full w-[min(88vw,22rem)] flex-col border-l border-white/10 bg-[rgba(7,7,7,0.97)] shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="font-display text-2xl uppercase tracking-[0.18em] text-white">Vidoza</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-white/45">Cinema mode</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pt-4">
              <button
                onClick={() => {
                  setIsVisible(true);
                  router.push('/search');
                  setMobileOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#e50914_0%,#ff6a3d_100%)] px-4 py-3 text-sm font-semibold text-white"
              >
                <Search size={16} />
                Search a movie, show or channel
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-1 px-3 py-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.to;
                return (
                  <button
                    key={link.to}
                    onClick={() => {
                      setIsVisible(true);
                      router.push(link.to);
                      setMobileOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'border border-[#ff6a3d]/30 bg-[#2a0d0b] text-white'
                        : 'text-white/72 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/10 p-5">
              <p className="text-sm text-white/55">Jump to anything quickly, save titles, and swap servers when a stream gets stubborn.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
