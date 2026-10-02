'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import SiteLogo from './SiteLogo';
import { CATEGORIES, CATEGORY_LABELS, Category } from '@/types';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'News' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Hide the public site header inside the admin area and login page.
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) {
    return null;
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-strong border-x-0 border-t-0">
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <SiteLogo size="sm" />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-gold bg-gold/10'
                    : 'text-stardust hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Category quick links */}
            <div className="hidden lg:flex items-center gap-1 ml-2 pl-4 border-l border-white/10">
              {(CATEGORIES as Category[]).slice(0, 4).map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat}`}
                  className="px-3 py-2 rounded-lg text-xs text-stardust hover:text-gold hover:bg-white/5 transition-colors"
                >
                  {CATEGORY_LABELS[cat]}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-stardust hover:text-white hover:bg-white/5 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-gold bg-gold/10'
                    : 'text-stardust hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-white/10">
              <p className="px-4 py-1 text-[10px] uppercase tracking-[0.2em] text-stardust/60">
                Categories
              </p>
              {(CATEGORIES as Category[]).map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat}`}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm text-stardust hover:text-gold hover:bg-white/5 transition-colors"
                >
                  {CATEGORY_LABELS[cat]}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
