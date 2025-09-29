import React from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0d0d0d] to-[#111111] text-gray-200">
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-8xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Oops! Page Not Found</h2>
        <p className="mb-8 text-lg text-gray-400 max-w-lg">
          The page you are looking for doesn’t exist, has been moved, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-lg font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 
                     hover:bg-blue-500/30 hover:text-blue-300 transition-all duration-300 shadow-lg"
        >
          Go Back Home
        </Link>
      </main>
      <Footer />
    </div>
  )
}

export default NotFound
