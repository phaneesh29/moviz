import React from 'react'
import Footer from '../components/Footer'

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#111111] text-gray-200">
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            About Vidoza
          </h1>

          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              <span className="font-semibold text-white">Vidoza</span> is a sleek and
              simple site that fetches movies and TV series through trusted third-party APIs,
              making streaming accessible and effortless.
            </p>

            <p>
              We are <span className="font-semibold text-red-400">not responsible</span> for any
              piracy. None of the content you watch is hosted or stored on our servers.
            </p>

            <p>
              We don’t run a database, nor do we keep user data. Vidoza is purely an
              interface that connects you to external streaming sources.
            </p>

            <p>
              The platform is completely <span className="font-semibold text-green-400">ad-free</span>.
              No intrusive ads, no trackers, no spam — just movies and series.
            </p>

            <p>
              Your <span className="font-semibold text-blue-400">privacy is ensured</span>. We do
              not collect, store, or misuse personal information. What you watch here stays with you.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default About
