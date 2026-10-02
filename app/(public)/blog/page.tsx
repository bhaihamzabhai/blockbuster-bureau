import { Suspense } from 'react';
import { Metadata } from 'next';
import { getPosts } from '@/lib/firestore';
import { Category } from '@/types';
import CategoryFilter from '@/components/blog/CategoryFilter';
import PostCard from '@/components/blog/PostCard';
import AdUnit from '@/components/ads/AdUnit';

export const metadata: Metadata = {
  title: 'Entertainment News',
  description:
    'Latest Hollywood news, movie reviews, upcoming releases, and entertainment updates from Blockbuster Bureau.',
};

export const revalidate = 3600;

interface BlogPageProps {
  searchParams: { category?: string; q?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const category = searchParams.category as Category | undefined;
  const q = (searchParams.q || '').trim().toLowerCase();

  let posts = await getPosts({
    status: 'published',
    category,
    limit: 50,
  });

  if (q) {
    posts = posts.filter((p) =>
      [p.title, p.excerpt, p.body].some((f) =>
        f?.toLowerCase().includes(q)
      )
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 font-extrabold text-2xl uppercase tracking-wide border-l-4 border-brand pl-3">
            {q ? `Search: “${searchParams.q}”` : 'Entertainment News'}
          </h1>
          <p className="text-gray-500 mt-2 text-[15px]">
            {q
              ? `${posts.length} result${posts.length === 1 ? '' : 's'} found`
              : 'Stay updated with the latest Hollywood news, movie reviews, upcoming releases, and exclusive entertainment coverage.'}
          </p>
        </div>

        {/* Category Filter (client component using useSearchParams) */}
        <Suspense fallback={<div className="h-12 mb-8" />}>
          <CategoryFilter />
        </Suspense>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* In-article ads after every 6 posts */}
        {posts.length > 6 && (
          <div className="mt-12 flex justify-center">
            <AdUnit slot="in-article" />
          </div>
        )}

        {/* Rectangle ad at bottom */}
        <div className="mt-12 flex justify-center">
          <AdUnit slot="rectangle" />
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">
              {q ? 'No articles matched your search.' : 'No posts found in this category.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
