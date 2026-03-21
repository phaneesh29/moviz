'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ExternalLink, RefreshCw, ShieldCheck, SkipForward } from 'lucide-react';

const PLAYERS = {
  vidfast: {
    label: 'VidFast',
    badge: 'Balanced',
    description: 'Fast startup with a clean player shell.',
    movie: (id: number | string) => `https://vidfast.pro/movie/${id}?autoPlay=true&theme=E50914`,
    tv: (id: number | string, s: number, e: number) => `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true&theme=E50914`,
  },
  videasy: {
    label: 'Videasy',
    badge: 'Lightweight',
    description: 'Usually the quickest fallback when embeds stall.',
    movie: (id: number | string) => `https://player.videasy.net/movie/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  vidrock: {
    label: 'VidRock',
    badge: 'Alternative',
    description: 'Helpful when the default source is inconsistent.',
    movie: (id: number | string) => `https://vidrock.net/movie/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://vidrock.net/tv/${id}/${s}/${e}`,
  },
  cinemaos: {
    label: 'CinemaOS',
    badge: 'Cinema UI',
    description: 'A visual-first backup with a familiar layout.',
    movie: (id: number | string) => `https://cinemaos.tech/player/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://cinemaos.tech/player/${id}/${s}/${e}`,
  },
  vidplus: {
    label: 'VidPlus',
    badge: 'Backup',
    description: 'Useful when regional availability differs.',
    movie: (id: number | string) => `https://player.vidplus.to/embed/movie/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://player.vidplus.to/embed/tv/${id}/${s}/${e}`,
  },
  '2embed': {
    label: '2Embed',
    badge: 'Legacy',
    description: 'Classic provider option for stubborn titles.',
    movie: (id: number | string) => `https://www.2embed.stream/embed/movie/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://www.2embed.stream/embed/tv/${id}/${s}/${e}`,
  },
  vidsrc: {
    label: 'VidSrc',
    badge: 'Last resort',
    description: 'Good to keep around when others fail.',
    movie: (id: number | string) => `https://vidsrc.store/embed/movie/${id}`,
    tv: (id: number | string, s: number, e: number) => `https://vidsrc.store/embed/tv/${id}/${s}/${e}`,
  },
} as const;

type PlayerName = keyof typeof PLAYERS;

type Props = {
  type?: 'movie' | 'tv';
  tmdbId: number | string;
  season?: number;
  episode?: number;
  compactActions?: boolean;
  mediaTitle?: string;
};

const PLAYER_ORDER = Object.keys(PLAYERS) as PlayerName[];
const PRIMARY_PLAYERS: PlayerName[] = ['vidfast', 'videasy', 'cinemaos', 'vidplus'];
const LOAD_TIMEOUT_SECONDS = 12;

function parsePlayer(value: string | null): PlayerName | null {
  if (!value) return null;
  const candidate = value as PlayerName;
  return PLAYERS[candidate] ? candidate : null;
}

function getQueryPlayer(): PlayerName | null {
  try {
    const value = new URLSearchParams(window.location.search).get('provider');
    return parsePlayer(value);
  } catch {
    return null;
  }
}

function syncProviderInQuery(player: PlayerName) {
  try {
    const url = new URL(window.location.href);
    const currentProvider = parsePlayer(url.searchParams.get('provider'));
    if (currentProvider === player) return;
    url.searchParams.set('provider', player);
    window.history.replaceState(window.history.state, '', `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
  } catch {
    // no-op
  }
}

type ProviderEvent = 'load-success' | 'load-timeout' | 'auto-switch' | 'manual-switch' | 'retry';

function trackProviderEvent(event: ProviderEvent, detail: { provider: PlayerName; type: 'movie' | 'tv'; tmdbId: number | string; season: number; episode: number }) {
  if (typeof window === 'undefined') return;

  try {
    const key = 'providerDiagnostics';
    const previous = window.localStorage.getItem(key);
    const parsed = previous ? (JSON.parse(previous) as unknown[]) : [];
    const safeArray = Array.isArray(parsed) ? parsed : [];

    const next = [
      ...safeArray,
      {
        event,
        provider: detail.provider,
        type: detail.type,
        tmdbId: String(detail.tmdbId),
        season: detail.season,
        episode: detail.episode,
        at: new Date().toISOString(),
      },
    ].slice(-50);

    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // no-op
  }
}

function getStoredPlayer(): PlayerName {
  try {
    const saved = parsePlayer(window.localStorage.getItem('preferredPlayer'));
    if (saved) return saved;
  } catch {
    // no-op
  }

  return 'vidfast';
}

export default function VideoEmbed({
  type = 'movie',
  tmdbId,
  season = 1,
  episode = 1,
  compactActions = false,
  mediaTitle,
}: Props) {
  const [player, setPlayer] = useState<PlayerName>(() => {
    if (typeof window === 'undefined') return 'vidfast';
    return getQueryPlayer() || getStoredPlayer();
  });
  const [retryNonce, setRetryNonce] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showAllProviders, setShowAllProviders] = useState(false);
  const [countdown, setCountdown] = useState(LOAD_TIMEOUT_SECONDS);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSwitchedBaseRef = useRef<string | null>(null);
  const countdownStartRef = useRef<number>(0);
  const lastProviderInteractionRef = useRef<number>(0);

  const embedUrl = useMemo(() => {
    if (!tmdbId) return '';
    return type === 'tv' ? PLAYERS[player].tv(tmdbId, season, episode) : PLAYERS[player].movie(tmdbId);
  }, [episode, player, season, tmdbId, type]);

  const baseKey = `${type}-${tmdbId}-${season}-${episode}`;
  const attemptKey = `${baseKey}-${player}-${retryNonce}`;
  const loadError = failedKey === attemptKey;
  const isLoading = loadedKey !== attemptKey && !loadError;

  const nextPlayer = useMemo(() => {
    const currentIndex = PLAYER_ORDER.indexOf(player);
    return PLAYER_ORDER[(currentIndex + 1) % PLAYER_ORDER.length];
  }, [player]);

  useEffect(() => {
    // Ensure deep links always carry the active provider, even on first load.
    syncProviderInQuery(player);
  }, [player]);

  useEffect(() => {
    if (!embedUrl) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownStartRef.current = Date.now();

    countdownRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - countdownStartRef.current) / 1000);
      setCountdown(Math.max(0, LOAD_TIMEOUT_SECONDS - elapsed));
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      if (autoSwitchedBaseRef.current !== baseKey) {
        autoSwitchedBaseRef.current = baseKey;
        const fallback = nextPlayer;
        trackProviderEvent('auto-switch', { provider: fallback, type, tmdbId, season, episode });
        setPlayer(fallback);
        setCountdown(LOAD_TIMEOUT_SECONDS);
        setFailedKey(null);
        setLoadedKey(null);
        try {
          window.localStorage.setItem('preferredPlayer', fallback);
          syncProviderInQuery(fallback);
        } catch {
          // no-op
        }
        return;
      }

      trackProviderEvent('load-timeout', { provider: player, type, tmdbId, season, episode });
      setFailedKey(attemptKey);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }, LOAD_TIMEOUT_SECONDS * 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [attemptKey, baseKey, embedUrl, episode, nextPlayer, player, season, tmdbId, type]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  if (!tmdbId) {
    return <p className="py-10 text-center text-sm text-red-300">No TMDB ID provided.</p>;
  }

  const changePlayer = (next: PlayerName) => {
    const now = Date.now();
    if (now - lastProviderInteractionRef.current < 320) return;
    lastProviderInteractionRef.current = now;

    const selectingCurrent = next === player;
    trackProviderEvent(selectingCurrent ? 'retry' : 'manual-switch', {
      provider: next,
      type,
      tmdbId,
      season,
      episode,
    });
    setPlayer(next);
    setCountdown(LOAD_TIMEOUT_SECONDS);
    setRetryNonce((value) => (selectingCurrent ? value + 1 : 0));
    setFailedKey(null);
    setLoadedKey(null);
    try {
      window.localStorage.setItem('preferredPlayer', next);
      syncProviderInQuery(next);
    } catch {
      // no-op
    }
  };

  const retryCurrent = () => {
    trackProviderEvent('retry', { provider: player, type, tmdbId, season, episode });
    setCountdown(LOAD_TIMEOUT_SECONDS);
    setRetryNonce((value) => value + 1);
    setFailedKey(null);
    setLoadedKey(null);
  };

  const advanceProvider = () => {
    changePlayer(nextPlayer);
    autoSwitchedBaseRef.current = baseKey;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedUrl);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const currentPlayer = PLAYERS[player];
  const progress = Math.max(0, Math.min(100, ((LOAD_TIMEOUT_SECONDS - countdown) / LOAD_TIMEOUT_SECONDS) * 100));
  const visiblePlayers = showAllProviders ? PLAYER_ORDER : PRIMARY_PLAYERS;
  const compactShellClass = compactActions ? 'mx-auto w-full md:w-[70vw]' : 'w-full';
  const sectionPaddingClass = compactActions ? 'px-3 py-3 md:px-4' : 'px-4 py-4 md:px-6';
  const actionButtonClass = compactActions ? 'px-3 py-1.5 text-xs md:text-sm' : 'px-4 py-2 text-sm';

  return (
    <section
      className={`player-ambient relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,10,10,0.98),rgba(7,7,7,0.92))] shadow-[0_30px_90px_rgba(0,0,0,0.48)] ${
        compactShellClass
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,9,20,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,122,63,0.14),transparent_26%)]" />

      <div className={`relative border-b border-white/[0.08] ${sectionPaddingClass}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[#ff7a3f]/25 bg-[#2f120d] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ffb08c]">
                External player
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                <ShieldCheck size={13} />
                Quick server switching enabled
              </span>
            </div>
            <div>
              <p className={`font-semibold text-white ${compactActions ? 'text-base md:text-lg' : 'text-lg md:text-xl'}`}>{currentPlayer.label}</p>
              <p className={`text-white/55 ${compactActions ? 'text-xs md:text-sm' : 'text-sm'}`}>{currentPlayer.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={retryCurrent}
              className={`cursor-watch inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] font-medium text-white/80 hover:border-white/20 hover:bg-white/[0.10] hover:text-white ${actionButtonClass}`}
            >
              <RefreshCw size={14} />
              Reload
            </button>
            <button
              onClick={advanceProvider}
              className={`cursor-watch inline-flex items-center gap-2 rounded-full border border-[#ff7a3f]/25 bg-[#2f120d] font-medium text-[#ffd8c7] hover:border-[#ff7a3f]/40 hover:bg-[#411813] ${actionButtonClass}`}
            >
              <SkipForward size={14} />
              Next server
            </button>
            {!compactActions && (
              <button
                onClick={handleCopy}
                className={`cursor-copy inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] font-medium text-white/80 hover:border-white/20 hover:bg-white/[0.10] hover:text-white ${actionButtonClass}`}
              >
                <ExternalLink size={14} />
                {copied ? 'Copied link' : 'Copy source'}
              </button>
            )}
          </div>
        </div>

        <div className={`mt-3 flex flex-wrap items-center gap-2 text-white/60 ${compactActions ? 'text-[11px]' : 'text-xs'}`}>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            {type === 'tv' ? `TV • S${season} E${episode}` : 'Movie stream'}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Source: {currentPlayer.label}</span>
        </div>

      </div>

      <div className={`relative bg-black ${compactActions ? 'aspect-video min-h-[220px] md:min-h-[330px] xl:min-h-[390px]' : 'aspect-video min-h-[320px] md:min-h-[520px]'}`}>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_12%_22%,rgba(0,163,255,0.12),transparent_22%),radial-gradient(circle_at_88%_78%,rgba(229,9,20,0.14),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(255,106,61,0.1),transparent_30%)]" />
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.18),transparent_35%),rgba(0,0,0,0.82)]">
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 text-center">
              <div className="size-14 animate-spin rounded-full border-[3px] border-white/10 border-t-[#ff7a3f]" />
              <div>
                <p className="text-base font-semibold text-white">Preparing {currentPlayer.label}</p>
                <p className="mt-1 text-sm text-white/55">
                  If this provider stalls in about {countdown}s, Moviz will automatically try {PLAYERS[nextPlayer].label}.
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#ff7a3f_0%,#e50914_100%)] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/86 px-6">
            <div className="max-w-lg rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,17,17,0.96),rgba(9,9,9,0.98))] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.52)]">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#34110c] text-[#ff9f78]">
                <AlertTriangle size={20} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">This provider is taking too long</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                External hosts can be inconsistent. Switch servers, reload this one, or open the provider directly in a new tab.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  onClick={advanceProvider}
                  className="cursor-watch rounded-full bg-[linear-gradient(135deg,#e50914_0%,#ff6a3d_100%)] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Try {PLAYERS[nextPlayer].label}
                </button>
                <button
                  onClick={retryCurrent}
                  className="cursor-watch rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/80 hover:border-white/20 hover:bg-white/[0.10] hover:text-white"
                >
                  Reload current
                </button>
              </div>
            </div>
          </div>
        )}

        <iframe
          key={`${player}-${tmdbId}-${season}-${episode}-${retryNonce}`}
          src={embedUrl}
          title={mediaTitle ? `${mediaTitle} Player` : type === 'tv' ? 'Series Player' : 'Movie Player'}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          loading="eager"
          referrerPolicy="origin-when-cross-origin"
          onLoad={() => {
            trackProviderEvent('load-success', { provider: player, type, tmdbId, season, episode });
            setLoadedKey(attemptKey);
            setFailedKey(null);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
          }}
          className="relative z-10 h-full w-full"
        />
      </div>

      <div className={`relative border-t border-white/[0.08] ${sectionPaddingClass}`}>
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Server selector</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {visiblePlayers.map((name) => {
            const provider = PLAYERS[name];
            const active = name === player;
            return (
              <button
                key={name}
                onClick={() => changePlayer(name)}
                aria-pressed={active}
                aria-label={`Use ${provider.label} server`}
                className={`cursor-watch rounded-full border px-3 py-2 text-left transition-all ${
                  active
                    ? 'border-[#e50914]/45 bg-[#2a0a0d] text-white shadow-[0_10px_24px_rgba(229,9,20,0.16)]'
                    : 'border-white/10 bg-white/[0.04] text-white/65 hover:border-white/20 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span className="block text-xs font-semibold uppercase tracking-[0.2em]">{provider.label}</span>
                <span className="mt-0.5 block text-[11px] text-white/45">{provider.badge}</span>
              </button>
            );
          })}
          {PLAYER_ORDER.length > PRIMARY_PLAYERS.length && (
            <button
              onClick={() => setShowAllProviders((value) => !value)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              {showAllProviders ? 'Show top 4 servers' : `Show all ${PLAYER_ORDER.length} servers`}
            </button>
          )}
        </div>
      </div>

      <div className="relative grid gap-3 border-t border-white/[0.08] px-4 py-4 text-sm text-white/60 md:grid-cols-3 md:px-6">
        <p>
          Preferred server is saved locally so the next title opens faster.
        </p>
        <p>
          If one source fails, switch providers instead of refreshing the whole page.
        </p>
        <p>
          Some providers behave better in a new tab, especially on mobile browsers.
        </p>
      </div>
    </section>
  );
}
