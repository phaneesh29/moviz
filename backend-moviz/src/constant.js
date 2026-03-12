export const API_KEY = process.env.TMDB_API_KEY
export const ORIGIN_DOMAIN = process.env.ORIGIN_DOMAIN || "http://localhost:5173"
export const RESEND_API_KEY = process.env.RESEND_API_KEY
export const LIVETV_PROXY_SECRET = process.env.LIVETV_PROXY_SECRET || process.env.TMDB_API_KEY || (process.env.NODE_ENV !== "production" ? "moviz-dev-live-tv-proxy-secret" : "")