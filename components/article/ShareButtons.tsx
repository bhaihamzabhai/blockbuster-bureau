'use client';

import { useEffect, useState } from 'react';
import { Facebook, Twitter, MessageCircle, Link2, Check, Send } from 'lucide-react';

/** Share buttons: X, Facebook, WhatsApp, Reddit, Telegram, copy link. */
export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  // Resolve the canonical URL client-side (works behind any domain).
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const text = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url || '');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const btn =
    'w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-sm';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-extrabold uppercase tracking-widest text-gray-500 mr-1">
        Share
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={`${btn} bg-black hover:bg-gray-800`}
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={`${btn} bg-[#1877f2] hover:bg-[#1463cc]`}
      >
        <Facebook className="w-4 h-4" />
      </a>
      <a
        href={`https://wa.me/?text=${text}%20${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className={`${btn} bg-[#25d366] hover:bg-[#1eb856]`}
      >
        <MessageCircle className="w-4 h-4" />
      </a>
      <a
        href={`https://www.reddit.com/submit?url=${shareUrl}&title=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Reddit"
        className={`${btn} bg-[#ff4500] hover:bg-[#d93b00]`}
      >
        <Send className="w-4 h-4" />
      </a>
      <button
        onClick={copy}
        aria-label="Copy link"
        className={`${btn} ${copied ? 'bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
