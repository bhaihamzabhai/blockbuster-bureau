import { Timestamp } from 'firebase/firestore';

export type Category =
  | 'upcoming-movies'
  | 'actor-news'
  | 'release-dates'
  | 'announcements'
  | 'reviews'
  | 'trailers';

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  category: Category;
  tags: string[];
  author: string;
  status: 'draft' | 'published';
  featured: boolean;
  youtubeVideoId?: string;
  publishedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  views: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface ChannelVideo {
  id: string;
  title: string;
  thumbnail: string;
}

export const CATEGORIES: Category[] = [
  'upcoming-movies',
  'actor-news',
  'release-dates',
  'announcements',
  'reviews',
  'trailers',
];

export const CATEGORY_LABELS: Record<Category, string> = {
  'upcoming-movies': 'Upcoming Movies',
  'actor-news': 'Actor News',
  'release-dates': 'Release Dates',
  announcements: 'Announcements',
  reviews: 'Reviews',
  trailers: 'Trailers',
};