import Link from 'next/link';
import SiteLogo from './SiteLogo';
import SocialIcons from './SocialIcons';
import { CATEGORIES, CATEGORY_LABELS, Category } from '@/types';
import { getSiteSettings } from '@/lib/siteSettings';

/** Light footer with social icons (admin-configured links). */
export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = await getSiteSettings();

  return (
    <footer className="bg-gray-100 text-gray-600 mt-0 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <SiteLogo size="sm" theme="light" />
            <p className="text-gray-500 text-sm mt-4 leading-relaxed">
              Your daily source for Hollywood news, upcoming movies, trailers
              and entertainment updates.
            </p>
            <SocialIcons settings={settings} className="mt-5" iconClassName="w-4 h-4" />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Home' },
                { href: '/blog', label: 'News' },
                { href: '/about', label: 'About' },
                { href: '/privacy', label: 'Privacy Policy' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-500 hover:text-brand text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {(CATEGORIES as Category[]).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/category/${cat}`}
                    className="text-gray-500 hover:text-brand text-sm transition-colors"
                  >
                    {CATEGORY_LABELS[cat]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Watch */}
          <div>
            <h4 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">Watch</h4>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Facecam videos, reviews and Hollywood updates on our YouTube channel.
            </p>
            {settings.youtubeUrl ? (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-bold uppercase tracking-wide transition-colors"
              >
                Visit Channel
              </a>
            ) : (
              <Link
                href="/blog?category=trailers"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-bold uppercase tracking-wide transition-colors"
              >
                Latest Trailers
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-400 text-xs">© {currentYear} Blockbuster Bureau. All rights reserved.</p>
          <p className="text-gray-400 text-xs">The Bureau Never Closes</p>
        </div>
      </div>
    </footer>
  );
}
