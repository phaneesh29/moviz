import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Search, Tv } from 'lucide-react';
import axiosInstance from '../utils/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LiveTv = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

    // Update URL when search or category changes
    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (selectedCategory !== 'All') params.set('category', selectedCategory);
        setSearchParams(params, { replace: true });
    }, [search, selectedCategory, setSearchParams]);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                // Fetch channels from our new backend endpoint
                const res = await axiosInstance.get(`/livetv/channels`);
                if (res.data.success) {
                    setChannels(res.data.results);
                }
            } catch (error) {
                console.error("Failed to fetch Live TV channels:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChannels();
    }, []);

    // Extract unique categories, sort them, and filter out empties.
    const categories = ['All', ...new Set(channels.map(c => c.group))].filter(c => c && c.trim() !== "").sort();

    const filteredChannels = channels.filter(channel => {
        const matchesSearch = channel.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || channel.group === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center">
                <div className="size-14 animate-spin border-[3px] border-purple-500/20 border-t-purple-500 rounded-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-[#0a0a0a] to-[#0a0a0a] text-white">
            <Navbar />
            
            <main className="flex-1 pt-24 pb-16 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto space-y-10">

                {/* Header Section */}
                <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-purple-900/40 via-purple-900/10 to-transparent p-8 sm:p-10 rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(168,85,247,0.1)] group">
                    {/* Background Glow */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">
                                <Tv size={36} className="text-purple-300" />
                            </div>
                            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-white drop-shadow-xl">
                                Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">TV</span>
                            </h1>
                        </div>
                        <p className="text-gray-400 font-medium ml-1 text-lg max-w-xl">Stream hundreds of premium and free global channels instantly.</p>
                    </div>

                    <div className="w-full md:w-96 relative z-10 group/search">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search size={20} className="text-gray-400 group-focus-within/search:text-purple-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find channels, news, sports..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-inner placeholder:text-gray-500"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                ? 'bg-[linear-gradient(135deg,#a855f7_0%,#d946ef_100%)] text-white shadow-[0_4px_15px_rgba(168,85,247,0.3)]'
                                : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-400 border border-white/5'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {filteredChannels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-gradient-to-b from-white/5 to-transparent rounded-3xl border border-white/5 shadow-inner">
                        <div className="p-6 bg-white/5 rounded-full mb-6 border border-white/5">
                            <Tv size={56} className="text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">No channels found</h3>
                        <p className="text-gray-400 max-w-md text-lg">Try adjusting your search or category filters to find what you're looking for.</p>
                        <button 
                            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                            className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:scale-105"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                        {filteredChannels.slice(0, 100).map(channel => ( // Limit to 100 for render perf initially
                            <div
                                key={channel.id}
                                onClick={() => navigate(`/live-tv/${channel.id}`)}
                                className="group relative bg-gradient-to-b from-[#1a1a1a] to-[#121212] flex flex-col items-center justify-center p-5 rounded-3xl border border-white/5 hover:border-purple-500/40 transition-all duration-300 cursor-pointer overflow-hidden aspect-[4/3] sm:aspect-square hover:shadow-[0_10px_40px_rgba(168,85,247,0.2)] hover:-translate-y-2 ring-1 ring-white/5 hover:ring-purple-500/30"
                            >
                                {/* Background glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                                <div className="relative z-0 w-16 h-16 sm:w-24 sm:h-24 flexItems-center justify-center transition-transform duration-500 group-hover:scale-110 mb-2">
                                    {channel.logo ? (
                                        <img
                                            src={channel.logo}
                                            alt={channel.name}
                                            loading="lazy"
                                            className="w-full h-full object-contain drop-shadow-2xl"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-black/40 rounded-2xl border border-white/10 shadow-inner flex items-center justify-center text-3xl font-black text-gray-500">
                                            {channel.name.charAt(0)}
                                        </div>
                                    )}
                                    {/* Fallback if img fails */}
                                    <div className="hidden w-full h-full bg-black/40 rounded-2xl border border-white/10 shadow-inner items-center justify-center text-3xl font-black text-gray-500">
                                        {channel.name.charAt(0)}
                                    </div>
                                </div>

                                {/* Hover Play Icon */}
                                <div className="absolute z-20 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-8 group-hover:translate-y-0 shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                                    <Play size={20} className="translate-x-[2px]" fill="currentColor" />
                                </div>

                                {/* Channel Name */}
                                <div className="absolute bottom-4 left-0 right-0 text-center px-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-sm font-bold text-white line-clamp-1 drop-shadow-md">{channel.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default LiveTv;
