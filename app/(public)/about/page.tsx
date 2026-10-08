import { Metadata } from 'next';
import Link from 'next/link';
import { Youtube, Mail, ArrowRight } from 'lucide-react';
import { CATEGORIES, CATEGORY_LABELS, type Category } from '@/types';
import { getSiteSettings } from '@/lib/siteSettings';
import VideoSpotlight from '@/components/youtube/VideoSpotlight';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Blockbuster Bureau - your daily source for Hollywood news, trailers, and entertainment updates.',
};

const categoryIcons: Record<string, string> = {
  'upcoming-movies': '🎬',
  'actor-news': '⭐',
  'release-dates': '📅',
  announcements: '📢',
  reviews: '🎭',
  trailers: '▶️',
};

const categoryDescriptions: Record<string, string> = {
  'upcoming-movies': 'Get the scoop on upcoming Hollywood blockbusters',
  'actor-news': 'Latest news about your favorite stars',
  'release-dates': 'Never miss a movie release again',
  announcements: 'Breaking entertainment announcements',
  reviews: 'Honest reviews of the latest films',
  trailers: 'Watch the newest movie trailers first',
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-gray-900 font-extrabold text-3xl md:text-4xl uppercase tracking-wide">
            About <span className="text-brand">Blockbuster Bureau</span>
          </h1>
          <p className="text-gray-500 text-lg mt-4">
            Your daily source for Hollywood news, trailers, and entertainment updates
          </p>
        </div>
      </section>

      {/* Channel Section */}
      <section className="py-12 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-gray-900 font-extrabold text-xl uppercase tracking-wide border-l-4 border-brand pl-3">
                Our YouTube Channel
              </h2>
              <p className="text-gray-500 mt-4 leading-relaxed">
                We cover breaking Hollywood news, upcoming movie releases, actor
                interviews, and exclusive entertainment updates — delivered
                daily on YouTube and in-depth here on Blockbuster Bureau.
              </p>
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                  Subscribe on YouTube
                </a>
              )}
            </div>
            <VideoSpotlight />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-gray-900 font-extrabold text-xl uppercase tracking-wide border-l-4 border-brand pl-3">
            What We Cover
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {(CATEGORIES as Category[]).map((category) => (
              <Link
                key={category}
                href={`/category/${category}`}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md hover:border-brand/40 transition group"
              >
                <span className="text-4xl mb-4 block">{categoryIcons[category]}</span>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-brand transition-colors">
                  {CATEGORY_LABELS[category]}
                </h3>
                <p className="text-gray-500 text-sm">{categoryDescriptions[category]}</p>
                <span className="inline-flex items-center gap-1 text-brand text-xs font-bold uppercase tracking-wider mt-4">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Standards Section (E-E-A-T: who we are, how we work) */}
      <section className="py-14 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-gray-900 font-extrabold text-xl uppercase tracking-wide border-l-4 border-brand pl-3">
            How We Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Original takes</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every article is written in our own voice with our own analysis —
                we don&apos;t copy-paste press releases. Our &ldquo;my take&rdquo;
                sections tell you what we actually think.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Facts checked</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Box office numbers, release dates, and casting news are verified
                against primary sources (studios, trades) before publishing.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Corrections</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We fix verified errors promptly and transparently. Spotted a
                mistake?{' '}
                <a href="/contact" className="text-brand font-semibold hover:underline">
                  Tell us here
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-14 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-gray-900 font-extrabold text-xl uppercase tracking-wide">
            Work With <span className="text-brand">Us</span>
          </h2>
          <p className="text-gray-500 mt-3 mb-6">
            Interested in sponsorship, collaboration, or press inquiries? We&apos;d love to hear from you.
          </p>
          <a
            href="mailto:contact@blockbusterbureau.com"
            className="inline-flex items-center gap-2 text-brand hover:text-brand-dark font-semibold transition-colors"
          >
            <Mail className="w-5 h-5" />
            contact@blockbusterbureau.com
          </a>
        </div>
      </section>
    </div>
  );
}
