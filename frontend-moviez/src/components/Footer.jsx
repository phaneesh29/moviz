import React from 'react'
import { Link } from 'react-router-dom'
import { Smartphone } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Brand */}
                    <Link to="/" className="text-xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
                        Vidoza
                    </Link>

                    {/* Links */}
                    <nav className="flex items-center gap-6 text-sm text-gray-400">
                        <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
                        <Link to="/search" className="hover:text-white transition-colors duration-200">Search</Link>
                        <Link to="/discover" className="hover:text-white transition-colors duration-200">Discover</Link>
                        <Link to="/watch-later" className="hover:text-white transition-colors duration-200">Watch Later</Link>
                        <Link to="/about" className="hover:text-white transition-colors duration-200">About</Link>
                        <Link to="/feedback" className="hover:text-white transition-colors duration-200">Feedback</Link>
                        <a 
                            href="/vidoza-v2.aab" 
                            download 
                            className="flex items-center gap-1 hover:text-purple-400 transition-colors duration-200"
                        >
                            <Smartphone size={14} />
                            <span>Get App</span>
                        </a>
                    </nav>
                </div>

                <p className="text-xs text-gray-600 text-center mt-6 leading-relaxed">
                    Disclaimer: We do not store any personal information. All content is fetched from trusted 3rd-party services.
                    We are not responsible for any external content.
                </p>
            </div>
        </footer>
    )
}

export default Footer