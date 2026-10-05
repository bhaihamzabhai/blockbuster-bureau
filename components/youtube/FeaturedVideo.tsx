'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import YouTubeEmbed from './YouTubeEmbed';
import type { YTVideo } from '@/lib/youtube';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Cinematic featured-video hero for /videos: latest video plays inline,
 * "Up next" rail on the side to swap the feature. Self-healing via /api/videos.
 */
export default function FeaturedVideo({ initialVideos }: { initialVideos: YTVideo[] }) {
  const [videos, setVideos] = useState<YTVideo[]>(initialVideos);
  const [featuredId, setFeaturedId] = useState<string | null>(initialVideos[0]?.id ?? null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch('/api/videos')
      .then((r) => r.json())
      .then((d) => {
        const list: YTVideo[] = d.videos || [];
        setVideos(list);
        setFeaturedId((cur) => cur ?? list[0]?.id ?? null);
      })
      .catch(() => {});
  }, []);

  const featured = videos.find((v) => v.id === featuredId) ?? videos[0];
  const upNext = videos.filter((v) => v.id !== featured?.id).slice(0, 3);

  if (!featured) return null;

  const select = (id: string) => {
    setFeaturedId(id);
    setPlaying(false);
  };

  return (
    <section className="relative bg-gray-950 rounded-2xl overflow-hidden film-grain mb-10">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(243,146,0,0.14), transparent 70%)',
        }}
      />
      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 p-5 sm:p-8">
        {/* Player */}
        <div className="lg:col-span-2">
          {playing ? (
            <YouTubeEmbed videoId={featured.id} title={featured.title} />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              className="group relative w-full aspect-video rounded-xl overflow-hidden bg-black text-left"
              aria-label={`Play ${featured.title}`}
            >
              <Image
                src={featured.thumbnail}
                alt={featured.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                priority
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-20 h-20 rounded-full bg-brand group-hover:scale-110 transition-transform flex items-center justify-center shadow-[0_0_50px_rgba(243,146,0,0.5)]">
                  <Play className="w-9 h-9 text-white fill-white ml-1" />
                </span>
              </span>
              <span className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-block bg-brand text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm mb-2">
                  Latest video
                </span>
                <span className="block text-white font-display text-2xl sm:text-4xl leading-tight line-clamp-2">
                  {featured.title}
                </span>
              </span>
            </button>
          )}
          {playing && (
            <h2 className="text-white font-bold text-lg sm:text-xl mt-4 line-clamp-2">
              {featured.title}
            </h2>
          )}
          <p className="text-gray-500 text-xs mt-1.5">{formatDate(featured.published)}</p>
        </div>

        {/* Up next */}
        {upNext.length > 0 && (
          <div className="flex flex-col">
            <h3 className="text-brand font-extrabold text-xs uppercase tracking-[0.25em] mb-3">
              Up next
            </h3>
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar">
              {upNext.map((v) => (
                <button
                  key={v.id}
                  onClick={() => select(v.id)}
                  className={`group flex gap-3 p-2 rounded-xl text-left shrink-0 w-64 lg:w-auto transition-colors ${
                    v.id === featured.id
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="relative w-36 lg:w-32 aspect-video rounded-lg overflow-hidden bg-gray-900 shrink-0">
                    <Image
                      src={v.thumbnail}
                      alt={v.title}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </span>
                  </span>
                  <span className="min-w-0 py-1">
                    <span className="block text-white text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                      {v.title}
                    </span>
                    <span className="block text-gray-500 text-[11px] mt-1">
                      {formatDate(v.published)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
