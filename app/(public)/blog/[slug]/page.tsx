import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPostBySlug, getPosts } from '@/lib/firestore';
import { CATEGORY_LABELS, Post } from '@/types';
import Badge from '@/components/ui/Badge';
import Tag from '@/components/ui/Tag';
import PostCard from '@/components/blog/PostCard';
import ViewCounter from '@/components/blog/ViewCounter';
import AdUnit from '@/components/ads/AdUnit';
import YouTubeEmbed from '@/components/youtube/YouTubeEmbed';
import ChannelBanner from '@/components/youtube/ChannelBanner';
import ReadingProgress from '@/components/article/ReadingProgress';
import ShareButtons from '@/components/article/ShareButtons';
import { List } from 'lucide-react';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blockbusterbureau.com';

interface BlogPostPageProps {
  params: { slug: string };
}

// Generate metadata for each post
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.seo.metaTitle || post.title,
    description: post.seo.metaDescription || post.excerpt,
    openGraph: {
      title: post.seo.metaTitle || post.title,
      description: post.seo.metaDescription || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt?.toDate().toISOString(),
      authors: [post.author],
      images: post.coverImage ? [post.coverImage] : [`${SITE_URL}/og-cover.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo.metaTitle || post.title,
      description: post.seo.metaDescription || post.excerpt,
      images: post.coverImage ? [post.coverImage] : [`${SITE_URL}/og-cover.jpg`],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

// Generate static params for all published posts
export async function generateStaticParams() {
  const posts = await getPosts({ status: 'published' });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export const revalidate = 3600;

function getReadTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

function formatDate(timestamp: { toDate: () => Date } | null): string {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as unknown as string);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function generateJsonLd(post: Post, slug: string) {
  const plainText = post.body.replace(/<[^>]*>/g, ' ');
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt || post.seo.metaDescription,
    image: post.coverImage ? [post.coverImage] : [`${SITE_URL}/og-cover.jpg`],
    datePublished: post.publishedAt?.toDate?.().toISOString(),
    dateModified: post.updatedAt?.toDate?.().toISOString(),
    wordCount,
    author: {
      '@type': 'Person',
      name: post.author || 'Blockbuster Bureau',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Blockbuster Bureau',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: CATEGORY_LABELS[post.category] || post.category,
  };
}

function generateBreadcrumbJsonLd(post: Post, slug: string) {  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: CATEGORY_LABELS[post.category] || post.category,
        item: `${SITE_URL}/category/${post.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: post.title,
        item: `${SITE_URL}/blog/${slug}`,
      },
    ],
  };
}

/**
 * Extracts plain <h2> headings from the article HTML, injects anchor ids,
 * and returns both the processed HTML and the heading list for a TOC.
 * Only matches bare <h2> tags (no attributes) to stay safe.
 */
function processHeadings(html: string): {
  html: string;
  headings: { id: string; text: string }[];
} {
  const headings: { id: string; text: string }[] = [];
  let n = 0;
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/gi, (m, inner: string) => {
    const text = String(inner).replace(/<[^>]*>/g, '').trim();
    if (!text) return m;
    const slug =
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50) || `heading-${n}`;
    const id = `toc-${n++}-${slug}`;
    headings.push({ id, text });
    return `<h2 id="${id}" class="scroll-mt-28">${inner}</h2>`;
  });
  return { html: out, headings };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // View counting is handled client-side by <ViewCounter /> (see below),
  // because Firestore rules only allow public updates to the views field.

  // Get related posts
  const relatedPosts = await getPosts({
    status: 'published',
    category: post.category,
    limit: 4,
  }).then((posts) => posts.filter((p) => p.id !== post.id).slice(0, 3));

  const jsonLd = generateJsonLd(post, params.slug);
  const breadcrumbLd = generateBreadcrumbJsonLd(post, params.slug);
  const { html: bodyHtml, headings } = processHeadings(post.body);

  return (
    <>
      {/* Reading progress bar */}
      <ReadingProgress />

      {/* Client-side view counter */}
      <ViewCounter postId={post.id} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <article className="min-h-screen">
        {/* Hero Section with Cover Image */}
        <div className="relative h-[50vh] md:h-[60vh]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <Badge
                label={CATEGORY_LABELS[post.category]}
                variant="brand"
                href={`/category/${post.category}`}
              />
              <h1 className="text-display text-4xl md:text-6xl text-white mt-4">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-8 pb-8 border-b border-gray-200">
            <span>By {post.author}</span>
            <span>•</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span>{getReadTime(post.body)}</span>
            {post.views > 0 && (
              <>
                <span>•</span>
                <span>{post.views.toLocaleString()} views</span>
              </>
            )}
          </div>

          {/* YouTube Hero Video (if set) */}
          {post.youtubeVideoId && (
            <div className="mb-8">
              <YouTubeEmbed videoId={post.youtubeVideoId} title={post.title} />
            </div>
          )}

          {/* In-article Ad */}
          <div className="my-8 flex justify-center">
            <AdUnit slot="in-article" />
          </div>

          {/* Table of contents (auto-built from h2 headings) */}
          {headings.length >= 2 && (
            <nav
              aria-label="Table of contents"
              className="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:p-6"
            >
              <p className="flex items-center gap-2 text-gray-900 font-extrabold text-sm uppercase tracking-widest mb-3">
                <List className="w-4 h-4 text-brand" /> In this article
              </p>
              <ul className="space-y-2">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className="text-sm text-gray-600 hover:text-brand transition-colors leading-snug block"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Post Body - sanitized HTML rendered via dangerouslySetInnerHTML */}
          <div
            className="prose-light"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {/* Share buttons */}
          <div className="mt-10 pt-8 border-t border-gray-200 flex justify-center">
            <ShareButtons title={post.title} />
          </div>

          {/* Ad placement after content */}
          <div className="my-8 flex justify-center">
            <AdUnit slot="leaderboard" />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-200">
              {post.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200">
            <h2 className="section-heading mb-8">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}
      </article>
      <ChannelBanner />
    </>
  );
}