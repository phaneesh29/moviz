import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import { imgPosterSmall } from '../utils/constants'
import { Star, Play, ClockPlus, Film, Tv, ChevronsLeft, ChevronsRight, SlidersHorizontal } from 'lucide-react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import Seo from '../components/Seo'
import { addToWatchLater } from '../utils/watchLater'
import { useToast } from '../components/Toast'
import { CardGridSkeleton } from '../components/Skeleton'

const SORT_OPTIONS = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'primary_release_date.desc', label: 'Newest First' },
    { value: 'primary_release_date.asc', label: 'Oldest First' },
]

const DiscoverPage = () => {
    const navigate = useNavigate()
    const toast = useToast()
    const [searchParams, setSearchParams] = useSearchParams()

    const [mediaType, setMediaType] = useState(searchParams.get('type') || 'movie')
    const [genres, setGenres] = useState({ movie: [], tv: [] })
    const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '')
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity.desc')
    const [data, setData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

    // Fetch genres on mount
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await axiosInstance.get('/discover/genres')
                if (res.status === 200) setGenres(res.data.results)
            } catch (err) {
                console.error('Failed to load genres', err)
            }
        }
        fetchGenres()
    }, [])

    // Fetch discover data
    const fetchDiscover = useCallback(async () => {
        setIsLoading(true)
        setData({})
        try {
            const endpoint = mediaType === 'movie' ? '/discover/movies' : '/discover/tv'
            const res = await axiosInstance.get(endpoint, {
                params: {
                    genre: selectedGenre || undefined,
                    page,
                    sort_by: sortBy,
                }
            })
            if (res.status === 200) setData(res.data.results)
        } catch (err) {
            console.error('Failed to load discover', err)
        } finally {
            setIsLoading(false)
        }
    }, [mediaType, selectedGenre, sortBy, page])

    useEffect(() => {
        fetchDiscover()
    }, [fetchDiscover])

    // Sync to URL
    useEffect(() => {
        const params = { type: mediaType }
        if (selectedGenre) params.genre = selectedGenre
        if (sortBy !== 'popularity.desc') params.sort = sortBy
        if (page > 1) params.page = page
        setSearchParams(params)
    }, [mediaType, selectedGenre, sortBy, page])

    const currentGenres = genres[mediaType] || []

    const handleItemClick = (id) => navigate(`/${mediaType}/${id}`)

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
            <Seo title="Discover — Vidoza" description="Browse movies and TV shows by genre, rating, and more." />
            <Navbar />

            <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                        <SlidersHorizontal size={24} className="text-purple-400" /> Discover
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Browse by genre, sort by popularity or rating</p>
                </div>

                {/* Controls */}
                <div className="space-y-4 mb-8">
                    {/* Media type toggle */}
                    <div className="flex gap-2">
                        <button onClick={() => { setMediaType('movie'); setSelectedGenre(''); setPage(1) }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all
                                ${mediaType === 'movie' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}>
                            <Film size={16} /> Movies
                        </button>
                        <button onClick={() => { setMediaType('tv'); setSelectedGenre(''); setPage(1) }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all
                                ${mediaType === 'tv' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}>
                            <Tv size={16} /> TV Shows
                        </button>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-3">
                        <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                            className="bg-[#141414] border border-white/10 text-white px-4 py-2 rounded-md text-sm focus:border-purple-500 focus:outline-none cursor-pointer">
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Genre chips */}
                    {currentGenres.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => { setSelectedGenre(''); setPage(1) }}
                                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all
                                    ${!selectedGenre ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'}`}>
                                All Genres
                            </button>
                            {currentGenres.map(g => (
                                <button key={g.id} onClick={() => { setSelectedGenre(String(g.id) === selectedGenre ? '' : String(g.id)); setPage(1) }}
                                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all
                                        ${String(g.id) === selectedGenre ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'}`}>
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Loading */}
                {isLoading && <CardGridSkeleton />}

                {/* Results */}
                {!isLoading && data.results?.length > 0 && (
                    <>
                        <div className="flex justify-between items-center px-1 pb-4 text-xs text-gray-500 font-mono border-b border-white/5 mb-6">
                            <span>{data.total_results?.toLocaleString()} results</span>
                            <span>Page {data.page} of {Math.min(data.total_pages, 500)}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                            {data.results.map((item) => (
                                <div key={item.id} onClick={() => handleItemClick(item.id)}
                                    className="relative group/card rounded-md overflow-hidden cursor-pointer bg-[#141414]">
                                    <img
                                        src={item.poster_path ? imgPosterSmall + item.poster_path : undefined}
                                        alt={item.title || item.name || 'media'}
                                        className={`w-full aspect-[2/3] object-cover transition-all duration-300 group-hover/card:scale-105 group-hover/card:brightness-50 ${!item.poster_path ? 'hidden' : ''}`}
                                        loading="lazy"
                                    />
                                    {!item.poster_path && (
                                        <div className="w-full aspect-[2/3] bg-[#1a1a1a] flex items-center justify-center">
                                            <Film size={28} className="text-gray-700" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent
                                                    opacity-0 group-hover/card:opacity-100 transition-all duration-300
                                                    flex flex-col justify-end p-3">
                                        <p className="text-sm font-bold truncate">{item.title || item.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                                            {item.vote_average > 0 && (
                                                <span className="flex items-center gap-0.5 text-yellow-400">
                                                    <Star size={10} fill="currentColor" /> {item.vote_average?.toFixed(1)}
                                                </span>
                                            )}
                                            {(item.release_date || item.first_air_date) && (
                                                <span>{(item.release_date || item.first_air_date || '').slice(0, 4)}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-1.5 mt-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleItemClick(item.id) }}
                                                className="flex-1 flex items-center justify-center gap-1 bg-white text-black text-xs font-bold py-1.5 rounded hover:bg-white/90 transition">
                                                <Play size={12} fill="black" /> View
                                            </button>
                                            <button title="Add to Watch Later"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    const added = addToWatchLater(item.id, mediaType)
                                                    toast[added ? 'success' : 'info'](added ? 'Added to Watch Later' : 'Already in Watch Later')
                                                }}
                                                className="flex items-center justify-center bg-white/10 border border-white/30 hover:border-white p-1.5 rounded transition">
                                                <ClockPlus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-4 mt-10 mb-4">
                            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${page <= 1
                                    ? "opacity-30 cursor-not-allowed bg-white/5 text-gray-600"
                                    : "bg-white/10 hover:bg-purple-600 text-white"}`}>
                                <ChevronsLeft size={16} /> Prev
                            </button>
                            <span className="text-sm font-mono text-gray-400 min-w-[60px] text-center">
                                {data.page} / {Math.min(data.total_pages, 500)}
                            </span>
                            <button disabled={page >= Math.min(data.total_pages, 500)} onClick={() => setPage(p => p + 1)}
                                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${page >= Math.min(data.total_pages, 500)
                                    ? "opacity-30 cursor-not-allowed bg-white/5 text-gray-600"
                                    : "bg-white/10 hover:bg-purple-600 text-white"}`}>
                                Next <ChevronsRight size={16} />
                            </button>
                        </div>
                    </>
                )}

                {!isLoading && data.results?.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No results found</p>
                        <p className="text-gray-600 text-sm mt-1">Try a different genre or filter</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default DiscoverPage
