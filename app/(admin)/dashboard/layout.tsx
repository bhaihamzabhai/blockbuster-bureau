'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/admin/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin, isEditor } = useAuth();
  const router = useRouter();

  // Admins and editors (verified via Firebase custom claims) may use the dashboard.
  // Editors see a limited sidebar (posts only); admin-only pages guard themselves.
  const isAllowed = isAdmin || isEditor;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (!isAllowed) {
      router.replace('/login?error=unauthorized');
    }
  }, [loading, user, isAllowed, router]);

  // Loading state
  if (loading || !user || !isAllowed) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar user={user} isEditor={isEditor && !isAdmin} />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}