import AdUnit from '@/components/ads/AdUnit';
import { getPosts, getFeaturedPosts } from '@/lib/firestore';
import Hero from '@/components/home/Hero';
import TrendingGrid from '@/components/home/TrendingGrid';
import RecentPosts from '@/components/home/RecentPosts';

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Fetch data server-side
  const [featuredPosts, recentPosts] = await Promise.all([
    getFeaturedPosts(),
    getPosts({ status: 'published', limit: 9 }),
  ]);

  return (
    <>
      <Hero />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-stardust text-xs text-center mb-2 uppercase tracking-wider">
            Advertisement
          </p>
          <div className="flex justify-center">
            <AdUnit slot="leaderboard" />
          </div>
        </div>
      </div>
      <TrendingGrid posts={featuredPosts} />
      <RecentPosts posts={recentPosts} />
    </>
  );
}