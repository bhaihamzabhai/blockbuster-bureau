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
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  // DEBUG: Print current logged-in user email in browser console (F12)
  console.log('Current Logged-in User:', user?.email);

  // TEMPORARY: Force allow to test if dashboard renders at all
  const isAllowed = true; 

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (!isAllowed) {
      router.replace('/login?error=unauthorized');
    }
  }, [loading, user, isAllowed, router]);

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stardust text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      <Sidebar user={user} />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}