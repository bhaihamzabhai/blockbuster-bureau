'use client';

import { useEffect } from 'react';
import { incrementViews } from '@/lib/firestore';

/**
 * Client-side view counter. Views are incremented from the browser so the
 * request carries the visitor's (unauthenticated) context — allowed by the
 * views-only Firestore rule.
 */
export default function ViewCounter({ postId }: { postId: string }) {
  useEffect(() => {
    // Guard against double-count in React Strict Mode (dev)
    const key = `bb-viewed-${postId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    incrementViews(postId).catch((error) => {
      console.error('Failed to increment views:', error);
    });
  }, [postId]);

  return null;
}