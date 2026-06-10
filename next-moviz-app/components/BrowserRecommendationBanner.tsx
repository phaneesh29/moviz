'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { ExternalLink, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BANNER_STORAGE_KEY = 'bannerShown';
const BANNER_STORAGE_EVENT = 'vidoza-banner-storage-change';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(BANNER_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(BANNER_STORAGE_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return window.sessionStorage.getItem(BANNER_STORAGE_KEY) !== 'true';
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return false;
}

export default function BrowserRecommendationBanner() {
  const isVisible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isBrave, setIsBrave] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBrave = async () => {
      interface BraveNavigator extends Navigator {
        brave?: {
          isBrave: () => Promise<boolean>;
        };
      }
      const nav = navigator as BraveNavigator;
      if (nav.brave && typeof nav.brave.isBrave === 'function') {
        const result = await nav.brave.isBrave();
        setIsBrave(!!result);
      } else {
        setIsBrave(false);
      }
    };
    checkBrave();
  }, []);

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(BANNER_STORAGE_KEY, 'true');
      window.dispatchEvent(new Event(BANNER_STORAGE_EVENT));
    } catch {
      // no-op
    }
  };

  if (!isVisible || isBrave === null || isBrave) return null;

  return (
    <div className="fixed inset-x-0 top-3 z-[80] flex justify-center px-3 sm:top-4">
      <div className="flex max-w-[920px] items-center gap-3 rounded-lg border border-white/12 bg-black/85 px-3 py-2.5 text-white shadow-2xl shadow-black/35 backdrop-blur-xl sm:px-4">
        <div className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-orange-300 sm:flex">
          <ShieldCheck size={17} />
        </div>
        <p className="min-w-0 text-xs leading-5 text-white/78 sm:text-sm">
          For a smoother player experience, use Brave Browser or install the uBlock Origin extension.
        </p>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <a
            href="https://brave.com/download/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/8 px-2.5 py-1.5 text-xs font-semibold text-white/82 transition hover:bg-white/14 hover:text-white"
          >
            Brave
            <ExternalLink size={13} />
          </a>
          <a
            href="https://ublockorigin.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/8 px-2.5 py-1.5 text-xs font-semibold text-white/82 transition hover:bg-white/14 hover:text-white"
          >
            uBlock Origin
            <ExternalLink size={13} />
          </a>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={dismiss}
          aria-label="Dismiss browser recommendation"
          className="shrink-0 rounded-md text-white/58 hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}
