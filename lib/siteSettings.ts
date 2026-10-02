import { cache } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

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
  youtubeChannelId: string;
  youtubeApiKey: string;
  tmdbApiKey: string;
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
  youtubeChannelId: '',
  youtubeApiKey: '',
  tmdbApiKey: '',
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
 *
 * Returns defaults immediately when Firebase isn't configured
 * (e.g. local `next build` without env vars), and gives up after
 * 10s so static page generation can never hang on a dead backend.
 *
 * Request-scoped cache: generateMetadata, layout and page share one
 * fetch per render instead of hitting Firestore three times.
 */
async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!isFirebaseConfigured) return DEFAULTS;
  try {
    const snap = await Promise.race([
      getDoc(doc(db, 'settings', 'general')),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('getSiteSettings timed out')), 10000)
      ),
    ]);
    if (!snap.exists()) return DEFAULTS;
    const d = snap.data();
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    return {
      youtubeUrl: str(d.youtubeUrl),
      tiktokUrl: str(d.tiktokUrl),
      facebookUrl: str(d.facebookUrl),
      youtubeChannelId: str(d.youtubeChannelId),
      youtubeApiKey: str(d.youtubeApiKey),
      tmdbApiKey: str(d.tmdbApiKey),
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

export const getSiteSettings = cache(fetchSiteSettings);
