'use client';

import { useRef } from 'react';
import { Post } from '@/types';
import SectionTitle from '@/components/ui/SectionTitle';
import PostCard from '@/components/blog/PostCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RecentPostsProps {
  posts: Post[];
}

export default function RecentPosts({ posts }: RecentPostsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <SectionTitle eyebrow="Latest Updates" title="Recent Posts" />
          
          {/* Scroll buttons - visible on mobile */}
          <div className="flex gap-2 lg:hidden">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-nebula hover:bg-gold/20 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-nebula hover:bg-gold/20 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x snap-mandatory lg:grid lg:grid-cols-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex-shrink-0 w-[300px] lg:w-auto snap-start"
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}