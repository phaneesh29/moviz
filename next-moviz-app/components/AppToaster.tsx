'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getNotificationEventName, type AppNotification } from '@/lib/notify';

type ToastItem = AppNotification & { id: number };

export default function AppToaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);

  useEffect(() => {
    const eventName = getNotificationEventName();

    const handleNotify = (event: Event) => {
      const customEvent = event as CustomEvent<AppNotification>;
      const detail = customEvent.detail;
      if (!detail?.title) return;

      const id = nextIdRef.current++;
      setToasts((current) => [...current, { ...detail, id }].slice(-3));

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 2200);
    };

    window.addEventListener(eventName, handleNotify);
    return () => window.removeEventListener(eventName, handleNotify);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,22rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-[18px] border border-white/10 bg-[rgba(20,20,20,0.96)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-emerald-500/15 p-1.5 text-emerald-300">
              <CheckCircle2 size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-xs leading-5 text-white/55">{toast.description}</p> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
