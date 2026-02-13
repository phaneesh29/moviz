import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import Footer from '../components/Footer'
import axiosInstance from '../utils/axios'
import { imageLink } from '../utils/constants'
import { ChevronLeft, ChevronRight, Play, Info, Search, ClockPlus, Star, Film, Tv } from 'lucide-react'

/* ── Netflix-style horizontal row ───────────────────────────── */
const TrendingRow = ({ title, items, onItemClick }) => {
  const rowRef = useRef(null)
  const navigate = useNavigate()
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkArrows = () => {
    if (!rowRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
    setShowLeftArrow(scrollLeft > 20)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20)
  }

  useEffect(() => {
    const el = rowRef.current
    if (el) {
      el.addEventListener('scroll', checkArrows)
      checkArrows()
      return () => el.removeEventListener('scroll', checkArrows)
    }
  }, [items])

  const scroll = (dir) => {
    if (!rowRef.current) return
    const amount = rowRef.current.clientWidth * 0.8
    rowRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (!items?.length) return null

  return (
    <section className="relative group/row mb-10">
      <h2 className="text-lg md:text-xl font-semibold mb-3 px-4 md:px-12 text-white/90 tracking-wide">
        {title}
      </h2>

      {/* Left arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-12 bottom-0 z-10 w-12 items-center justify-center
                     bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeft size={32} className="text-white drop-shadow-lg" />
        </button>
      )}

      {/* Row */}
      <div
        ref={rowRef}
        className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide px-4 md:px-12 pb-4"
      >
        {items.map((item, idx) => {
          const type = item.media_type || (item.title ? 'movie' : 'tv')
          return (
            <div
              key={item.id}
              className="relative flex-shrink-0 w-[130px] md:w-[200px] cursor-pointer group/card rounded-md overflow-hidden"
              onClick={() => onItemClick(type, item.id)}
            >
              <img
                src={
                  item.poster_path
                    ? imageLink + item.poster_path
                    : 'https://via.placeholder.com/200x300?text=No+Image'
                }
                alt={item.title || item.name || 'media'}
                className="w-full aspect-[2/3] object-cover transition-all duration-300 
                           group-hover/card:scale-110 group-hover/card:brightness-50"
                loading="lazy"
              />

              {/* Rank number */}
              {idx < 10 && (
                <span className="absolute bottom-1 left-1 text-6xl md:text-7xl font-black text-white/10 leading-none select-none pointer-events-none"
                  style={{ textShadow: '2px 2px 0 rgba(139,92,246,0.15)' }}>
                  {idx + 1}
                </span>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent
                              opacity-0 group-hover/card:opacity-100 transition-all duration-300
                              flex flex-col justify-end p-3">
                <p className="text-sm font-bold truncate text-white">{item.title || item.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                  <span className="flex items-center gap-0.5 text-yellow-400">
                    <Star size={10} fill="currentColor" /> {item.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-gray-500">|</span>
                  <span>{(item.release_date || item.first_air_date || '').slice(0, 4)}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onItemClick(type, item.id) }}
                    className="flex-1 flex items-center justify-center gap-1 bg-white text-black text-xs font-bold py-1.5 rounded hover:bg-white/90 transition"
                  >
                    <Play size={12} fill="black" /> Play
                  </button>
                  <button
                    title="Watch Later"
                    onClick={(e) => { e.stopPropagation(); navigate(`/watch-later?id=${item.id}&type=${type}`) }}
                    className="flex items-center justify-center bg-white/10 border border-white/30 hover:border-white p-1.5 rounded transition"
                  >
                    <ClockPlus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Right arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-12 bottom-0 z-10 w-12 items-center justify-center
                     bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <ChevronRight size={32} className="text-white drop-shadow-lg" />
        </button>
      )}
    </section>
  )
}

/* ── Landing Page ───────────────────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate()
  const [trendingMovies, setTrendingMovies] = useState([])
  const [trendingTV, setTrendingTV] = useState([])
  const [latestMovie, setLatestMovie] = useState(null)
  const [latestTV, setLatestTV] = useState(null)
  const [hero, setHero] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true)
      try {
        const [moviesRes, tvRes] = await Promise.all([
          axiosInstance.get('/trending/movies'),
          axiosInstance.get('/trending/tv'),
        ])
        const movies = moviesRes.data?.results?.results || []
        const tv = tvRes.data?.results?.results || []
        setTrendingMovies(movies)
        setTrendingTV(tv)

        // Fetch latest (these return single items)
        try {
          const [latestMovieRes, latestTVRes] = await Promise.all([
            axiosInstance.get('/movie/latest'),
            axiosInstance.get('/tv/latest'),
          ])
          if (latestMovieRes.data?.results) setLatestMovie(latestMovieRes.data.results)
          if (latestTVRes.data?.results) setLatestTV(latestTVRes.data.results)
        } catch (e) {
          console.error('Failed to load latest', e)
        }

        const withBackdrop = movies.filter((m) => m.backdrop_path)
        if (withBackdrop.length) {
          setHero(withBackdrop[Math.floor(Math.random() * withBackdrop.length)])
        }
      } catch (err) {
        console.error('Failed to load trending data', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTrending()
  }, [])

  const handleItemClick = (type, id) => navigate(`/${type}/${id}`)

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-200">
      <Seo
        title="Vidoza — Watch Movies & Series Online"
        description="Discover trending titles, build your watch-later list, and dive into cinematic worlds fetched from trusted sources—no ads, no trackers."
        canonical="https://vidoza.vercel.app/"
        openGraph={{ image: 'https://vidoza.vercel.app/logo.png' }}
      />

      {/* ── Hero ──────────────────────────────────────────── */}
      <header className="relative w-full h-[75vh] md:h-[90vh] overflow-hidden">
        {hero ? (
          <>
            <img
              src={imageLink + hero.backdrop_path}
              alt={hero.title || hero.name}
              className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-[#0a0a0a]/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-[#0a0a0a]" />
        )}

        {/* Top nav */}
        <nav className="relative z-10 flex items-center justify-between px-4 md:px-12 py-4">
          <Link to="/" className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent tracking-tight">
            VIDOZA
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/search"
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Search</span>
            </Link>
            <Link
              to="/watch-later"
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-600/20"
            >
              <ClockPlus size={16} />
              <span className="hidden sm:inline">My List</span>
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="absolute bottom-20 md:bottom-28 left-4 md:left-12 max-w-lg z-10 space-y-4">
          {hero ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-purple-600/90 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Trending
                </span>
                <span className="flex items-center gap-1 text-sm text-yellow-400">
                  <Star size={14} fill="currentColor" /> {hero.vote_average?.toFixed(1)}
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight drop-shadow-2xl">
                {hero.title || hero.name}
              </h2>
              <p className="text-sm md:text-base text-gray-300 line-clamp-3 leading-relaxed max-w-md">
                {hero.overview}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleItemClick(hero.media_type || 'movie', hero.id)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-md font-bold text-sm
                             hover:bg-white/90 transition-all duration-200 shadow-xl"
                >
                  <Play size={18} fill="black" /> Play
                </button>
                <button
                  onClick={() => handleItemClick(hero.media_type || 'movie', hero.id)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm rounded-md font-semibold text-sm
                             hover:bg-white/30 transition-all duration-200 border border-white/10"
                >
                  <Info size={18} /> More Info
                </button>
              </div>
            </>
          ) : !isLoading && (
            <>
              <p className="uppercase tracking-[0.3em] text-xs text-purple-400/70 font-semibold">
                Stream smart · Stream safe
              </p>
              <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
                Welcome to Vidoza
              </h2>
              <p className="text-base text-gray-400 max-w-md">
                Discover trending titles, build your watch-later list, and dive into cinematic worlds.
              </p>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-500 transition font-bold text-white shadow-lg shadow-purple-600/30"
              >
                <Search size={18} /> Start Searching
              </Link>
            </>
          )}
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </header>

      {/* ── Content rows ────────────────────────────────── */}
      <main className="-mt-20 relative z-10 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="size-14 animate-spin border-[3px] border-purple-500/20 border-t-purple-500 rounded-full" />
          </div>
        ) : (
          <>
            <TrendingRow title="Trending Movies Today" items={trendingMovies} onItemClick={handleItemClick} />
            <TrendingRow title="Trending TV Shows Today" items={trendingTV} onItemClick={handleItemClick} />

            {/* Just Added */}
            {(latestMovie || latestTV) && (
              <section className="px-4 md:px-12 mb-10">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-white/90 tracking-wide">Just Added</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {latestMovie && (
                    <div
                      onClick={() => handleItemClick('movie', latestMovie.id)}
                      className="flex gap-4 bg-white/5 border border-white/5 rounded-lg p-4 cursor-pointer 
                                 hover:bg-white/10 hover:border-purple-500/20 transition-all group"
                    >
                      {latestMovie.poster_path ? (
                        <img src={imageLink + latestMovie.poster_path} alt={latestMovie.title}
                          className="w-[80px] h-[120px] object-cover rounded-md flex-shrink-0" />
                      ) : (
                        <div className="w-[80px] h-[120px] bg-[#1a1a1a] rounded-md flex items-center justify-center flex-shrink-0">
                          <Film size={24} className="text-gray-700" />
                        </div>
                      )}
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1">Latest Movie</span>
                        <p className="font-semibold truncate">{latestMovie.title}</p>
                        {latestMovie.overview && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{latestMovie.overview}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          {latestMovie.release_date && <span>{latestMovie.release_date}</span>}
                          {latestMovie.vote_average > 0 && (
                            <span className="flex items-center gap-0.5 text-yellow-400">
                              <Star size={10} fill="currentColor" /> {latestMovie.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {latestTV && (
                    <div
                      onClick={() => handleItemClick('tv', latestTV.id)}
                      className="flex gap-4 bg-white/5 border border-white/5 rounded-lg p-4 cursor-pointer 
                                 hover:bg-white/10 hover:border-pink-500/20 transition-all group"
                    >
                      {latestTV.poster_path ? (
                        <img src={imageLink + latestTV.poster_path} alt={latestTV.name}
                          className="w-[80px] h-[120px] object-cover rounded-md flex-shrink-0" />
                      ) : (
                        <div className="w-[80px] h-[120px] bg-[#1a1a1a] rounded-md flex items-center justify-center flex-shrink-0">
                          <Tv size={24} className="text-gray-700" />
                        </div>
                      )}
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1">Latest TV Show</span>
                        <p className="font-semibold truncate">{latestTV.name}</p>
                        {latestTV.overview && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{latestTV.overview}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          {latestTV.first_air_date && <span>{latestTV.first_air_date}</span>}
                          {latestTV.vote_average > 0 && (
                            <span className="flex items-center gap-0.5 text-yellow-400">
                              <Star size={10} fill="currentColor" /> {latestTV.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {/* CTA */}
        <div className="flex flex-wrap justify-center gap-3 px-6 pt-8 pb-4">
          <Link
            to="/search"
            className="px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-500 transition font-semibold text-white text-sm shadow-lg shadow-purple-600/20"
          >
            Browse All Titles
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 rounded-md border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition font-semibold text-sm"
          >
            About Vidoza
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Landing