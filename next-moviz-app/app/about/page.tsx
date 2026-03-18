import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Vidoza',
  description: 'Learn more about Vidoza - the movie, TV, and live channel streaming platform',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="page-shell min-h-screen text-white">
      <Navbar />
      <main className="page-container pb-20">
        <div className="page-hero mb-8 p-6 md:p-8">
          <div className="relative z-10 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">About the platform</p>
            <h1 className="mt-3 text-4xl md:text-5xl">About Vidoza</h1>
            <p className="mt-3 text-sm leading-7 text-neutral-300 md:text-base">
              Vidoza is built to make movie discovery, TV browsing, live channels, and saved lists feel clean and premium.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-0">

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">What is Vidoza?</h2>
              <p className="leading-relaxed">
                Vidoza is your destination for discovering and streaming movies and TV shows.
                We bring you the latest trending content, personalized recommendations, and live TV channels
                all in one place.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="leading-relaxed">
                Our mission is to make entertainment accessible to everyone. We provide a seamless platform
                for discovering, exploring, and enjoying entertainment content from around the world.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Browse thousands of movies and TV shows</li>
                <li>Get trending content recommendations</li>
                <li>Personalized search and filtering</li>
                <li>Live TV channels</li>
                <li>Detailed cast and crew information</li>
                <li>High-quality streaming</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Source</h2>
              <p className="leading-relaxed">
                We use the TMDB (The Movie Database) API to provide comprehensive movie and TV show information.
                TMDB is a community-built movie and TV database.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

