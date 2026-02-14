import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Search, Menu, X, ClockPlus, SlidersHorizontal, Info, MessageSquare } from 'lucide-react'

/**
 * Shared navigation bar used across all pages.
 * @param {"sticky"|"fixed"|"transparent"} variant
 *   - "sticky" (default): sticky top with backdrop blur + border (Search, Person, WatchLater, About)
 *   - "fixed": fixed top with gradient fade (Movie, TvSeries)
 *   - "transparent": no bg, used inside hero areas (Landing — has its own nav)
 */
const Navbar = ({ variant = 'sticky' }) => {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const base = 'top-0 left-0 right-0 z-30'
  const styles = {
    sticky: `sticky ${base} bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5`,
    fixed: `fixed ${base} bg-gradient-to-b from-black/80 to-transparent`,
    transparent: `relative ${base}`,
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/search', label: 'Search', icon: <Search size={18} /> },
    { to: '/discover', label: 'Discover', icon: <SlidersHorizontal size={18} /> },
    { to: '/watch-later', label: 'My List', icon: <ClockPlus size={18} /> },
    { to: '/about', label: 'About', icon: <Info size={18} /> },
    { to: '/feedback', label: 'Feedback', icon: <MessageSquare size={18} /> },
  ]

  return (
    <>
      <nav className={styles[variant] || styles.sticky}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent"
          >
            VIDOZA
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.to}
                aria-label={link.label}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                onClick={() => navigate(link.to)}
              >
                {link.icon}
                <span className="hidden lg:inline">{link.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile: icons + hamburger */}
          <div className="flex md:hidden items-center gap-1">
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
            <button
              aria-label="Open menu"
              className="p-2 rounded-md hover:bg-white/10 transition text-gray-300 hover:text-white"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-64 bg-[#0f0f0f] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <span className="text-lg font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
                VIDOZA
              </span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md hover:bg-white/10 transition text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 py-4">
              {navLinks.map(link => (
                <button
                  key={link.to}
                  onClick={() => { navigate(link.to); setMobileOpen(false) }}
                  className="flex items-center gap-3 w-full px-6 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </div>
            <div className="border-t border-white/5 p-4">
              <p className="text-[10px] text-gray-600 text-center">Stream smart · Stream safe</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
