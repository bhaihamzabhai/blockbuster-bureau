'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Wrap admin-only dashboard pages with this. Editors are bounced back
// to the posts list; only full admins may view the wrapped page.
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) {
      router.replace('/dashboard/posts');
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
