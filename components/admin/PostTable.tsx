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

function formatDateTime(timestamp: { toDate: () => Date } | null | undefined): string {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as unknown as string);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function PostTable({ posts, onDelete }: PostTableProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">No posts found. Create your first post!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500 text-sm border-b border-gray-200">
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
            <tr key={post.id} className="border-b border-gray-200 hover:bg-white transition-colors">
              <td className="p-4">
                <Link
                  href={`/dashboard/posts/${post.id}/edit`}
                  className="text-gray-900 hover:text-brand-dark transition-colors line-clamp-1"
                >
                  {post.title}
                </Link>
              </td>
              <td className="p-4">
                <span className="text-gray-500 text-sm">
                  {CATEGORY_LABELS[post.category]}
                </span>
              </td>
              <td className="p-4">
                {post.status === 'scheduled' ? (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    Scheduled{post.scheduledAt ? ` · ${formatDateTime(post.scheduledAt)}` : ''}
                  </span>
                ) : (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-gold/20 text-brand-dark'
                        : 'bg-stardust/20 text-gray-500'
                    }`}
                  >
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                )}
              </td>
              <td className="p-4 text-gray-500">{post.views || 0}</td>
              <td className="p-4 text-gray-500 text-sm">
                {formatDate(post.publishedAt)}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-brand-dark transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(post)}
                    className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {post.status === 'published' && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
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