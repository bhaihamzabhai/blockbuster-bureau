'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Clapperboard } from 'lucide-react';
import { CATEGORIES, CATEGORY_LABELS, Category } from '@/types';

interface MainNavProps {}

/** Orange navigation bar with dropdown for categories — like the reference design. */
export default function MainNav({}: MainNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const linkCls = (href: string) =>
    `px-5 h-12 flex items-center text-[13px] font-bold uppercase tracking-wider transition-colors ${
      isActive(href) ? 'bg-gray-900 text-white' : 'text-white hover:bg-black/15'
    }`;

  return (
    <nav className="bg-brand sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center">
          <Link href="/" className={linkCls('/')}>Home</Link>

          {/* Categories dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <Link
              href="/blog"
              className={`${linkCls('/blog')} ${pathname.startsWith('/category') ? 'bg-gray-900 text-white' : ''} gap-1`}
            >
              Categories
              <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            {catOpen && (
              <div className="absolute left-0 top-full min-w-[220px] bg-white shadow-xl border border-gray-100 py-2 z-50">
                {(CATEGORIES as Category[]).map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${cat}`}
                    className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-brand hover:text-white transition-colors"
                  >
                    {CATEGORY_LABELS[cat]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/blog" className={linkCls('/blog')}>News</Link>
          <Link href="/videos" className={linkCls('/videos')}>
            <span className="flex items-center gap-1.5">
              <Clapperboard className="w-4 h-4" />
              Videos
            </span>
          </Link>
          <Link href="/releases" className={linkCls('/releases')}>Releases</Link>
          <Link href="/about" className={linkCls('/about')}>About</Link>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center justify-between h-12">
          <span className="text-white text-[13px] font-bold uppercase tracking-wider">Menu</span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-dark border-t border-white/20">
          {[
            { href: '/', label: 'Home' },
            { href: '/blog', label: 'News' },
            { href: '/videos', label: 'Videos' },
            { href: '/releases', label: 'Releases' },
            { href: '/about', label: 'About' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block px-5 py-3 text-white text-sm font-bold uppercase tracking-wider border-b border-white/10"
            >
              {l.label}
            </Link>
          ))}
          <div className="px-5 py-2 text-white/80 text-xs font-bold uppercase tracking-wider">Categories</div>
          {(CATEGORIES as Category[]).map((cat) => (
            <Link
              key={cat}
              href={`/category/${cat}`}
              onClick={() => setMobileOpen(false)}
              className="block px-8 py-2.5 text-white text-sm border-b border-white/10"
            >
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
