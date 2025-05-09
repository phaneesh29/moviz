import React from 'react'
import { Route, Routes } from 'react-router-dom'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import About from './pages/About'
import Landing from './pages/Landing'
import SearchPage from './pages/Search'
import MoviePage from './pages/Movie'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movie/:id" element={<MoviePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App