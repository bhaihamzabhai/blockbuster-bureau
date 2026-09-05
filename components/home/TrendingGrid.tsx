import { Post } from '@/types';
import SectionTitle from '@/components/ui/SectionTitle';
import PostCard from '@/components/blog/PostCard';

interface TrendingGridProps {
  posts: Post[];
}

export default function TrendingGrid({ posts }: TrendingGridProps) {
  if (posts.length === 0) {
    return null;
  }

  const [featuredPost, ...otherPosts] = posts;
  const topPosts = otherPosts.slice(0, 4);

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle eyebrow="What's Hot" title="Trending This Week" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Featured Post - 60% width on desktop */}
          <div className="lg:col-span-3 min-h-[400px]">
            <PostCard post={featuredPost} variant="featured" />
          </div>

          {/* Other Posts - 40% width on desktop */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {topPosts.map((post) => (
              <PostCard key={post.id} post={post} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}