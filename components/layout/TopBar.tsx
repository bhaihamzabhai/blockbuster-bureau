'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, User } from 'lucide-react';
import SiteLogo from './SiteLogo';
import SocialIcons from './SocialIcons';
import type { SiteSettings } from '@/lib/siteSettings';

interface TopBarProps {
  settings: SiteSettings;
}

/** White utility bar: logo, search, social icons, login — like the reference design. */
export default function TopBar({ settings }: TopBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/blog?q=${encodeURIComponent(q)}` : '/blog');
  };

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-[76px] flex items-center gap-4 md:gap-8">
        <SiteLogo size="sm" theme="light" />

        {/* Search */}
        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md mx-auto">
          <div className="flex w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, news..."
              className="flex-1 h-10 px-4 rounded-l-full bg-gray-100 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <button
              type="submit"
              className="h-10 px-6 rounded-r-full bg-gray-900 hover:bg-brand text-white text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              Go
            </button>
          </div>
        </form>

        {/* Social + Login */}
        <div className="flex items-center gap-3 ml-auto">
          <SocialIcons settings={settings} className="hidden sm:flex" />
          <span className="hidden sm:block w-px h-6 bg-gray-200" />
          <Link
            href="/login"
            className="h-10 px-6 rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors"
          >
            <User className="w-4 h-4" />
            Login
          </Link>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={onSearch} className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, news..."
            className="flex-1 h-10 px-4 rounded-l-full bg-gray-100 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="h-10 px-5 rounded-r-full bg-gray-900 text-white text-sm font-semibold flex items-center gap-1"
          >
            <Search className="w-4 h-4" />
            Go
          </button>
        </form>
      </div>
    </div>
  );
}
