import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Menu, X, ClockPlus, SlidersHorizontal, Info, MessageSquare } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let hideTimeoutId = null
    const INACTIVITY_DELAY = 1000

    const startHideTimer = () => {
      if (hideTimeoutId) clearTimeout(hideTimeoutId)
      hideTimeoutId = setTimeout(() => {
        setIsVisible(false)
      }, INACTIVITY_DELAY)
    }

    const clearHideTimer = () => {
      if (hideTimeoutId) clearTimeout(hideTimeoutId)
    }

    const handleScroll = () => {
      setIsVisible(true)
      startHideTimer()
    }

    const handleMouseMove = (e) => {
      // Show navbar if cursor moves to the top (<= 80px)
      if (e.clientY <= 80) {
        setIsVisible(true)
        clearHideTimer()
      } else {
        // Not at top, start hiding timer on movement
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
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out flex justify-center w-max max-w-[95vw] ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0'
          }`}
      >
        <nav className="p-1.5 bg-[#121212]/70 backdrop-blur-3xl border border-white/5 rounded-full flex items-center shadow-[0_8px_32px_rgba(168,85,247,0.15)] mx-auto overflow-hidden">

          {/* Logo Element */}
          <div
            className="flex items-center px-4 md:px-5 py-2 cursor-pointer border-r border-white/10 mr-1.5 group"
            onClick={() => navigate('/')}
          >
            <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
              V
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to
              return (
                <button
                  key={link.to}
                  aria-label={link.label}
                  onClick={() => navigate(link.to)}
                  className={`flex items-center rounded-full transition-all duration-500 ease-out group ${isActive
                    ? 'bg-[linear-gradient(135deg,#a855f7_0%,#d946ef_100%)] text-white shadow-[0_4px_20px_rgba(168,85,247,0.4)] px-5 py-2.5'
                    : 'text-gray-400 hover:text-white hover:bg-white/10 px-3.5 py-2.5'
                    }`}
                >
                  <span className={`transition-transform duration-300 ${!isActive ? 'group-hover:scale-110' : ''}`}>
                    {link.icon}
                  </span>
                  <span className={`overflow-hidden transition-all duration-500 ease-out whitespace-nowrap font-medium text-sm ${isActive ? 'max-w-[120px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'
                    }`}>
                    {link.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Mobile Nav Links: Scaled down gracefully */}
          <div className="flex md:hidden items-center gap-0.5">
            {navLinks.slice(0, 3).map(link => {
              const isActive = location.pathname === link.to
              return (
                <button
                  key={link.to}
                  aria-label={link.label}
                  onClick={() => navigate(link.to)}
                  className={`flex items-center rounded-full transition-all duration-500 ease-out ${isActive
                    ? 'bg-[linear-gradient(135deg,#a855f7_0%,#d946ef_100%)] text-white shadow-[0_4px_15px_rgba(168,85,247,0.4)] px-4 py-2'
                    : 'text-gray-400 hover:text-white hover:bg-white/10 px-3 py-2'
                    }`}
                >
                  {link.icon}
                  <span className={`overflow-hidden transition-all duration-500 ease-out whitespace-nowrap font-medium text-sm ${isActive ? 'max-w-[100px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'
                    }`}>
                    {link.label}
                  </span>
                </button>
              )
            })}

            <button
              aria-label="Open menu"
              className="px-3 py-2 ml-0.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile slide-out menu with glass effect */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-64 bg-black/40 backdrop-blur-2xl border-l border-white/5 shadow-2xl flex flex-col transition-transform duration-300 animate-slide-in-right">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <span className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
                VIDOZA
              </span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 py-4 flex flex-col gap-1 px-3">
              {navLinks.map(link => {
                const isActive = location.pathname === link.to
                return (
                  <button
                    key={link.to}
                    onClick={() => { navigate(link.to); setMobileOpen(false) }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${isActive
                      ? 'bg-[#a855f7]/20 text-[#d946ef] border border-[#a855f7]/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {link.icon}
                    {link.label}
                  </button>
                )
              })}
            </div>
            <div className="border-t border-white/5 p-5">
              <p className="text-xs text-gray-500 text-center font-medium">Stream smart · Stream safe</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
