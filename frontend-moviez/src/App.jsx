import React from 'react'
import { Route, Routes, Link } from 'react-router-dom'
import NotFound from './pages/NotFound'
import About from './pages/About'
import Landing from './pages/Landing'
import SearchPage from './pages/Search'
import MoviePage from './pages/Movie'
import ComingSoon from './pages/CommingSoon'
import TvSeries from './pages/TvSeries'
import WatchLater from './pages/WatchLater'

const App = () => {
  return (
    <>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movie/:id" element={<MoviePage />} />
        <Route path="/tv/:id" element={<TvSeries />} />
        <Route path="/person/:id" element={<ComingSoon />} />
        <Route path="/watch-later" element={<WatchLater />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

    </>
  )
}

export default App
