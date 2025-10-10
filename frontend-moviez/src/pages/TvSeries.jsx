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
    const [showFullCrew, setShowFullCrew] = useState(false)

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
    }, [id])

    useEffect(() => {
        const loadEpisode = async () => {
            setIsLoading(true)
            await fetchSeason(selectedSeason)
            await fetchEpisode(selectedSeason, selectedEpisode)
            await fetchCredits(selectedSeason, selectedEpisode)
            setIsLoading(false)
        }
        loadEpisode()
    }, [selectedSeason, selectedEpisode])

    useEffect(() => {
        document.title = series.name || "TV Series"
    }, [series])

    const displayedCast = showFullCast ? credits.cast : credits.cast?.slice(0, 6)
    const displayedCrew = showFullCrew ? credits.crew : credits.crew?.slice(0, 6)

    const renderPersonCard = (person, isImage = true, role = "") => (
        <div key={person.id} className="bg-[#141414] p-2 rounded-lg w-30 flex flex-col gap-2 items-center text-center shadow hover:shadow-lg transition">
            {isImage && (
                <img
                    src={person.profile_path ? imageLink + person.profile_path : "https://via.placeholder.com/150x150"}
                    alt={person.name}
                    className="rounded-lg h-28 w-20 object-cover object-center mb-1"
                />
            )}
            <p className="font-medium text-sm">{person.name}</p>
            {role && <p className="text-xs text-gray-400">{role}</p>}
        </div>
    )

    return (
        <div className="bg-[#0a0a0a] text-white min-h-screen font-sans">
            {isLoading ? (
                <div className="h-screen flex justify-center items-center">
                    <div className="w-16 h-16 animate-spin border-4 border-t-blue-500 border-gray-600 rounded-full"></div>
                </div>
            ) : (
                <>
                    {episode.id && (
                        <div className="relative w-full aspect-video shadow-lg">
                            <SeriesEmbed id={series.id} season_num={selectedSeason} episode_num={selectedEpisode} />
                        </div>
                    )}

                    <div className="flex items-center gap-4 p-3 fixed right-4 top-4 z-20 
                          bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20
                          opacity-20 hover:opacity-100 transition-all duration-300">
                        <button className="p-2 rounded-lg hover:bg-white/20 transition" onClick={() => navigate("/")}>
                            <LucideHome size={20} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/20 transition" onClick={() => navigate("/search")}>
                            <LucideSearch size={20} />
                        </button>
                    </div>

                    <div className="p-4 lg:p-10 max-w-7xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{series.name}</h1>
                        <p className="text-lg italic text-gray-400 mb-6">{series.tagline}</p>
                        <p className="text-lg italic text-gray-400 mb-6">{episode.overview}</p>

                        <div className="flex flex-col flex-wrap items-center gap-4 text-gray-300 text-sm mb-4">
                            <div className='flex gap-3 items-center'>
                                <span>First Aired: {series.first_air_date || "N/A"}</span>
                                <span>Last Aired: {series.last_air_date || "N/A"}</span>
                            </div>
                            <span className='flex gap-2 items-center'>{series.genres?.map((g) => <span className="text-xs bg-gradient-to-r from-[#1e1e1e] to-[#2c2c2c] px-3 py-1 rounded-full font-medium shadow" key={g.id}>{g.name}</span>) || "N/A"}</span>
                        </div>

                        <div className="mb-8">
                            {/* Season Selector */}
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
                                        <p className="text-xs text-gray-400">{ep.air_date}</p>
                                    </button>
                                ))}
                            </div>

                            {/* People Sections */}
                            {series.created_by?.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-xl font-semibold mb-3">Created By</h3>
                                    <div className="flex flex-wrap gap-4 justify-start items-center">
                                        {series.created_by.map((creator, idx) => renderPersonCard(creator))}
                                    </div>
                                </div>
                            )}

                            {credits.cast?.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-xl font-semibold mb-3">Cast</h3>
                                    <div className="flex flex-wrap gap-4 justify-start items-center">
                                        {displayedCast.map((cast) => renderPersonCard(cast, true, cast.character))}
                                    </div>
                                    {credits.cast.length > 6 && (
                                        <button onClick={() => setShowFullCast(!showFullCast)}
                                            className="mt-2 text-sm px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition">
                                            {showFullCast ? "Show Less" : "Show More"}
                                        </button>
                                    )}
                                </div>
                            )}

                            {episode.guest_stars?.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-xl font-semibold mb-3">Guest Stars</h3>
                                    <div className="flex flex-wrap gap-4 justify-start items-center">
                                        {episode.guest_stars.map((guest) => renderPersonCard(guest, true, guest.character))}
                                    </div>
                                </div>
                            )}

                            {credits.crew?.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-xl font-semibold mb-3">Crew</h3>
                                    <div className="flex flex-wrap gap-4 justify-start items-center">
                                        {displayedCrew.map((crew) => renderPersonCard(crew, false, crew.job))}
                                    </div>
                                    {credits.crew.length > 6 && (
                                        <button onClick={() => setShowFullCrew(!showFullCrew)}
                                            className="mt-2 text-sm px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition">
                                            {showFullCrew ? "Show Less" : "Show More"}
                                        </button>
                                    )}
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
