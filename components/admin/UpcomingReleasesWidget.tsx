'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Film, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import type { UpcomingMovie } from '@/lib/tmdb';
import { daysUntil } from '@/lib/tmdb';

/** Dashboard widget: upcoming movie releases with countdowns (same data as /releases). */
export default function UpcomingReleasesWidget() {
  const [movies, setMovies] = useState<UpcomingMovie[] | null>(null);

  useEffect(() => {
    fetch('/api/releases')
      .then((r) => r.json())
      .then((d) => setMovies(d.movies || []))
      .catch(() => setMovies([]));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-display text-2xl text-gray-900 flex items-center gap-2">
          <Film className="w-5 h-5 text-brand-dark" />
          Upcoming Releases
        </h2>
        <Link
          href="/releases"
          target="_blank"
          className="text-sm font-medium text-brand-dark hover:text-brand flex items-center gap-1"
        >
          View page <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {movies === null ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-7 h-7 text-brand animate-spin" />
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <KeyRound className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            No release data.{' '}
            <Link href="/dashboard/settings" className="text-brand-dark font-medium hover:underline">
              Add your TMDB API key in Settings
            </Link>{' '}
            to see upcoming movies here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.slice(0, 6).map((m) => {
            const days = daysUntil(m.releaseDate);
            return (
              <div key={m.id} className="group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  {m.poster ? (
                    <Image
                      src={m.poster}
                      alt={m.title}
                      fill
                      className="object-cover"
                      sizes="15vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  {days !== null && days > 0 && (
                    <span className="absolute top-1.5 left-1.5 text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-brand text-white">
                      {days}d left
                    </span>
                  )}
                </div>
                <p className="text-gray-900 text-xs font-semibold mt-1.5 line-clamp-1">{m.title}</p>
                <p className="text-gray-400 text-[11px]">
                  {m.releaseDate
                    ? new Date(m.releaseDate + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'TBA'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
