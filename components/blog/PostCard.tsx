'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Post, CATEGORY_LABELS } from '@/types';
import Badge from '@/components/ui/Badge';
import { formatPostDate } from '@/lib/dates';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'compact';
}

function getReadTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

function formatDate(timestamp: unknown): string {
  return formatPostDate(timestamp);
}

export default function PostCard({ post, variant = 'default' }: PostCardProps) {
  if (variant === 'featured') {
    return (
      <motion.article
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="group relative h-full"
      >
        <Link href={`/blog/${post.slug}`} className="block h-full">
          <div className="relative h-full rounded-xl overflow-hidden">
            {/* Cover Image */}
            <div className="absolute inset-0">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-6">
              <Badge
                label={CATEGORY_LABELS[post.category]}
                variant="gold"
                href={`/category/${post.category}`}
              />
              <h2 className="text-display text-3xl md:text-4xl text-white mt-3 mb-2 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-stardust text-sm line-clamp-2 mb-4">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 text-stardust text-xs">
                <span>{formatDate(post.publishedAt)}</span>
                <span>•</span>
                <span>{getReadTime(post.body)}</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.article
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
        className="group"
      >
        <Link href={`/blog/${post.slug}`} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Badge label={CATEGORY_LABELS[post.category]} variant="brand" />
            <h4 className="text-gray-900 font-medium mt-1 line-clamp-2 group-hover:text-brand transition-colors">
              {post.title}
            </h4>
            <p className="text-gray-500 text-xs mt-1">
              {formatDate(post.publishedAt)}
            </p>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Default variant
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Cover Image */}
          <div className="relative h-48 overflow-hidden">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <Badge label={CATEGORY_LABELS[post.category]} variant="brand" />
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-brand transition-colors">
              {post.title}
            </h3>
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 mt-4 text-gray-500 text-xs">
              <span>{formatDate(post.publishedAt)}</span>
              <span>•</span>
              <span>{getReadTime(post.body)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}