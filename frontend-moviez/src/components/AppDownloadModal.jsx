import React, { useState, useEffect } from 'react'
import { X, Smartphone, Download } from 'lucide-react'

const APK_DOWNLOAD_URL = '/vidoza-v2.aab' 
const AppDownloadModal = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const checkAndShowModal = () => {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      
      // Get next show date from localStorage
      const nextShowDate = localStorage.getItem('appModalNextDate')
      
      // If no date set (first visit) or today matches the next show date
      if (!nextShowDate || nextShowDate === today) {
        // Check sessionStorage to avoid showing multiple times in same session
        const shownThisSession = sessionStorage.getItem('appModalShownSession')
        
        if (!shownThisSession) {
          // Show modal after a short delay
          const timer = setTimeout(() => {
            setOpen(true)
            sessionStorage.setItem('appModalShownSession', 'true')
            
            // Calculate next show date (3 days from now)
            const nextDate = new Date()
            nextDate.setDate(nextDate.getDate() + 3)
            const nextDateStr = nextDate.toISOString().split('T')[0]
            localStorage.setItem('appModalNextDate', nextDateStr)
          }, 2000)
          
          return () => clearTimeout(timer)
        }
      }
    }

    checkAndShowModal()
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 animate-[fadeInUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-3">
              <Smartphone size={28} className="text-purple-400" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Get Vidoza Mobile App
            </h2>
            <p className="text-gray-400 text-sm">
              Enjoy movies & TV shows on the go with our Android app!
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>Faster streaming experience</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              <span>Save to watch later</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>No ads, completely free</span>
            </div>
          </div>

          {/* Download Button */}
          <a
            href={APK_DOWNLOAD_URL}
            download
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20"
            onClick={() => setOpen(false)}
          >
            <Download size={18} />
            Download APK
          </a>

          {/* Dismiss text */}
          <p className="text-center text-xs text-gray-500">
            Android only · ~20MB
          </p>
        </div>
      </div>
    </div>
  )
}

export default AppDownloadModal
