'use client';

import { usePathname } from 'next/navigation';
import TopBar from './TopBar';
import MainNav from './MainNav';
import NewsTicker from '../home/NewsTicker';
import type { SiteSettings } from '@/lib/siteSettings';
import type { Post } from '@/types';

interface HeaderProps {
  settings: SiteSettings;
  tickerPosts: Post[];
}

/** Public site header: white top bar + orange nav + breaking ticker. Hidden in admin/login. */
export default function Header({ settings, tickerPosts }: HeaderProps) {
  const pathname = usePathname();

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) {
    return null;
  }

  return (
    <header className="relative z-40">
      <TopBar settings={settings} />
      <MainNav />
      <NewsTicker posts={tickerPosts} />
    </header>
  );
}
