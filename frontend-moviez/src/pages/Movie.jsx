import React, { useEffect, useState } from 'react'
import axiosInstance from '../utils/axios'
import { useNavigate, useParams } from 'react-router-dom';
import { imageLink } from '../utils/constants'
import MovieEmbed from '../components/MovieEmbed';
import { LucideHome, LucideSearch } from 'lucide-react';

const MoviePage = () => {
    const navigate = useNavigate()
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [data, setData] = useState({})
    const [credit, setCredit] = useState({})
    const [showFullCast, setShowFullCast] = useState(false)

    const fetchMovieData = async (id) => {
        setError("")
        setData({})
        setIsLoading(true)
        try {
            const result = await axiosInstance.get(`/movie/get/${id}`)
            if (result.status == 200) {
                setData(result.data.results)
            }
        }
        catch (error) {
            setData({})
            setError(error?.response?.data?.message || "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchMovieCredits = async (id) => {
        setError("")
        setCredit({})
        setIsLoading(true)
        try {
            const result = await axiosInstance.get(`/movie/credits/${id}`)
            if (result.status == 200) {
                setCredit(result.data.results)
            }
        }
        catch (error) {
            setCredit({})
            setError(error?.response?.data?.message || "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMovieData(id)
        fetchMovieCredits(id)
    }, [id])

    useEffect(() => {
        document.title = data.title || "Movie Page"
    }, [data])

    const displayedCast = showFullCast ? credit.cast : credit.cast?.slice(0, 6)

    return (
        <div className='bg-[#0a0a0a] text-white min-h-screen font-sans'>

            {data.id && (
                <div className='h-full w-full aspect-video bg-black'>
                    <MovieEmbed imdbId={data.imdb_id} tmdbId={data.id} />
                </div>
            )}
            <div className='flex items-center cursor-pointer justify-start transition-all duration-300 gap-4 p-4 fixed right-1 top-3 lg:right-8 lg:top-4 z-10 bg-[#1a1a1abe] opacity-20 hover:opacity-100 rounded-lg shadow-lg'>
                <button className='flex  justify-center items-center gap-2 cursor-pointer rounded-lg text-sm' onClick={() => navigate("/")}><LucideHome /></button>
                <button className='flex  justify-center items-center gap-2 cursor-pointer rounded-lg text-sm' onClick={() => navigate("/search")}><LucideSearch /></button>
            </div>

            <div className='p-4 lg:p-8'>
                {/* Movie Info & Cast */}
                {data.id && (
                    <div className='flex flex-col lg:flex-row gap-10 mt-6'>
                        {/* Movie Details */}
                        <div className='lg:w-2/3 space-y-6'>
                            <h1 className='text-4xl font-bold tracking-tight'>{data.title}</h1>
                            <p className='text-base italic text-gray-400'>{data.tagline}</p>
                            <div className='flex flex-wrap gap-2'>
                                {data.genres?.map((genre, index) => (
                                    <span key={index} className='text-xs bg-[#1c1c1c] px-3 py-1 rounded-full font-medium'>{genre.name}</span>
                                ))}
                            </div>
                            <p className='text-gray-200 text-lg leading-relaxed'>{data.overview}</p>

                            <div className='grid grid-cols-2 gap-4 text-sm text-gray-400'>
                                <p><span className='text-white font-semibold'>Release:</span> {data.release_date}</p>
                                <p><span className='text-white font-semibold'>Original Title:</span> {data.original_title}</p>
                                <p><span className='text-white font-semibold'>IMDB ID:</span> {data.imdb_id}</p>
                                <p><span className='text-white font-semibold'>Budget:</span> ${data.budget?.toLocaleString()}</p>
                            </div>

                            {/* Production Companies */}
                            <div className='mt-4'>
                                <h3 className='text-lg font-semibold mb-2'>Production Companies</h3>
                                <div className='flex flex-wrap gap-2'>
                                    {data.production_companies?.map((company) => (
                                        <span key={company.name} className='text-xs bg-[#262626] px-2 py-1 rounded-md'>{company.name}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Countries */}
                            <div>
                                <h3 className='text-lg font-semibold mt-4 mb-2'>Production Countries</h3>
                                <div className='flex flex-wrap gap-2'>
                                    {data.production_countries?.map((country) => (
                                        <span key={country.name} className='text-xs bg-[#262626] px-2 py-1 rounded-md'>{country.name}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Cast Section */}
                        {credit.id && credit.cast.length > 0 && (
                            <div className='lg:w-1/3 space-y-4'>
                                <h2 className='text-2xl font-semibold border-b border-gray-600 pb-2'>Cast</h2>
                                <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-4'>
                                    {displayedCast.map((cast, index) => (
                                        <div key={index} className='bg-[#1a1a1a] p-2 rounded-md gap-2 flex flex-col items-center justify-center shadow hover:bg-[#1b1b1b] transition-all duration-300'>
                                            <img src={imageLink + (cast.profile_path)} alt={cast.name || "media"} className='rounded-lg h-[220px] object-cover object-center' />
                                            <p className='mt-2 font-medium text-center text-sm'>{cast.name}</p>
                                            <p className='text-sm text-gray-400 text-center'>{cast.character}</p>
                                        </div>
                                    ))}
                                </div>
                                {credit.cast.length > 6 && (
                                    <button
                                        onClick={() => setShowFullCast(!showFullCast)}
                                        className='mt-2 text-sm  p-1 rounded-lg text-blue-400 hover:underline transition duration-200'
                                    >
                                        {showFullCast ? 'Show Less ' : 'Show More'}
                                    </button>

                                )}



                            </div>
                        )}
                    </div>
                )}

                {/* Loading Spinner */}
                {isLoading && (
                    <div className='w-20 h-20 animate-spin border-4 border-t-white border-gray-600 rounded-full m-auto mt-10'></div>
                )}

                {/* Error Message */}
                {error && (
                    <p className='text-red-600 text-center text-lg font-semibold mt-6'>{error}</p>
                )}
            </div>
        </div>
    )
}

export default MoviePage
