import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { Post, Category } from '@/types';

const POSTS_COLLECTION = 'posts';

interface GetPostsOptions {
  category?: Category;
  limit?: number;
  status?: 'draft' | 'published';
  startAfter?: DocumentSnapshot;
}

/**
 * Get posts from Firestore with optional filtering
 */
export async function getPosts(
  options: GetPostsOptions = {}
): Promise<Post[]> {
  try {
    const constraints: QueryConstraint[] = [];

    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }

    if (options.category) {
      constraints.push(where('category', '==', options.category));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }

    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    const q = query(collection(db, POSTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];
  } catch (error) {
    // Fail soft: build-time prerendering and ISR must not crash when
    // Firebase is unreachable (e.g. no network during `next build`).
    // Pages render empty and revalidate successfully at runtime.
    console.error('getPosts failed:', error);
    return [];
  }
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('slug', '==', slug),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Post;
  } catch (error) {
    console.error('getPostBySlug failed:', error);
    return null;
  }
}

/**
 * Get featured posts for the trending section
 */
export async function getFeaturedPosts(): Promise<Post[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('status', '==', 'published'),
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];
  } catch (error) {
    console.error('getFeaturedPosts failed:', error);
    return [];
  }
}

/**
 * Create a new post
 */
export async function createPost(data: Partial<Post>): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
    ...data,
    createdAt: now,
    updatedAt: now,
    views: 0,
    publishedAt: data.status === 'published' ? now : null,
  });

  return docRef.id;
}

/**
 * Update an existing post
 */
export async function updatePost(
  id: string,
  data: Partial<Post>
): Promise<void> {
  const docRef = doc(db, POSTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a post
 */
export async function deletePost(id: string): Promise<void> {
  const docRef = doc(db, POSTS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Increment view count for a post
 */
export async function incrementViews(id: string): Promise<void> {
  const docRef = doc(db, POSTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const currentViews = docSnap.data().views || 0;
    await updateDoc(docRef, {
      views: currentViews + 1,
    });
  }
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}