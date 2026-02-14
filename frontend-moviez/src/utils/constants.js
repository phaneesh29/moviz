const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p"

/** Full-resolution — avoid using unless necessary */
export const imageLink = `${TMDB_IMAGE_BASE}/original`

/** Sized variants — use these for better performance */
export const imgPosterSmall = `${TMDB_IMAGE_BASE}/w342`   // card thumbnails
export const imgPosterLarge = `${TMDB_IMAGE_BASE}/w500`   // detail posters
export const imgBackdrop    = `${TMDB_IMAGE_BASE}/w1280`  // hero/backdrop
export const imgProfile     = `${TMDB_IMAGE_BASE}/w185`   // person photos