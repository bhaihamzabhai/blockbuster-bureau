'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Post } from '@/types';

/** Netflix-style Top 10: giant outlined rank numbers + portrait posters, snap-scroll row. */
export default function TopTen({ posts }: { posts: Post[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const top = [...posts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  if (top.length === 0) return null;

  const scroll = (dir: 1 | -1) =>
    trackRef.current?.scrollBy({ left: dir * 480, behavior: 'smooth' });

  const arrowCls =
    'absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-brand text-white items-center justify-center opacity-0 group-hover:opacity-100 transition hidden md:flex backdrop-blur-sm';

  return (
    <section className="bg-void film-grain py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="font-display text-3xl uppercase tracking-wide text-white border-l-4 border-[#f39200] pl-3">
          Top 10 Trending
        </h2>
        <p className="text-stardust text-sm mt-1.5">
          The most-viewed stories on Blockbuster Bureau right now
        </p>

        <div className="relative group mt-7">
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className={`${arrowCls} left-0`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className={`${arrowCls} right-0`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            ref={trackRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x no-scrollbar"
          >
          {top.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group snap-start shrink-0"
              aria-label={`#${i + 1}: ${post.title}`}
            >
              <span className="flex items-end">
                <span className="top10-number" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="relative block w-36 h-52 -ml-7 rounded-lg overflow-hidden bg-nebula shadow-lg ring-1 ring-white/10 group-hover:ring-[#f39200]/60 transition">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt=""
                      fill
                      sizes="144px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-white/40 font-display text-4xl">
                      B
                    </span>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </span>
              <span className="block w-36 mt-2.5 text-white text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-[#f39200] transition-colors">
                {post.title}
              </span>
            </Link>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
