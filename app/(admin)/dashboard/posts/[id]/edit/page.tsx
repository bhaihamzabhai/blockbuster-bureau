'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/types';
import PostEditor from '@/components/admin/PostEditor';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

/**
 * Edit-post page.
 *
 * NOTE: This must fetch the post client-side (not in a server component).
 * Firestore rules only allow admins to read *draft* posts, and the Firebase
 * Auth token only exists in the browser — a server-side getDoc() runs
 * unauthenticated, gets permission-denied on drafts, and wrongly 404s.
 */
export default function EditPostPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'posts', params.id));
        if (cancelled) return;
        if (!snap.exists()) {
          setMissing(true);
        } else {
          setPost({ id: snap.id, ...snap.data() } as Post);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        if (!cancelled) setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, params.id]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading post…</p>
        </div>
      </div>
    );
  }

  if (missing || !post) {
    return (
      <div className="max-w-md mx-auto mt-24 bg-white rounded-xl border border-gray-200 p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
        <h1 className="text-gray-900 font-semibold text-lg mb-2">Post not found</h1>
        <p className="text-gray-500 text-sm mb-6">
          This post doesn&apos;t exist or may have been deleted.
        </p>
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 hover:bg-gray-100 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to posts
        </Link>
      </div>
    );
  }

  return <PostEditor initialData={post} postId={params.id} />;
}
