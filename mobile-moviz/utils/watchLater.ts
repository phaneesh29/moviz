import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "watchLater";

export type WatchLaterItem = {
  id: string;
  media_type: "movie" | "tv";
};

export async function getWatchLaterList(): Promise<WatchLaterItem[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function isInWatchLater(
  id: string | number,
  media_type: string
): Promise<boolean> {
  if (!id || !media_type) return false;
  const existing = await getWatchLaterList();
  return !!existing.find(
    (item) =>
      String(item.id) === String(id) && item.media_type === media_type
  );
}

export async function addToWatchLater(
  id: string | number,
  media_type: "movie" | "tv"
): Promise<boolean> {
  if (!id || !media_type) return false;
  const existing = await getWatchLaterList();
  if (
    existing.find(
      (item) =>
        String(item.id) === String(id) && item.media_type === media_type
    )
  ) {
    return false;
  }
  existing.push({ id: String(id), media_type });
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return true;
}

export async function removeFromWatchLater(
  id: string | number,
  media_type: string
): Promise<void> {
  const existing = await getWatchLaterList();
  const updated = existing.filter(
    (item) =>
      !(String(item.id) === String(id) && item.media_type === media_type)
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function clearWatchLater(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
