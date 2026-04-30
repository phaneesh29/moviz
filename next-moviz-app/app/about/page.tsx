import type { Metadata } from 'next';
import Link from 'next/link';
import { Database, Film, ListPlus, MessageSquare, Play, Radio, Search, ShieldCheck, Sparkles, Tv } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About Vidoza',
  description: 'Learn more about Vidoza - the movie, TV, and live channel streaming platform',
  alternates: {
    canonical: '/about',
  },
};

const features = [
  {
    title: 'Movies and series',
    description: 'Browse trending titles, discover by genre, and open details quickly.',
    icon: Film,
  },
  {
    title: 'Live TV',
    description: 'Search channels and jump into streams from a compact guide.',
    icon: Tv,
  },
  {
    title: 'Search',
    description: 'Find movies, shows, and people with simple filters.',
    icon: Search,
  },
  {
    title: 'My List',
    description: 'Save titles for later and keep your next watches close.',
    icon: ListPlus,
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />

      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8">
          <section className="flex flex-col gap-5">
            <Badge variant="outline" className="w-fit border-white/12 bg-white/[0.06] text-white/70">
              <Sparkles data-icon="inline-start" />
              About
            </Badge>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="flex flex-col gap-4">
                <h1 className="font-display text-4xl font-black tracking-normal text-white sm:text-5xl">
                  Vidoza is built for fast entertainment browsing.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-white/62 sm:text-lg">
                  A compact streaming-style app for discovering movies and series, watching live channels, searching titles, and keeping a saved list.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/discover"
                    className={cn(
                      buttonVariants(),
                      'rounded-full bg-white px-5 font-semibold text-black hover:bg-white/90',
                    )}
                  >
                    <Play data-icon="inline-start" fill="currentColor" />
                    Browse titles
                  </Link>
                  <Link
                    href="/live-tv"
                    className={cn(
                      buttonVariants({ variant: 'ghost' }),
                      'rounded-full bg-white/[0.07] px-5 text-white/75 hover:bg-white/[0.12] hover:text-white',
                    )}
                  >
                    <Radio data-icon="inline-start" />
                    Live TV
                  </Link>
                </div>
              </div>

              <Card className="border-white/10 bg-black/45 shadow-[0_16px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-white">What stays simple</CardTitle>
                  <CardDescription className="text-white/55">
                    No bloated landing page, no noisy promo sections. Just the main workflows.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {['Discover', 'Search', 'Watch', 'Save'].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                      <ShieldCheck className="text-white/45" />
                      <span className="text-sm font-semibold text-white/75">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="bg-white/10" />

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-white/10 bg-white/[0.035] shadow-[0_12px_34px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                  <CardHeader>
                    <div className="mb-2 flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                      <Icon className="text-white/65" />
                    </div>
                    <CardTitle className="text-lg font-bold text-white">{feature.title}</CardTitle>
                    <CardDescription className="leading-6 text-white/55">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="border-white/10 bg-white/[0.035] shadow-[0_12px_34px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <CardHeader>
                <Badge className="mb-2 w-fit bg-white/[0.07] text-white/68">
                  <Database data-icon="inline-start" />
                  Data
                </Badge>
                <CardTitle className="text-2xl font-black text-white">Powered by TMDB metadata</CardTitle>
                <CardDescription className="leading-6 text-white/55">
                  Movie, TV, cast, rating, and poster information is sourced through TMDB APIs. Streaming availability and external feeds can vary by title or channel.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-white/10 bg-white/[0.035] shadow-[0_12px_34px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <CardHeader>
                <Badge className="mb-2 w-fit bg-white/[0.07] text-white/68">
                  <MessageSquare data-icon="inline-start" />
                  Feedback
                </Badge>
                <CardTitle className="text-2xl font-black text-white">Help improve the app</CardTitle>
                <CardDescription className="leading-6 text-white/55">
                  Report broken streams, confusing pages, or missing polish so the experience keeps getting cleaner.
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-white/10 bg-white/[0.025]">
                <Link
                  href="/feedback"
                  className={cn(
                    buttonVariants(),
                    'rounded-full bg-white px-5 font-semibold text-black hover:bg-white/90',
                  )}
                >
                  <MessageSquare data-icon="inline-start" />
                  Send feedback
                </Link>
              </CardFooter>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
