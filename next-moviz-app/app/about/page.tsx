import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Moviz',
  description: 'Learn more about Moviz - the ultimate movie and TV streaming platform',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-8">About Moviz</h1>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">What is Moviz?</h2>
              <p className="leading-relaxed">
                Moviz is your ultimate destination for discovering and streaming movies and TV shows.
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

