'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, Youtube, Loader2 } from 'lucide-react';
import VideoPlayerModal from './VideoPlayerModal';
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
  excludeIds?: string[];
}

/**
 * Video grid with click-to-play modal.
 * Self-healing: always re-checks /api/videos on load, so a statically
 * generated page built before the channel ID / API key was saved gets
 * replaced with fresh data (and Shorts stay filtered out).
 */
export default function VideoGrid({ initialVideos, initialConfigured, excludeIds = [] }: VideoGridProps) {
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

  const visible = videos.filter((v) => !excludeIds.includes(v.id));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((v) => (
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
      {active && <VideoPlayerModal video={active} onClose={() => setActive(null)} />}
    </>
  );
}
