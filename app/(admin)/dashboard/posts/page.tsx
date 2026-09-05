'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getPosts, deletePost } from '@/lib/firestore';
import { Post, Category, CATEGORIES, CATEGORY_LABELS } from '@/types';
import PostTable from '@/components/admin/PostTable';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { PlusCircle, Search } from 'lucide-react';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch ALL posts (drafts + published) — admin is authenticated,
      // so Firestore rules allow reading everything.
      const data = await getPosts({});
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      setIsDeleting(true);
      await deletePost(postToDelete.id);
      setPosts(posts.filter((p) => p.id !== postToDelete.id));
      setDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    // Status filter
    if (statusFilter !== 'all' && post.status !== statusFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && post.category !== categoryFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display text-4xl text-white">All Posts</h1>
          <p className="text-stardust mt-1">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-void font-bold rounded-lg hover:scale-105 transition-transform"
        >
          <PlusCircle className="w-5 h-5" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stardust" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-nebula border border-white/10 rounded-lg text-white placeholder-stardust focus:outline-none focus:border-gold/50"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
          className="px-4 py-2 bg-nebula border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold/50"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
          className="px-4 py-2 bg-nebula border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold/50"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-gold"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : (
        <PostTable posts={filteredPosts} onDelete={handleDeleteClick} />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        post={postToDelete}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}