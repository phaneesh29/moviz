import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import { imageLink } from '../utils/constants'
import { Home, Search, User, ExternalLink, MapPin, Calendar, TrendingUp } from 'lucide-react'
import Footer from '../components/Footer'
import Seo from '../components/Seo'

const PersonPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [data, setData] = useState({})

    const fetchPerson = async (id) => {
        setError("")
        setData({})
        setIsLoading(true)
        try {
            const result = await axiosInstance.get(`/people/get/${id}`)
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

    useEffect(() => {
        fetchPerson(id)
    }, [id])

    useEffect(() => {
        document.title = data.name || "Person"
    }, [data])

    const genderLabel = (g) => {
        switch (g) {
            case 1: return "Female"
            case 2: return "Male"
            case 3: return "Non-binary"
            default: return "Unknown"
        }
    }

    return (
        <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
            {/* Top nav */}
            <nav className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                    <Link to="/" className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
                        VIDOZA
                    </Link>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-md hover:bg-white/10 transition text-gray-400 hover:text-white"
                            onClick={() => navigate("/")}>
                            <Home size={18} />
                        </button>
                        <button className="p-2 rounded-md hover:bg-white/10 transition text-gray-400 hover:text-white"
                            onClick={() => navigate("/search")}>
                            <Search size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
                {/* Loader */}
                {isLoading && (
                    <div className="flex justify-center py-20">
                        <div className="size-14 animate-spin border-[3px] border-purple-500/20 border-t-purple-500 rounded-full" />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center py-16">
                        <p className="text-red-400 text-lg font-semibold">{error}</p>
                    </div>
                )}

                {data.id && (
                    <>
                        <Seo
                            title={data.name}
                            description={data.biography?.slice(0, 160)}
                            canonical={`https://vidoza.vercel.app/person/${data.id}`}
                            openGraph={{
                                image: data.profile_path ? imageLink + data.profile_path : undefined,
                            }}
                            jsonLd={data.id ? {
                                "@context": "https://schema.org",
                                "@type": "Person",
                                "name": data.name,
                                "image": data.profile_path ? imageLink + data.profile_path : undefined,
                                "description": data.biography?.slice(0, 160),
                                "birthDate": data.birthday,
                            } : null}
                        />

                        <div className="flex flex-col lg:flex-row gap-10">
                            {/* Profile image */}
                            <div className="lg:w-[280px] flex-shrink-0">
                                {data.profile_path ? (
                                    <img
                                        src={imageLink + data.profile_path}
                                        alt={data.name || "Person"}
                                        className="w-full max-w-[280px] mx-auto rounded-lg shadow-2xl border border-white/10"
                                    />
                                ) : (
                                    <div className="w-full max-w-[280px] mx-auto aspect-[2/3] bg-[#141414] rounded-lg flex items-center justify-center border border-white/5">
                                        <User size={80} className="text-gray-700" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                                        {data.name}
                                    </h1>
                                    {data.known_for_department && (
                                        <span className="inline-block mt-2 text-xs bg-purple-600/20 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full font-medium">
                                            {data.known_for_department}
                                        </span>
                                    )}
                                </div>

                                {/* Quick info chips */}
                                <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                                    {data.birthday && (
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-purple-400" /> {data.birthday}
                                            {data.deathday && ` – ${data.deathday}`}
                                        </span>
                                    )}
                                    {data.place_of_birth && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-purple-400" /> {data.place_of_birth}
                                        </span>
                                    )}
                                    {data.popularity && (
                                        <span className="flex items-center gap-1.5">
                                            <TrendingUp size={14} className="text-purple-400" /> {data.popularity} popularity
                                        </span>
                                    )}
                                </div>

                                {/* Biography */}
                                {data.biography && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Biography</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                            {data.biography}
                                        </p>
                                    </div>
                                )}

                                {/* Details grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <p className="text-gray-500 text-xs mb-1">Gender</p>
                                        <p className="font-medium">{genderLabel(data.gender)}</p>
                                    </div>
                                    {data.imdb_id && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                            <p className="text-gray-500 text-xs mb-1">IMDB</p>
                                            <a href={`https://www.imdb.com/name/${data.imdb_id}`} target="_blank" rel="noopener noreferrer"
                                               className="font-medium text-purple-400 hover:underline flex items-center gap-1">
                                                {data.imdb_id} <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    )}
                                    {data.homepage && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                            <p className="text-gray-500 text-xs mb-1">Website</p>
                                            <a href={data.homepage} target="_blank" rel="noopener noreferrer"
                                               className="font-medium text-purple-400 hover:underline flex items-center gap-1 break-all text-xs">
                                                Visit <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Also Known As */}
                                {data.also_known_as?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Also Known As</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {data.also_known_as.map((name, index) => (
                                                <span key={index}
                                                    className="text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-md">
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default PersonPage
