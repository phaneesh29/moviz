'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ClockPlus, Home, Info, Menu, MessageSquare, Search, SlidersHorizontal, Tv, X } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
    const inactivityDelay = 1000;

    const startHideTimer = () => {
      if (hideTimeoutId) clearTimeout(hideTimeoutId);
      hideTimeoutId = setTimeout(() => setIsVisible(false), inactivityDelay);
    };

    const clearHideTimer = () => {
      if (hideTimeoutId) clearTimeout(hideTimeoutId);
    };

    const handleScroll = () => {
      setIsVisible(true);
      startHideTimer();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 36) {
        setIsVisible(true);
        clearHideTimer();
      } else {
        startHideTimer();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearHideTimer();
    };
  }, []);

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/live-tv', label: 'Live TV', icon: <Tv size={18} /> },
    { to: '/search', label: 'Search', icon: <Search size={18} /> },
    { to: '/discover', label: 'Discover', icon: <SlidersHorizontal size={18} /> },
    { to: '/watch-later', label: 'My List', icon: <ClockPlus size={18} /> },
    { to: '/about', label: 'About', icon: <Info size={18} /> },
    { to: '/feedback', label: 'Feedback', icon: <MessageSquare size={18} /> },
  ];

  return (
    <>
      <div
        className={`fixed top-4 left-1/2 z-50 flex w-max max-w-[95vw] -translate-x-1/2 justify-center transition-all duration-500 ease-in-out ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0'
        }`}
      >
        <nav className="mx-auto flex items-center rounded-full border border-white/10 bg-[rgba(10,10,10,0.74)] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
          <div
            className="group mr-1.5 flex cursor-pointer items-center gap-3 border-r border-white/10 px-4 py-2 md:px-5"
            onClick={() => router.push('/')}
          >
            <div className="hidden md:block">
              <p className="font-display text-sm uppercase tracking-[0.22em] text-white">Vidoza</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">Premium streaming</p>
            </div>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.to;
              return (
                <button
                  key={link.to}
                  aria-label={link.label}
                  onClick={() => router.push(link.to)}
                  className={`group relative flex items-center rounded-full px-3.5 py-2.5 transition-all duration-300 ${
                    isActive
                      ? 'bg-[linear-gradient(135deg,#e50914_0%,#b20710_100%)] text-white shadow-[0_10px_24px_rgba(229,9,20,0.34)]'
                      : 'text-neutral-400 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span className={`${!isActive ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>
                    {link.icon}
                  </span>
                  <span
                    className={`overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 ${
                      isActive ? 'ml-2 max-w-[120px] opacity-100' : 'ml-0 max-w-0 opacity-0'
                    }`}
                  >
                    {link.label}
                  </span>
                  {!isActive && (
                    <div className="pointer-events-none absolute -bottom-11 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-[#111111]/95 px-2.5 py-1 text-xs font-medium text-white/80 opacity-0 shadow-xl transition-opacity duration-300 group-hover:opacity-100">
                      {link.label}
                      <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-[#111111]/95" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-0.5 md:hidden">
            {navLinks.slice(0, 3).map((link) => {
              const isActive = pathname === link.to;
              return (
                <button
                  key={link.to}
                  aria-label={link.label}
                  onClick={() => router.push(link.to)}
                  className={`flex items-center rounded-full px-3 py-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-[linear-gradient(135deg,#e50914_0%,#b20710_100%)] text-white shadow-[0_10px_20px_rgba(229,9,20,0.28)]'
                      : 'text-neutral-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span
                    className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                      isActive ? 'ml-2 max-w-[100px] opacity-100' : 'ml-0 max-w-0 opacity-0'
                    }`}
                  >
                    {link.label}
                  </span>
                </button>
              );
            })}

            <button
              aria-label="Open menu"
              className="ml-0.5 rounded-full px-3 py-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setMobileOpen(false)} />

          <div className="animate-slide-in-right absolute right-0 top-0 flex h-full w-72 flex-col border-l border-white/10 bg-[rgba(7,7,7,0.96)] shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <span className="font-display text-2xl uppercase tracking-[0.18em] text-[#e50914]">Vidoza</span>
                <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-white/45">Cinema mode</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-1 px-3 py-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.to;
                return (
                  <button
                    key={link.to}
                    onClick={() => {
                      router.push(link.to);
                      setMobileOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'border border-[#e50914]/40 bg-[#e50914]/18 text-white'
                        : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/10 p-5">
              <p className="text-center text-xs uppercase tracking-[0.24em] text-white/40">
                Curated for movie nights
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
