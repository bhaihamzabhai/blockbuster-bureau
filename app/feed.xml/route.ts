import { getPosts } from '@/lib/firestore';
import { CATEGORY_LABELS } from '@/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blockbusterbureau.com';
const SITE_TITLE = 'Blockbuster Bureau';
const SITE_DESCRIPTION = 'Your daily source for Hollywood news, upcoming movie releases, actor interviews, and exclusive entertainment updates.';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  // Get latest 20 published posts
  const posts = await getPosts({ status: 'published', limit: 20 });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/og-image.png</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${SITE_URL}</link>
    </image>
    ${posts
      .map((post) => {
        const postUrl = `${SITE_URL}/blog/${post.slug}`;
        const pubDate = post.publishedAt?.toDate?.().toUTCString() || new Date().toUTCString();
        const category = CATEGORY_LABELS[post.category] || post.category;
        const excerpt = post.excerpt || post.body.replace(/<[^>]*>/g, '').slice(0, 200);

        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(category)}</category>
      <description>${escapeXml(excerpt)}</description>
      <content:encoded><![CDATA[${post.body}]]></content:encoded>
      ${post.author ? `<dc:creator>${escapeXml(post.author)}</dc:creator>` : ''}
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}