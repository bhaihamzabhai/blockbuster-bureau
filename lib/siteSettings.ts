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
}

const DEFAULTS: SiteSettings = {
  youtubeUrl: '',
  tiktokUrl: '',
  facebookUrl: '',
  heroSlides: [],
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
    return {
      youtubeUrl: typeof d.youtubeUrl === 'string' ? d.youtubeUrl : '',
      tiktokUrl: typeof d.tiktokUrl === 'string' ? d.tiktokUrl : '',
      facebookUrl: typeof d.facebookUrl === 'string' ? d.facebookUrl : '',
      heroSlides: Array.isArray(d.heroSlides) ? (d.heroSlides as HeroSlide[]) : [],
    };
  } catch (error) {
    console.error('getSiteSettings failed:', error);
    return DEFAULTS;
  }
}
