import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import { imageLink } from '../utils/constants'
import SeriesEmbed from '../components/SeriesEmbed'
import { LucideHome, LucideSearch } from 'lucide-react'
import Footer from '../components/Footer'

const TvSeries = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

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

    // Update URL when season or episode changes
    useEffect(() => {
        navigate(`/tv/${id}?season=${selectedSeason}&episode=${selectedEpisode}`, { replace: true })
    }, [selectedSeason, selectedEpisode, id, navigate])

    // Fetch series main details
    const fetchSeries = async () => {
        try {
            const res = await axiosInstance.get(`/tv/get/${id}`)
            if (res.status === 200) setSeries(res.data.results)
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load series")
        }
    }

    // Fetch season details
    const fetchSeason = async (seasonNum) => {
        try {
            const res = await axiosInstance.get(`/tv/season/${id}/${seasonNum}`)
            if (res.status === 200) setSeason(res.data.results)
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load season")
        }
    }

    // Fetch episode details
    const fetchEpisode = async (seasonNum, episodeNum) => {
        try {
            const res = await axiosInstance.get(`/tv/episode/${id}/${seasonNum}/${episodeNum}`)
            if (res.status === 200) setEpisode(res.data.results)
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load episode")
        }
    }

    // Fetch episode credits
    const fetchCredits = async (seasonNum, episodeNum) => {
        try {
            const res = await axiosInstance.get(`/tv/credits/${id}/${seasonNum}/${episodeNum}`)
            if (res.status === 200) setCredits(res.data.results)
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load credits")
        }
    }

    // Initial load
    useEffect(() => {
        const loadAll = async () => {
            setIsLoading(true)
            await fetchSeries()
            await fetchSeason(selectedSeason)
            await fetchEpisode(selectedSeason, selectedEpisode)
            await fetchCredits(selectedSeason, selectedEpisode)
            setIsLoading(false)
        }
        loadAll()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    // Update on season/episode change
    useEffect(() => {
        const loadEpisode = async () => {
            setIsLoading(true)
            await fetchSeason(selectedSeason)
            await fetchEpisode(selectedSeason, selectedEpisode)
            await fetchCredits(selectedSeason, selectedEpisode)
            setIsLoading(false)
        }
        loadEpisode()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSeason, selectedEpisode])

    useEffect(() => {
        document.title = series.name || "TV Series"
    }, [series])

    const displayedCast = showFullCast ? credits.cast : credits.cast?.slice(0, 6)

    return (
        <div className="bg-[#0a0a0a] text-white min-h-screen font-sans">
            {isLoading ? (
                <div className="h-screen flex justify-center items-center">
                    <div className="w-16 h-16 animate-spin border-4 border-t-blue-500 border-gray-600 rounded-full"></div>
                </div>
            ) : (
                <>
                    {/* Player */}
                    {episode.id && (
                        <div className="relative w-full aspect-video shadow-lg">
                            <SeriesEmbed id={series.id} season_num={selectedSeason} episode_num={selectedEpisode} />
                        </div>
                    )}

                    {/* Floating Nav */}
                    <div className="flex items-center gap-4 p-3 fixed right-4 top-4 z-20 
                          bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20
                          opacity-40 hover:opacity-100 transition-all duration-300">
                        <button className="p-2 rounded-lg hover:bg-white/20 transition" onClick={() => navigate("/")}>
                            <LucideHome size={20} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/20 transition" onClick={() => navigate("/search")}>
                            <LucideSearch size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 lg:p-10 max-w-7xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{series.name}</h1>
                        <p className="text-lg italic text-gray-400 mb-6">{series.tagline}</p>

                        {/* Season + Episodes */}
                        <div className="mb-8">
                            <label className="text-gray-300 mr-2">Season:</label>
                            <select
                                value={selectedSeason}
                                onChange={(e) => { setSelectedSeason(Number(e.target.value)); setSelectedEpisode(1) }}
                                className="bg-[#1c1c1c] px-3 py-2 rounded-lg border border-gray-700"
                            >
                                {Array.from({ length: series.number_of_seasons }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>Season {i + 1}</option>
                                ))}
                            </select>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                {season.episodes?.map((ep) => (
                                    <button
                                        key={ep.id}
                                        onClick={() => setSelectedEpisode(ep.episode_number)}
                                        className={`p-3 rounded-lg text-left bg-[#141414] hover:bg-[#1f1f1f] transition
                                            ${ep.episode_number === selectedEpisode ? "ring-2 ring-blue-500" : ""}`}
                                    >
                                        <p className="font-semibold text-sm">E{ep.episode_number}: {ep.name}</p>
                                        <p className="text-xs text-gray-400">{ep.runtime} min</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cast + Crew */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
                            {/* Cast */}
                            {credits.cast?.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2 mb-4">Cast</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {displayedCast.map((cast, idx) => (
                                            <div key={idx} className="bg-[#141414] p-3 rounded-lg flex flex-col items-center shadow hover:shadow-lg hover:scale-[1.02] transition">
                                                <img src={cast.profile_path ? imageLink + cast.profile_path : "https://via.placeholder.com/200x300"} alt={cast.name} className="rounded-lg h-[200px] w-full object-cover object-center" />
                                                <p className="mt-2 font-medium text-center text-sm">{cast.name}</p>
                                                <p className="text-sm text-gray-400 text-center">{cast.character}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {credits.cast.length > 6 && (
                                        <button onClick={() => setShowFullCast(!showFullCast)} className="mt-3 text-sm px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition">
                                            {showFullCast ? "Show Less" : "Show More"}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Crew */}
                            {credits.crew?.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2 mb-4">Crew</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {credits.crew.slice(0, 9).map((crew, idx) => (
                                            <div key={idx} className="bg-[#141414] p-3 rounded-lg flex flex-col items-center shadow">
                                                <p className="font-medium text-center text-sm">{crew.name}</p>
                                                <p className="text-sm text-gray-400 text-center">{crew.job}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Footer />
                </>
            )}

            {error && <p className="text-red-500 text-center text-lg font-semibold mt-6">{error}</p>}
        </div>
    )
}

export default TvSeries
