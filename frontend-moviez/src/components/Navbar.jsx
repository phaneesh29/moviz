import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Search, Menu, X, ClockPlus, SlidersHorizontal, Info, MessageSquare } from 'lucide-react'

/**
 * Shared navigation bar used across all pages.
 * @param {"sticky"|"fixed"|"transparent"} variant
 */
const Navbar = ({ variant = 'sticky' }) => {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let hideTimeoutId = null
    const INACTIVITY_DELAY = 1000

    const startHideTimer = () => {
      if (hideTimeoutId) clearTimeout(hideTimeoutId)
      hideTimeoutId = setTimeout(() => {
        if (window.scrollY > 80) {
          setIsVisible(false)
        }
      }, INACTIVITY_DELAY)
    }

    const clearHideTimer = () => {
      if (hideTimeoutId) clearTimeout(hideTimeoutId)
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down: hide immediately
        setIsVisible(false)
        clearHideTimer()
      } else {
        // Scrolling up or at top: show
        setIsVisible(true)
        if (currentScrollY > 80) {
          startHideTimer()
        } else {
          clearHideTimer()
        }
      }
      lastScrollY = currentScrollY
    }

    const handleMouseMove = (e) => {
      // Show navbar if cursor moves to the top (<= 80px)
      if (e.clientY <= 80) {
        setIsVisible(true)
        clearHideTimer()
      } else if (window.scrollY > 80) {
        // If not at the top, start/reset the hide timer on mouse movement
        startHideTimer()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      clearHideTimer()
    }
  }, [])

  const base = `top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
    }`

  const styles = {
    sticky: `sticky ${base} bg-black/40 backdrop-blur-xl saturate-150 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]`,
    fixed: `fixed ${base} bg-black/20 backdrop-blur-lg saturate-150 border-b border-white/5 shadow-2xl`,
    transparent: `absolute ${base}`,
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            VIDOZA
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(link => (
              <button
                key={link.to}
                aria-label={link.label}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300"
                onClick={() => navigate(link.to)}
              >
                {link.icon}
                <span className="hidden lg:inline">{link.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile: icons + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              aria-label="Go to Home"
              className="p-2 rounded-xl hover:bg-white/10 transition text-gray-300 hover:text-white"
              onClick={() => navigate('/')}
            >
              <Home size={18} />
            </button>
            <button
              aria-label="Go to Search"
              className="p-2 rounded-xl hover:bg-white/10 transition text-gray-300 hover:text-white"
              onClick={() => navigate('/search')}
            >
              <Search size={18} />
            </button>
            <button
              aria-label="Open menu"
              className="p-2 rounded-xl hover:bg-white/10 transition text-gray-300 hover:text-white"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out menu with glass effect */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-64 bg-black/40 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 animate-slide-in-right">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <span className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
                VIDOZA
              </span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 py-4 flex flex-col gap-1 px-3">
              {navLinks.map(link => (
                <button
                  key={link.to}
                  onClick={() => { navigate(link.to); setMobileOpen(false) }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 text-sm font-medium"
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </div>
            <div className="border-t border-white/10 p-5">
              <p className="text-xs text-gray-500 text-center font-medium">Stream smart · Stream safe</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
