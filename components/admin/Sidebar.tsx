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
  Mail,
  Bell,
  MessageSquare,
  Users,
} from 'lucide-react';
import { signOut } from '@/lib/auth';
import { User } from 'firebase/auth';

interface SidebarProps {
  user: User | null;
  isEditor?: boolean;
}

const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/dashboard/posts', label: 'Posts', icon: FileText, adminOnly: false },
  { href: '/dashboard/posts/new', label: 'New Post', icon: PlusCircle, adminOnly: false },
  { href: '/dashboard/newsletter', label: 'Newsletter', icon: Mail, adminOnly: true },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, adminOnly: true },
  { href: '/dashboard/push', label: 'Push Alerts', icon: Bell, adminOnly: true },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, adminOnly: true },
  { href: '/dashboard/team', label: 'Team', icon: Users, adminOnly: true },
];

export default function Sidebar({ user, isEditor = false }: SidebarProps) {
  // Editors only see content sections; admin-only sections are hidden.
  const navItems = allNavItems.filter((item) => !isEditor || !item.adminOnly);
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-50 shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-display text-2xl text-brand">BB</span>
          <span className="text-gray-900 font-semibold">Dashboard</span>
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
                  ? 'bg-brand/10 text-brand-dark'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
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
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="font-medium">View Site</span>
        </Link>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="mb-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Signed in as
            </p>
            <p className="text-gray-900 text-sm truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}