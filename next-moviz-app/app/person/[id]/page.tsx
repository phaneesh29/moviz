import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import Image from 'next/image';

export const revalidate = 3600;

interface PersonDetailsProps {
  params: Promise<{ id: string }>;
}

interface Person {
  id: number;
  name: string;
  profile_path?: string;
  known_for_department?: string;
  birthday?: string;
  place_of_birth?: string;
  biography?: string;
}

interface PersonCredit {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
}

interface PersonCredits {
  cast?: PersonCredit[];
}

async function getPersonDetails(id: string): Promise<Person | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/people/${id}`, {
      cache: 'force-cache',
    });
    if (!res.ok) throw new Error('Failed to fetch');
    const data = (await res.json()) as { results?: Person };
    return data.results || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getPersonCredits(id: string): Promise<PersonCredits | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/people/${id}/credits`, {
      cache: 'force-cache',
    });
    if (!res.ok) throw new Error('Failed to fetch');
    const data = (await res.json()) as { results?: PersonCredits };
    return data.results || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function getReleaseYear(credit: PersonCredit): string {
  const rawDate = credit.release_date || credit.first_air_date;
  if (!rawDate) return 'N/A';
  const parsed = new Date(rawDate);
  const year = parsed.getFullYear();
  return Number.isNaN(year) ? 'N/A' : String(year);
}

export async function generateMetadata({ params }: PersonDetailsProps): Promise<Metadata> {
  const { id } = await params;
  const person = await getPersonDetails(id);

  return {
    title: person?.name || 'Person',
    description: person?.biography || 'View this person on Moviz',
  };
}

export default async function PersonPage({ params }: PersonDetailsProps) {
  const { id } = await params;
  const person = await getPersonDetails(id);
  const credits = await getPersonCredits(id);

  if (!person) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <p className="text-gray-400">Person not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const actingCredits = credits?.cast?.slice(0, 12) || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {person.profile_path && (
              <div className="flex-shrink-0">
                <Image
                  src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                  alt={person.name}
                  width={300}
                  height={450}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-6">{person.name}</h1>

              {person.known_for_department && <p className="text-xl text-gray-400 mb-4">Known for: {person.known_for_department}</p>}

              {person.birthday && <p className="text-gray-400 mb-4">Born: {new Date(person.birthday).toLocaleDateString()}</p>}

              {person.place_of_birth && <p className="text-gray-400 mb-8">Place of Birth: {person.place_of_birth}</p>}

              {person.biography && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Biography</h2>
                  <p className="text-gray-300 leading-relaxed">{person.biography}</p>
                </div>
              )}
            </div>
          </div>

          {actingCredits.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8">Known For</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {actingCredits.map((credit) => (
                  <div key={credit.id} className="text-center">
                    {credit.poster_path && (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${credit.poster_path}`}
                        alt={credit.title || credit.name || 'Credit'}
                        width={200}
                        height={300}
                        className="rounded-lg mb-2 w-full h-auto"
                      />
                    )}
                    <p className="font-semibold text-sm truncate">{credit.title || credit.name}</p>
                    <p className="text-gray-400 text-xs">({getReleaseYear(credit)})</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

