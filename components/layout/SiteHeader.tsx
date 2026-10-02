import Header from './Header';
import { getSiteSettings } from '@/lib/siteSettings';

/** Server wrapper: loads social links etc. once, then renders the client header. */
export default async function SiteHeader() {
  const settings = await getSiteSettings();
  return <Header settings={settings} />;
}
