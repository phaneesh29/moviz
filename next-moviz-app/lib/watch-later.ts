export type WatchLaterType = 'movie' | 'tv';

export type WatchLaterItem = {
  id: string;
  media_type: WatchLaterType;
};

const STORAGE_KEY = 'watchLater';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getWatchLaterList(): WatchLaterItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as WatchLaterItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isInWatchLater(id: string | number, mediaType: WatchLaterType): boolean {
  const existing = getWatchLaterList();
  return existing.some((item) => String(item.id) === String(id) && item.media_type === mediaType);
}

export function addToWatchLater(id: string | number, mediaType: WatchLaterType): boolean {
  if (!canUseStorage()) return false;

  const existing = getWatchLaterList();
  const alreadyExists = existing.some((item) => String(item.id) === String(id) && item.media_type === mediaType);
  if (alreadyExists) return false;

  const updated = [...existing, { id: String(id), media_type: mediaType }];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return true;
}

export function removeFromWatchLater(id: string | number, mediaType: WatchLaterType) {
  if (!canUseStorage()) return;

  const existing = getWatchLaterList();
  const updated = existing.filter((item) => !(String(item.id) === String(id) && item.media_type === mediaType));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearWatchLater() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

