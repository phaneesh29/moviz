import { ChevronsLeft, ChevronsRight, ClockPlus, ScanSearch, Search } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import axiosInstance from '../utils/axios'
import { imageLink } from '../utils/constants'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] justify-between">
            <div className="text-white p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">
                {/* Header */}
                <h1 className="text-[#b4b4b4] font-mono text-3xl text-center flex items-center justify-center gap-3">
                    <div className="flex gap-2 flex-wrap justify-center">
                        <p className="font-extrabold text-white">Search</p> for
                        <p className="underline decoration-pink-500">Movies</p>,
                        <p className="underline decoration-purple-500">TV Shows</p>
                    </div>
                    <Search size="28px" strokeWidth="3px" />
                </h1>

                {/* Search Input */}
                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                    <div className="flex items-center gap-2 w-full">
                        <input
                            value={searchBar}
                            onChange={(e) => setSearchBar(e.target.value)}
                            type="text"
                            placeholder="Search..."
                            className="bg-[#222222] text-white px-4 py-3 rounded-lg w-full border border-transparent outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                        <button
                            type="submit"
                            disabled={buttonDisabled}
                            className={`px-5 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md transition ${buttonDisabled
                                ? "cursor-not-allowed opacity-50 bg-[#2a2a2a]"
                                : "bg-purple-600 hover:bg-purple-700"
                                }`}
                        >
                            Search <ScanSearch size="20px" strokeWidth="2px" />
                        </button>
                    </div>
                    <div className="flex justify-end items-center gap-2 w-full">
                        <input
                            checked={isAdult}
                            onChange={(e) => setisAdult(e.target.checked)}
                            type="checkbox"
                            id="include-adult"
                            className="accent-purple-600"
                        />
                        <label
                            htmlFor="include-adult"
                            className="text-sm text-[#aaa] cursor-pointer"
                        >
                            Include Adult
                        </label>
                    </div>
                </form>

                {/* Loader */}
                {isLoading && (
                    <div className="flex justify-center py-6">
                        <div className="size-[60px] animate-spin border-4 border-purple-500/30 border-t-purple-500 rounded-full"></div>
                    </div>
                )}

                {/* Results */}
                {(data.results?.length > 0 || data.page > 0) && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center gap-2 p-3 text-sm text-[#b4b4b4] font-mono border-b border-[#333]">
                            <p>Total Pages: {data.total_pages}</p>
                            <p>Total Results: {data.total_results}</p>
                            <p>Page: {data.page}</p>
                        </div>

                        {data?.results?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-3">
                                {data.results.filter(item => item.media_type !== "person").map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleMovie(item.media_type, item.id)}
                                        className="flex gap-4 p-4 bg-[#1e1e1e] rounded-xl cursor-pointer hover:bg-[#292929] transition-all shadow-md hover:shadow-lg"
                                    >
                                        <img
                                            src={
                                                item.poster_path || item.backdrop_path || item.profile_path
                                                    ? imageLink +
                                                    (item.poster_path ||
                                                        item.backdrop_path ||
                                                        item.profile_path)
                                                    : "https://via.placeholder.com/100x150?text=No+Image"
                                            }
                                            alt={item.title || item.name || "media"}
                                            className="h-[150px] w-[100px] object-cover rounded-md"
                                        />
                                        <div className="flex flex-col gap-1 text-sm overflow-hidden">
                                            <p>
                                                Type:{" "}
                                                <span className="font-semibold text-purple-400">
                                                    {item.media_type?.toUpperCase()}
                                                </span>
                                            </p>
                                            {item.title && (
                                                <p className="truncate">Title: {item.title}</p>
                                            )}
                                            {item.name && (
                                                <p className="truncate">Name: {item.name}</p>
                                            )}
                                            {item.original_title && (
                                                <p className="truncate">
                                                    Original Title: {item.original_title}
                                                </p>
                                            )}
                                            {item.original_name && (
                                                <p className="truncate">
                                                    Original Name: {item.original_name}
                                                </p>
                                            )}
                                            {item.release_date && <p>Release: {item.release_date}</p>}
                                            {item.first_air_date && (
                                                <p>Aired: {item.first_air_date}</p>
                                            )}
                                            <p className="font-mono text-[#aaa]">ID: {item.id}</p>
                                            <button title='Add to Watch Later' onClick={(e) => { e.stopPropagation(); navigate(`/watch-later?id=${item.id}&type=${item.media_type}`) }} className='bg-transparent hover:bg-purple-400 size-5 rounded-full cursor-pointer'><ClockPlus size={20} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-[#888] py-6">No Results Found</p>
                        )}

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-6 mt-6">
                            <button
                                disabled={data.page <= 1}
                                onClick={() => handlePageLeft(data.total_pages, data.page)}
                                className={`p-2 rounded-lg transition ${data.page <= 1
                                    ? "opacity-50 cursor-not-allowed bg-[#222]"
                                    : "hover:bg-purple-600 bg-[#2a2a2a]"
                                    }`}
                            >
                                <ChevronsLeft />
                            </button>
                            <p className="font-mono">{data.page}</p>
                            <button
                                disabled={data.page >= data.total_pages}
                                onClick={() => handlePageRight(data.total_pages, data.page)}
                                className={`p-2 rounded-lg transition ${data.page >= data.total_pages
                                    ? "opacity-50 cursor-not-allowed bg-[#222]"
                                    : "hover:bg-purple-600 bg-[#2a2a2a]"
                                    }`}
                            >
                                <ChevronsRight />
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <p className="text-red-500 text-lg text-center font-semibold py-4">
                        {error}
                    </p>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default SearchPage
