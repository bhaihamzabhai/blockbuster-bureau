'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, X } from 'lucide-react';

const STORAGE_KEY = 'bb-channel-banner-dismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function ChannelBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const channelUrl = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL;

  useEffect(() => {
    // Check if banner was recently dismissed
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION) {
        return;
      }
    }

    // Show banner after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  if (!channelUrl || channelUrl.includes('YOURCHANNEL')) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-nova/90 backdrop-blur-md rounded-xl border border-white/10 p-4 flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Watch on YouTube</p>
                  <p className="text-white/70 text-sm">
                    Subscribe for daily Hollywood entertainment news
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Youtube className="w-4 h-4" />
                  Subscribe
                </a>
                <button
                  onClick={handleDismiss}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}