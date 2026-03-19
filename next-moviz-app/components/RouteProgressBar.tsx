'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_VISIBLE_MS = 320;

function isInternalNavigation(anchor: HTMLAnchorElement): boolean {
  if (!anchor.href) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;

  try {
    const nextUrl = new URL(anchor.href, window.location.href);
    return nextUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    startedAtRef.current = Date.now();
    stopProgressTimer();
    setVisible(true);
    setProgress(8);

    progressTimerRef.current = setInterval(() => {
      setProgress((value) => {
        if (value >= 88) return value;
        const step = value < 35 ? 9 : value < 60 ? 5 : 2;
        return Math.min(88, value + step);
      });
    }, 120);
  }, [stopProgressTimer]);

  const finish = useCallback(() => {
    const elapsed = Date.now() - startedAtRef.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

    window.setTimeout(() => {
      stopProgressTimer();
      setProgress(100);

      window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 180);
    }, wait);
  }, [stopProgressTimer]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigation(anchor)) return;

      try {
        const current = `${window.location.pathname}${window.location.search}`;
        const next = `${new URL(anchor.href, window.location.href).pathname}${new URL(anchor.href, window.location.href).search}`;
        if (current === next) return;
      } catch {
        // no-op
      }

      start();
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
    };
  }, [start]);

  useEffect(() => {
    if (!visible) return;
    finish();
  }, [pathname, searchParams, finish, visible]);

  useEffect(() => {
    return () => {
      stopProgressTimer();
    };
  }, [stopProgressTimer]);

  return (
    <div
      aria-hidden="true"
      className="route-progress-line"
      style={{
        opacity: visible ? 1 : 0,
        transform: `scaleX(${progress / 100})`,
      }}
    />
  );
}
