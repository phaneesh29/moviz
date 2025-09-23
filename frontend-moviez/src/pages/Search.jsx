import { ChevronsLeft, ChevronsRight, ScanSearch, Search } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import axiosInstance from '../utils/axios'
import { imageLink } from '../utils/constants'
import { useNavigate } from 'react-router-dom'
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
    const [searchBar, setSearchBar] = useState("")
    const [buttonDisabled, setbuttonDisabled] = useState(true)
    const [isAdult, setisAdult] = useState(false)
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
        if (searchBar.trim()) {
            setbuttonDisabled(false)
            debouncedFetch(searchBar)
        } else {
            setbuttonDisabled(true)
            setData({})
        }
    }, [searchBar, isAdult])

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
        <div className='bg-[#111111] text-white p-2 py-5 min-h-screen flex flex-col gap-4'>
            <h1 className='text-[#b4b4b4] font-mono text-3xl text-center flex items-center justify-center gap-4'>
                <div className='flex gap-2 flex-wrap justify-center'>
                    <p className='font-extrabold text-white'>Search</p> for <p className='underline'>Movies</p>, <p className='underline'>TV Shows</p>, <p className='underline'>People</p>
                </div>
                <Search size={"26px"} strokeWidth='3px' />
            </h1>

            <form className='flex flex-col gap-2 p-3' onSubmit={handleSubmit}>
                <div className='flex items-center justify-center gap-2 w-full'>
                    <input
                        value={searchBar}
                        onChange={(e) => setSearchBar(e.target.value)}
                        type="text"
                        placeholder='Search...'
                        className='bg-[#222222] text-white p-3 rounded-md w-full border-none outline-none'
                    />
                    <button
                        type='submit'
                        disabled={buttonDisabled}
                        className={`bg-[#333333] p-3 rounded-md flex items-center justify-center gap-2 hover:bg-[#2b2b2b] ${buttonDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    >
                        Search <ScanSearch size={"20px"} strokeWidth='2px' />
                    </button>
                </div>
                <div className='flex justify-end items-center gap-2 w-full'>
                    <input
                        checked={isAdult}
                        onChange={(e) => setisAdult(e.target.checked)}
                        type="checkbox"
                        id="include-adult"
                    />
                    <label htmlFor="include-adult" className='text-sm text-[#888888]'>Include Adult</label>
                </div>
            </form>

            {isLoading && <div className='size-[60px] animate-spin border-4 border-white/30 border-t-white rounded-full mx-auto'></div>}

            {data.page && (
                <div>
                    <div className='flex justify-between items-center gap-2 p-3 text-sm text-[#b4b4b4] font-mono'>
                        <p>Total Pages: {data.total_pages}</p>
                        <p>Total Results: {data.total_results}</p>
                        <p>Page: {data.page}</p>
                    </div>
                    {data?.results?.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-[#0f0f0f] rounded-xl'>
                            {data.results.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleMovie(item.media_type, item.id)}
                                    className='flex gap-4 p-4 bg-[#222222] rounded-lg cursor-pointer hover:bg-[#2e2e2e] transition-all'
                                >
                                    <img
                                        src={item.poster_path || item.backdrop_path || item.profile_path ? imageLink + (item.poster_path || item.backdrop_path || item.profile_path) : "https://via.placeholder.com/100x150?text=No+Image"}
                                        alt={item.title || item.name || "media"}
                                        className='h-[150px] w-[100px] object-cover rounded-md'
                                    />
                                    <div className='flex flex-col gap-1 text-sm'>
                                        <p>Type: <span className='font-semibold'>{item.media_type?.toUpperCase()}</span></p>
                                        {item.title && <p>Title: {item.title}</p>}
                                        {item.name && <p>Name: {item.name}</p>}
                                        {item.original_title && <p>Original Title: {item.original_title}</p>}
                                        {item.original_name && <p>Original Name: {item.original_name}</p>}
                                        {item.release_date && <p>Release: {item.release_date}</p>}
                                        {item.first_air_date && <p>Aired: {item.first_air_date}</p>}
                                        <p className='font-mono text-[#aaa]'>ID: {item.id}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-center text-[#888]'>No Results Found</p>
                    )}

                    <div className='flex justify-center items-center gap-4 mt-4'>
                        <button
                            disabled={data.page <= 1}
                            onClick={() => handlePageLeft(data.total_pages, data.page)}
                            className={`p-2 ${data.page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:text-white text-[#888]"}`}
                        >
                            <ChevronsLeft />
                        </button>
                        <p className='font-mono'>{data.page}</p>
                        <button
                            disabled={data.page >= data.total_pages}
                            onClick={() => handlePageRight(data.total_pages, data.page)}
                            className={`p-2 ${data.page >= data.total_pages ? "opacity-50 cursor-not-allowed" : "hover:text-white text-[#888]"}`}
                        >
                            <ChevronsRight />
                        </button>
                    </div>
                </div>
            )}

            {error && <p className='text-red-500 text-lg text-center'>{error}</p>}
            <Footer />
        </div>
    )
}

export default SearchPage
