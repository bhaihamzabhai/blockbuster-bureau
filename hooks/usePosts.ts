'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPosts, getFeaturedPosts, getPostBySlug } from '@/lib/firestore';
import { Post, Category } from '@/types';

interface UsePostsOptions {
  category?: Category;
  limit?: number;
  status?: 'draft' | 'published';
}

/**
 * Hook to fetch and manage posts
 */
export function usePosts(options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPosts({
        status: options.status || 'published',
        category: options.category,
        limit: options.limit,
      });
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
    }
  }, [options.category, options.limit, options.status]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}

/**
 * Hook to fetch featured posts
 */
export function useFeaturedPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFeaturedPosts();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch featured posts'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}

/**
 * Hook to fetch a single post by slug
 */
export function usePostBySlug(slug: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostBySlug(slug);
        setPost(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch post'));
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  return { post, loading, error };
}