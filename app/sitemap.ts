import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/firestore';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blockbusterbureau.com';

const STATIC_PAGES = [
  '',
  '/blog',
  '/videos',
  '/releases',
  '/about',
  '/privacy',
  '/category/upcoming-movies',
  '/category/actor-news',
  '/category/release-dates',
  '/category/announcements',
  '/category/reviews',
  '/category/trailers',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all published posts
  const posts = await getPosts({ status: 'published' });

  // Create sitemap entries for posts (with cover images for image search)
  const postEntries = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt?.toDate?.() || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    images: post.coverImage ? [post.coverImage] : undefined,
  }));

  // Create sitemap entries for static pages
  const staticEntries = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'daily' as const : 'weekly' as const,
    priority: page === '' ? 1.0 : page.startsWith('/category/') ? 0.7 : 0.9,
  }));

  return [...staticEntries, ...postEntries];
}