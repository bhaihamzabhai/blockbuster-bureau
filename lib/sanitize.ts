import DOMPurify from 'dompurify';

/**
 * DOMPurify instance.
 * Sanitization runs client-side (the admin PostEditor sanitizes content
 * before writing to Firestore). On the server there is no DOM, so we
 * gracefully return the input — server code must never trust raw HTML
 * and should only render content that was sanitized at write time.
 */
const purify =
  typeof window !== 'undefined' ? DOMPurify(window) : null;

/**
 * Allowed HTML tags for post body content
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'mark',
  'sub',
  'sup',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'blockquote',
  'hr',
  'a',
  'img',
  'figure',
  'figcaption',
  'iframe',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'colgroup',
  'col',
  'span',
  'div',
];

/**
 * Allowed HTML attributes
 */
const ALLOWED_ATTR = [
  'href',
  'target',
  'rel',
  'src',
  'alt',
  'width',
  'height',
  'style',
  'frameborder',
  'allowfullscreen',
  'allow',
  'loading',
  'colspan',
  'rowspan',
  'class',
  'data-type',
];

/**
 * Allowed iframe domains
 */
const ALLOWED_IFRAME_DOMAINS = [
  'www.youtube-nocookie.com',
  'www.youtube.com',
  'youtube.com',
  'platform.twitter.com',
  'twitter.com',
  'instagram.com',
  'tiktok.com',
  'open.spotify.com',
  'anchor.fm',
];

/**
 * Sanitize HTML content for post body
 */
export function sanitizeHTML(dirty: string): string {
  if (!purify) return dirty; // No DOM on server — see note above
  return purify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  });
}

/**
 * Sanitize text content (strips all HTML)
 */
export function sanitizeText(dirty: string): string {
  if (!purify) return dirty.replace(/<[^>]*>/g, '');
  return purify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Validate a URL slug
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100;
}

/**
 * Validate that an iframe src is from an allowed domain
 */
export function validateIframeSrc(src: string): boolean {
  try {
    const url = new URL(src);
    return ALLOWED_IFRAME_DOMAINS.some((domain) =>
      url.hostname.endsWith(domain)
    );
  } catch {
    return false;
  }
}