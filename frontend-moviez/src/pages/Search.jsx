import { ChevronsLeft, ChevronsRight, ClockPlus, ScanSearch, Search, Star, Play, Home } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import axiosInstance from '../utils/axios'
import { imageLink } from '../utils/constants'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Footer from '../components/Footer'

function debounce(func, delay) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            func(...args)
        }, delay)
    }
}

const SearchPage = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [searchBar, setSearchBar] = useState(searchParams.get("query") || "")
    const [buttonDisabled, setbuttonDisabled] = useState(!searchParams.get("query"))
    const [isAdult, setisAdult] = useState(searchParams.get("adult") === "true")
    const [data, setData] = useState({})
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const fetchData = async (query, page = 1) => {
        if (!query.trim()) return
        setError("")
        setData({})
        setIsLoading(true)
        try {
            const result = await axiosInstance.post("/search", { query, page, isAdult })
            if (result.status === 200) {
                setData(result.data.results)
            }
        } catch (error) {
            setData({})
            setError(error?.response?.data?.message || "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const debouncedFetch = useRef(debounce((query, page = 1) => {
        fetchData(query, page)
    }, 600)).current

    useEffect(() => {
        const params = {}
        if (searchBar.trim()) params.query = searchBar
        if (isAdult) params.adult = "true"
        setSearchParams(params)
    }, [searchBar, isAdult])

    // Sync URL → fetch
    useEffect(() => {
        const query = searchParams.get("query") || ""
        const adult = searchParams.get("adult") === "true"
        if (query) {
            setSearchBar(query)
            setisAdult(adult)
            setbuttonDisabled(false)
            debouncedFetch(query)
        } else {
            setbuttonDisabled(true)
            setData({})
        }
    }, [searchParams])

    const handleSubmit = (e) => {
        e.preventDefault()
        fetchData(searchBar)
    }

    const handlePageLeft = (total, current) => {
        const page = Math.max(1, current - 1)
        fetchData(searchBar, page)
    }

    const handlePageRight = (total, current) => {
        const page = Math.min(total, current + 1)
        fetchData(searchBar, page)
    }

    const handleMovie = (type, id) => {
        navigate(`/${type}/${id}`)
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
            {/* Top nav */}
            <nav className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                    <Link to="/" className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
                        VIDOZA
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/" className="p-2 rounded-md hover:bg-white/10 transition text-gray-400 hover:text-white">
                            <Home size={18} />
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Search form */}
                <form className="flex flex-col gap-3 mb-8" onSubmit={handleSubmit}>
                    <div className="flex items-center gap-2 w-full">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                value={searchBar}
                                onChange={(e) => setSearchBar(e.target.value)}
                                type="text"
                                placeholder="Search for movies, TV shows, people..."
                                className="bg-[#141414] text-white pl-11 pr-4 py-3 rounded-md w-full border border-white/10 
                                           outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all
                                           placeholder:text-gray-600"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={buttonDisabled}
                            className={`px-5 py-3 rounded-md font-semibold flex items-center gap-2 transition-all ${buttonDisabled
                                ? "cursor-not-allowed opacity-40 bg-[#1a1a1a] text-gray-500"
                                : "bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20"
                                }`}
                        >
                            <ScanSearch size={18} />
                            <span className="hidden sm:inline">Search</span>
                        </button>
                    </div>
                    <div className="flex justify-end items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                            <input
                                checked={isAdult}
                                onChange={(e) => setisAdult(e.target.checked)}
                                type="checkbox"
                                className="accent-purple-600 rounded"
                            />
                            <span className="text-xs text-gray-500 group-hover:text-gray-300 transition">
                                Include Adult
                            </span>
                        </label>
                    </div>
                </form>

                {/* Loader */}
                {isLoading && (
                    <div className="flex justify-center py-16">
                        <div className="size-12 animate-spin border-[3px] border-purple-500/20 border-t-purple-500 rounded-full" />
                    </div>
                )}

                {/* Results */}
                {(data.results?.length > 0 || data.page > 0) && (
                    <div>
                        {/* Stats bar */}
                        <div className="flex justify-between items-center px-1 pb-4 text-xs text-gray-500 font-mono border-b border-white/5 mb-6">
                            <span>{data.total_results?.toLocaleString()} results</span>
                            <span>Page {data.page} of {data.total_pages}</span>
                        </div>

                        {data?.results?.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                                {data.results.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleMovie(item.media_type, item.id)}
                                        className="relative group/card rounded-md overflow-hidden cursor-pointer bg-[#141414]"
                                    >
                                        <img
                                            src={
                                                item.poster_path || item.backdrop_path || item.profile_path
                                                    ? imageLink + (item.poster_path || item.backdrop_path || item.profile_path)
                                                    : "https://via.placeholder.com/200x300?text=No+Image"
                                            }
                                            alt={item.title || item.name || "media"}
                                            className="w-full aspect-[2/3] object-cover transition-all duration-300 
                                                       group-hover/card:scale-105 group-hover/card:brightness-50"
                                            loading="lazy"
                                        />

                                        {/* Type badge */}
                                        <span className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider
                                            ${item.media_type === 'movie' ? 'bg-purple-600/90' : item.media_type === 'tv' ? 'bg-pink-600/90' : 'bg-gray-600/90'}`}>
                                            {item.media_type}
                                        </span>

                                        {/* Hover overlay */}
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
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMovie(item.media_type, item.id) }}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-white text-black text-xs font-bold py-1.5 rounded hover:bg-white/90 transition"
                                                >
                                                    <Play size={12} fill="black" /> View
                                                </button>
                                                <button
                                                    title="Add to Watch Later"
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/watch-later?id=${item.id}&type=${item.media_type}`) }}
                                                    className="flex items-center justify-center bg-white/10 border border-white/30 hover:border-white p-1.5 rounded transition"
                                                >
                                                    <ClockPlus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-gray-500 text-lg">No results found</p>
                                <p className="text-gray-600 text-sm mt-1">Try a different search term</p>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-4 mt-10 mb-4">
                            <button
                                disabled={data.page <= 1}
                                onClick={() => handlePageLeft(data.total_pages, data.page)}
                                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${data.page <= 1
                                    ? "opacity-30 cursor-not-allowed bg-white/5 text-gray-600"
                                    : "bg-white/10 hover:bg-purple-600 text-white"
                                    }`}
                            >
                                <ChevronsLeft size={16} /> Prev
                            </button>
                            <span className="text-sm font-mono text-gray-400 min-w-[60px] text-center">
                                {data.page} / {data.total_pages}
                            </span>
                            <button
                                disabled={data.page >= data.total_pages}
                                onClick={() => handlePageRight(data.total_pages, data.page)}
                                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${data.page >= data.total_pages
                                    ? "opacity-30 cursor-not-allowed bg-white/5 text-gray-600"
                                    : "bg-white/10 hover:bg-purple-600 text-white"
                                    }`}
                            >
                                Next <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-400 text-lg font-semibold">{error}</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default SearchPage
