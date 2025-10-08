import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import { imageLink } from '../utils/constants'
import Footer from '../components/Footer'
import { Trash2, Loader2, Home } from 'lucide-react'

const WatchLater = () => {
  const [query] = useSearchParams()
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const id = query.get('id')
  const media_type = query.get('type') // unify with media_type naming

  // ✅ Add to Watch Later (media_type unified)
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


  // ✅ Fetch all saved items (media_type unified)
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

  // ✅ Initial load
  useEffect(() => {
    addLater(id, media_type)
    fetchData()
  }, [])

  const handleItemClick = (media_type, id) => {
    navigate(`/${media_type}/${id}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] justify-between">
      <div className="text-white p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">

        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-mono text-center text-[#b4b4b4] mx-auto">
            <span className="text-white font-bold">Your</span>{' '}
            <span className="underline decoration-purple-500">Watch Later</span> List
          </h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition font-semibold text-sm"
          >
            <Home size={18} />
            Home
          </button>
        </div>

        {/* Loader */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 size={50} className="animate-spin text-purple-500" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center text-lg font-semibold">{error}</p>
        )}

        {/* Empty */}
        {!isLoading && !error && data.length === 0 && (
          <p className="text-[#999] text-center py-8 font-mono">
            No items saved for later.
          </p>
        )}

        {/* Watch Later Grid */}
        {!isLoading && data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-3">
            {data.map((item) => (
              <div
                key={`${item.id}-${item.media_type}`}
                onClick={() => handleItemClick(item.media_type, item.id)}
                className="flex gap-4 p-4 bg-[#1e1e1e] rounded-xl cursor-pointer hover:bg-[#292929] transition-all shadow-md hover:shadow-lg relative group"
              >
                {/* Thumbnail */}
                <img
                  src={
                    item.poster_path || item.backdrop_path
                      ? imageLink + (item.poster_path || item.backdrop_path)
                      : 'https://via.placeholder.com/100x150?text=No+Image'
                  }
                  alt={item.title || item.name || 'media'}
                  className="h-[150px] w-[100px] object-cover rounded-md"
                />

                {/* Info Section */}
                <div className="flex flex-col gap-1 text-sm overflow-hidden">
                  <p>
                    Type:{' '}
                    <span className="font-semibold text-purple-400">
                      {item.media_type?.toUpperCase()}
                    </span>
                  </p>

                  {/* Movie Info */}
                  {item.media_type === 'movie' && (
                    <>
                      {item.title && (
                        <p className="truncate">
                          Title:{' '}
                          <span className="text-[#ddd]">{item.title}</span>
                        </p>
                      )}
                      {item.original_title &&
                        item.original_title !== item.title && (
                          <p className="truncate">
                            Original Title:{' '}
                            <span className="text-[#aaa]">
                              {item.original_title}
                            </span>
                          </p>
                        )}
                      {item.release_date && (
                        <p className="truncate">
                          Released:{' '}
                          <span className="text-[#aaa]">
                            {item.release_date}
                          </span>
                        </p>
                      )}
                    </>
                  )}

                  {/* TV Show Info */}
                  {item.media_type === 'tv' && (
                    <>
                      {item.name && (
                        <p className="truncate">
                          Name:{' '}
                          <span className="text-[#ddd]">{item.name}</span>
                        </p>
                      )}
                      {item.original_name &&
                        item.original_name !== item.name && (
                          <p className="truncate">
                            Original Name:{' '}
                            <span className="text-[#aaa]">
                              {item.original_name}
                            </span>
                          </p>
                        )}
                      {item.first_air_date && (
                        <p className="truncate">
                          Aired:{' '}
                          <span className="text-[#aaa]">
                            {item.first_air_date}
                          </span>
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeLater(item.id, item.media_type)
                  }}
                  className="absolute top-3 right-3 bg-[#2a2a2a] hover:bg-red-500 transition p-2 rounded-full opacity-80 group-hover:opacity-100"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
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
