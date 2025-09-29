
import React from "react"
import { Wrench, Loader2 } from "lucide-react"
import Footer from "../components/Footer"

const ComingSoon = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] text-white text-center p-6">
      <div className="flex items-center gap-3 animate-pulse">
        <Wrench size={40} className="text-purple-500" />
        <h1 className="text-4xl font-bold">Coming Soon</h1>
      </div>

      <p className="mt-4 text-lg text-[#aaa] max-w-lg">
        Our devs are working hard on this feature. Stay tuned for updates!
      </p>

      <div className="mt-6 flex items-center gap-2 text-purple-400">
        <Loader2 size={28} className="animate-spin" />
        <span className="font-mono">Building...</span>
      </div>

      <footer className="absolute bottom-6 text-sm text-[#555]">
        <Footer />
      </footer>
    </div>
  )
}

export default ComingSoon

