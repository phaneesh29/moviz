import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import { imageLink } from '../utils/constants'
import Footer from '../components/Footer'
import { Trash2, Home, Search, Play, Film, Tv, Clock } from 'lucide-react'

const WatchLater = () => {
  const [query] = useSearchParams()
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const id = query.get('id')
  const media_type = query.get('type')

  const addLater = (id, media_type) => {
    if (!id || !media_type) return
    const existing = JSON.parse(localStorage.getItem('watchLater') || '[]')
    if (existing.find(item => item.id === id && item.media_type === media_type)) return
    existing.push({ id, media_type })
    localStorage.setItem('watchLater', JSON.stringify(existing))
  }

  const removeLater = (id, media_type) => {
    const existing = JSON.parse(localStorage.getItem('watchLater') || '[]')
    const updated = existing.filter(
      item => !(String(item.id) === String(id) && item.media_type === media_type)
    )
    localStorage.setItem('watchLater', JSON.stringify(updated))
    setData(prev => prev.filter(
      item => !(String(item.id) === String(id) && item.media_type === media_type)
    ))
  }

  const fetchData = async () => {
    const localData = JSON.parse(localStorage.getItem('watchLater') || '[]')
    if (localData.length === 0) {
      setData([])
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const results = []
      for (let i = 0; i < localData.length; i++) {
        const item = localData[i]
        const res = await axiosInstance.get(`/${item.media_type}/get/${item.id}`)
        results.push({ ...res.data.results, media_type: item.media_type })
      }
      setData(results)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch saved items.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    addLater(id, media_type)
    fetchData()
  }, [])

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
            VIDOZA
          </Link>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md hover:bg-white/10 transition text-gray-400 hover:text-white"
              onClick={() => navigate("/")}>
              <Home size={18} />
            </button>
            <button className="p-2 rounded-md hover:bg-white/10 transition text-gray-400 hover:text-white"
              onClick={() => navigate("/search")}>
              <Search size={18} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
        {/* Page heading */}
        <div className="flex items-center gap-3 mb-8">
          <Clock size={24} className="text-purple-400" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Watch Later</h1>
          {data.length > 0 && (
            <span className="text-sm text-gray-500 ml-1">{data.length} saved</span>
          )}
        </div>

        {/* Loader */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="size-14 animate-spin border-[3px] border-purple-500/20 border-t-purple-500 rounded-full" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 text-center text-lg font-semibold py-10">{error}</p>
        )}

        {/* Empty */}
        {!isLoading && !error && data.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <Clock size={48} className="mx-auto text-gray-700" />
            <p className="text-gray-500 text-lg">Your watch list is empty</p>
            <button onClick={() => navigate("/search")}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-semibold transition">
              Browse content
            </button>
          </div>
        )}

        {/* Poster Grid */}
        {!isLoading && data.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data.map((item) => (
              <div key={`${item.id}-${item.media_type}`}
                className="group relative rounded-lg overflow-hidden bg-[#141414] border border-white/5 cursor-pointer">

                {/* Poster */}
                <div className="aspect-[2/3] relative" onClick={() => navigate(`/${item.media_type}/${item.id}`)}>
                  {item.poster_path ? (
                    <img src={imageLink + item.poster_path}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                      {item.media_type === 'movie' ? <Film size={36} className="text-gray-700" /> : <Tv size={36} className="text-gray-700" />}
                    </div>
                  )}

                  {/* Type badge */}
                  <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.media_type === 'movie' ? 'bg-purple-600' : 'bg-pink-600'}`}>
                    {item.media_type}
                  </span>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/${item.media_type}/${item.id}`) }}
                      className="bg-white text-black px-5 py-2 rounded-md text-sm font-bold flex items-center gap-1.5 hover:bg-gray-200 transition">
                      <Play size={14} fill="black" /> Play
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); removeLater(item.id, item.media_type) }}
                      className="bg-red-600/80 hover:bg-red-600 px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition">
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>

                {/* Title bar */}
                <div className="p-2.5">
                  <p className="text-sm font-medium truncate">{item.title || item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default WatchLater
