'use client';

import { usePathname } from 'next/navigation';
import TopBar from './TopBar';
import MainNav from './MainNav';
import type { SiteSettings } from '@/lib/siteSettings';

interface HeaderProps {
  settings: SiteSettings;
}

/** Public site header: white top bar + orange nav. Hidden in admin/login. */
export default function Header({ settings }: HeaderProps) {
  const pathname = usePathname();

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) {
    return null;
  }

  return (
    <header className="relative z-40">
      <TopBar settings={settings} />
      <MainNav settings={settings} />
    </header>
  );
}
