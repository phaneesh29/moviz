const STORAGE_KEY = 'watchLater'

export function getWatchLaterList() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

/**
 * Check if an item is already in the watch-later list.
 * @returns {boolean}
 */
export function isInWatchLater(id, media_type) {
  if (!id || !media_type) return false
  const existing = getWatchLaterList()
  return !!existing.find(item => String(item.id) === String(id) && item.media_type === media_type)
}

/**
 * Add an item to the watch-later list.
 * @returns {boolean} true if added, false if already existed
 */
export function addToWatchLater(id, media_type) {
  if (!id || !media_type) return false
  const existing = getWatchLaterList()
  if (existing.find(item => String(item.id) === String(id) && item.media_type === media_type)) {
    return false
  }
  existing.push({ id: String(id), media_type })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  return true
}

export function removeFromWatchLater(id, media_type) {
  const existing = getWatchLaterList()
  const updated = existing.filter(
    item => !(String(item.id) === String(id) && item.media_type === media_type)
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
