'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Hls from 'hls.js';
import { AlertCircle, ArrowLeft, Loader2, Play } from 'lucide-react';

type ChannelDetails = {
  id: number;
  name: string;
  group?: string;
  logo?: string;
  streamUrl: string;
};

export default function LiveTvPlayerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [channel, setChannel] = useState<ChannelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;

    const fetchChannel = async () => {
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

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(channel.streamUrl);
      hls.attachMedia(videoEl);
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = channel.streamUrl;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [channel?.streamUrl]);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error('Playback failed:', err);
        setIsPlaying(false);
      });
    }
  }, [isPlaying]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center">
        <Loader2 className="size-10 text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Tuning in...</p>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center text-center p-4">
        <AlertCircle className="size-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Stream Offline</h2>
        <p className="text-gray-400 max-w-md">{error || 'This channel stream is currently unavailable.'}</p>
        <button
          onClick={() => router.push('/live-tv')}
          className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        >
          <ArrowLeft size={18} /> Back to Channels
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-[#0a0a0a] to-[#0a0a0a] text-white pt-24 pb-14 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="font-medium text-sm">Back to Guide</span>
        </button>

        <div
          className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-[0_0_80px_rgba(168,85,247,0.15)] group ring-1 ring-white/10"
          onClick={() => {
            if (!isPlaying) setIsPlaying(true);
          }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-contain bg-black outline-none"
            controls={isPlaying}
            playsInline
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />

          {!isPlaying && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer hover:bg-black/20 transition-all duration-500 group">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative p-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full text-white shadow-[0_0_40px_rgba(168,85,247,0.5)] transform transition-transform group-hover:scale-110 border border-white/20">
                  <Play size={40} fill="currentColor" className="translate-x-0.5" />
                </div>
              </div>
              <p className="mt-5 font-bold tracking-[0.2em] drop-shadow-lg text-white/90 uppercase text-xs">Click to Start Stream</p>
            </div>
          )}
        </div>

        <div className="flex items-start gap-5 p-6 sm:p-8 bg-gradient-to-r from-white/[0.03] to-transparent rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl">
          {channel.logo ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black/50 rounded-2xl flex items-center justify-center flex-shrink-0 p-3 border border-white/10 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black/50 rounded-2xl flex items-center justify-center text-3xl font-black border border-white/10 text-gray-500 flex-shrink-0 shadow-inner">
              {channel.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 mt-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 w-fit shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                <span className="text-[10px] font-black tracking-widest uppercase">LIVE NOW</span>
              </div>
              {channel.group && (
                <span className="text-xs text-purple-400 font-bold tracking-widest uppercase bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">
                  {channel.group}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm">{channel.name}</h1>
            <p className="text-sm text-gray-400 mt-3 flex items-start gap-2 max-w-2xl leading-relaxed">
              <AlertCircle size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
              Streams are provided by third-party public IPTV providers. Connection stability and availability may vary based on your region and source server load.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

