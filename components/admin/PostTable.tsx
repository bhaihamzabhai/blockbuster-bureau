'use client';

import Link from 'next/link';
import { Post, CATEGORY_LABELS } from '@/types';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';

interface PostTableProps {
  posts: Post[];
  onDelete: (post: Post) => void;
}

function formatDate(timestamp: { toDate: () => Date } | null): string {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as unknown as string);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PostTable({ posts, onDelete }: PostTableProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-nebula rounded-xl border border-white/5">
        <p className="text-stardust">No posts found. Create your first post!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-nebula rounded-xl border border-white/5">
      <table className="w-full">
        <thead>
          <tr className="text-left text-stardust text-sm border-b border-white/10">
            <th className="p-4 font-medium">Title</th>
            <th className="p-4 font-medium">Category</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Views</th>
            <th className="p-4 font-medium">Published</th>
            <th className="p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="p-4">
                <Link
                  href={`/dashboard/posts/${post.id}/edit`}
                  className="text-white hover:text-gold transition-colors line-clamp-1"
                >
                  {post.title}
                </Link>
              </td>
              <td className="p-4">
                <span className="text-stardust text-sm">
                  {CATEGORY_LABELS[post.category]}
                </span>
              </td>
              <td className="p-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    post.status === 'published'
                      ? 'bg-gold/20 text-gold'
                      : 'bg-stardust/20 text-stardust'
                  }`}
                >
                  {post.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="p-4 text-stardust">{post.views || 0}</td>
              <td className="p-4 text-stardust text-sm">
                {formatDate(post.publishedAt)}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="p-2 rounded hover:bg-white/10 text-stardust hover:text-gold transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(post)}
                    className="p-2 rounded hover:bg-white/10 text-stardust hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {post.status === 'published' && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 rounded hover:bg-white/10 text-stardust hover:text-nova transition-colors"
                      title="View"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}