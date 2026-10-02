import Link from 'next/link';
import { Youtube, ArrowRight } from 'lucide-react';
import AdUnit from '@/components/ads/AdUnit';
import HeroSlider from '@/components/home/HeroSlider';
import FeaturedSection from '@/components/home/FeaturedSection';
import Newsletter from '@/components/home/Newsletter';
import HomeReleases from '@/components/home/HomeReleases';
import { getPosts } from '@/lib/firestore';
import { getSiteSettings, type HeroSlide } from '@/lib/siteSettings';
import { CATEGORIES, CATEGORY_LABELS, type Category } from '@/types';

export const revalidate = 3600; // Revalidate every hour

const CATEGORY_GRADIENTS: Record<string, string> = {
  'upcoming-movies': 'from-orange-500 to-red-600',
  'actor-news': 'from-purple-500 to-indigo-600',
  'release-dates': 'from-blue-500 to-cyan-600',
  announcements: 'from-emerald-500 to-teal-600',
  reviews: 'from-amber-500 to-orange-600',
  trailers: 'from-rose-500 to-pink-600',
};

export default async function HomePage() {
  const [settings, posts] = await Promise.all([
    getSiteSettings(),
    getPosts({ status: 'published', limit: 24 }),
  ]);

  // Hero slides: admin-configured, otherwise fall back to latest posts.
  const slides: HeroSlide[] =
    settings.heroSlides.length > 0
      ? settings.heroSlides.slice(0, 5)
      : posts.slice(0, 3).map((p) => ({
          id: p.id,
          image: p.coverImage || '',
          title: p.title,
          subtitle: p.excerpt || '',
          link: `/blog/${p.slug}`,
        }));

  return (
    <div className="bg-white text-gray-900">
      <HeroSlider slides={slides} latestPosts={posts} settings={settings} />

      {/* Leaderboard ad */}
      <div className="py-6 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400 text-[11px] text-center mb-2 uppercase tracking-widest">
            Advertisement
          </p>
          <div className="flex justify-center">
            <AdUnit slot="leaderboard" />
          </div>
        </div>
      </div>

      <FeaturedSection posts={posts} />

      {/* Browse by category */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-gray-900 font-extrabold text-xl uppercase tracking-wide border-l-4 border-brand pl-3">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            {(CATEGORIES as Category[]).map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat}`}
                className={`rounded-lg bg-gradient-to-br ${CATEGORY_GRADIENTS[cat] || 'from-gray-500 to-gray-700'} p-5 text-white group hover:shadow-lg transition-shadow`}
              >
                <p className="font-bold text-[15px] leading-tight">{CATEGORY_LABELS[cat]}</p>
                <p className="text-white/80 text-xs mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon — upcoming releases strip */}
      <HomeReleases />

      {/* YouTube CTA */}
      {settings.youtubeUrl && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="rounded-xl bg-gray-900 px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                <Youtube className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-white font-extrabold text-xl">Watch on YouTube</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Facecam videos, reviews and Hollywood updates — subscribe for daily content.
                </p>
              </div>
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-7 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wide flex items-center transition-colors shrink-0"
              >
                Subscribe
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter signup */}
      <Newsletter />
    </div>
  );
}
