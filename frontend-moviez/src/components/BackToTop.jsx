import React, { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const BackToTop = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 left-6 z-40 p-3 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white
                 shadow-lg shadow-purple-600/30 backdrop-blur-sm transition-all duration-300
                 hover:scale-110 active:scale-95"
    >
      <ArrowUp size={20} />
    </button>
  )
}

export default BackToTop
