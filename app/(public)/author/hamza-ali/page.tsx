import { Metadata } from 'next';
import Link from 'next/link';
import { Youtube, Mail, PenLine, ArrowRight } from 'lucide-react';
import { getPosts } from '@/lib/firestore';
import { getSiteSettings } from '@/lib/siteSettings';
import PostCard from '@/components/blog/PostCard';

export const metadata: Metadata = {
  title: 'Hamza Ali — Founder & Editor | Blockbuster Bureau',
  description:
    'Meet Hamza Ali, founder and editor of Blockbuster Bureau — covering Hollywood news, box office analysis, trailers and reviews with original takes.',
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blockbusterbureau.com';

export default async function AuthorPage() {
  const [settings, allPosts] = await Promise.all([
    getSiteSettings(),
    getPosts({ status: 'published', limit: 100 }),
  ]);

  // Articles by Hamza Ali (author field match, case-insensitive)
  const articles = allPosts.filter((p) =>
    (p.author || '').toLowerCase().includes('hamza')
  );

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Hamza Ali',
    url: `${SITE_URL}/author/hamza-ali`,
    jobTitle: 'Founder & Editor',
    worksFor: {
      '@type': 'Organization',
      name: 'Blockbuster Bureau',
      url: SITE_URL,
    },
    description:
      'Founder and editor of Blockbuster Bureau, covering Hollywood news, box office analysis, trailers and reviews.',
    knowsAbout: [
      'Hollywood Movies',
      'Box Office Analysis',
      'Movie Trailers',
      'Film Reviews',
      'Entertainment News',
    ],
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      {/* Author hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-36 h-36 rounded-full bg-brand flex items-center justify-center text-white text-6xl font-extrabold shadow-lg">
              H
            </div>
          </div>
          <div className="text-center md:text-left">
            <p className="text-brand text-sm font-bold uppercase tracking-widest">
              Founder & Editor
            </p>
            <h1 className="text-gray-900 font-extrabold text-3xl md:text-4xl mt-2">
              Hamza Ali
            </h1>
            <p className="text-gray-500 mt-4 leading-relaxed max-w-2xl">
              Hamza founded Blockbuster Bureau to cover Hollywood the way fans
              actually talk about it — sharp box office analysis, honest
              reviews, and trailer breakdowns with original takes, not
              copy-pasted press releases. He also runs a YouTube channel with
              facecam deep-dives on the biggest movie stories.
            </p>
            <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-md hover:bg-red-700 transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                  YouTube
                </a>
              )}
              <a
                href="mailto:contact@blockbusterbureau.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-bold rounded-md hover:border-brand hover:text-brand transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="py-12 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-gray-900 font-extrabold text-xl uppercase tracking-wide border-l-4 border-brand pl-3">
            Coverage Areas
          </h2>
          <div className="flex flex-wrap gap-2 mt-6">
            {[
              'Box Office Analysis',
              'Movie Reviews',
              'Trailer Breakdowns',
              'Release Dates',
              'Actor News',
              'Industry Announcements',
            ].map((t) => (
              <span
                key={t}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900 font-extrabold text-xl uppercase tracking-wide border-l-4 border-brand pl-3">
              Articles by Hamza Ali
            </h2>
            <span className="inline-flex items-center gap-1.5 text-gray-500 text-sm font-semibold">
              <PenLine className="w-4 h-4" />
              {articles.length} articles
            </span>
          </div>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {articles.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-8">Articles coming soon.</p>
          )}
          <div className="text-center mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-brand font-bold hover:underline"
            >
              Browse all articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
