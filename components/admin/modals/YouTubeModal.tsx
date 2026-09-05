'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Search, Play, Clock, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { extractVideoId, getYouTubeThumbnail } from '@/lib/youtubeVideos';
import { CHANNEL_VIDEOS } from '@/lib/youtubeVideos';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: {
    videoId: string;
    nocookie: boolean;
    rel: boolean;
    autoplay: boolean;
    startSeconds: number;
    align: "left" | "center" | "right";
    caption: string;
  }) => void;
}

export default function YouTubeModal({
  isOpen,
  onClose,
  onInsert,
}: YouTubeModalProps) {
  const [urlInput, setUrlInput] = useState("");
  const [videoId, setVideoId] = useState("");
  const [nocookie, setNocookie] = useState(true);
  const [rel, setRel] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [caption, setCaption] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  useEffect(() => {
    if (isOpen) {
      setUrlInput("");
      setVideoId("");
      setNocookie(true);
      setRel(false);
      setAutoplay(false);
      setStartTime("");
      setAlign("center");
      setCaption("");
      setVideoTitle("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (videoId) {
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        .then((res) => res.json())
        .then((data) => {
          if (data.title) setVideoTitle(data.title);
        })
        .catch(() => setVideoTitle(""));
    } else {
      setVideoTitle("");
    }
  }, [videoId]);

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    const id = extractVideoId(value);
    if (id) {
      setVideoId(id);
    } else {
      setVideoId("");
    }
  };

  const handleSelectVideo = (id: string) => {
    setVideoId(id);
    setUrlInput(`https://www.youtube.com/watch?v=${id}`);
  };

  const parseStartTime = (time: string): number => {
    if (!time) return 0;
    const parts = time.split(":").map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parseInt(time) || 0;
  };

  const handleInsert = () => {
    if (!videoId) return;
    onInsert({
      videoId,
      nocookie,
      rel,
      autoplay,
      startSeconds: parseStartTime(startTime),
      align,
      caption,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && videoId) handleInsert();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
          onKeyDown={handleKeyDown}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-nebula rounded-xl border border-white/10 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-display text-xl text-white flex items-center gap-2">
                <Youtube className="w-5 h-5 text-gold" />
                Insert YouTube Video
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-white/10 text-stardust hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-stardust text-sm mb-2">
                Paste YouTube URL or Video ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stardust" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-3 bg-void border border-white/10 rounded-lg text-white placeholder-stardust focus:outline-none focus:border-gold/50"
                  autoFocus
                />
              </div>
              {videoId && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gold/30">
                  <div className="relative aspect-video bg-void">
                    <img
                      src={getYouTubeThumbnail(videoId, "mqdefault")}
                      alt={videoTitle || "Video thumbnail"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-void ml-1" />
                      </div>
                    </div>
                  </div>
                  {videoTitle && (
                    <div className="p-3 bg-void/50">
                      <p className="text-white text-sm font-medium truncate">{videoTitle}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mb-6">
              <p className="text-stardust text-sm mb-3">Or pick from your channel</p>
              <div className="grid grid-cols-3 gap-2">
                {CHANNEL_VIDEOS.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleSelectVideo(video.id)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                      videoId === video.id
                        ? "border-gold"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-xs truncate">{video.title}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-stardust/50 text-xs mt-2">
                {'// TODO: Replace hardcoded array with YouTube Data API v3 call using NEXT_PUBLIC_YOUTUBE_API_KEY'}
              </p>
            </div>
            <div className="space-y-4 mb-6">
              <p className="text-stardust text-sm font-medium">Embed Options</p>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nocookie}
                    onChange={(e) => setNocookie(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-void text-gold focus:ring-gold/50"
                  />
                  <span className="text-stardust text-sm">Privacy-enhanced mode</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rel}
                    onChange={(e) => setRel(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-void text-gold focus:ring-gold/50"
                  />
                  <span className="text-stardust text-sm">Show related videos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoplay}
                    onChange={(e) => setAutoplay(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-void text-gold focus:ring-gold/50"
                  />
                  <span className="text-stardust text-sm">Autoplay</span>
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stardust" />
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="Start time (e.g. 1:30)"
                    className="flex-1 px-2 py-1 bg-void border border-white/10 rounded text-white text-sm placeholder-stardust focus:outline-none focus:border-gold/50"
                  />
                </div>
              </div>
              <div>
                <p className="text-stardust text-sm mb-2">Alignment</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAlign("left")}
                    className={`p-2 rounded transition-colors ${
                      align === "left" ? "bg-gold/20 text-gold" : "bg-void text-stardust hover:text-white"
                    }`}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlign("center")}
                    className={`p-2 rounded transition-colors ${
                      align === "center" ? "bg-gold/20 text-gold" : "bg-void text-stardust hover:text-white"
                    }`}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlign("right")}
                    className={`p-2 rounded transition-colors ${
                      align === "right" ? "bg-gold/20 text-gold" : "bg-void text-stardust hover:text-white"
                    }`}
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-stardust text-sm mb-1">Caption (optional)</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Video caption..."
                  className="w-full px-4 py-2 bg-void border border-white/10 rounded-lg text-white placeholder-stardust focus:outline-none focus:border-gold/50"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-white/10">
              <div className="flex-1" />
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsert}
                disabled={!videoId}
                className="px-4 py-2 rounded-lg bg-gold text-void font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Video
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}