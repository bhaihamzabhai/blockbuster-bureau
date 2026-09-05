'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { signOut } from '@/lib/auth';
import { User } from 'firebase/auth';

interface SidebarProps {
  user: User | null;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/posts', label: 'Posts', icon: FileText },
  { href: '/dashboard/posts/new', label: 'New Post', icon: PlusCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-nebula border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-display text-2xl text-gold">BB</span>
          <span className="text-white font-medium">Dashboard</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gold/20 text-gold'
                  : 'text-stardust hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* View Site Link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-stardust hover:bg-white/5 hover:text-white transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="font-medium">View Site</span>
        </Link>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/5">
        {user && (
          <div className="mb-4">
            <p className="text-stardust text-xs uppercase tracking-wider mb-1">
              Signed in as
            </p>
            <p className="text-white text-sm truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-stardust hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}