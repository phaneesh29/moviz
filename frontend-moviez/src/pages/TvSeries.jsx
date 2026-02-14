import React, { useEffect, useState, useRef } from 'react'
import Seo from '../components/Seo'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import { imageLink, imgPosterSmall, imgPosterLarge, imgBackdrop, imgProfile } from '../utils/constants'
import VideoEmbed from '../components/VideoEmbed'
import { Star, Play, ChevronDown, ClockPlus, Film, Tv, Share2, Youtube, X } from 'lucide-react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { addToWatchLater } from '../utils/watchLater'
import { useToast } from '../components/Toast'
import { DetailSkeleton } from '../components/Skeleton'

const TvSeries = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const toast = useToast()

    const query = new URLSearchParams(location.search)
    const querySeason = Number(query.get('season')) || 1
    const queryEpisode = Number(query.get('episode')) || 1

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [series, setSeries] = useState({})
    const [season, setSeason] = useState({})
    const [episode, setEpisode] = useState({})
    const [credits, setCredits] = useState({ cast: [], crew: [] })
    const [selectedSeason, setSelectedSeason] = useState(querySeason)
    const [selectedEpisode, setSelectedEpisode] = useState(queryEpisode)
    const [showFullCast, setShowFullCast] = useState(false)
    const [showFullCrew, setShowFullCrew] = useState(false)
    const [recommendations, setRecommendations] = useState([])
    const [trailerKey, setTrailerKey] = useState(null)
    const [showTrailer, setShowTrailer] = useState(false)
    const initialLoadDone = useRef(false)

    useEffect(() => {
        navigate(`/tv/${id}?season=${selectedSeason}&episode=${selectedEpisode}`, { replace: true })
    }, [selectedSeason, selectedEpisode, id, navigate])

    const fetchSeries = async () => {
        try {
            const res = await axiosInstance.get(`/tv/get/${id}`)
            if (res.status === 200) setSeries(res.data.results)
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load series")
        }
    }

    const fetchSeason = async (seasonNum) => {
        try {
            const res = await axiosInstance.get(`/tv/season/${id}/${seasonNum}`)
            if (res.status === 200) setSeason(res.data.results)
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load season")
        }
    }

    const fetchEpisode = async (seasonNum, episodeNum) => {
        try {
            const res = await axiosInstance.get(`/tv/episode/${id}/${seasonNum}/${episodeNum}`)
            if (res.status === 200) setEpisode(res.data.results)
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load episode")
        }
    }

    const fetchCredits = async (seasonNum, episodeNum) => {
        try {
            const res = await axiosInstance.get(`/tv/credits/${id}/${seasonNum}/${episodeNum}`)
            if (res.status === 200) setCredits(res.data.results)
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load credits")
        }
    }

    const fetchRecommendations = async () => {
        try {
            const res = await axiosInstance.get(`/tv/recommendations/${id}`)
            if (res.status === 200) setRecommendations(res.data.results?.results || [])
        } catch (err) {
            console.error('Failed to load recommendations', err)
        }
    }

    const fetchVideos = async () => {
        try {
            const res = await axiosInstance.get(`/tv/videos/${id}`)
            if (res.status === 200) {
                const videos = res.data.results?.results || []
                const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
                    || videos.find(v => v.site === 'YouTube')
                if (trailer) setTrailerKey(trailer.key)
            }
        } catch (err) {
            console.error('Failed to load videos', err)
        }
    }

    useEffect(() => {
        const loadAll = async () => {
            initialLoadDone.current = false
            setIsLoading(true)
            setTrailerKey(null)
            await Promise.all([
                fetchSeries(),
                fetchSeason(selectedSeason),
                fetchEpisode(selectedSeason, selectedEpisode),
                fetchCredits(selectedSeason, selectedEpisode),
                fetchRecommendations(),
                fetchVideos(),
            ])
            setIsLoading(false)
            initialLoadDone.current = true
        }
        loadAll()
    }, [id])

    useEffect(() => {
        // Skip the first run — initial load already fetched these
        if (!initialLoadDone.current) return
        const loadEpisode = async () => {
            setIsLoading(true)
            await Promise.all([
                fetchSeason(selectedSeason),
                fetchEpisode(selectedSeason, selectedEpisode),
                fetchCredits(selectedSeason, selectedEpisode),
            ])
            setIsLoading(false)
        }
        loadEpisode()
    }, [selectedSeason, selectedEpisode])

    const displayedCast = showFullCast ? credits.cast : credits.cast?.slice(0, 8)
    const displayedCrew = showFullCrew ? credits.crew : credits.crew?.slice(0, 6)

    const PersonCard = ({ person, role = "" }) => (
        <div onClick={() => navigate(`/person/${person.id}`)}
            className="bg-[#141414] rounded-lg overflow-hidden cursor-pointer group border border-white/5 hover:border-purple-500/30 transition-all">
            {person.profile_path ? (
                <img
                    src={imgProfile + person.profile_path}
                    alt={person.name}
                    className="w-full h-[140px] object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
            ) : (
                <div className="w-full h-[140px] bg-[#1a1a1a] flex items-center justify-center text-gray-600 text-2xl font-bold">
                    {person.name?.[0]}
                </div>
            )}
            <div className="p-2">
                <p className="text-xs font-medium truncate">{person.name}</p>
                {role && <p className="text-[10px] text-gray-500 truncate">{role}</p>}
            </div>
        </div>
    )

    return (
        <div className="bg-[#0a0a0a] text-white min-h-screen">
            {/* Top nav */}
            <Navbar variant="fixed" />

            {isLoading && !series.id ? (
                <DetailSkeleton />
            ) : (
                <>
                    {/* Player */}
                    {episode.id && (
                        <div className="relative w-full aspect-video shadow-2xl bg-black">
                            <VideoEmbed type="tv" tmdbId={series.id} season={selectedSeason} episode={selectedEpisode} />
                        </div>
                    )}

                    {/* Trailer modal */}
                    {showTrailer && trailerKey && (
                        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setShowTrailer(false)}>
                            <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => setShowTrailer(false)}
                                    className="absolute -top-10 right-0 text-white hover:text-red-400 transition"
                                >
                                    <X size={28} />
                                </button>
                                <iframe
                                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                                    title="Trailer"
                                    allowFullScreen
                                    allow="autoplay"
                                    className="w-full h-full rounded-lg"
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                        <Seo
                            title={series.name}
                            description={series.overview || episode.overview}
                            canonical={`https://vidoza.vercel.app/tv/${series.id}`}
                            openGraph={{ image: series.poster_path ? imgPosterLarge + series.poster_path : undefined }}
                            jsonLd={series.id ? {
                                "@context": "https://schema.org",
                                "@type": "TVSeries",
                                "name": series.name,
                                "description": series.overview,
                                "image": series.poster_path ? imgPosterLarge + series.poster_path : undefined,
                            } : null}
                        />

                        {/* Series header */}
                        <div className="flex gap-6 items-start mb-8">
                            {series.poster_path && (
                                <img src={imgPosterLarge + series.poster_path} alt={series.name}
                                    className="hidden md:block w-[140px] rounded-lg shadow-xl border border-white/10" />
                            )}
                            <div className="space-y-3">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight">{series.name}</h1>
                                {series.tagline && <p className="text-sm italic text-gray-500">{series.tagline}</p>}

                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                                    {series.vote_average > 0 && (
                                        <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                                            <Star size={14} fill="currentColor" /> {series.vote_average?.toFixed(1)}
                                        </span>
                                    )}
                                    <span>{series.first_air_date?.slice(0, 4)} – {series.last_air_date?.slice(0, 4) || 'Present'}</span>
                                    <span>{series.number_of_seasons} Season{series.number_of_seasons > 1 ? 's' : ''}</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {series.genres?.map((g) => (
                                        <span key={g.id}
                                            className="text-xs bg-purple-600/20 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full font-medium">
                                            {g.name}
                                        </span>
                                    ))}
                                </div>

                                {episode.overview && (
                                    <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{episode.overview}</p>
                                )}

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href)
                                        toast.success('Link copied to clipboard')
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm font-medium transition border border-white/10 w-fit"
                                >
                                    <Share2 size={14} /> Share
                                </button>
                                {trailerKey && (
                                    <button
                                        onClick={() => setShowTrailer(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-md text-sm font-semibold transition w-fit"
                                    >
                                        <Youtube size={16} /> Trailer
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Season & Episode selector */}
                        <div className="mb-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <select
                                        value={selectedSeason}
                                        onChange={(e) => { setSelectedSeason(Number(e.target.value)); setSelectedEpisode(1) }}
                                        className="appearance-none bg-[#141414] border border-white/10 text-white px-4 py-2 pr-10 rounded-md 
                                                   text-sm font-medium focus:border-purple-500 focus:outline-none cursor-pointer"
                                    >
                                        {Array.from({ length: series.number_of_seasons }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>Season {i + 1}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Episode grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                {season.episodes?.map((ep) => (
                                    <button
                                        key={ep.id}
                                        onClick={() => setSelectedEpisode(ep.episode_number)}
                                        className={`relative text-left p-3 rounded-md transition-all border
                                            ${ep.episode_number === selectedEpisode
                                                ? "bg-purple-600/20 border-purple-500/50 ring-1 ring-purple-500/30"
                                                : "bg-[#141414] border-white/5 hover:border-white/15 hover:bg-[#1a1a1a]"}`}
                                    >
                                        {ep.still_path && (
                                            <img src={imgPosterSmall + ep.still_path} alt={ep.name}
                                                className="w-full aspect-video object-cover rounded mb-2 opacity-70" loading="lazy" />
                                        )}
                                        <p className="font-semibold text-xs truncate">
                                            <span className="text-purple-400">E{ep.episode_number}</span> {ep.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                            {ep.runtime && <span>{ep.runtime}m</span>}
                                            {ep.air_date && <span>{ep.air_date}</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* People sections */}
                        <div className="space-y-8">
                            {series.created_by?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Created By</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                        {series.created_by.map((creator) => (
                                            <PersonCard key={creator.id} person={creator} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {credits.cast?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Cast</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                        {displayedCast.map((cast) => (
                                            <PersonCard key={cast.id + cast.character} person={cast} role={cast.character} />
                                        ))}
                                    </div>
                                    {credits.cast.length > 8 && (
                                        <button onClick={() => setShowFullCast(!showFullCast)}
                                            className="mt-3 text-sm px-4 py-2 rounded-md bg-white/5 border border-white/10 text-purple-400 
                                                       hover:bg-purple-600/20 hover:border-purple-500/30 transition-all">
                                            {showFullCast ? "Show Less" : `Show All (${credits.cast.length})`}
                                        </button>
                                    )}
                                </div>
                            )}

                            {episode.guest_stars?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Guest Stars</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                        {episode.guest_stars.map((guest) => (
                                            <PersonCard key={guest.id + guest.character} person={guest} role={guest.character} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {credits.crew?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Crew</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                        {displayedCrew.map((crew, i) => (
                                            <PersonCard key={crew.id + crew.job + i} person={crew} role={crew.job} />
                                        ))}
                                    </div>
                                    {credits.crew.length > 6 && (
                                        <button onClick={() => setShowFullCrew(!showFullCrew)}
                                            className="mt-3 text-sm px-4 py-2 rounded-md bg-white/5 border border-white/10 text-purple-400 
                                                       hover:bg-purple-600/20 hover:border-purple-500/30 transition-all">
                                            {showFullCrew ? "Show Less" : `Show All (${credits.crew.length})`}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">More Like This</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                    {recommendations.slice(0, 12).map((rec) => (
                                        <div key={rec.id}
                                            onClick={() => navigate(`/tv/${rec.id}`)}
                                            className="group/rec relative rounded-lg overflow-hidden bg-[#141414] border border-white/5 cursor-pointer hover:border-purple-500/30 transition-all">
                                            <div className="aspect-[2/3] relative">
                                                {rec.poster_path ? (
                                                    <img src={imgPosterSmall + rec.poster_path} alt={rec.name}
                                                        className="w-full h-full object-cover group-hover/rec:scale-105 transition-transform duration-300" loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                                                        <Tv size={28} className="text-gray-700" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/rec:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                                                    <button className="bg-white text-black px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 hover:bg-gray-200 transition">
                                                        <Play size={12} fill="black" /> Play
                                                    </button>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation()
                                                        const added = addToWatchLater(rec.id, 'tv')
                                                        toast[added ? 'success' : 'info'](added ? 'Added to Watch Later' : 'Already in Watch Later')
                                                    }}
                                                        className="bg-white/10 border border-white/30 hover:border-white px-3 py-1 rounded-md text-[10px] flex items-center gap-1 transition">
                                                        <ClockPlus size={11} /> Watch Later
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-2">
                                                <p className="text-xs font-medium truncate">{rec.name}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                                    {rec.vote_average > 0 && (
                                                        <span className="flex items-center gap-0.5 text-yellow-400">
                                                            <Star size={8} fill="currentColor" /> {rec.vote_average.toFixed(1)}
                                                        </span>
                                                    )}
                                                    <span>{rec.first_air_date?.slice(0, 4)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Footer />
                </>
            )}

            {error && (
                <div className="text-center py-12 space-y-4">
                    <p className="text-red-400 text-lg font-semibold">{error}</p>
                    <button
                        onClick={() => { setError(''); window.location.reload() }}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-md text-sm font-semibold transition"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    )
}

export default TvSeries
