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
    openGraph: {
      title: `${label} | Blockbuster Bureau`,
      description: `Latest ${label.toLowerCase()} news and updates from Blockbuster Bureau.`,
      type: 'website',
    },
    alternates: {
      canonical: `/category/${category}`,
    },
  };
}

export const revalidate = 300; // Safety net: auto-refresh every 5 min (dashboard also triggers instant refresh on publish)

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
    <div className="bg-white text-gray-900 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 font-extrabold text-2xl uppercase tracking-wide border-l-4 border-brand pl-3">
            {categoryLabel}
          </h1>
          <p className="text-gray-500 mt-2 text-[15px] max-w-2xl">
            Stay updated with the latest {categoryLabel.toLowerCase()} news and
            updates from Blockbuster Bureau.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <p className="text-gray-500">
              No posts found in {categoryLabel}. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}