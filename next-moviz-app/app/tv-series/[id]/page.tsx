import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const revalidate = 3600;

interface TVSeriesPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TVSeriesPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `TV Series ${id}`,
    description: 'Watch TV series on Moviz',
  };
}

export default async function TVSeriesPage({ params }: TVSeriesPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">TV Series</h1>
          <p className="text-gray-400">TV series page coming soon for ID {id}.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

