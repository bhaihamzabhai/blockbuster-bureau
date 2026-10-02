'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Film, ArrowRight } from 'lucide-react';
import type { UpcomingMovie } from '@/lib/tmdb';
import { daysUntil } from '@/lib/tmdb';

/**
 * Homepage "Coming Soon" strip: upcoming releases with countdowns.
 * Stays hidden until there is actually data to show.
 */
export default function HomeReleases() {
  const [movies, setMovies] = useState<UpcomingMovie[] | null>(null);

  useEffect(() => {
    fetch('/api/releases')
      .then((r) => r.json())
      .then((d) => setMovies(d.movies || []))
      .catch(() => setMovies([]));
  }, []);

  if (!movies || movies.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading">
            Coming Soon
          </h2>
          <Link
            href="/releases"
            className="text-sm font-bold uppercase tracking-wide text-brand-dark hover:text-brand flex items-center gap-1 transition-colors"
          >
            All release dates <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
          {movies.slice(0, 10).map((m) => {
            const days = daysUntil(m.releaseDate);
            return (
              <Link
                key={m.id}
                href="/releases"
                className="snap-start shrink-0 w-36 sm:w-44 group"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow">
                  {m.poster ? (
                    <Image
                      src={m.poster}
                      alt={m.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="176px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  {days !== null && (
                    <span
                      className={`absolute top-2 left-2 text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        days <= 0 ? 'bg-green-600 text-white' : 'bg-brand text-white'
                      }`}
                    >
                      {days <= 0 ? 'Out now' : days === 1 ? 'Tomorrow' : `${days}d left`}
                    </span>
                  )}
                </div>
                <p className="text-gray-900 text-sm font-bold mt-2 line-clamp-1 group-hover:text-brand transition-colors">
                  {m.title}
                </p>
                <p className="text-gray-400 text-xs">
                  {m.releaseDate
                    ? new Date(m.releaseDate + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Date TBA'}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
