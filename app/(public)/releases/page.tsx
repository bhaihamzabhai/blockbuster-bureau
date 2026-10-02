import { Metadata } from 'next';
import ReleasesGrid from '@/components/releases/ReleasesGrid';
import { getSiteSettings } from '@/lib/siteSettings';
import { getUpcomingMovies } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Movie Release Dates',
  description:
    'Upcoming Hollywood movie release dates with countdowns — find out when the biggest blockbusters hit theaters.',
  alternates: { canonical: '/releases' },
};

export const revalidate = 3600; // refresh hourly (movie data itself is cached 24h at the fetch level)

export default async function ReleasesPage() {
  const settings = await getSiteSettings();
  const movies = await getUpcomingMovies(settings.tmdbApiKey);
  const configured = !!settings.tmdbApiKey;

  return (
    <div className="bg-white text-gray-900 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-gray-900 font-extrabold text-2xl uppercase tracking-wide border-l-4 border-brand pl-3">
          Movie Release Dates
        </h1>
        <p className="text-gray-500 mt-2 text-[15px] mb-8">
          Upcoming Hollywood releases with live countdowns. Dates update automatically.
        </p>

        <ReleasesGrid initialMovies={movies} initialConfigured={configured} />

        <p className="text-gray-400 text-xs text-center mt-10">
          Movie data and posters provided by TMDB. This product uses the TMDB API
          but is not endorsed or certified by TMDB.
        </p>
      </div>
    </div>
  );
}
