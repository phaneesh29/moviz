const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

/** Full-resolution — avoid using unless necessary */
export const imageLink = `${TMDB_IMAGE_BASE}/original`;

/** Sized variants — use these for better performance */
export const imgPosterSmall = `${TMDB_IMAGE_BASE}/w342`; // card thumbnails
export const imgPosterLarge = `${TMDB_IMAGE_BASE}/w500`; // detail posters
export const imgBackdrop = `${TMDB_IMAGE_BASE}/w1280`; // hero/backdrop
export const imgProfile = `${TMDB_IMAGE_BASE}/w185`; // person photos

export const COLORS = {
  background: "#0a0a0a",
  surface: "#141414",
  surfaceLight: "#1e1e1e",
  card: "#1a1a2e",
  border: "#2a2a2a",
  text: "#ffffff",
  textSecondary: "#a0a0a0",
  textMuted: "#666666",
  primary: "#8b5cf6", // purple
  primaryDark: "#7c3aed",
  accent: "#ec4899", // pink
  gradient: ["#8b5cf6", "#ec4899"],
  star: "#fbbf24",
  success: "#22c55e",
  error: "#ef4444",
  info: "#3b82f6",
};

export const PLAYER_SERVERS = [
  { name: "VidFast", url: (type: string, id: string, s?: number, e?: number) => type === "movie" ? `https://vidfast.pro/movie/${id}` : `https://vidfast.pro/tv/${id}/${s}/${e}` },
  { name: "Videasy", url: (type: string, id: string, s?: number, e?: number) => type === "movie" ? `https://player.videasy.net/movie/${id}` : `https://player.videasy.net/tv/${id}/${s}/${e}` },
  { name: "VidSrc", url: (type: string, id: string, s?: number, e?: number) => type === "movie" ? `https://vidsrc.cc/v2/embed/movie/${id}` : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}` },
  { name: "VidPlus", url: (type: string, id: string, s?: number, e?: number) => type === "movie" ? `https://vidplus.top/movie/${id}` : `https://vidplus.top/tv/${id}/${s}/${e}` },
  { name: "2Embed", url: (type: string, id: string, s?: number, e?: number) => type === "movie" ? `https://www.2embed.cc/embed/movie?id=${id}` : `https://www.2embed.cc/embed/tv?id=${id}&s=${s}&e=${e}` },
  { name: "CinemaOS", url: (type: string, id: string, s?: number, e?: number) => type === "movie" ? `https://cinemaosfree.com/movie/${id}` : `https://cinemaosfree.com/tv/${id}/${s}/${e}` },
];
