import React, { Suspense, lazy } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import { Analytics } from "@vercel/analytics/react"
import { ToastProvider } from './components/Toast'
import BackToTop from './components/BackToTop'
import ErrorBoundary from './components/ErrorBoundary'
import FeedbackModal from './components/FeedbackModal'
import AppDownloadModal from './components/AppDownloadModal'

const Landing = lazy(() => import('./pages/Landing'))
const About = lazy(() => import('./pages/About'))
const SearchPage = lazy(() => import('./pages/Search'))
const MoviePage = lazy(() => import('./pages/Movie'))
const TvSeries = lazy(() => import('./pages/TvSeries'))
const WatchLater = lazy(() => import('./pages/WatchLater'))
const PersonPage = lazy(() => import('./pages/Person'))
const DiscoverPage = lazy(() => import('./pages/Discover'))
const FeedbackPage = lazy(() => import('./pages/Feedback'))
const NotFound = lazy(() => import('./pages/NotFound'))

const PageSpinner = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center">
    <div className="size-14 animate-spin border-[3px] border-purple-500/20 border-t-purple-500 rounded-full" />
  </div>
)

/* Scroll to top on route change */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const App = () => {
  return (
    <ErrorBoundary>
    <ToastProvider>
    <Analytics/>
      <ScrollToTop />
      {/* Routes */}
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/tv/:id" element={<TvSeries />} />
          <Route path="/person/:id" element={<PersonPage />} />
          <Route path="/watch-later" element={<WatchLater />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <BackToTop />
      <FeedbackModal />
      <AppDownloadModal />
    </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
