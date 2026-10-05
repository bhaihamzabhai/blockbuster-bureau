'use client';

import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';

export interface SavedPost {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
}

const KEY = 'bbb-bookmarks';

export function getBookmarks(): SavedPost[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedPost[]) : [];
  } catch {
    return [];
  }
}

function setBookmarks(list: SavedPost[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — stay silent */
  }
}

export function removeBookmark(id: string) {
  setBookmarks(getBookmarks().filter((b) => b.id !== id));
}

/** Save/unsave toggle stored in localStorage ("My List"). */
export default function BookmarkButton({ post }: { post: SavedPost }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getBookmarks().some((b) => b.id === post.id));
  }, [post.id]);

  const toggle = () => {
    const list = getBookmarks();
    if (saved) {
      setBookmarks(list.filter((b) => b.id !== post.id));
    } else {
      setBookmarks([...list, post]);
    }
    setSaved(!saved);
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={saved}
      title={saved ? 'Remove from My List' : 'Save to My List'}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
        saved
          ? 'bg-brand/10 border-brand text-brand-dark'
          : 'bg-white border-gray-200 text-gray-600 hover:border-brand hover:text-brand-dark'
      }`}
    >
      <Bookmark className={`w-4 h-4 ${saved ? 'fill-brand text-brand' : ''}`} />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
