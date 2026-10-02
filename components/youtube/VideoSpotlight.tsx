'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, Youtube } from 'lucide-react';
import type { YTVideo } from '@/lib/youtube';
import VideoPlayerModal from './VideoPlayerModal';

/**
 * About-page spotlight: shows the channel's latest video.
 * Click to play in a modal. Falls back to the plain placeholder
 * while loading or when no videos are available.
 */
export default function VideoSpotlight() {
  const [video, setVideo] = useState<YTVideo | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch('/api/videos')
      .then((r) => r.json())
      .then((d) => setVideo(d.videos?.[0] || null))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || !video) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Youtube className="w-16 h-16 text-brand mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Blockbuster Bureau on YouTube</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setPlaying(true)}
        className="group relative aspect-video w-full bg-gray-900 rounded-xl overflow-hidden text-left shadow-sm hover:shadow-md transition-shadow"
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
          <span className="w-16 h-16 rounded-full bg-brand/95 group-hover:scale-110 transition-transform flex items-center justify-center shadow-lg">
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </span>
          <span className="text-white font-semibold text-sm sm:text-base line-clamp-2 text-center drop-shadow">
            {video.title}
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-light">
            Latest video — watch now
          </span>
        </span>
      </button>
      {playing && <VideoPlayerModal video={video} onClose={() => setPlaying(false)} />}
    </>
  );
}
