'use client';

import { X, ExternalLink } from 'lucide-react';
import type { YTVideo } from '@/lib/youtube';

/** Fullscreen YouTube player modal, shared by video grids and spotlights. */
export default function VideoPlayerModal({
  video,
  onClose,
}: {
  video: YTVideo;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="flex items-center justify-between gap-4 p-4 bg-gray-900">
          <p className="text-white text-sm font-medium line-clamp-1">{video.title}</p>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-wider text-brand hover:text-white flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> YouTube
            </a>
            <button
              onClick={onClose}
              aria-label="Close player"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
