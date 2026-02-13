import React, { useEffect, useState } from 'react'
import Seo from '../components/Seo'
import axiosInstance from '../utils/axios'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { imageLink } from '../utils/constants'
import MovieEmbed from '../components/MovieEmbed';
import { Home, Search, Star, Clock, DollarSign, Film, Globe, Play, ClockPlus } from 'lucide-react';
import Footer from '../components/Footer';

const MoviePage = () => {
    const navigate = useNavigate()
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [data, setData] = useState({})
    const [credit, setCredit] = useState({})
    const [recommendations, setRecommendations] = useState([])
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

    const fetchRecommendations = async (id) => {
        try {
            const result = await axiosInstance.get(`/movie/recommendations/${id}`)
            if (result.status === 200) {
                setRecommendations(result.data.results?.results || [])
            }
        } catch (err) {
            console.error('Failed to load recommendations', err)
        }
    }

    useEffect(() => {
        fetchMovieData(id)
        fetchMovieCredits(id)
        fetchRecommendations(id)
    }, [id])

    useEffect(() => {
        document.title = data.title || "Movie Page"
    }, [data])

    const displayedCast = showFullCast ? credit.cast : credit.cast?.slice(0, 8)

    const formatRuntime = (mins) => {
        if (!mins) return null
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return `${h}h ${m}m`
    }

    return (
        <div className="bg-[#0a0a0a] text-white min-h-screen">

            {/* Floating Nav */}
            <nav className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                    <Link to="/" className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
                        VIDOZA
                    </Link>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-md hover:bg-white/10 transition text-gray-300 hover:text-white"
                            onClick={() => navigate("/")}>
                            <Home size={18} />
                        </button>
                        <button className="p-2 rounded-md hover:bg-white/10 transition text-gray-300 hover:text-white"
                            onClick={() => navigate("/search")}>
                            <Search size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Movie Player */}
            {data.id && (
                <div className="relative w-full aspect-video bg-black shadow-2xl">
                    <MovieEmbed imdbId={data.imdb_id} tmdbId={data.id} />
                </div>
            )}

            {/* Backdrop hero area */}
            {data.id && data.backdrop_path && (
                <div className="relative h-[40vh] md:h-[50vh] overflow-hidden -mt-1">
                    <img
                        src={imageLink + data.backdrop_path}
                        alt={data.title}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 to-transparent" />

                    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 h-full flex items-end pb-10">
                        <div className="flex gap-6 items-end">
                            {data.poster_path && (
                                <img
                                    src={imageLink + data.poster_path}
                                    alt={data.title}
                                    className="hidden md:block w-[160px] rounded-lg shadow-2xl border border-white/10"
                                />
                            )}
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                                    {data.title}
                                </h1>
                                {data.tagline && (
                                    <p className="text-base italic text-gray-400">{data.tagline}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                                    {data.vote_average > 0 && (
                                        <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                                            <Star size={14} fill="currentColor" /> {data.vote_average?.toFixed(1)}
                                        </span>
                                    )}
                                    {data.release_date && (
                                        <span>{data.release_date.slice(0, 4)}</span>
                                    )}
                                    {data.runtime > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={13} /> {formatRuntime(data.runtime)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {data.id && (
                    <>
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

                        <div className="flex flex-col lg:flex-row gap-10">
                            {/* Main content */}
                            <div className="lg:w-2/3 space-y-6">
                                {/* Genres */}
                                <div className="flex flex-wrap gap-2">
                                    {data.genres?.map((genre) => (
                                        <span key={genre.id}
                                            className="text-xs bg-purple-600/20 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full font-medium">
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>

                                {/* Overview */}
                                <p className="text-gray-300 text-base leading-relaxed">{data.overview}</p>

                                {/* Details grid */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {data.release_date && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                            <p className="text-gray-500 text-xs mb-1">Release Date</p>
                                            <p className="font-medium">{data.release_date}</p>
                                        </div>
                                    )}
                                    {data.original_title && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                            <p className="text-gray-500 text-xs mb-1">Original Title</p>
                                            <p className="font-medium">{data.original_title}</p>
                                        </div>
                                    )}
                                    {data.imdb_id && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                            <p className="text-gray-500 text-xs mb-1">IMDB</p>
                                            <a href={`https://www.imdb.com/title/${data.imdb_id}`} target="_blank" rel="noopener noreferrer"
                                               className="font-medium text-purple-400 hover:underline">{data.imdb_id}</a>
                                        </div>
                                    )}
                                    {data.budget > 0 && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                            <p className="text-gray-500 text-xs mb-1">Budget</p>
                                            <p className="font-medium">${data.budget?.toLocaleString()}</p>
                                        </div>
                                    )}
                                    {data.revenue > 0 && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                            <p className="text-gray-500 text-xs mb-1">Revenue</p>
                                            <p className="font-medium">${data.revenue?.toLocaleString()}</p>
                                        </div>
                                    )}
                                    {data.status && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                            <p className="text-gray-500 text-xs mb-1">Status</p>
                                            <p className="font-medium">{data.status}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Production */}
                                {data.production_companies?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Production</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {data.production_companies.map((company) => (
                                                <span key={company.name}
                                                    className="text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-md">
                                                    {company.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {data.production_countries?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Countries</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {data.production_countries.map((country) => (
                                                <span key={country.name}
                                                    className="text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-md">
                                                    {country.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cast sidebar */}
                            {credit.id && credit.cast?.length > 0 && (
                                <div className="lg:w-1/3 space-y-4">
                                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Cast</h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        {displayedCast.map((cast, index) => (
                                            <div key={index}
                                                onClick={() => navigate(`/person/${cast.id}`)}
                                                className="bg-[#141414] rounded-lg overflow-hidden cursor-pointer group
                                                           border border-white/5 hover:border-purple-500/30 transition-all">
                                                <img src={cast.profile_path ? imageLink + cast.profile_path : 'https://via.placeholder.com/200x250?text=No+Photo'}
                                                    alt={cast.name || "media"}
                                                    className="w-full h-[160px] object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                                                <div className="p-2">
                                                    <p className="text-sm font-medium truncate">{cast.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{cast.character}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {credit.cast.length > 8 && (
                                        <button
                                            onClick={() => setShowFullCast(!showFullCast)}
                                            className="text-sm px-4 py-2 rounded-md bg-white/5 border border-white/10 text-purple-400 
                                                       hover:bg-purple-600/20 hover:border-purple-500/30 transition-all w-full">
                                            {showFullCast ? 'Show Less' : `Show All (${credit.cast.length})`}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">More Like This</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {recommendations.slice(0, 12).map((rec) => (
                                <div key={rec.id}
                                    onClick={() => navigate(`/movie/${rec.id}`)}
                                    className="group/rec relative rounded-lg overflow-hidden bg-[#141414] border border-white/5 cursor-pointer hover:border-purple-500/30 transition-all">
                                    <div className="aspect-[2/3] relative">
                                        {rec.poster_path ? (
                                            <img src={imageLink + rec.poster_path} alt={rec.title}
                                                className="w-full h-full object-cover group-hover/rec:scale-105 transition-transform duration-300" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                                                <Film size={28} className="text-gray-700" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/rec:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                                            <button className="bg-white text-black px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 hover:bg-gray-200 transition">
                                                <Play size={12} fill="black" /> Play
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/watch-later?id=${rec.id}&type=movie`) }}
                                                className="bg-white/10 border border-white/30 hover:border-white px-3 py-1 rounded-md text-[10px] flex items-center gap-1 transition">
                                                <ClockPlus size={11} /> Watch Later
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <p className="text-xs font-medium truncate">{rec.title}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                            {rec.vote_average > 0 && (
                                                <span className="flex items-center gap-0.5 text-yellow-400">
                                                    <Star size={8} fill="currentColor" /> {rec.vote_average.toFixed(1)}
                                                </span>
                                            )}
                                            <span>{rec.release_date?.slice(0, 4)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="h-[50vh] flex justify-center items-center">
                        <div className="size-14 animate-spin border-[3px] border-purple-500/20 border-t-purple-500 rounded-full" />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center py-16">
                        <p className="text-red-400 text-lg font-semibold">{error}</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default MoviePage
