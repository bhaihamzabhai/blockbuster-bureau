'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CalendarDays, Clock, Film, Loader2 } from 'lucide-react';
import type { UpcomingMovie } from '@/lib/tmdb';
import { daysUntil } from '@/lib/tmdb';

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface ReleasesGridProps {
  initialMovies: UpcomingMovie[];
  initialConfigured: boolean;
}

/**
 * Self-healing: if the statically generated page was built before the
 * TMDB key was saved, it fetches fresh data client-side.
 */
export default function ReleasesGrid({ initialMovies, initialConfigured }: ReleasesGridProps) {
  const [movies, setMovies] = useState<UpcomingMovie[]>(initialMovies);
  const [configured, setConfigured] = useState(initialConfigured);
  const [checking, setChecking] = useState(initialMovies.length === 0);

  useEffect(() => {
    if (initialMovies.length > 0) return;
    fetch('/api/releases')
      .then((r) => r.json())
      .then((d) => {
        setMovies(d.movies || []);
        setConfigured(d.configured !== false);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [initialMovies.length]);

  if (checking) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
        <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Release data is not available right now.</p>
        <p className="text-gray-400 text-sm mt-1">
          {configured
            ? 'The movie database could not be reached — please try again later.'
            : 'The admin needs to add a free TMDB API key in dashboard Settings → API Keys.'}
        </p>
      </div>
    );
  }

  return (
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
  );
}
