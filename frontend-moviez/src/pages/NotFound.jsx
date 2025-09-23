import React from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-6">Oops! Page not found.</h2>
      <p className="mb-8 text-lg text-gray-300">
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
      >
        Go Back Home
      </Link>
      <Footer />
    </div>
  )
}

export default NotFound
