'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Hls from 'hls.js';
import { AlertTriangle, ArrowLeft, Info, RadioTower, RefreshCcw } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type ChannelDetails = {
  id: number;
  name: string;
  group?: string;
  logo?: string;
  streamUrl: string;
};

function getChannelGroups(channel: ChannelDetails) {
  return (channel.group || 'Undefined')
    .split(';')
    .map((group) => group.trim())
    .filter(Boolean);
}

export default function LiveTvPlayerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [channel, setChannel] = useState<ChannelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;

    const fetchChannel = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/livetv/channels/${id}`);
        const data = (await res.json()) as { success?: boolean; results?: ChannelDetails; message?: string };

        if (!data.success || !data.results?.streamUrl) {
          setError(data.message || 'Channel not found');
          return;
        }

        setChannel(data.results);
      } catch (err) {
        console.error('Failed to fetch channel:', err);
        setError('Failed to load channel stream.');
      } finally {
        setLoading(false);
      }
    };

    void fetchChannel();
  }, [params?.id]);

  useEffect(() => {
    if (!channel?.streamUrl || !videoRef.current) return;

    const videoEl = videoRef.current;
    let hls: Hls | null = null;
    setStreamReady(false);
    setStreamError(null);
    videoEl.muted = true;
    videoEl.autoplay = true;

    const startPlayback = () => {
      videoEl.play().then(() => {
        setIsPlaying(true);
        setStreamError(null);
      }).catch((err) => {
        console.error('Autoplay failed:', err);
        setIsPlaying(false);
      });
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(channel.streamUrl);
      hls.attachMedia(videoEl);
      hls.on(Hls.Events.MANIFEST_PARSED, startPlayback);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setStreamError('This stream is not responding right now.');
        }
      });
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = channel.streamUrl;
      videoEl.addEventListener('loadedmetadata', startPlayback, { once: true });
    } else {
      setStreamError('This browser cannot play this stream format.');
    }

    return () => {
      if (hls) hls.destroy();
      videoEl.removeEventListener('loadedmetadata', startPlayback);
      videoEl.removeAttribute('src');
      videoEl.load();
    };
  }, [channel?.streamUrl, reloadNonce]);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error('Playback failed:', err);
        setStreamError('Playback was blocked. Try starting the stream again.');
        setIsPlaying(false);
      });
    }
  }, [isPlaying]);

  const reloadStream = () => {
    setReloadNonce((value) => value + 1);
  };

  const channelGroups = channel ? getChannelGroups(channel) : [];

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_20%_0%,rgba(0,168,225,0.16),transparent_28%),linear-gradient(180deg,#020202_0%,#071013_42%,#000_100%)] text-white">
        <Navbar />
        <main className="flex-1 px-4 pb-14 pt-28 sm:px-6 md:px-8">
          <div className="mx-auto max-w-7xl space-y-5">
            <Skeleton className="h-10 w-36 rounded-full bg-white/10" />
            <section className="overflow-hidden rounded-[22px] border border-white/10 bg-black/60 shadow-[0_24px_90px_rgba(0,0,0,0.52)]">
              <div className="border-b border-white/10 px-4 py-4 md:px-6">
                <Skeleton className="h-5 w-48 bg-white/10" />
              </div>
              <Skeleton className="aspect-video rounded-none bg-white/10" />
              <div className="grid gap-3 border-t border-white/10 p-4 md:grid-cols-3 md:p-6">
                <Skeleton className="h-16 bg-white/10" />
                <Skeleton className="h-16 bg-white/10" />
                <Skeleton className="h-16 bg-white/10" />
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-28 text-center">
          <div className="max-w-md rounded-[22px] border border-white/10 bg-white/[0.035] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.52)]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-500/10 text-red-300">
              <AlertTriangle size={24} />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-white">Stream Offline</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">{error || 'This channel stream is currently unavailable.'}</p>
            <Button
              onClick={() => router.push('/live-tv')}
              className="mt-6 rounded-full bg-white px-5 font-semibold text-black hover:bg-white/90"
            >
              <ArrowLeft size={18} />
              Back to Guide
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_18%_0%,rgba(0,168,225,0.18),transparent_30%),radial-gradient(circle_at_84%_24%,rgba(16,185,129,0.08),transparent_24%),linear-gradient(180deg,#020202_0%,#061115_45%,#000_100%)] text-white">
      <Navbar />

      <main className="flex-1 px-4 pb-8 pt-24 sm:px-6 md:px-8 lg:px-10 xl:pt-22">
        <div className="mx-auto w-full max-w-[min(90rem,calc((100vh-180px)*16/9))]">
          <section className="overflow-hidden rounded-[18px] border border-white/10 bg-black/60 shadow-[0_20px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl">
            <div className="relative aspect-video overflow-hidden bg-black">
              <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.05),transparent_20%),radial-gradient(circle_at_85%_75%,rgba(0,168,225,0.07),transparent_22%)]" />
              {!streamReady && !streamError ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(0,168,225,0.12),transparent_35%),rgba(0,0,0,0.82)]">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 text-center">
                    <div className="w-full overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.035] p-3">
                      <Skeleton className="aspect-video rounded-2xl bg-white/10" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">Tuning {channel.name}</p>
                      <p className="mt-1 text-sm text-white/55">Waiting for the public stream to respond.</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {streamError ? (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/86 px-6">
                  <div className="max-w-lg rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,17,17,0.96),rgba(9,9,9,0.98))] p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.52)]">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#0a2a35] text-[#00a8e1]">
                      <AlertTriangle size={20} />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">This stream is taking too long</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">{streamError}</p>
                    <Button onClick={reloadStream} className="mt-5 rounded-full bg-white px-5 font-semibold text-black hover:bg-white/90">
                      <RefreshCcw size={16} />
                      Reload stream
                    </Button>
                  </div>
                </div>
              ) : null}

              <video
                key={`${channel.id}-${reloadNonce}`}
                ref={videoRef}
                className="relative z-10 h-full w-full bg-black object-contain outline-none"
                autoPlay
                muted
                controls
                playsInline
                onCanPlay={() => setStreamReady(true)}
                onWaiting={() => setStreamReady(false)}
                onError={() => setStreamError('The browser could not play this stream.')}
                onPause={() => setIsPlaying(false)}
                onPlay={() => {
                  setStreamReady(true);
                  setStreamError(null);
                  setIsPlaying(true);
                }}
              />
            </div>

            <div className="relative border-t border-white/[0.08] px-4 py-3 md:px-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,168,225,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.07),transparent_30%)]" />
              <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/46 p-2 shadow-inner shadow-white/[0.03]">
                    {channel.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={channel.logo} alt={channel.name} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
                    ) : (
                      <span className="font-display text-xl font-black uppercase text-white/42">{channel.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
                        <span className="size-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.9)]" />
                        Live now
                      </span>
                      {channelGroups.slice(0, 2).map((group) => (
                        <span key={group} className="rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/48">
                          {group}
                        </span>
                      ))}
                    </div>
                    <h1 className="truncate text-xl font-black tracking-tight text-white sm:text-2xl">{channel.name}</h1>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={reloadStream}
                    className="rounded-full border-white/10 bg-white/[0.055] text-white/74 hover:bg-white/[0.1] hover:text-white"
                  >
                    <RefreshCcw size={16} />
                    Reload
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.push('/live-tv')}
                    className="rounded-full bg-white px-5 font-semibold text-black hover:bg-white/90"
                  >
                    Browse guide
                    <ArrowLeft size={16} className="rotate-180" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-white/[0.08] px-4 py-3 text-xs text-white/58 md:grid-cols-3 md:px-5">
              <p className="flex gap-2">
                <RadioTower size={16} className="mt-0.5 shrink-0 text-cyan-300" />
                Live channels are provided by public IPTV sources and may vary by region.
              </p>
              <p className="flex gap-2">
                <RefreshCcw size={16} className="mt-0.5 shrink-0 text-cyan-300" />
                If playback stalls, reload the stream before returning to the guide.
              </p>
              <p className="flex gap-2">
                <Info size={16} className="mt-0.5 shrink-0 text-cyan-300" />
                Browser support depends on HLS playback and the stream host.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
