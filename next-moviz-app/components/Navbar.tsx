'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ClockPlus,
  Home,
  Info,
  Menu,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Tv,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type NavLink = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const navLinks: NavLink[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/discover', label: 'Discover', icon: SlidersHorizontal },
  { to: '/watch-later', label: 'My List', icon: ClockPlus },
  { to: '/live-tv', label: 'Live TV', icon: Tv },
  { to: '/about', label: 'About', icon: Info },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
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
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 transition-all duration-500 md:px-5 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-[125%] opacity-0'
        }`}
      >
        <nav
          className={`pointer-events-auto relative w-full max-w-[100rem] rounded-2xl md:rounded-full border border-white/10 bg-black/40 backdrop-blur-2xl transition-all duration-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl md:before:rounded-full before:bg-gradient-to-b before:from-white/[0.08] before:to-transparent ${
            scrolled ? 'shadow-[0_16px_42px_rgba(0,0,0,0.5)]' : 'shadow-[0_4px_24px_rgba(0,0,0,0.2)]'
          }`}
        >

          <div className="relative flex items-center justify-between gap-2.5 px-3 py-2 md:px-4 lg:justify-center">
            <button
              onClick={() => router.push('/')}
              className="group/brand flex min-w-0 items-center gap-2 rounded-xl py-0.5 pl-0.5 pr-2.5 text-left hover:bg-white/[0.04] lg:absolute lg:left-4 lg:top-1/2 lg:-translate-y-1/2"
              aria-label="Go to home"
            >
              <Image 
                src="/icon.png" 
                alt="Vidoza Icon" 
                width={36} 
                height={36} 
                className="shrink-0 rounded-xl shadow-[0_10px_22px_rgba(255,255,255,0.13)] transition-transform group-hover/brand:scale-[1.03]"
              />
              <span className="hidden font-display text-sm font-bold uppercase tracking-widest text-white lg:block pl-1">
                Vidoza
              </span>
            </button>

            <div className="relative hidden items-center gap-1.5 lg:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.to;
                const Icon = link.icon;
                return (
                  <Button
                    key={link.to}
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(link.to)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'relative z-10 h-8 rounded-full px-3.5 text-sm font-semibold',
                      isActive
                        ? 'bg-white text-black shadow-[0_12px_30px_rgba(255,255,255,0.18)] hover:bg-white'
                        : 'text-white/72 hover:bg-white/[0.12] hover:text-white',
                    )}
                  >
                    <Icon data-icon="inline-start" />
                    <span>{link.label}</span>
                    {isActive ? (
                      <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-black/60" />
                    ) : null}
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/search')}
                className="rounded-full text-white/72 hover:bg-white/[0.12] hover:text-white"
                aria-label="Open search"
              >
                <Search className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsVisible(true);
                  setMobileOpen(true);
                }}
                className="rounded-full text-white/72 hover:bg-white/[0.12] hover:text-white"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </div>
          </div>
        </nav>
      </div>

      <Sheet
        open={mobileOpen}
        onOpenChange={(open) => {
          setMobileOpen(open);
          if (open) setIsVisible(true);
        }}
      >
        <SheetContent
          side="right"
          className="w-[min(88vw,22rem)] border-white/10 bg-black/92 p-0 text-white backdrop-blur-2xl"
        >
          <SheetHeader className="border-b border-white/10 bg-white/[0.035] px-5 py-5">
            <div className="flex items-center gap-3">
              <Image 
                src="/icon.png" 
                alt="Vidoza Icon" 
                width={44} 
                height={44} 
                className="shrink-0 rounded-2xl"
              />
              <div>
                <SheetTitle className="font-display text-xl uppercase tracking-[0.12em] text-white">
                  Vidoza
                </SheetTitle>
                <SheetDescription className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Stream anything
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="px-4 pt-4">
            <Button
              onClick={() => {
                setIsVisible(true);
                router.push('/search');
                setMobileOpen(false);
              }}
              className="h-11 w-full rounded-2xl bg-white font-semibold text-black shadow-[0_14px_34px_rgba(255,255,255,0.13)] hover:bg-white/90"
            >
              <Search data-icon="inline-start" />
              Search movies & shows
            </Button>
          </div>

          <div className="flex flex-1 flex-col gap-1 px-3 py-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.to;
              const Icon = link.icon;

              return (
                <Button
                  key={link.to}
                  variant={isActive ? 'secondary' : 'ghost'}
                  onClick={() => {
                    setIsVisible(true);
                    router.push(link.to);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    'h-11 w-full justify-start rounded-2xl px-4 text-sm font-semibold',
                    isActive
                      ? 'border border-white/14 bg-white/12 text-white shadow-inner shadow-white/[0.03]'
                      : 'text-white/60 hover:bg-white/[0.07] hover:text-white',
                  )}
                >
                  <Icon data-icon="inline-start" />
                  {link.label}
                </Button>
              );
            })}
          </div>

          <Separator className="bg-white/10" />
          <div className="p-5">
            <p className="text-sm text-white/40">
              Your streaming companion for movies, series, and live TV.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
