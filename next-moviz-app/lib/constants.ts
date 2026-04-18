export const API_KEY = process.env.TMDB_API_KEY
export const RESEND_API_KEY = process.env.RESEND_API_KEY
export const LIVETV_PROXY_SECRET = process.env.LIVETV_PROXY_SECRET || (process.env.NODE_ENV !== "production" ? "moviz-dev-live-tv-proxy-secret" : "")
export const TMDB_LANGUAGE = 'en'
export const TMDB_REGION = 'IN'

