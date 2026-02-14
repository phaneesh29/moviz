import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import { Shield, Eye, Zap } from 'lucide-react'
import Navbar from '../components/Navbar'

const About = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
      {/* Top nav */}
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 md:px-8 py-16">
        <div className="max-w-3xl w-full space-y-10">
          <Seo title="About Vidoza" description="Learn about Vidoza — an ad-free interface that fetches movies and TV series from trusted third-party sources." />

          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              About Vidoza
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              A sleek, ad-free interface that connects you to movies and TV series through trusted third-party APIs.
            </p>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-lg p-5 space-y-3">
              <Zap size={24} className="text-green-400" />
              <h3 className="font-semibold">Ad-Free</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                No intrusive ads, no trackers, no spam — just movies and series.
              </p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-lg p-5 space-y-3">
              <Eye size={24} className="text-blue-400" />
              <h3 className="font-semibold">Privacy First</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We do not collect, store, or misuse personal information. What you watch stays with you.
              </p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-lg p-5 space-y-3">
              <Shield size={24} className="text-red-400" />
              <h3 className="font-semibold">Disclaimer</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We are not responsible for any piracy. No content is hosted or stored on our servers.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600">
            Vidoza does not run a database nor keep user data. It is purely an interface that connects you to external streaming sources.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default About
