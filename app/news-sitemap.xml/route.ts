import { getPosts } from '@/lib/firestore';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blockbusterbureau.com';
const PUBLICATION_NAME = 'Blockbuster Bureau';

/**
 * Google News sitemap — only articles from the last 2 days (Google's rule).
 * Submit in Search Console + reference from robots.txt for faster News pickup.
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await getPosts({ status: 'published', limit: 50 });

  // Google News sitemap: only articles published within the last 2 days
  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
  const fresh = posts.filter((post) => {
    const pub = post.publishedAt?.toDate?.()?.getTime() || 0;
    return pub >= twoDaysAgo;
  });

  const urls = fresh
    .map((post) => {
      const postUrl = `${SITE_URL}/blog/${post.slug}`;
      const pubDate =
        post.publishedAt?.toDate?.()?.toISOString() || new Date().toISOString();
      return `  <url>
    <loc>${postUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  });
}
