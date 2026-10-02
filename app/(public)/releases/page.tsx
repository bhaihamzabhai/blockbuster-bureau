import { Metadata } from 'next';
import Image from 'next/image';
import { CalendarDays, Clock, Film } from 'lucide-react';
import { getSiteSettings } from '@/lib/siteSettings';
import { getUpcomingMovies, daysUntil } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Movie Release Dates',
  description:
    'Upcoming Hollywood movie release dates with countdowns — find out when the biggest blockbusters hit theaters.',
  alternates: { canonical: '/releases' },
};

export const revalidate = 3600; // refresh hourly (movie data itself is cached 24h at the fetch level)

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function ReleasesPage() {
  const settings = await getSiteSettings();
  const movies = await getUpcomingMovies(settings.tmdbApiKey);

  return (
    <div className="bg-white text-gray-900 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-gray-900 font-extrabold text-2xl uppercase tracking-wide border-l-4 border-brand pl-3">
          Movie Release Dates
        </h1>
        <p className="text-gray-500 mt-2 text-[15px] mb-8">
          Upcoming Hollywood releases with live countdowns. Dates update automatically.
        </p>

        {movies.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
            <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Release data is not available right now.</p>
            <p className="text-gray-400 text-sm mt-1">
              {settings.tmdbApiKey
                ? 'The movie database could not be reached — please try again later.'
                : 'The admin needs to add a free TMDB API key in dashboard Settings → API Keys.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {movies.map((m) => {
              const days = daysUntil(m.releaseDate);
              return (
                <div
                  key={m.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[2/3] bg-gray-100">
                    {m.poster ? (
                      <Image
                        src={m.poster}
                        alt={m.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    {days !== null && (
                      <span
                        className={`absolute top-2 left-2 text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                          days <= 0 ? 'bg-green-600 text-white' : 'bg-brand text-white'
                        }`}
                      >
                        {days <= 0 ? 'Out now' : days === 1 ? 'Tomorrow' : `${days} days left`}
                      </span>
                    )}
                  </div>
                  <div className="p-3.5">
                    <h3 className="text-gray-900 font-bold text-sm leading-snug line-clamp-2">
                      {m.title}
                    </h3>
                    {m.releaseDate ? (
                      <p className="flex items-center gap-1.5 text-gray-500 text-xs mt-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(m.releaseDate)}
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5 text-gray-400 text-xs mt-1.5">
                        <Clock className="w-3.5 h-3.5" /> Date TBA
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-gray-400 text-xs text-center mt-10">
          Movie data and posters provided by TMDB. This product uses the TMDB API
          but is not endorsed or certified by TMDB.
        </p>
      </div>
    </div>
  );
}
