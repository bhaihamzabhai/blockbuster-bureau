'use client';

import { useMemo, useState } from 'react';
import type { Post } from '@/types';
import ArticleCard from './ArticleCard';

type Tab = 'featured' | 'topViewed' | 'topRated' | 'recent';

const TABS: { id: Tab; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'topViewed', label: 'Top Viewed' },
  { id: 'topRated', label: 'Top Rated' },
  { id: 'recent', label: 'Recently Added' },
];

function tsOf(v: unknown): number {
  try {
    if (v && typeof (v as any).toDate === 'function') return (v as any).toDate().getTime();
    return new Date(v as any).getTime();
  } catch {
    return 0;
  }
}

/** "Featured Articles" section with tabs — like the reference design. */
export default function FeaturedSection({ posts }: { posts: Post[] }) {
  const [tab, setTab] = useState<Tab>('featured');

  const filtered = useMemo(() => {
    const list = [...posts];
    switch (tab) {
      case 'featured': {
        const f = list.filter((p) => p.featured);
        return (f.length > 0 ? f : list).slice(0, 8);
      }
      case 'topViewed':
        return list.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8);
      case 'topRated':
        return list
          .filter((p) => (p.rating || 0) > 0)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 8);
      case 'recent':
        return list.sort((a, b) => tsOf(b.publishedAt || b.createdAt) - tsOf(a.publishedAt || a.createdAt)).slice(0, 8);
    }
  }, [posts, tab]);

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-gray-900 font-extrabold text-xl uppercase tracking-wide border-l-4 border-brand pl-3">
          Featured Articles
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded text-[13px] font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-brand text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">
            No articles in this section yet — publish some from the dashboard.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {filtered.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
