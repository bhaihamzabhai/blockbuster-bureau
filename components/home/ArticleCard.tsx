import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Post } from '@/types';
import { formatPostDate } from '@/lib/dates';

function isNew(post: Post) {
  try {
    const d = (post.publishedAt as any)?.toDate
      ? (post.publishedAt as any).toDate()
      : new Date(post.publishedAt as any);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function formatDate(post: Post) {
  return formatPostDate(post.publishedAt);
}

export function Stars({ rating, className = 'w-3.5 h-3.5' }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${className} ${s <= Math.round(rating) ? 'text-brand fill-brand' : 'text-gray-300'}`}
        />
      ))}
    </span>
  );
}

/** Clean article card like the reference poster cards. */
export default function ArticleCard({ post }: { post: Post }) {
  const rating = typeof post.rating === 'number' ? post.rating : 0;

  return (
    <Link href={`/blog/${post.slug}`} className="group block card-glow rounded-lg">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 font-extrabold text-2xl">B</span>
          </div>
        )}
        {isNew(post) && (
          <span className="absolute top-2 left-2 w-10 h-10 rounded-full bg-brand text-white text-[10px] font-extrabold uppercase flex items-center justify-center shadow">
            New
          </span>
        )}
      </div>
      <h3 className="mt-3 text-gray-900 font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-brand transition-colors">
        {post.title}
      </h3>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-gray-500 text-xs">{formatDate(post)}</span>
        {rating > 0 && <Stars rating={rating} />}
      </div>
    </Link>
  );
}
