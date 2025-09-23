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

    </>
  )
}

export default App
