'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, X } from 'lucide-react';
import {
  getBookmarks,
  removeBookmark,
  type SavedPost,
} from '@/components/blog/BookmarkButton';

/** "My List" — articles the reader saved on this device (localStorage). */
export default function MyListPage() {
  const [items, setItems] = useState<SavedPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(getBookmarks());
    setLoaded(true);
  }, []);

  const remove = (id: string) => {
    removeBookmark(id);
    setItems(getBookmarks());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-[60vh]">
      <h1 className="section-heading">My List</h1>
      <p className="text-gray-500 text-sm mt-2">
        Articles you saved on this device.
      </p>

      {!loaded ? null : items.length === 0 ? (
        <div className="py-16 text-center">
          <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold">No saved articles yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Tap <span className="font-semibold">Save</span> on any article and
            it will show up here.
          </p>
          <Link
            href="/blog"
            className="inline-block mt-6 px-6 py-2.5 bg-brand text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-brand-dark transition-colors"
          >
            Browse articles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8 mt-8">
          {items.map((post) => (
            <div key={post.id} className="group relative">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-400 font-extrabold text-2xl">B</span>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 text-gray-900 font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                  {post.title}
                </h3>
              </Link>
              <button
                onClick={() => remove(post.id)}
                aria-label="Remove from My List"
                title="Remove"
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-brand text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
