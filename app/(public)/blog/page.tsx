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
  searchParams: { category?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const category = searchParams.category as Category | undefined;

  const posts = await getPosts({
    status: 'published',
    category,
    limit: 50,
  });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-display text-5xl md:text-6xl text-gold mb-4">
            Entertainment News
          </h1>
          <p className="text-stardust text-lg max-w-2xl mx-auto">
            Stay updated with the latest Hollywood news, movie reviews, upcoming
            releases, and exclusive entertainment coverage.
          </p>
        </div>

        {/* Category Filter (client component using useSearchParams) */}
        <Suspense fallback={<div className="h-12 mb-8" />}>
          <CategoryFilter />
        </Suspense>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <div key={post.id}>
              <PostCard post={post} />
            </div>
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
            <p className="text-stardust text-lg">
              No posts found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}