'use client';

import Link from 'next/link';
import type { Post } from '@/types';

/** Auto-scrolling breaking-news ticker fed by the latest published posts. */
export default function NewsTicker({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  // Duplicate list for a seamless infinite loop
  const items = [...posts, ...posts];

  return (
    <div className="bg-gray-900 text-white flex items-stretch h-10 overflow-hidden" aria-label="Breaking news">
      <div className="bg-brand text-white text-[11px] font-extrabold uppercase tracking-[0.2em] flex items-center px-4 shrink-0 z-10">
        Breaking
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-track absolute top-0 left-0 h-10 flex items-center whitespace-nowrap will-change-transform">
          {items.map((p, i) => (
            <Link
              key={`${p.id}-${i}`}
              href={`/blog/${p.slug}`}
              className="mx-5 text-[13px] text-gray-200 hover:text-brand transition-colors flex items-center gap-2"
              aria-hidden={i >= posts.length}
              tabIndex={i >= posts.length ? -1 : 0}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
              {p.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
