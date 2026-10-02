import Header from './Header';
import { getSiteSettings } from '@/lib/siteSettings';
import { getPosts } from '@/lib/firestore';

/** Server wrapper: loads settings + latest headlines once, then renders the client header. */
export default async function SiteHeader() {
  const [settings, posts] = await Promise.all([
    getSiteSettings(),
    getPosts({ status: 'published', limit: 8 }),
  ]);
  return <Header settings={settings} tickerPosts={posts} />;
}
