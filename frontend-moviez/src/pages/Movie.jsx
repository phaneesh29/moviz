import React, { useEffect, useState } from 'react'
import Seo from '../components/Seo'
import axiosInstance from '../utils/axios'
import { useNavigate, useParams } from 'react-router-dom';
import { imageLink } from '../utils/constants'
import MovieEmbed from '../components/MovieEmbed';
import { LucideHome, LucideSearch } from 'lucide-react';
import Footer from '../components/Footer';

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
            if (result.status === 200) {
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
            if (result.status === 200) {
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
        <div className="bg-[#0a0a0a] text-white min-h-screen font-sans">

            {/* Movie Player */}
            {data.id && (
                <div className="relative w-full aspect-video bg-black shadow-lg">
                    <MovieEmbed imdbId={data.imdb_id} tmdbId={data.id} />
                </div>
            )}

            {/* Floating Nav */}
            <div className="flex items-center gap-4 p-3 fixed right-4 top-4 z-20 
                            bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20
                            opacity-40 hover:opacity-100 transition-all duration-300">
                <button
                    className="p-2 rounded-lg hover:bg-white/20 transition"
                    onClick={() => navigate("/")}>
                    <LucideHome size={20} />
                </button>
                <button
                    className="p-2 rounded-lg hover:bg-white/20 transition"
                    onClick={() => navigate("/search")}>
                    <LucideSearch size={20} />
                </button>
            </div>

            <div className="p-4 lg:p-10 max-w-7xl mx-auto">

                {data.id && (
                    <div className="flex flex-col lg:flex-row gap-10 mt-8">

                        {/* Movie Details */}
                        <div className="lg:w-2/3 space-y-6">
                            <Seo
                                title={data.title}
                                description={data.overview}
                                canonical={`https://vidoza.vercel.app/movie/${data.id}`}
                                openGraph={{
                                    image: data.poster_path ? imageLink + data.poster_path : undefined,
                                }}
                                jsonLd={data.id ? {
                                    "@context": "https://schema.org",
                                    "@type": "Movie",
                                    "name": data.title,
                                    "image": data.poster_path ? imageLink + data.poster_path : undefined,
                                    "description": data.overview,
                                    "datePublished": data.release_date,
                                    "aggregateRating": data.vote_average ? { "@type": "AggregateRating", "ratingValue": data.vote_average, "ratingCount": data.vote_count } : undefined
                                } : null}
                            />

                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                                    {data.title}
                                </h1>
                            {data.tagline && (
                                <p className="text-lg italic text-gray-400">{data.tagline}</p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {data.genres?.map((genre, index) => (
                                    <span key={index}
                                        className="text-xs bg-gradient-to-r from-[#1e1e1e] to-[#2c2c2c] px-3 py-1 rounded-full font-medium shadow">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>

                            <p className="text-gray-200 text-lg leading-relaxed">{data.overview}</p>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 bg-[#111]/60 p-4 rounded-lg shadow-md">
                                <p><span className="text-white font-semibold">Release:</span> {data.release_date}</p>
                                <p><span className="text-white font-semibold">Original Title:</span> {data.original_title}</p>
                                <p><span className="text-white font-semibold">IMDB ID:</span> {data.imdb_id}</p>
                                <p><span className="text-white font-semibold">Budget:</span> ${data.budget?.toLocaleString()}</p>
                            </div>

                            {/* Production Companies */}
                            {data.production_companies?.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Production Companies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {data.production_companies?.map((company) => (
                                            <span key={company.name}
                                                className="text-xs bg-[#1a1a1a] px-3 py-1 rounded-md shadow">
                                                {company.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Countries */}
                            {data.production_countries?.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mt-4 mb-3">Production Countries</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {data.production_countries?.map((country) => (
                                            <span key={country.name}
                                                className="text-xs bg-[#1a1a1a] px-3 py-1 rounded-md shadow">
                                                {country.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cast Section */}
                        {credit.id && credit.cast?.length > 0 && (
                            <div className="lg:w-1/3 space-y-5">
                                <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">Cast</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {displayedCast.map((cast, index) => (
                                        <div key={index}
                                            className="bg-[#141414] p-3 rounded-lg flex flex-col items-center justify-center 
                                                       shadow hover:shadow-lg hover:scale-[1.02] transition">
                                            <img src={imageLink + (cast.profile_path)}
                                                alt={cast.name || "media"}
                                                className="rounded-lg h-[200px] w-full object-cover object-center" />
                                            <p className="mt-2 font-medium text-center text-sm">{cast.name}</p>
                                            <p className="text-sm text-gray-400 text-center">{cast.character}</p>
                                        </div>
                                    ))}
                                </div>
                                {credit.cast.length > 6 && (
                                    <button
                                        onClick={() => setShowFullCast(!showFullCast)}
                                        className="mt-2 text-sm px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition">
                                        {showFullCast ? 'Show Less' : 'Show More'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="h-[50vh] flex justify-center items-center">
                        <div className="w-16 h-16 animate-spin border-4 border-t-blue-500 border-gray-600 rounded-full"></div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <p className="text-red-500 text-center text-lg font-semibold mt-6">{error}</p>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default MoviePage
