'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Youtube, ArrowRight, Loader2 } from 'lucide-react';
import type { YTVideo } from '@/lib/youtube';
import VideoPlayerModal from '../youtube/VideoPlayerModal';

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

interface YouTubeShowcaseProps {
  youtubeUrl: string;
}

/**
 * Dark "cinema" showcase: 4 latest channel videos with a subscribe CTA.
 * Premium Hollywood vibe — plays videos in a modal right on the page.
 */
export default function YouTubeShowcase({ youtubeUrl }: YouTubeShowcaseProps) {
  const [videos, setVideos] = useState<YTVideo[] | null>(null);
  const [active, setActive] = useState<YTVideo | null>(null);

  useEffect(() => {
    fetch('/api/videos')
      .then((r) => r.json())
      .then((d) => setVideos((d.videos || []).slice(0, 4)))
      .catch(() => setVideos([]));
  }, []);

  return (
    <section className="relative bg-gray-950 overflow-hidden film-grain">
      {/* cinematic backdrop: vignette + gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(243,146,0,0.12), transparent 70%), linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 30%, transparent 70%, rgba(0,0,0,0.6))',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-brand text-xs font-extrabold uppercase tracking-[0.3em] mb-2">
              Our Channel
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-wide">
              Watch on <span className="text-brand">YouTube</span>
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Facecam videos, reviews and Hollywood updates — subscribe for daily content.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/videos"
              className="text-sm font-bold uppercase tracking-wide text-gray-300 hover:text-brand flex items-center gap-1 transition-colors"
            >
              All videos <ArrowRight className="w-4 h-4" />
            </Link>
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wide transition-colors"
              >
                <Youtube className="w-5 h-5" /> Subscribe
              </a>
            )}
          </div>
        </div>

        {videos === null ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 text-brand animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          youtubeUrl ? (
            <div className="rounded-xl bg-white/5 border border-white/10 px-6 py-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                <Youtube className="w-7 h-7 text-white" />
              </div>
              <p className="text-gray-300 text-sm flex-1 text-center sm:text-left">
                Videos are on the way — subscribe so you never miss an upload.
              </p>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-7 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wide flex items-center transition-colors shrink-0"
              >
                Subscribe
              </a>
            </div>
          ) : null
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => setActive(v)}
                className="group text-left"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-white/10 shadow-lg group-hover:border-brand/60 group-hover:shadow-[0_10px_40px_rgba(243,146,0,0.25)] group-hover:-translate-y-1 transition-all duration-300">
                  <Image
                    src={v.thumbnail}
                    alt={v.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-brand/95 group-hover:scale-110 transition-transform flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </span>
                  </span>
                </div>
                <h3 className="mt-3 text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                  {v.title}
                </h3>
                <p className="text-gray-500 text-xs mt-1">{formatDate(v.published)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {active && <VideoPlayerModal video={active} onClose={() => setActive(null)} />}
    </section>
  );
}
