import { Metadata } from 'next';
import { Youtube, Mail } from 'lucide-react';
import { CATEGORIES, CATEGORY_LABELS } from '@/types';
import SectionTitle from '@/components/ui/SectionTitle';
import GlowCard from '@/components/ui/GlowCard';
import YouTubeEmbed from '@/components/youtube/YouTubeEmbed';

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

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-display text-5xl md:text-6xl text-gold mb-4">
            About Blockbuster Bureau
          </h1>
          <p className="text-stardust text-lg md:text-xl">
            Your daily source for Hollywood news, trailers, and entertainment
            updates
          </p>
        </div>
      </section>

      {/* Channel Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* YouTube Channel Info */}
            <div>
              <h2 className="text-display text-3xl text-white mb-4">
                Our YouTube Channel
              </h2>
              <p className="text-stardust mb-6">
                We cover breaking Hollywood news, upcoming movie releases, actor
                interviews, and exclusive entertainment updates — delivered
                daily on YouTube and in-depth here on Blockbuster Bureau.
              </p>
              <a
                href={process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                <Youtube className="w-5 h-5" />
                Subscribe on YouTube
              </a>
            </div>

            {/* Channel Thumbnail Placeholder */}
            <div className="relative aspect-video bg-nebula rounded-xl overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <Youtube className="w-16 h-16 text-gold mx-auto mb-4" />
                <p className="text-stardust">YouTube Channel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Videos Section */}
      <section className="py-16 px-4 bg-nebula/30">
        <div className="max-w-6xl mx-auto">
          <SectionTitle eyebrow="Watch Now" title="Latest Videos" align="center" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Placeholder videos - replace with actual video IDs */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-video bg-void rounded-xl flex items-center justify-center"
              >
                <p className="text-stardust">Video {i}</p>
              </div>
            ))}
          </div>
          <p className="text-stardust text-sm text-center mt-4">
            Replace these placeholders with your actual YouTube video IDs
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            eyebrow="Coverage"
            title="What We Cover"
            align="center"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {CATEGORIES.map((category) => (
              <GlowCard key={category}>
                <div className="p-6 text-center">
                  <span className="text-4xl mb-4 block">
                    {categoryIcons[category]}
                  </span>
                  <h3 className="text-display text-xl text-white mb-2">
                    {CATEGORY_LABELS[category]}
                  </h3>
                  <p className="text-stardust text-sm">
                    {categoryDescriptions[category]}
                  </p>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/Collab Section */}
      <section className="py-16 px-4 bg-nebula/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-display text-3xl text-gold mb-4">Work With Us</h2>
          <p className="text-stardust mb-6">
            Interested in sponsorship, collaboration, or press inquiries? We&apos;d
            love to hear from you.
          </p>
          <a
            href="mailto:contact@blockbusterbureau.com"
            className="inline-flex items-center gap-2 text-nova hover:text-gold transition-colors"
          >
            <Mail className="w-5 h-5" />
            contact@blockbusterbureau.com
          </a>
        </div>
      </section>
    </div>
  );
}