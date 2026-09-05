import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPosts } from '@/lib/firestore';
import { CATEGORIES, CATEGORY_LABELS, Category } from '@/types';
import PostCard from '@/components/blog/PostCard';
import AdBanner from '@/components/home/AdBanner';

interface CategoryPageProps {
  params: { category: string };
}

// Generate static params for all categories
export function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category,
  }));
}

// Generate metadata for each category
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = params.category as Category;

  if (!CATEGORIES.includes(category)) {
    return {
      title: 'Category Not Found',
    };
  }

  const label = CATEGORY_LABELS[category];

  return {
    title: label,
    description: `Latest ${label.toLowerCase()} news and updates from Blockbuster Bureau.`,
  };
}

export const revalidate = 3600;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category as Category;

  // Validate category
  if (!CATEGORIES.includes(category)) {
    notFound();
  }

  const posts = await getPosts({
    status: 'published',
    category,
    limit: 50,
  });

  const categoryLabel = CATEGORY_LABELS[category];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <p className="text-stardust text-sm uppercase tracking-wider mb-2">
            Category
          </p>
          <h1 className="text-display text-5xl md:text-6xl text-gold mb-4">
            {categoryLabel}
          </h1>
          <p className="text-stardust text-lg max-w-2xl mx-auto">
            Stay updated with the latest {categoryLabel.toLowerCase()} news and
            updates from Blockbuster Bureau.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <div key={post.id}>
              <PostCard post={post} />
              {/* Ad placement after every 6 posts */}
              {(index + 1) % 6 === 0 && index !== posts.length - 1 && (
                <div className="col-span-full mt-6">
                  <AdBanner />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-stardust text-lg">
              No posts found in {categoryLabel}. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}