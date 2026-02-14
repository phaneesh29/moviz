import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

/**
 * Shared navigation bar used across all pages.
 * @param {"sticky"|"fixed"|"transparent"} variant
 *   - "sticky" (default): sticky top with backdrop blur + border (Search, Person, WatchLater, About)
 *   - "fixed": fixed top with gradient fade (Movie, TvSeries)
 *   - "transparent": no bg, used inside hero areas (Landing — has its own nav)
 */
const Navbar = ({ variant = 'sticky' }) => {
  const navigate = useNavigate()

  const base = 'top-0 left-0 right-0 z-30'
  const styles = {
    sticky: `sticky ${base} bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5`,
    fixed: `fixed ${base} bg-gradient-to-b from-black/80 to-transparent`,
    transparent: `relative ${base}`,
  }

  return (
    <nav className={styles[variant] || styles.sticky}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent"
        >
          VIDOZA
        </Link>
        <div className="flex items-center gap-2">
          <button
            aria-label="Go to Home"
            className="p-2 rounded-md hover:bg-white/10 transition text-gray-300 hover:text-white"
            onClick={() => navigate('/')}
          >
            <Home size={18} />
          </button>
          <button
            aria-label="Go to Search"
            className="p-2 rounded-md hover:bg-white/10 transition text-gray-300 hover:text-white"
            onClick={() => navigate('/search')}
          >
            <Search size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
