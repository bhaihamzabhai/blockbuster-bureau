'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { Post } from '@/types';
import type { HeroSlide, SiteSettings } from '@/lib/siteSettings';
import SocialIcons from '../layout/SocialIcons';
import { formatPostDate } from '@/lib/dates';

interface HeroSliderProps {
  slides: HeroSlide[];
  latestPosts: Post[];
  settings: SiteSettings;
}

function formatDate(ts: Post['publishedAt'] | Post['createdAt']) {
  return formatPostDate(ts || '');
}

/**
 * Hero slider like the reference design: big sliding banner on the left,
 * dark "latest" side panel on the right, floating social icons on the edge.
 */
export default function HeroSlider({ slides, latestPosts, settings }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, go, count]);

  if (count === 0) return null;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="relative">
          {/* Floating social icons (left edge) */}
          <div className="hidden lg:flex flex-col gap-2 absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full z-10 pr-3">
            <SocialIcons
              settings={settings}
              className="flex-col"
              iconClassName="w-4 h-4"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-xl overflow-hidden shadow-lg">
            {/* Slider */}
            <div
              className="lg:col-span-2 relative aspect-[16/10] sm:aspect-[16/8] lg:aspect-[16/7] bg-gray-900 overflow-hidden group film-grain"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {slides.map((slide, i) => (
                <Link
                  key={slide.id}
                  href={slide.link || '#'}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  aria-hidden={i !== index}
                >
                  {slide.image ? (
                    <Image
                      key={i === index ? `active-${slide.id}` : slide.id}
                      src={slide.image}
                      alt={slide.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className={`object-cover ${i === index ? 'kenburns' : ''}`}
                      priority={i === 0}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                    <div className="glass rounded-xl p-5 sm:p-6 max-w-2xl">
                      <span className="inline-block bg-brand text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm mb-3">
                        Featured
                      </span>
                      <h2 className="font-display text-white text-3xl sm:text-5xl leading-[1.05] tracking-wide mb-2 line-clamp-2">
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="text-gray-300 text-sm sm:text-base line-clamp-2">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

              {/* Arrows */}
              {count > 1 && (
                <>
                  <button
                    onClick={() => go(-1)}
                    aria-label="Previous slide"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-brand text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => go(1)}
                    aria-label="Next slide"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-brand text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  {/* Dots */}
                  <div className="absolute bottom-4 right-5 z-20 flex gap-1.5">
                    {slides.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => setIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          i === index ? 'w-6 bg-brand' : 'w-1.5 bg-white/50 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Side panel: latest posts */}
            <div className="bg-gray-900 p-5 sm:p-6 flex flex-col">
              <h3 className="text-brand font-extrabold text-sm uppercase tracking-[0.2em] mb-4 pb-3 border-b border-white/10">
                Latest News
              </h3>
              <div className="flex-1 divide-y divide-white/10">
                {latestPosts.slice(0, 5).map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-3 py-3 group first:pt-0 last:pb-0">
                    <div className="relative w-20 h-14 shrink-0 rounded overflow-hidden bg-gray-800">
                      {post.coverImage ? (
                        <Image src={post.coverImage} alt={post.title} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand/40 to-gray-800" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                        {post.title}
                      </p>
                      <p className="text-gray-500 text-[11px] mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/blog"
                className="mt-4 text-center text-[12px] font-bold uppercase tracking-widest text-brand hover:text-white transition-colors"
              >
                View all news →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
