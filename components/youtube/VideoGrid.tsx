'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, X, ExternalLink, Youtube, Loader2 } from 'lucide-react';
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

interface VideoGridProps {
  initialVideos: YTVideo[];
  initialConfigured: boolean;
}

/**
 * Video grid with click-to-play modal.
 * Self-healing: always re-checks /api/videos on load, so a statically
 * generated page built before the channel ID / API key was saved gets
 * replaced with fresh data (and Shorts stay filtered out).
 */
export default function VideoGrid({ initialVideos, initialConfigured }: VideoGridProps) {
  const [videos, setVideos] = useState<YTVideo[]>(initialVideos);
  const [configured, setConfigured] = useState(initialConfigured);
  const [checking, setChecking] = useState(initialVideos.length === 0);
  const [active, setActive] = useState<YTVideo | null>(null);

  useEffect(() => {
    fetch('/api/videos')
      .then((r) => r.json())
      .then((d) => {
        setVideos(d.videos || []);
        setConfigured(d.configured !== false);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
        <Youtube className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No videos found yet.</p>
        <p className="text-gray-400 text-sm mt-1">
          {configured
            ? 'The channel feed could not be loaded right now — please try again later.'
            : 'The admin needs to add the YouTube Channel ID in dashboard Settings → Social Links.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v)}
            className="group text-left bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-video bg-gray-900">
              <Image
                src={v.thumbnail}
                alt={v.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-14 h-14 rounded-full bg-brand/95 group-hover:scale-110 transition-transform flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                </span>
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-gray-900 font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                {v.title}
              </h3>
              <p className="text-gray-500 text-xs mt-1.5">{formatDate(v.published)}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Player modal */}
      {active && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${active.id}?autoplay=1&rel=0`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-4 bg-gray-900">
              <p className="text-white text-sm font-medium line-clamp-1">{active.title}</p>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold uppercase tracking-wider text-brand hover:text-white flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> YouTube
                </a>
                <button
                  onClick={() => setActive(null)}
                  aria-label="Close player"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
