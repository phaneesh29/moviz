import React from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#111111] text-gray-200">
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full text-center space-y-10">
          <div className="space-y-4">
            <p className="uppercase tracking-[0.35em] text-xs text-purple-400/80">
              Stream smart · Stream safe
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
              Welcome to Vidoza
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Discover trending titles, build your watch-later list, and dive into cinematic worlds fetched from trusted sources—no ads, no noise, just stories.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/search"
              className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 transition font-semibold text-white shadow-lg shadow-purple-600/30"
            >
              Start Searching
            </Link>
            <Link
              to="/watch-later"
              className="px-6 py-3 rounded-lg bg-pink-600/80 hover:bg-pink-500 transition font-semibold text-white shadow-lg shadow-pink-600/30"
            >
              View Watch Later
            </Link>
            <Link
              to="/about"
              className="px-6 py-3 rounded-lg border border-purple-500/40 text-purple-300 hover:border-purple-400 hover:text-purple-200 transition font-semibold"
            >
              Learn About Us
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Landing