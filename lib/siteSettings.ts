import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface SiteSettings {
  youtubeUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  heroSlides: HeroSlide[];
  siteTitle: string;
  siteDescription: string;
  metaTitle: string;
  metaKeywords: string;
  googleAnalyticsId: string;
}

const DEFAULTS: SiteSettings = {
  youtubeUrl: '',
  tiktokUrl: '',
  facebookUrl: '',
  heroSlides: [],
  siteTitle: '',
  siteDescription: '',
  metaTitle: '',
  metaKeywords: '',
  googleAnalyticsId: '',
};

/**
 * Reads public site settings (social links + hero slides) from
 * the `settings/general` Firestore document. Fails soft so pages
 * still render when Firebase is unreachable.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'));
    if (!snap.exists()) return DEFAULTS;
    const d = snap.data();
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    return {
      youtubeUrl: str(d.youtubeUrl),
      tiktokUrl: str(d.tiktokUrl),
      facebookUrl: str(d.facebookUrl),
      heroSlides: Array.isArray(d.heroSlides) ? (d.heroSlides as HeroSlide[]) : [],
      siteTitle: str(d.siteTitle),
      siteDescription: str(d.siteDescription),
      metaTitle: str(d.metaTitle),
      metaKeywords: str(d.metaKeywords),
      googleAnalyticsId: str(d.googleAnalyticsId),
    };
  } catch (error) {
    console.error('getSiteSettings failed:', error);
    return DEFAULTS;
  }
}
