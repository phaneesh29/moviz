import React from 'react'
import { Route, Routes, Link } from 'react-router-dom'
import NotFound from './pages/NotFound'
import About from './pages/About'
import Landing from './pages/Landing'
import SearchPage from './pages/Search'
import MoviePage from './pages/Movie'

const App = () => {
  return (
    <>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movie/:id" element={<MoviePage />} />
        <Route path="/tv/:id" element={<MoviePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer with links and disclaimer */}
      <footer className="p-4 bg-gray-100 text-center text-sm mt-6">
        <div className="mb-2 space-x-4">
          <Link to="/" className="hover:underline">Landing</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/search" className="hover:underline">Search</Link>
        </div>
        <p>
          Disclaimer: We do not store any personal information in our database.  
          All content is fetched from trusted 3rd-party services.
        </p>
      </footer>
    </>
  )
}

export default App
